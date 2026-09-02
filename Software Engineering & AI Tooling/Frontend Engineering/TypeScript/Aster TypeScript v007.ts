import type { ChatMessage, ChatRole } from './Aster TypeScript v001';
import type { JsonlChatRecord } from './Aster TypeScript v006';

const CHAT_ROLES = new Set<ChatRole>(['system', 'user', 'assistant']);

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ChatMessage>;
  return CHAT_ROLES.has(candidate.role as ChatRole) && typeof candidate.content === 'string';
}

export function importChatJsonl(text: string): ChatMessage[] {
  const imported: ChatMessage[] = [];

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const record = JSON.parse(line) as Partial<JsonlChatRecord>;
    if (!Array.isArray(record.messages) || !record.messages.every(isChatMessage)) {
      throw new Error('invalid chat JSONL record');
    }
    imported.push(...record.messages);
  }

  return imported;
}
