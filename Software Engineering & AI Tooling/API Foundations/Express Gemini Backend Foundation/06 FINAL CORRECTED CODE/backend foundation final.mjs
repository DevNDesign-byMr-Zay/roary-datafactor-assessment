import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import dotenv from 'dotenv';
import { Storage } from '@google-cloud/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

app.use((err, _req, res, next) => {
  if (err?.message?.startsWith('Not allowed by CORS')) {
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

app.use(bodyParser.json({ limit: '15mb' }));

const APP_API_TOKEN = process.env.APP_API_TOKEN || '';
const BUCKET_NAME = process.env.BUCKET_NAME || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!BUCKET_NAME) console.warn('[WARN] BUCKET_NAME is not set.');
if (!GEMINI_API_KEY) console.warn('[WARN] GEMINI_API_KEY is not set — /chat will fail.');

const storage = new Storage();
const bucket = BUCKET_NAME ? storage.bucket(BUCKET_NAME) : null;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    project: process.env.GOOGLE_CLOUD_PROJECT || null,
    location: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
    model: 'gemini-1.5-flash',
    bucket: BUCKET_NAME || null,
    corsAllowed: allowedOrigins,
    auth: {
      protected: ['/upload', '/chat', '/sign'],
      header: 'x-app-token',
      required: !!APP_API_TOKEN,
    },
  });
});

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(204);

  const token = req.header('x-app-token');
  if (APP_API_TOKEN && token === APP_API_TOKEN) return next();

  return res.status(401).json({ error: 'Unauthorized' });
});

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!bucket) return res.status(500).json({ error: 'Bucket not configured' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const original = req.file.originalname.replace(/\s+/g, '_');
    const timestamp = Date.now();
    const objectName = `uploads/${timestamp}-${original}`;
    const file = bucket.file(objectName);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
      resumable: false,
    });

    res.json({ ok: true, objectName, mimeType: req.file.mimetype });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/sign', async (req, res) => {
  try {
    if (!bucket) return res.status(500).json({ error: 'Bucket not configured' });
    const object = req.query.object;
    if (!object) return res.status(400).json({ error: 'Missing ?object=' });

    const file = bucket.file(object);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000,
    });

    res.json({ url });
  } catch (err) {
    console.error('Sign error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/chat', async (req, res) => {
  try {
    if (!geminiModel) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    const sessionId = req.body?.sessionId || 'default';
    const text = (req.body?.text || '').toString();
    const files = Array.isArray(req.body?.files) ? req.body.files : [];

    const fileParts = [];
    for (const f of files) {
      if (!f?.objectName || !bucket) continue;
      try {
        const [url] = await bucket.file(f.objectName).getSignedUrl({
          action: 'read',
          expires: Date.now() + 45 * 60 * 1000,
        });
        fileParts.push({
          fileData: {
            fileUri: url,
            mimeType: f.mimeType || 'application/octet-stream',
          },
        });
      } catch (e) {
        console.warn('Failed to sign file:', f.objectName, e.message);
      }
    }

    const parts = [
      ...fileParts,
      ...(text ? [{ text }] : []),
    ];

    const reply = await generateReply(parts);
    res.json({ reply, sessionId });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

async function generateReply(parts) {
  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts }],
    });
    const response = await result.response;
    return await response.text();
  } catch (err) {
    console.error('Gemini error:', err);
    return 'The model request failed. Please try again.';
  }
}

app.listen(port, () => {
  console.log(`Application API running at http://localhost:${port}`);
});
