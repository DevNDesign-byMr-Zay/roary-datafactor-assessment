import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const initializeApp = jest.fn();
const firestore = jest.fn(() => ({ kind: 'firestore' }));
const admin = { apps: [], initializeApp, firestore };
const VertexAI = jest.fn(function VertexAIMock(options) {
  this.options = options;
});

jest.unstable_mockModule('firebase-admin', () => ({ default: admin }));
jest.unstable_mockModule('@google-cloud/vertexai', () => ({ VertexAI }));

const { createCloudDependencies } = await import('../src/cloud.mjs');

describe('cloud dependency factory', () => {
  beforeEach(() => {
    initializeApp.mockClear();
    firestore.mockClear();
    VertexAI.mockClear();
    admin.apps.length = 0;
  });

  test('uses safe assessment defaults when cloud env values are absent', () => {
    const result = createCloudDependencies({});

    expect(result.project).toBe('assessment-project');
    expect(result.location).toBe('us-central1');
    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(VertexAI).toHaveBeenCalledWith({
      project: 'assessment-project',
      location: 'us-central1',
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
    expect(VertexAI).toHaveBeenCalledWith({ project: 'project-a', location: 'europe-west1' });
  });

  test('does not reinitialize Firebase when an app already exists', () => {
    admin.apps.push({ name: 'existing' });

    createCloudDependencies({});

    expect(initializeApp).not.toHaveBeenCalled();
    expect(firestore).toHaveBeenCalledTimes(1);
  });
});
