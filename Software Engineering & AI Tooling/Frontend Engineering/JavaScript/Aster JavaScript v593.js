export function deriveContextPrompt({
  composerText = '',
  messages = [],
  stripAttachmentBlock = (value) => value,
  maxLength = 400,
} = {}) {
  const typed = String(composerText || '').trim();
  if (typed) return typed.slice(0, maxLength);

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== 'user' || !message?.content) continue;

    const stripped = String(stripAttachmentBlock(message.content) || '').trim();
    if (stripped) return stripped.slice(0, maxLength);
  }

  return '';
}
