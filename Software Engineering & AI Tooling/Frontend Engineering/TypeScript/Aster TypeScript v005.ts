import type { CompletionChunk } from './Aster TypeScript v001';

export async function streamCompletion(
  response: Response,
  onDelta: (text: string) => void,
): Promise<void> {
  if (!response.ok) throw new Error(`completion request failed: ${response.status}`);
  if (!response.body) throw new Error('completion response has no body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload) continue;
      if (payload === '[DONE]') return;

      try {
        const chunk = JSON.parse(payload) as CompletionChunk;
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) onDelta(delta);
      } catch {
        // Ignore malformed event fragments and continue consuming the stream.
      }
    }

    if (done) break;
  }
}
