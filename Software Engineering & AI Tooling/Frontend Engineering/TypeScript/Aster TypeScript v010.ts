import type { ChatMessage } from './Aster TypeScript v001';
import type { RuntimeConfig } from './Aster TypeScript v002';

export interface CompletionRequest {
  url: string;
  init: RequestInit;
}

export function buildCompletionRequest(
  config: RuntimeConfig,
  messages: ChatMessage[],
): CompletionRequest {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

  return {
    url: `${config.apiBase.replace(/\/$/, '')}/chat/completions`,
    init: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        stream: true,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        messages: messages.map(({ role, content }) => ({ role, content })),
      }),
    },
  };
}
