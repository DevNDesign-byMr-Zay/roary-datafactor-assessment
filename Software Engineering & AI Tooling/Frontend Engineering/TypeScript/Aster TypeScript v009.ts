import type { ChatMessage } from './Aster TypeScript v001';

export function composeCompletionMessages(
  existing: ChatMessage[],
  systemPrompt: string,
  userText: string,
): ChatMessage[] {
  const content = userText.trim();
  if (!content) throw new Error('user message is empty');

  const configuredSystem = systemPrompt.trim();
  const priorSystem = existing.filter((message) => message.role === 'system').slice(0, 1);
  const history = existing.filter((message) => message.role !== 'system');
  const system: ChatMessage[] = configuredSystem
    ? [{ role: 'system', content: configuredSystem }]
    : priorSystem;

  return [...system, ...history, { role: 'user', content }];
}
