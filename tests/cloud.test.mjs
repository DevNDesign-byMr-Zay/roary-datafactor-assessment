import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const initializeApp = jest.fn();
const firestore = jest.fn(() => ({ kind: 'firestore' }));
const admin = { apps: [], initializeApp, firestore };
const generateContent = jest.fn(async (request) => ({ request }));
const GoogleGenAI = jest.fn(function GoogleGenAIMock(options) {
  this.options = options;
  this.models = { generateContent };
});

jest.unstable_mockModule('firebase-admin', () => ({ default: admin }));
jest.unstable_mockModule('@google/genai', () => ({ GoogleGenAI }));

const { createCloudDependencies, createVertexCompatibleClient } = await import('../src/cloud.mjs');

describe('cloud dependency factory', () => {
  beforeEach(() => {
    initializeApp.mockClear();
    firestore.mockClear();
    GoogleGenAI.mockClear();
    generateContent.mockClear();
    admin.apps.length = 0;
  });

  test('uses safe assessment defaults when cloud env values are absent', () => {
    const result = createCloudDependencies({});

    expect(result.project).toBe('assessment-project');
    expect(result.location).toBe('us-central1');
    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(GoogleGenAI).toHaveBeenCalledWith({
      vertexai: true,
      project: 'assessment-project',
      location: 'us-central1',
      apiVersion: 'v1',
    });
    expect(firestore).toHaveBeenCalledTimes(1);
  });

  test('uses explicit project and location environment values', () => {
    const result = createCloudDependencies({
      GOOGLE_CLOUD_PROJECT: 'project-a',
      VERTEX_LOCATION: 'europe-west1',
    });

    expect(result.project).toBe('project-a');
    expect(result.location).toBe('europe-west1');
    expect(GoogleGenAI).toHaveBeenCalledWith({
      vertexai: true,
      project: 'project-a',
      location: 'europe-west1',
      apiVersion: 'v1',
    });
  });

  test('does not reinitialize Firebase when an app already exists', () => {
    admin.apps.push({ name: 'existing' });

    createCloudDependencies({});

    expect(initializeApp).not.toHaveBeenCalled();
    expect(firestore).toHaveBeenCalledTimes(1);
  });

  test('adapts the Gen AI client to the maintained model contract', async () => {
    const client = createVertexCompatibleClient({
      project: 'project-a',
      location: 'us-central1',
    });
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: {
        parts: [{ text: 'Be concise.' }, { text: 'Stay helpful.' }],
      },
    });
    const contents = [{ role: 'user', parts: [{ text: 'Hello' }] }];

    await model.generateContent({ contents });

    expect(generateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash',
      contents,
      config: { systemInstruction: 'Be concise.\nStay helpful.' },
    });
  });

  test('omits model configuration when no system instruction is provided', async () => {
    const client = createVertexCompatibleClient({
      project: 'project-a',
      location: 'us-central1',
    });
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    await model.generateContent({ contents: [] });

    expect(generateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash',
      contents: [],
      config: undefined,
    });
  });
});
