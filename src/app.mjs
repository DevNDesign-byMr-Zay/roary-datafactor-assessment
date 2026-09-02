import cors from 'cors';
import express from 'express';

import { createHistoryStore } from './history-store.mjs';
import { extractModelText } from './model-response.mjs';
import { parseChatRequest } from './validation.mjs';

const SYSTEM_INSTRUCTION = `You are a concise, helpful conversational assistant.
- Keep answers short unless asked.
- If you do not know, say so and offer next steps.
- Avoid sensitive or personal data unless explicitly requested.`;

export function createApp({
  vertexClient,
  db,
  logger,
  project = 'assessment-project',
  location = 'us-central1',
  modelName = 'gemini-2.5-flash',
  historyLimit = 12,
} = {}) {
  if (!vertexClient?.getGenerativeModel) {
    throw new TypeError('A Vertex AI-compatible client is required.');
  }
  if (!db) throw new TypeError('A Firestore-compatible database is required.');
  if (!logger) throw new TypeError('A structured logger is required.');

  const app = express();
  const historyStore = createHistoryStore(db, { historyLimit });
  const model = vertexClient.getGenerativeModel({
    model: modelName,
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
  });

  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '64kb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, project, location, model: modelName });
  });

  app.get('/', (_req, res) => {
    res.status(200).send('Conversational AI service is live');
  });

  app.post('/chat', async (req, res) => {
    const parsed = parseChatRequest(req.body);
    if (!parsed.ok) {
      logger.warn({ event: 'chat.validation_failed' }, 'Rejected invalid chat request');
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
        logger.error({ event: 'chat.empty_model_response', sessionId }, 'Model returned no text');
        return res.status(502).json({
          error: { code: 'EMPTY_MODEL_RESPONSE', message: 'The model returned no text.' },
        });
      }

      await historyStore.append(sessionId, [
        { role: 'user', text },
        { role: 'assistant', text: reply },
      ]);

      logger.info({ event: 'chat.completed', sessionId }, 'Chat request completed');
      return res.status(200).json({ reply, sessionId });
    } catch (error) {
      logger.error({ event: 'chat.failed', sessionId, err: error }, 'Chat request failed');
      return res.status(500).json({
        error: {
          code: 'CHAT_REQUEST_FAILED',
          message: 'Unable to complete the chat request.',
        },
      });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
  });

  return app;
}
