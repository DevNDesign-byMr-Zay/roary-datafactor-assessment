async function generateReply(parts) {
  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts }],
    });
    const response = await result.response;
    return await response.text();
  } catch (err) {
    console.error('Gemini error:', err);
    return 'I had trouble processing that request. Try again.';
  }
}
