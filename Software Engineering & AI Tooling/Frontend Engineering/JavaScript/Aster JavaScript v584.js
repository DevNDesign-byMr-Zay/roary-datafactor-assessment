const VOLATILE_PARAMS = new Set([
  'token', 'sig', 'signature', 'expires', 'expiry', 'exp',
  't', 'ts', 'timestamp', 'cache', 'cb',
]);

export function canonicalizeMediaKey(source, baseUrl = globalThis.location?.href) {
  if (!source) return '';
  const value = String(source);

  if (/^blob:/i.test(value)) return value;
  if (/^data:/i.test(value)) return `data:${value.slice(0, 64)}::len=${value.length}`;

  try {
    const url = new URL(value, baseUrl);
    url.hash = '';

    const stable = [];
    for (const [key, val] of url.searchParams) {
      if (!VOLATILE_PARAMS.has(key.toLowerCase())) stable.push([key, val]);
    }

    stable.sort(([ak, av], [bk, bv]) =>
      ak.localeCompare(bk) || av.localeCompare(bv)
    );

    url.search = '';
    for (const [key, val] of stable) url.searchParams.append(key, val);
    return url.toString();
  } catch {
    return value;
  }
}
