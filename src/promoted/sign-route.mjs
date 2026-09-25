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
