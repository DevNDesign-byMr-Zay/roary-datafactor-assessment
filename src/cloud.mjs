import { VertexAI } from '@google-cloud/vertexai';
import admin from 'firebase-admin';

export function createCloudDependencies(env = process.env) {
  const project = env.GOOGLE_CLOUD_PROJECT || 'assessment-project';
  const location = env.VERTEX_LOCATION || 'us-central1';

  if (!admin.apps.length) {
    admin.initializeApp();
  }

  return {
    project,
    location,
    vertexClient: new VertexAI({ project, location }),
    db: admin.firestore(),
  };
}
