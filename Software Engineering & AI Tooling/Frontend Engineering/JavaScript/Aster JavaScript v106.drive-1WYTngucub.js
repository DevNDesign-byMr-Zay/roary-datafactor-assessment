(function (g) {
  'use strict';
  var DEFAULT_BASE = 'http://127.0.0.1:5151';
  var LOCK = /^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;
  function normalizeBase(value) {
    var base = String(value || DEFAULT_BASE).replace(/\/+$/, '');
    if (!LOCK.test(base + '/')) throw new Error('Backend base must use localhost or 127.0.0.1 on port 5151.');
    return base;
  }
  async function run(imageUrl, options) {
    options = options || {};
    var body = {
      image_url: String(imageUrl || ''),
      mood: String(options.mood || 'neutral'),
      level: Number.isFinite(Number(options.level)) ? Number(options.level) : 1,
      prompt: String(options.prompt || ''),
      output_format: String(options.outputFormat || 'png'),
      sync_mode: options.syncMode !== false
    };
    if (!body.image_url) throw new Error('imageUrl is required.');
    var endpoint = String(options.endpoint || 'relight_json').replace(/^\/+/, '');
    var res = await fetch(normalizeBase(options.base) + '/tool/' + encodeURIComponent(endpoint), {
      method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
      headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
    });
    var text = await res.text();
    var data = null;
    try { data = text ? JSON.parse(text) : {}; } catch (_) { data = {raw:text}; }
    if (!res.ok) throw new Error((data && (data.detail || data.error || data.message)) || ('HTTP ' + res.status));
    return data;
  }
  g.AsterJsonRelight = {run:run, normalizeBase:normalizeBase};
})(window);
