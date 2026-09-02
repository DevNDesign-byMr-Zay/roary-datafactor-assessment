const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!bucket) return res.status(500).json({ error: 'Bucket not configured' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const original = req.file.originalname.replace(/\\s+/g, '_');
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
