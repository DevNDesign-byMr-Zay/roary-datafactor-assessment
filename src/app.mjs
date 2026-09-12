import { randomUUID } from 'node:crypto';

import cors from 'cors';
import express from 'express';

import { createHistoryStore } from './history-store.mjs';
import { extractModelText } from './model-response.mjs';
import { parseChatRequest } from './validation.mjs';

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

export function createApp({
  vertexClient,
  db,
  logger,
  project = 'assessment-project',
  location = 'us-central1',
  modelName = 'gemini-2.5-flash',
  historyLimit = 12,
  requestIdFactory = randomUUID,
} = {}) {
  if (!vertexClient?.getGenerativeModel) {
    throw new TypeError('A Vertex AI-compatible client is required.');
  }
  if (!db) throw new TypeError('A Firestore-compatible database is required.');
  if (!logger) throw new TypeError('A structured logger is required.');
  if (typeof requestIdFactory !== 'function') {
    throw new TypeError('requestIdFactory must be a function.');
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
    res.status(200).json({ ok: true, project, location, model: modelName });
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
      return res.status(415).json({
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: 'Chat requests must use application/json.',
        },
      });
    }

    const parsed = parseChatRequest(req.body);
    if (!parsed.ok) {
      logger.warn(
        { event: 'chat.validation_failed', requestId },
        'Rejected invalid chat request',
      );
      return res.status(400).json({ error: parsed.error });
    }

    const { text, sessionId } = parsed.value;

    try {
      const history = await historyStore.load(sessionId);
      const result = await model.generateContent({
        contents: [...history, { role: 'user', parts: [{ text }] }],
      });
      const reply = extractModelText(result);

      if (!reply) {
        logger.error(
          { event: 'chat.empty_model_response', requestId, sessionId },
          'Model returned no text',
        );
        return res.status(502).json({
          error: { code: 'EMPTY_MODEL_RESPONSE', message: 'The model returned no text.' },
        });
      }

      await historyStore.append(sessionId, [
        { role: 'user', text },
        { role: 'assistant', text: reply },
      ]);

      logger.info({ event: 'chat.completed', requestId, sessionId }, 'Chat request completed');
      return res.status(200).json({ reply, sessionId });
    } catch (error) {
      logger.error(
        { ...sanitizeFailureMetadata(error), requestId, sessionId },
        'Chat request failed',
      );
      return res.status(500).json({
        error: {
          code: 'CHAT_REQUEST_FAILED',
          message: 'Unable to complete the chat request.',
        },
      });
    }
  });

  app.use((error, req, res, next) => {
    const requestId = req.requestId;

    if (error?.type === 'entity.too.large') {
      logger.warn(
        { event: 'request.body_too_large', requestId },
        'Rejected oversized request body',
      );
      return res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: 'Request body exceeds the 64kb limit.',
        },
      });
    }

    if (error?.type === 'entity.parse.failed') {
      logger.warn({ event: 'request.invalid_json', requestId }, 'Rejected malformed JSON request');
      return res.status(400).json({
        error: {
          code: 'INVALID_JSON',
          message: 'Request body must contain valid JSON.',
        },
      });
    }

    if (error?.type === 'encoding.unsupported') {
      logger.warn(
        { event: 'request.unsupported_encoding', requestId },
        'Rejected unsupported request encoding',
      );
      return res.status(415).json({
        error: {
          code: 'UNSUPPORTED_CONTENT_ENCODING',
          message: 'Request content encoding is not supported.',
        },
      });
    }

    return next(error);
  });

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
  });

  return app;
}
