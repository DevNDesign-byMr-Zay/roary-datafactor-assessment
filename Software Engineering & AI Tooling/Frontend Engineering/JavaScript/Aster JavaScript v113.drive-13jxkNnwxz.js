(function (g) {
  'use strict';
  function extract(text){
    var s=String(text||''), out=[], m;
    var md=/!\[[^\]]*\]\(([^)]+)\)/g; while((m=md.exec(s))) out.push(m[1]);
    var html=/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi; while((m=html.exec(s))) out.push(m[1]);
    return out;
  }
  async function recover(threads,write){
    var seen=new Set(), items=[];
    (threads||[]).forEach(function(t){(t&&Array.isArray(t.messages)?t.messages:[]).forEach(function(msg){
      extract((msg&&msg.content)||(msg&&msg.text)||'').forEach(function(src){src=String(src||'').trim(); if(src&&!seen.has(src)){seen.add(src);items.push({src:src,threadId:t.id||null,recoveredAt:Date.now()});}});
    });});
    if(typeof write==='function'&&items.length) await write(items); return items;
  }
  g.AsterThreadMediaRecovery={extract:extract,recover:recover};
})(window);
