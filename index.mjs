import express from 'express';
import { VertexAI } from '@google-cloud/vertexai';
import admin from 'firebase-admin';

const app = express();
app.use(express.json());

const project = process.env.GOOGLE_CLOUD_PROJECT || 'assessment-project';
const location = process.env.VERTEX_LOCATION || 'us-central1';

const vertexAi = new VertexAI({ project, location });
const model = vertexAi.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: {
    parts: [{
      text: `You are a concise, helpful conversational assistant.
- Keep answers short unless asked.
- If you do not know, say so and offer next steps.
- Avoid sensitive or personal data unless explicitly requested.`
    }]
  }
});

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

async function loadHistory(sessionId, limit = 8) {
  const qs = await db
    .collection('conversations')
    .doc(sessionId)
    .collection('turns')
    .orderBy('ts', 'desc')
    .limit(limit)
    .get();

  return qs.docs.reverse().map((doc) => doc.data());
}

async function saveTurn(sessionId, user, assistant) {
  await db
    .collection('conversations')
    .doc(sessionId)
    .collection('turns')
    .add({
      ts: admin.firestore.FieldValue.serverTimestamp(),
      user,
      assistant
    });
}

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    project,
    location,
    model: 'gemini-2.5-flash'
  });
});

app.get('/', (_req, res) => {
  res.send('Conversational AI service is live');
});

app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.text || 'Hello';
    const sessionId = (req.body?.sessionId || 'default').toString();

    const history = await loadHistory(sessionId, 8);
    const contents = [
      ...history.flatMap((turn) => ([
        { role: 'user', parts: [{ text: turn.user }] },
        { role: 'model', parts: [{ text: turn.assistant }] }
      ])),
      { role: 'user', parts: [{ text: userInput }] }
    ];

    const resp = await model.generateContent({ contents });

    let reply = '';
    if (resp?.response && typeof resp.response.text === 'function') {
      reply = resp.response.text();
    } else if (resp?.response && typeof resp.response.text === 'string') {
      reply = resp.response.text;
    } else {
      const candidates = resp?.response?.candidates ?? [];
      reply = candidates
        .map((candidate) => (candidate?.content?.parts ?? [])
          .map((part) => part?.text ?? '')
          .join(''))
        .join('\n')
        .trim();
    }

    if (!reply) reply = '[no text returned]';

    await saveTurn(sessionId, userInput, reply);
    res.json({ reply, sessionId });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Conversational AI service running on port ${PORT} (project=${project}, location=${location})`);
});
