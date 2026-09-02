import type { CompletionChunk } from './Aster TypeScript v001';

export function collectSseDelta(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return '';

  const payload = trimmed.slice(5).trim();
  if (!payload || payload === '[DONE]') return '';

  try {
    const chunk = JSON.parse(payload) as CompletionChunk;
    return chunk.choices?.[0]?.delta?.content || '';
  } catch {
    return '';
  }
}
