const ASTER_API_TOKEN = process.env.ASTER_API_TOKEN || '';

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  const token = req.header('x-aster-token');
  if (ASTER_API_TOKEN && token === ASTER_API_TOKEN) return next();
  return res.status(401).json({ error: 'Unauthorized' });
});
