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
