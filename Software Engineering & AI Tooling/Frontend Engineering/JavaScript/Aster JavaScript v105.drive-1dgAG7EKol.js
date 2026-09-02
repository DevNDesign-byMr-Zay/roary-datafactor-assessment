(function (g) {
  'use strict';
  function install(options) {
    options = options || {};
    var interval = Math.max(250, Number(options.intervalMs || 700));
    var getActiveId = options.getActiveId;
    var getActiveThread = options.getActiveThread;
    var setCurrentId = options.setCurrentId;
    var setCurrentThread = options.setCurrentThread;
    var saveThreads = options.saveThreads;
    var saveMedia = options.saveMedia;
    function sync() {
      try {
        if (typeof getActiveId === 'function' && typeof setCurrentId === 'function') setCurrentId(getActiveId());
        if (typeof getActiveThread === 'function' && typeof setCurrentThread === 'function') setCurrentThread(getActiveThread());
      } catch (_) {}
    }
    var timer = g.setInterval(sync, interval);
    var flush = function () {
      try { if (typeof saveThreads === 'function') saveThreads(); } catch (_) {}
      try { if (typeof saveMedia === 'function') saveMedia(); } catch (_) {}
    };
    g.addEventListener('beforeunload', flush, {capture:true});
    sync();
    return function dispose() { g.clearInterval(timer); g.removeEventListener('beforeunload', flush, {capture:true}); };
  }
  g.AsterStateSync = { install: install };
})(window);
