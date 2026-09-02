import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Aster API running at http://localhost:${port}`);
});
