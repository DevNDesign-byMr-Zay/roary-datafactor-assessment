import { expect, jest, test } from '@jest/globals';
import request from 'supertest';

import { createApp } from '../src/app.mjs';

function makeLogger() {
  return { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
}

function makeDb() {
  const collection = {
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(async () => ({ docs: [] })),
      })),
    })),
    add: jest.fn(async () => ({ id: 'doc-1' })),
  };

  return {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => collection),
      })),
    })),
  };
}

test('GET /metrics exposes in-process request and latency counters', async () => {
  let currentTime = 1_000;
  const nowFn = () => currentTime;
  const logger = makeLogger();
  const vertexClient = {
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn(async () => {
        currentTime += 100;
        return { response: { text: () => 'Response text' } };
      }),
    })),
  };

  const app = createApp({
    vertexClient,
    db: makeDb(),
    logger,
    serviceVersion: '1.1.3-test',
    nowFn,
  });

  // Query /metrics initially
  const initial = await request(app).get('/metrics');
  expect(initial.status).toBe(200);
  expect(initial.body).toEqual({
    ok: true,
    service: 'conversational-ai-service',
    version: '1.1.3-test',
    metrics: {
      totalRequests: 1,
      errorRequests: 0,
      chatRequests: 0,
      avgChatLatencyMs: 0,
    },
  });

  // Make a successful chat request
  await request(app).post('/chat').send({ text: 'Hello', sessionId: 'test-session' });

  // Make an invalid route request resulting in 404
  await request(app).get('/unknown-route');

  // Query /metrics again
  const metricsRes = await request(app).get('/metrics');
  expect(metricsRes.status).toBe(200);
  expect(metricsRes.body.metrics.totalRequests).toBe(4);
  expect(metricsRes.body.metrics.errorRequests).toBe(1);
  expect(metricsRes.body.metrics.chatRequests).toBe(1);
  expect(metricsRes.body.metrics.avgChatLatencyMs).toBe(100);
});
