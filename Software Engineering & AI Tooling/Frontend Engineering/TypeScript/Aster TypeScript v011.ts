import { streamCompletion } from './Aster TypeScript v005';
import type { CompletionRequest } from './Aster TypeScript v010';

export async function runStreamingCompletion(
  request: CompletionRequest,
  onDelta?: (text: string) => void,
): Promise<string> {
  const response = await fetch(request.url, request.init);
  let assistantText = '';

  await streamCompletion(response, (delta) => {
    assistantText += delta;
    onDelta?.(delta);
  });

  return assistantText;
}
