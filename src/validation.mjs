import { z } from 'zod';

export const chatRequestSchema = z
  .object({
    text: z.string().trim().min(1).max(12_000),
    sessionId: z.string().trim().min(1).max(128).default('default'),
  })
  .strict();

export function parseChatRequest(body) {
  const result = chatRequestSchema.safeParse(body ?? {});
  if (result.success) {
    return { ok: true, value: result.data };
  }

  return {
    ok: false,
    error: {
      code: 'INVALID_CHAT_REQUEST',
      message: 'Request body is invalid.',
      fields: result.error.flatten().fieldErrors,
    },
  };
}
