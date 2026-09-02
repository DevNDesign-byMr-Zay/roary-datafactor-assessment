export function createMemoryChatHandler({ loadHistory, saveTurn, generate, historyLimit = 8 }) {
  return async function memoryChatHandler(req, res) {
    try {
      const sessionId = String(req.body?.sessionId ?? 'default');
      const userInput = String(req.body?.text ?? '');
      const history = await loadHistory(sessionId, historyLimit);
      const result = await generate({ history, userInput });
      const reply = String(result?.reply ?? '');

      await saveTurn(sessionId, { user: userInput, assistant: reply });
      return res.json({ reply, sessionId });
    } catch (error) {
      console.error('Chat request failed:', error);
      return res.status(500).json({ error: 'Chat request failed' });
    }
  };
}
