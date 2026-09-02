/**
 * Aster JavaScript v105
 * JSON-first local image-tool transport with bounded, CORS-safe source normalization.
 */
(function (global) {
  'use strict';
  const DEFAULT_BASE = 'http://127.0.0.1:5151';
  const BASE_RE = /^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;
  const ALLOWED_TOOLS = new Set(['edit', 'expand', 'erase', 'remove']);

  function localBase(value) {
    const candidate = String(value || global.__asterToolBackendBase || DEFAULT_BASE).trim().replace(/\/+$/, '');
    if (!BASE_RE.test(candidate + '/')) throw new Error('Image-tool backend must use localhost port 5151.');
    return candidate;
  }
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Unable to read image blob.'));
      reader.readAsDataURL(blob);
    });
  }
  async function toDataURL(value, signal) {
    if (value instanceof Blob) return blobToDataURL(value);
    const src = String(value || '').trim();
    if (!src) return '';
    if (/^data:image\//i.test(src)) return src;
    if (/^blob:/i.test(src) || /^https?:\/\//i.test(src)) {
      const response = await fetch(src, { mode: 'cors', credentials: 'omit', cache: 'no-store', signal });
      if (!response.ok) throw new Error(`Image fetch failed (${response.status}).`);
      return blobToDataURL(await response.blob());
    }
    return '';
  }
  async function run(tool, options) {
    const opts = options || {};
    const name = String(tool || '').trim().toLowerCase();
    if (!ALLOWED_TOOLS.has(name)) throw new Error('Unsupported image tool.');
    const image = await toDataURL(opts.image, opts.signal);
    if (!image) throw new Error('A persistent image source is required.');
    const payload = {
      image_url: image,
      prompt: String(opts.prompt || '').trim(),
      output_format: String(opts.outputFormat || 'png')
    };
    if (opts.mask) payload.mask_data_url = await toDataURL(opts.mask, opts.signal);
    if (Array.isArray(opts.references)) {
      payload.reference_images = (await Promise.all(opts.references.slice(0, 3).map(v => toDataURL(v, opts.signal)))).filter(Boolean);
    }
    if (opts.parameters && typeof opts.parameters === 'object') Object.assign(payload, opts.parameters);
    const response = await fetch(`${localBase(opts.base)}/tool/${name}_json`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      mode: 'cors', credentials: 'omit', cache: 'no-store', signal: opts.signal
    });
    const text = await response.text();
    let data = null; try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { raw: text }; }
    if (!response.ok) throw new Error((data && (data.detail || data.error)) || `Image tool failed (${response.status}).`);
    return data;
  }
  global.AsterJsonImageTools = { run, toDataURL, localBase };
})(window);
