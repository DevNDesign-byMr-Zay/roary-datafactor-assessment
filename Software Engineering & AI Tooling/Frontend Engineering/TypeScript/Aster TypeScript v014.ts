import type { ChatMessage } from './Aster TypeScript v001';

export function exportTurnJsonl(
  messages: ChatMessage[],
  systemPrompt: string,
): string {
  const turns = messages.filter((message) => message.role !== 'system');
  const records: string[] = [];
  let buffer: ChatMessage[] = [];

  for (const message of turns) {
    buffer.push(message);
    if (message.role !== 'assistant') continue;

    const record: ChatMessage[] = [];
    if (systemPrompt.trim()) {
      record.push({ role: 'system', content: systemPrompt.trim() });
    }
    record.push(...buffer);
    records.push(JSON.stringify({ messages: record }));
    buffer = [];
  }

  return records.length ? `${records.join('\n')}\n` : '';
}
