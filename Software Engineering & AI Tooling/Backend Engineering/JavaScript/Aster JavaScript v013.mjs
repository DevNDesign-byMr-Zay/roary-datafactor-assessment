export async function saveConversationTurn(turnStore, sessionId, turn, now = () => new Date()) {
  const user = String(turn?.user ?? '');
  const assistant = String(turn?.assistant ?? '');

  return turnStore.add({
    sessionId: String(sessionId),
    timestamp: now(),
    user,
    assistant,
  });
}
