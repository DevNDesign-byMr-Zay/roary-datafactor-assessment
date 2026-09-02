import type { ChatMessage } from './Aster TypeScript v001';

export interface StudioState {
  messages: ChatMessage[];
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface StudioDefaults {
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

function numberOrFallback(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function restoreStudioState(
  storage: Storage,
  defaults: StudioDefaults,
): StudioState {
  const systemPrompt = storage.getItem('aster:sys') || defaults.systemPrompt;
  const savedChat = storage.getItem('aster:chat');

  return {
    messages: savedChat
      ? (JSON.parse(savedChat) as ChatMessage[])
      : [{ role: 'system', content: defaults.systemPrompt }],
    systemPrompt,
    model: storage.getItem('aster:model') || defaults.model,
    temperature: numberOrFallback(storage.getItem('aster:temp'), defaults.temperature),
    maxTokens: numberOrFallback(storage.getItem('aster:max'), defaults.maxTokens),
  };
}
