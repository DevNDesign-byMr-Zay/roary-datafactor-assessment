(function (g) {
  'use strict';
  function sortThreads(list) {
    return (Array.isArray(list) ? list.slice() : []).sort(function(a,b){
      var pin=(Number(Boolean(b&&b.pinned))-Number(Boolean(a&&a.pinned))); if(pin) return pin;
      return Number((b&&b.updatedAt)||0)-Number((a&&a.updatedAt)||0);
    });
  }
  function populate(root, items, render, force) {
    if (!root || typeof render !== 'function') return false;
    if (!force && root.children && root.children.length) return false;
    var list=sortThreads(items);
    if (!list.length) return false;
    var frag=document.createDocumentFragment();
    list.forEach(function(item){ var node=render(item); if(node) frag.appendChild(node); });
    if (!force && root.children && root.children.length) return false;
    root.replaceChildren(frag); return true;
  }
  function recover(options) {
    options=options||{};
    var threads=typeof options.getThreads==='function'?options.getThreads():[];
    var media=typeof options.getMedia==='function'?options.getMedia():[];
    var a=populate(options.threadRoot,threads,options.renderThread,options.force);
    var b=populate(options.mediaRoot,media,options.renderMedia,options.force);
    return {threads:a,media:b};
  }
  g.AsterSidebarRecovery = {recover:recover, sortThreads:sortThreads};
})(window);
