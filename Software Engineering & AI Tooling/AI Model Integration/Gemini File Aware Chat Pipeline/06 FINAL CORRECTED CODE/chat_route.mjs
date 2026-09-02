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
        fileParts.push({ fileData: { fileUri: url, mimeType: f.mimeType || 'application/octet-stream' } });
      } catch (e) {
        console.warn('Failed to sign file:', f.objectName, e.message);
      }
    }
    const parts = [...fileParts, ...(text ? [{ text }] : [])];
    const reply = await generateReply(parts);
    res.json({ reply, sessionId });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});
