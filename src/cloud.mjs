import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';

function toSystemInstructionText(systemInstruction) {
  return systemInstruction?.parts
    ?.map((part) => part?.text)
    .filter(Boolean)
    .join('\n');
}

export function createVertexCompatibleClient({ project, location }) {
  const ai = new GoogleGenAI({
    vertexai: true,
    project,
    location,
    apiVersion: 'v1',
  });

  return {
    getGenerativeModel({ model, systemInstruction }) {
      const systemInstructionText = toSystemInstructionText(systemInstruction);

      return {
        generateContent({ contents }) {
          return ai.models.generateContent({
            model,
            contents,
            config: systemInstructionText
              ? { systemInstruction: systemInstructionText }
              : undefined,
          });
        },
      };
    },
  };
}

export function createCloudDependencies(env = process.env) {
  const project = env.GOOGLE_CLOUD_PROJECT || 'assessment-project';
  const location = env.VERTEX_LOCATION || 'us-central1';

  if (!admin.apps.length) {
    admin.initializeApp();
  }

  return {
    project,
    location,
    vertexClient: createVertexCompatibleClient({ project, location }),
    db: admin.firestore(),
  };
}
