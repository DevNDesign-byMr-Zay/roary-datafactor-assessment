export function buildConversationMessages(history, userInput) {
  const prior = Array.isArray(history) ? history : [];
  const messages = prior.flatMap((turn) => [
    { role: 'user', parts: [{ text: String(turn?.user ?? '') }] },
    { role: 'assistant', parts: [{ text: String(turn?.assistant ?? '') }] },
  ]);

  messages.push({ role: 'user', parts: [{ text: String(userInput ?? '') }] });
  return messages;
}
