import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';

import { createChatDeadlineBudget, runWithChatDeadline } from './chat-deadline.mjs';
import { ChatAbortError, ChatTimeoutError } from './errors.mjs';
import { createHistoryStore } from './history-store.mjs';
import { createModel } from './model.mjs';
import { createRequestLogger } from './request-logger.mjs';

function requestErrorBody(requestId, { code, message }) {
  return { error: { code, message, requestId } };
}

function assertChatActive(signal, deadline) {
  if (signal?.aborted) throw new ChatAbortError();
  deadline.remainingMs();
}

export function createApp({ db, model, historyStore, advisoryCoordinator, logger } = {}) {
  const app = express();
  const resolvedHistoryStore = historyStore ?? createHistoryStore(db);
  const resolvedModel = model ?? createModel();
  const resolvedLogger = logger ?? createRequestLogger();

  app.disable('x-powered-by');
  app.use(cors());
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    next();
  });
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/chat', async (req, res) => {
    const requestId = req.requestId;
    const { message: text, sessionId = requestId } = req.body ?? {};
    const abortController = new AbortController();
    const deadline = createChatDeadlineBudget();
    const handleRequestAbort = () => abortController.abort();

    req.on('aborted', handleRequestAbort);

    try {
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json(requestErrorBody(requestId, {
          code: 'INVALID_MESSAGE',
          message: 'A non-empty message is required.',
        }));
      }

      const history = await runWithChatDeadline(
        () => resolvedHistoryStore.load(sessionId, { signal: abortController.signal }),
        {
          timeoutMs: deadline.remainingMs(),
          signal: abortController.signal,
        },
      );

      const reply = await runWithChatDeadline(
        () => resolvedModel.generate({ text, history, signal: abortController.signal }),
        {
          timeoutMs: deadline.remainingMs(),
          signal: abortController.signal,
        },
      );

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
        });
      }

      assertChatActive(abortController.signal, deadline);
      await resolvedHistoryStore.append(sessionId, [
        { role: 'user', text },
        { role: 'assistant', text: reply },
      ], { signal: abortController.signal });

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

function sanitizeFailureMetadata(error) {
  return {
    errorName: error?.name ?? 'Error',
    errorMessage: typeof error?.message === 'string' ? error.message.slice(0, 240) : 'Unknown error',
  };
}
