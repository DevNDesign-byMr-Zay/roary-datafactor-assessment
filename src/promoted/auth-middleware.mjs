const APP_API_TOKEN = process.env.APP_API_TOKEN || '';

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  const token = req.header('x-app-token');
  if (APP_API_TOKEN && token === APP_API_TOKEN) return next();
  return res.status(401).json({ error: 'Unauthorized' });
});
