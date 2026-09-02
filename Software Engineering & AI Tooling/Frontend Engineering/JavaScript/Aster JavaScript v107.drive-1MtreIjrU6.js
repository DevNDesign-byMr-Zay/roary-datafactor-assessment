(function (g) {
  'use strict';
  function trimText(value, max) { return String(value == null ? '' : value).slice(0, max); }
  function stripEmbeddedImages(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+/ig, '[embedded image omitted]');
  }
  function pruneThreads(input, options) {
    options = options || {};
    var maxThreads = Number(options.maxThreads || 20), maxMessages = Number(options.maxMessages || 70), maxText = Number(options.maxText || 4000);
    var list = Array.isArray(input) ? input.slice(0, maxThreads) : [];
    return list.map(function (thread) {
      var out = Object.assign({}, thread || {});
      var messages = Array.isArray(out.messages) ? out.messages.slice(-maxMessages) : [];
      out.messages = messages.map(function (m) {
        var item = Object.assign({}, m || {});
        if ('content' in item) item.content = trimText(stripEmbeddedImages(item.content), maxText);
        if ('text' in item) item.text = trimText(stripEmbeddedImages(item.text), maxText);
        return item;
      });
      return out;
    });
  }
  function pruneStoredJson(key, options) {
    try {
      var parsed = JSON.parse(localStorage.getItem(key) || '[]');
      var clean = pruneThreads(parsed, options);
      localStorage.setItem(key, JSON.stringify(clean));
      return clean;
    } catch (_) { return []; }
  }
  g.AsterStoragePrune = {pruneThreads:pruneThreads, pruneStoredJson:pruneStoredJson};
})(window);
