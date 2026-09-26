import { expect, jest, test } from '@jest/globals';
import request from 'supertest';

import { createApp } from '../src/app.mjs';

test('GET /health exposes the documented conventional health contract', async () => {
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const vertexClient = {
    getGenerativeModel: jest.fn(() => ({ generateContent: jest.fn() })),
  };
  const app = createApp({
    vertexClient,
    db: {},
    logger,
    project: 'assessment-project',
    location: 'us-central1',
    modelName: 'gemini-2.5-flash',
    serviceVersion: '1.1.2',
    startedAt: 2_000,
    healthNowFn: () => 7_000,
  });

  const response = await request(app).get('/health');

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    ok: true,
    status: 'ok',
    service: 'conversational-ai-service',
    version: '1.1.2',
    uptimeSeconds: 5,
    project: 'assessment-project',
    location: 'us-central1',
    model: 'gemini-2.5-flash',
  });
});
