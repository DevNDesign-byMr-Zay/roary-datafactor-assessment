import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const firestoreInstances = [];
const Firestore = jest.fn(function FirestoreMock(options) {
  this.options = options;
  this.kind = 'firestore';
  firestoreInstances.push(this);
});
const generateContent = jest.fn(async (request) => ({ request }));
const GoogleGenAI = jest.fn(function GoogleGenAIMock(options) {
  this.options = options;
  this.models = { generateContent };
});

jest.unstable_mockModule('@google-cloud/firestore', () => ({ Firestore }));
jest.unstable_mockModule('@google/genai', () => ({ GoogleGenAI }));

const { createCloudDependencies, createVertexCompatibleClient } = await import('../src/cloud.mjs');

describe('cloud dependency factory', () => {
  beforeEach(() => {
    Firestore.mockClear();
    GoogleGenAI.mockClear();
    generateContent.mockClear();
    firestoreInstances.length = 0;
  });

  test('uses safe assessment defaults when cloud env values are absent', () => {
    const result = createCloudDependencies({});

    expect(result.project).toBe('assessment-project');
    expect(result.location).toBe('us-central1');
    expect(GoogleGenAI).toHaveBeenCalledWith({
      vertexai: true,
      project: 'assessment-project',
      location: 'us-central1',
      apiVersion: 'v1',
    });
    expect(Firestore).toHaveBeenCalledWith({ projectId: 'assessment-project' });
    expect(result.db).toBe(firestoreInstances[0]);
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
    expect(Firestore).toHaveBeenCalledWith({ projectId: 'project-a' });
  });

  test('creates independent Firestore clients for independently constructed dependency sets', () => {
    const first = createCloudDependencies({ GOOGLE_CLOUD_PROJECT: 'project-a' });
    const second = createCloudDependencies({ GOOGLE_CLOUD_PROJECT: 'project-b' });

    expect(Firestore).toHaveBeenCalledTimes(2);
    expect(first.db).not.toBe(second.db);
    expect(first.db.options).toEqual({ projectId: 'project-a' });
    expect(second.db.options).toEqual({ projectId: 'project-b' });
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
