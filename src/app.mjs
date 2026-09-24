import { randomUUID } from 'node:crypto';

import cors from 'cors';
import express from 'express';

import {
  ChatAbortError,
  ChatTimeoutError,
  createChatDeadlineBudget,
  runWithChatDeadline,
} from './chat-deadline.mjs';
import { createHistoryStore } from './history-store.mjs';
import { extractModelText } from './model-response.mjs';
import { classifyProviderFailure } from './provider-failure.mjs';
import { parseChatRequest } from './validation.mjs';

const SERVICE_VERSION = '1.1.2';

const SYSTEM_INSTRUCTION = `You are a concise, helpful conversational assistant.
- Keep answers short unless asked.
- If you do not know, say so and offer next steps.
- Avoid sensitive or personal data unless explicitly requested.`;

function sanitizeFailureMetadata(error) {
  const metadata = { event: 'chat.failed' };

  if (typeof error?.name === 'string' && error.name) metadata.errorName = error.name;
  if (typeof error?.code === 'string' && error.code) metadata.errorCode = error.code;

  return metadata;
}

function normalizeRequestId(value) {
  const requestId = typeof value === 'string' ? value.trim() : '';
  if (!requestId || requestId.length > 128) {
    throw new TypeError('requestIdFactory must return a non-empty string up to 128 characters.');
  }
  return requestId;
}

function requestErrorBody(requestId, error) {
  return {
    error: {
      ...error,
      requestId,
    },
  };
}

function assertChatActive(signal, deadline) {
  if (signal?.aborted) throw new ChatAbortError();
  deadline.remainingMs();
}

export function createApp({
  vertexClient,
  db,
  logger,
  project = 'assessment-project',
  location = 'us-central1',
  modelName = 'gemini-2.5-flash',
  historyLimit = 12,
  requestIdFactory = randomUUID,
  chatTimeoutMs = 15_000,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
  nowFn = Date.now,
  healthNowFn = Date.now,
  serviceVersion = SERVICE_VERSION,
  startedAt = healthNowFn(),
  advisoryCoordinator = null,
} = {}) {
  if (!vertexClient?.getGenerativeModel) {
    throw new TypeError('A Vertex AI-compatible client is required.');
  }
  if (!db) throw new TypeError('A Firestore-compatible database is required.');
  if (!logger) throw new TypeError('A structured logger is required.');
  if (typeof requestIdFactory !== 'function') {
    throw new TypeError('requestIdFactory must be a function.');
  }
  if (!Number.isFinite(chatTimeoutMs) || chatTimeoutMs <= 0) {
    throw new TypeError('chatTimeoutMs must be a positive finite number.');
  }
  if (typeof setTimeoutFn !== 'function' || typeof clearTimeoutFn !== 'function') {
    throw new TypeError('timer functions must be functions.');
  }
  if (typeof nowFn !== 'function') throw new TypeError('nowFn must be a function.');
  if (typeof healthNowFn !== 'function') throw new TypeError('healthNowFn must be a function.');
  if (typeof serviceVersion !== 'string' || !serviceVersion.trim()) {
    throw new TypeError('serviceVersion must be a non-empty string.');
  }
  if (!Number.isFinite(startedAt) || startedAt < 0) {
    throw new TypeError('startedAt must be a non-negative finite number.');
  }
  if (advisoryCoordinator !== null && typeof advisoryCoordinator !== 'function') {
    throw new TypeError('advisoryCoordinator must be a function when provided.');
  }

  const app = express();
  const historyStore = createHistoryStore(db, { historyLimit });
  const model = vertexClient.getGenerativeModel({
    model: modelName,
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
  });

  app.disable('x-powered-by');
  app.use(cors());
  app.use((req, res, next) => {
    try {
      req.requestId = normalizeRequestId(requestIdFactory());
      res.set('X-Request-Id', req.requestId);
      return next();
    } catch (error) {
      return next(error);
    }
  });
  app.use(express.json({ limit: '64kb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      status: 'ok',
      service: 'conversational-ai-service',
      version: serviceVersion.trim(),
      uptimeSeconds: Math.max(0, Math.floor((healthNowFn() - startedAt) / 1000)),
      project,
      location,
      model: modelName,
    });
  });

  app.get('/', (_req, res) => {
    res.status(200).send('Conversational AI service is live');
  });

  app.post('/chat', async (req, res) => {
    const { requestId } = req;

    if (!req.is('application/json')) {
      logger.warn(
        { event: 'request.unsupported_media_type', requestId },
        'Rejected non-JSON chat request',
      );
      return res.status(415).json(
        requestErrorBody(requestId, {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: 'Chat requests must use application/json.',
        }),
      );
    }

    const parsed = parseChatRequest(req.body);
    if (!parsed.ok) {
      logger.warn(
        { event: 'chat.validation_failed', requestId },
        'Rejected invalid chat request',
      );
      return res.status(400).json(requestErrorBody(requestId, parsed.error));
    }

    const { text, sessionId } = parsed.value;
    const abortController = new globalThis.AbortController();
    const handleRequestAbort = () => abortController.abort();
    req.once('aborted', handleRequestAbort);

    try {
      const deadline = createChatDeadlineBudget(chatTimeoutMs, { nowFn });
      const history = await runWithChatDeadline(
        () => historyStore.load(sessionId, { signal: abortController.signal }),
        {
          timeoutMs: deadline.remainingMs(),
          signal: abortController.signal,
          setTimeoutFn,
          clearTimeoutFn,
        },
      );
      let result;
      try {
        result = await runWithChatDeadline(
          () =>
            model.generateContent({
              contents: [...history, { role: 'user', parts: [{ text }] }],
            }),
          {
            timeoutMs: deadline.remainingMs(),
            signal: abortController.signal,
            setTimeoutFn,
            clearTimeoutFn,
          },
        );
      } catch (error) {
        if (error instanceof ChatAbortError || error instanceof ChatTimeoutError) throw error;

        const providerFailure = classifyProviderFailure(error);
        if (!providerFailure) throw error;

        logger.warn(
          {
            ...sanitizeFailureMetadata(error),
            event: providerFailure.event,
            requestId,
            sessionId,
          },
          'Model provider request failed',
        );
        return res.status(providerFailure.status).json(
          requestErrorBody(requestId, {
            code: providerFailure.code,
            message: providerFailure.message,
          }),
        );
      }
      const reply = extractModelText(result);

      if (!reply) {
        logger.error(
          { event: 'chat.empty_model_response', requestId, sessionId },
          'Model returned no text',
        );
        return res.status(502).json(
          requestErrorBody(requestId, {
            code: 'EMPTY_MODEL_RESPONSE',
            message: 'The model returned no text.',
          }),
        );
      }

      if (advisoryCoordinator) {
        const advisoryContext = Object.freeze({
          requestId,
          sessionId,
          reply,
          signal: abortController.signal,
        });
        await runWithChatDeadline(() => advisoryCoordinator(advisoryContext), {
          timeoutMs: deadline.remainingMs(),
          signal: abortController.signal,
          setTimeoutFn,
          clearTimeoutFn,
        });
      }

      assertChatActive(abortController.signal, deadline);
      await historyStore.append(
        sessionId,
        [
          { role: 'user', text },
          { role: 'assistant', text: reply },
        ],
        { signal: abortController.signal },
      );

      logger.info({ event: 'chat.completed', requestId, sessionId }, 'Chat request completed');
      return res.status(200).json({ reply, sessionId });
    } catch (error) {
      if (error instanceof ChatAbortError || req.aborted) {
        logger.warn(
          { event: 'chat.client_aborted', requestId, sessionId },
          'Chat request aborted by client',
        );
        return undefined;
      }

      if (error instanceof ChatTimeoutError) {
        logger.warn(
          { event: 'chat.timed_out', requestId, sessionId },
          'Chat request timed out',
        );
        return res.status(504).json(
          requestErrorBody(requestId, {
            code: 'CHAT_TIMEOUT',
            message: 'The chat request timed out.',
          }),
        );
      }

      logger.error(
        { ...sanitizeFailureMetadata(error), requestId, sessionId },
        'Chat request failed',
      );
      return res.status(500).json(
        requestErrorBody(requestId, {
          code: 'CHAT_REQUEST_FAILED',
          message: 'Unable to complete the chat request.',
        }),
      );
    } finally {
      req.off('aborted', handleRequestAbort);
    }
  });

  app.use((error, req, res, next) => {
    const requestId = req.requestId;

    if (error?.type === 'entity.too.large') {
      logger.warn(
        { event: 'request.body_too_large', requestId },
        'Rejected oversized request body',
      );
      return res.status(413).json(
        requestErrorBody(requestId, {
          code: 'REQUEST_TOO_LARGE',
          message: 'Request body exceeds the 64kb limit.',
        }),
      );
    }

    if (error?.type === 'entity.parse.failed') {
      logger.warn({ event: 'request.invalid_json', requestId }, 'Rejected malformed JSON request');
      return res.status(400).json(
        requestErrorBody(requestId, {
          code: 'INVALID_JSON',
          message: 'Request body must contain valid JSON.',
        }),
      );
    }

    if (error?.type === 'encoding.unsupported') {
      logger.warn(
        { event: 'request.unsupported_encoding', requestId },
        'Rejected unsupported request encoding',
      );
      return res.status(415).json(
        requestErrorBody(requestId, {
          code: 'UNSUPPORTED_CONTENT_ENCODING',
          message: 'Request content encoding is not supported.',
        }),
      );
    }

    return next(error);
  });

  app.use((req, res) => {
    res.status(404).json(
      requestErrorBody(req.requestId, {
        code: 'NOT_FOUND',
        message: 'Route not found.',
      }),
    );
  });

  return app;
}
