export function resolveAsterImageToolBase(candidate = globalThis.__asterToolBackendBase) {
  const fallback = 'http://127.0.0.1:5151';
  const raw = String(candidate || fallback).trim().replace(/\/+$/, '');
  if (!/^http:\/\/(?:127\.0\.0\.1|localhost):5151$/i.test(raw)) return fallback;
  return raw.replace('localhost', '127.0.0.1');
}
