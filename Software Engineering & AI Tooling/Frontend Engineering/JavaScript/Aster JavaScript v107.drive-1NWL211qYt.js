/** Aster JavaScript v107 — JSON Relight transport with mood/level controls and port-5151 lockdown. */
(function (global) {
  'use strict';
  const DEFAULT_BASE = 'http://127.0.0.1:5151';
  const BASE_RE = /^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;
  function base(value) {
    const b = String(value || global.__asterToolBackendBase || DEFAULT_BASE).trim().replace(/\/+$/, '');
    if (!BASE_RE.test(b + '/')) throw new Error('Relight backend must use localhost port 5151.');
    return b;
  }
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader(); r.onload = () => resolve(String(r.result || ''));
      r.onerror = () => reject(r.error || new Error('Blob read failed.')); r.readAsDataURL(blob);
    });
  }
  async function persistentImage(value, signal) {
    if (value instanceof Blob) return blobToDataURL(value);
    const s = String(value || '').trim();
    if (/^data:image\//i.test(s)) return s;
    if (!/^blob:|^https?:\/\//i.test(s)) return '';
    const r = await fetch(s, { mode: 'cors', credentials: 'omit', cache: 'no-store', signal });
    if (!r.ok) throw new Error(`Image fetch failed (${r.status}).`);
    return blobToDataURL(await r.blob());
  }
  async function relight(options) {
    const o = options || {};
    const image_url = await persistentImage(o.image, o.signal);
    if (!image_url) throw new Error('Relight requires a persistent image source.');
    const payload = {
      image_url,
      mood: String(o.mood || 'Neutral'),
      level: Math.max(0, Math.min(1, Number.isFinite(Number(o.level)) ? Number(o.level) : 1)),
      prompt: String(o.prompt || '').trim(),
      output_format: String(o.outputFormat || 'png'),
      sync_mode: true
    };
    const r = await fetch(`${base(o.base)}/tool/relight_json`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      mode: 'cors', credentials: 'omit', cache: 'no-store', signal: o.signal
    });
    const text = await r.text(); let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { raw: text }; }
    if (!r.ok) throw new Error(data.detail || data.error || `Relight failed (${r.status}).`);
    return data;
  }
  global.AsterRelightJson = { relight, persistentImage };
})(window);
