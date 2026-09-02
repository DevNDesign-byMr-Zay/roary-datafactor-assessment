import type { ChatMessage } from './Aster TypeScript v001';

export interface JsonlChatRecord {
  messages: ChatMessage[];
}

export function exportChatJsonl(messages: ChatMessage[]): string {
  if (!messages.length) return '';
  return `${JSON.stringify({ messages } satisfies JsonlChatRecord)}\n`;
}
