/**
 * Materialize referenced files into ordered MIME-aware inline message parts.
 * The caller supplies storage reads and byte encoding so this helper stays
 * provider-, filesystem-, and runtime-neutral.
 */

function normalizeMimeType(value) {
  const text = String(value || '').trim().toLowerCase();
  return text && text.includes('/') ? text : 'application/octet-stream';
}

function getLocator(ref) {
  if (!ref || typeof ref !== 'object') return '';
  return String(ref.locator ?? ref.objectName ?? ref.key ?? ref.path ?? '').trim();
}

export async function materializeInlineFileParts(
  references,
  { readBytes, toBase64 } = {},
) {
  if (!Array.isArray(references)) {
    throw new TypeError('references must be an array');
  }
  if (typeof readBytes !== 'function') {
    throw new TypeError('readBytes must be a function');
  }
  if (typeof toBase64 !== 'function') {
    throw new TypeError('toBase64 must be a function');
  }

  return Promise.all(
    references.map(async (ref, index) => {
      const locator = getLocator(ref);
      if (!locator) {
        throw new TypeError(`reference at index ${index} is missing a locator`);
      }

      const bytes = await readBytes(locator, ref);
      if (bytes == null) {
        throw new Error(`readBytes returned no data for reference at index ${index}`);
      }

      const data = String(await toBase64(bytes, ref));
      if (!data) {
        throw new Error(`toBase64 returned empty data for reference at index ${index}`);
      }

      return {
        inlineData: {
          data,
          mimeType: normalizeMimeType(ref.mimeType ?? ref.type),
        },
      };
    }),
  );
}

export function composeTextAndInlineParts(text, inlineParts = []) {
  const parts = [];
  const normalizedText = String(text ?? '');
  if (normalizedText) parts.push({ text: normalizedText });
  for (const part of inlineParts) {
    if (part && typeof part === 'object') parts.push(part);
  }
  return parts;
}
