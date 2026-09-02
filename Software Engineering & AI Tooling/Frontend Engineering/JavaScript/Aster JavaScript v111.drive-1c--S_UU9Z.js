(function (g) {
  'use strict';
  function keyOf(x){return String((x&&x.id)||(x&&x.src)||(x&&x.url)||'');}
  function merge(list) { var m=new Map(); (list||[]).forEach(function(x){var k=keyOf(x); if(k)m.set(k,x);}); return Array.from(m.values()).sort(function(a,b){return Number((b&&b.updatedAt)||0)-Number((a&&a.updatedAt)||0);}); }
  async function restore(stores) {
    var out=[];
    for (var i=0;i<(stores||[]).length;i++) {
      var store=stores[i]; var values=typeof store==='function'?await store():store;
      if (!Array.isArray(values)) continue;
      values.forEach(function(item){
        var x=Object.assign({},item||{});
        if (x.blob instanceof Blob) { x.src=URL.createObjectURL(x.blob); delete x.blob; }
        else if (x.src && /^https?:|^data:|^blob:/i.test(String(x.src))) x.src=String(x.src);
        out.push(x);
      });
    }
    return merge(out);
  }
  g.AsterLocalMediaRestore = {restore:restore,merge:merge};
})(window);
