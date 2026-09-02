function asterNormalizeMediaSrc(src){
  try{
    if(src==null) return "";
    let s = String(src).trim();
    if(!s || s==="undefined" || s==="null") return "";

    // Repair common corruption: file:///.../data:image... or file:///.../blob:...
    if(/^file:/i.test(s)){
      const di = s.indexOf('data:image');
      if(di!==-1) return s.slice(di);
      const bi = s.indexOf('blob:');
      if(bi!==-1) return s.slice(bi);
      const du = s.indexOf('data%3Aimage');
      if(du!==-1){
        try{ return decodeURIComponent(s.slice(du)); }catch(_){ return s.slice(du).replace(/^data%3A/,'data:'); }
      }
    }

    // Repair: accidental path prefix without file: scheme
    const di2 = s.indexOf('data:image');
    if(di2>0 && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return s.slice(di2);

    // If it already has a URL scheme (data:, blob:, http:, https:, file:, etc.) keep it.
    if(/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return s;

    // Otherwise resolve relative to the current document
    try{ return new URL(s, location.href).href; }catch(_){ return s; }
  }catch(_){ return ""; }
}

async function asterMediaDeleteBySrc(src){
  try{
    src = String(src||"").trim();
    if(!src) return false;
    const db = await zn();
    return await new Promise(res=>{
      try{
        const tx = db.transaction('items','readwrite');
        const store = tx.objectStore('items');
        const idx = store.index('src');
        const gk = idx.getKey(src);
        gk.onsuccess = ()=>{
          const key = gk.result;
          if(key==null){ res(false); return; }
          const del = store.delete(key);
          del.onsuccess = ()=>res(true);
          del.onerror = ()=>res(false);
        };
        gk.onerror = ()=>res(false);
      }catch(_){ res(false); }
    });
  }catch(_){ return false; }
}

async function asterRecoverMediaFromThreads(){
  try{
    let existing=[];
    try{ existing=await jn(1) }catch(_){ existing=[] }
    if(existing&&existing.length){ try{ await Hn() }catch(_){} return; }
    try{ if(localStorage.getItem("aster.media.recovered.v1")==="1"){ try{ await Hn() }catch(_){} return; } }catch(_){}
    const threads=Array.isArray(dn)?dn:[];
    const seen=new Set();
    let count=0;
    for(const th of threads){
      const tid=th&&th.id?th.id:null;
      const title=(th&&th.title)||"";
      const imgs=[];
      try{ th&&th.latestSrc&&imgs.push(th.latestSrc); }catch(_){}
      try{ Array.isArray(th&&th.images)&&imgs.push(...th.images); }catch(_){}
      const msgs=Array.isArray(th&&th.messages)?th.messages:[];
      let prompt="";
      for(let i=msgs.length-1;i>=0;i--){
        const m=msgs[i];
        if(m&&m.role==="user"&&typeof m.text==="string"&&m.text.trim()){ prompt=m.text.trim(); break; }
      }
      if(!prompt&&title) prompt=title;
      for(const m of msgs){
        if(!m) continue;
        if(typeof m.src==="string") imgs.push(m.src);
        if(typeof m.imageSrc==="string") imgs.push(m.imageSrc);
        if(typeof m.image==="string") imgs.push(m.image);
        if(Array.isArray(m.images)) imgs.push(...m.images);
      }
      for(const src of imgs){
        const s=String(src||"").trim();
        if(!s) continue;
        if(seen.has(s)) continue;
        seen.add(s);
        if(/^blob:null\//i.test(s)) continue;
        try{
          const id=Date.now().toString(36)+Math.random().toString(36).slice(2);
          const ts=(th&&(th.updatedTs||th.ts))||Date.now();
          await Xn(s,{id:id,prompt:prompt||"",title:prompt||"",kind:"image",ts:ts,threadId:tid||null,parentSrc:null});
          try{ tid&&k&&k(s,tid) }catch(_){}
          count++;
        }catch(_){}
        if(count>=300) break;
      }
      if(count>=300) break;
    }
    try{ localStorage.setItem("aster.media.recovered.v1","1") }catch(_){}
    try{ await Hn() }catch(_){}
  }catch(_){ try{ await Hn() }catch(__){} }
}
