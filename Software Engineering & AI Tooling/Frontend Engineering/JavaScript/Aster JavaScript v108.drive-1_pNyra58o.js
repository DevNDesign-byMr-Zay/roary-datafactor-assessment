(function (g) {
  'use strict';
  function create(options) {
    options = options || {};
    var prefix = String(options.prefix || 'aster.sidebar.');
    var limits = {threads:Number(options.maxThreads||24), messages:Number(options.maxMessages||80), media:Number(options.maxMedia||30)};
    function get(key, fallback) { try { var v=JSON.parse(localStorage.getItem(prefix+key)); return v == null ? fallback : v; } catch (_) { return fallback; } }
    function set(key, value) { try { localStorage.setItem(prefix+key, JSON.stringify(value)); } catch (_) {} return value; }
    function capThreads(list) {
      list = Array.isArray(list) ? list.slice(0, limits.threads) : [];
      return list.map(function(t){ var x=Object.assign({},t||{}); if(Array.isArray(x.messages)) x.messages=x.messages.slice(-limits.messages); return x; });
    }
    return {
      getThreads:function(){return get('threads',[]);}, setThreads:function(v){return set('threads',capThreads(v));},
      getActiveId:function(){return get('activeId',null);}, setActiveId:function(v){return set('activeId',v);},
      getMedia:function(){return get('media',[]);}, setMedia:function(v){return set('media',(Array.isArray(v)?v:[]).slice(0,limits.media));}
    };
  }
  g.AsterSidebarStore = {create:create};
})(window);
