const EPHEMERAL_SOURCE = /^(?:blob:|file:)/i;

function keepPersistent(values) {
  return Array.isArray(values)
    ? values.filter((value) => !EPHEMERAL_SOURCE.test(String(value || '')))
    : values;
}

export function sanitizePersistedThread(thread) {
  if (!thread || typeof thread !== 'object') {
    return { thread, changed: false };
  }

  const next = structuredClone(thread);
  let changed = false;

  if (Array.isArray(next.images)) {
    const filtered = keepPersistent(next.images);
    changed ||= filtered.length !== next.images.length;
    next.images = filtered;
  }

  for (const message of Array.isArray(next.messages) ? next.messages : []) {
    if (!message || typeof message !== 'object') continue;

    if (Array.isArray(message.images)) {
      const filtered = keepPersistent(message.images);
      changed ||= filtered.length !== message.images.length;
      message.images = filtered;
    }

    for (const key of ['image', 'image_url', 'src', 'url', 'thumb', 'thumbnail']) {
      if (typeof message[key] === 'string' && EPHEMERAL_SOURCE.test(message[key])) {
        delete message[key];
        changed = true;
      }
    }

    for (const key of ['attachments', 'media']) {
      if (!Array.isArray(message[key])) continue;
      const filtered = message[key].filter((entry) => {
        const value = typeof entry === 'string'
          ? entry
          : entry?.url || entry?.src || entry?.href || '';
        return !EPHEMERAL_SOURCE.test(String(value));
      });
      changed ||= filtered.length !== message[key].length;
      message[key] = filtered;
    }
  }

  return { thread: next, changed };
}
