export function cleanAssistantText(text, {
  answerHeading = 'answer',
  sourcesHeading = 'sources',
  repeatedSectionMarker = '### Analysis Summary',
} = {}) {
  if (!text) return '';

  let output = String(text);

  const answerPattern = new RegExp(`^#{1,6}\\s*${answerHeading}\\s*\\n+`, 'i');
  output = output.replace(answerPattern, '');

  const sourcesPattern = new RegExp(
    `\\n+#{1,6}\\s*${sourcesHeading}\\s*\\n[\\s\\S]*?(\\n-{3,}\\s*|\\s*$)`,
    'gi',
  );
  output = output.replace(sourcesPattern, '\n\n');

  const first = output.indexOf(repeatedSectionMarker);
  if (first !== -1) {
    const second = output.indexOf(
      repeatedSectionMarker,
      first + repeatedSectionMarker.length,
    );
    if (second !== -1) output = output.slice(0, second).trimEnd();
  }

  return output.trim();
}
