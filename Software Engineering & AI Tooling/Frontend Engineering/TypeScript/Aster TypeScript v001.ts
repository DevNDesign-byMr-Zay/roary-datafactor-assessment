export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CompletionChunk {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}
