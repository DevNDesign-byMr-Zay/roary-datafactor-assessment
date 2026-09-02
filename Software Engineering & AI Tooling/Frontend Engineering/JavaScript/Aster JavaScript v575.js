function trimText(value, maxChars) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
}

export function buildWebAugmentedTurn({
  history,
  userText,
  webEnabled,
  sources = [],
  maxSources = 3,
  maxCharsPerSource = 1800,
}) {
  const messages = Array.isArray(history) ? [...history] : [];
  const prompt = String(userText ?? '').trim();

  if (webEnabled) {
    const context = sources.slice(0, maxSources).map((source, index) => {
      const title = trimText(source?.title, 200);
      const url = trimText(source?.url, 500);
      const content = trimText(source?.content ?? source?.snippet, maxCharsPerSource);
      return `[${index + 1}] ${title}\n${url}\n${content}`;
    }).filter(Boolean).join('\n\n');

    if (context) {
      messages.push({
        role: 'system',
        content: `Retrieved web context for this turn only:\n\n${context}`,
      });
    }
  }

  messages.push({ role: 'user', content: prompt });
  return messages;
}
