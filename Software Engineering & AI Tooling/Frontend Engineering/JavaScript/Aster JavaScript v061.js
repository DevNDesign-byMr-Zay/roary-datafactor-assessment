/* Aster JavaScript v061
Authenticated historical derivative: portable conversation/thread/media backup, restore, and one-click JSON import.
Product identity, credentials, proprietary prompts, and protected reasoning/visualization code removed.
*/
(function(){
  "use strict";
  if(window.__asterPortableMemoryArchiveV1) return;
  window.__asterPortableMemoryArchiveV1 = true;

  function readLocalJson(key,fallback=null){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(_){
      return fallback;
    }
  }

  function writeLocalJson(key,value){
    try{
      localStorage.setItem(key,JSON.stringify(value));
      return true;
    }catch(_){
      return false;
    }
  }

  async function requestPersistentStorage(){
    try{
      if(navigator.storage?.persist){
        return !!(await navigator.storage.persist());
      }
    }catch(_){}
    return false;
  }

  async function exportArchive(options={}){
    const listThreads = options.listThreads || window.asterListThreads;
    const listMedia = options.listMedia || window.asterListMediaItems;
    const conversationsKey = options.conversationsKey || "aster.conversations";

    const archive = {
      version:1,
      exportedAt:Date.now(),
      conversations:readLocalJson(conversationsKey,[]),
      threads:[],
      media:[]
    };

    if(typeof listThreads === "function"){
      try{ archive.threads = await listThreads() || []; }catch(_){}
    }
    if(typeof listMedia === "function"){
      try{ archive.media = await listMedia(Number(options.mediaLimit || 5000)) || []; }catch(_){}
    }

    if(options.download !== false){
      const blob = new Blob([JSON.stringify(archive)],{type:"application/json"});
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = options.filename || "aster_memory_export.json";
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(()=>{
        try{ URL.revokeObjectURL(url); }catch(_){}
        try{ anchor.remove(); }catch(_){}
      },500);
    }

    return archive;
  }

  async function importArchive(input,options={}){
    let data = input;
    if(typeof input === "string"){
      try{ data = JSON.parse(input); }
      catch(_){ return false; }
    }
    if(!data || typeof data !== "object") return false;

    const putThread = options.putThread || window.asterPutThread;
    const upsertMedia = options.upsertMedia || window.asterUpsertMediaItem;
    const refreshMedia = options.refreshMedia || window.asterRefreshMediaLibrary;
    const recoverMedia = options.recoverMedia || window.asterRecoverMediaFromThreads;
    const conversationsKey = options.conversationsKey || "aster.conversations";

    if(Array.isArray(data.conversations)){
      writeLocalJson(conversationsKey,data.conversations);
    }

    if(Array.isArray(data.threads) && typeof putThread === "function"){
      for(const thread of data.threads){
        try{
          if(thread?.id) await putThread(thread);
        }catch(_){}
      }
    }

    if(Array.isArray(data.media) && typeof upsertMedia === "function"){
      for(const item of data.media){
        try{
          if(item?.src) await upsertMedia(item.src,item);
        }catch(_){}
      }
    }

    if(typeof recoverMedia === "function"){
      try{ await recoverMedia(); }catch(_){}
    }
    if(typeof refreshMedia === "function"){
      try{ await refreshMedia(); }catch(_){}
    }

    return true;
  }

  async function importFromFile(options={}){
    return new Promise(resolve=>{
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.appendChild(input);

      input.onchange = async ()=>{
        try{
          const file = input.files?.[0];
          if(!file){
            resolve(false);
            return;
          }
          const text = await file.text();
          resolve(!!(await importArchive(text,options)));
        }catch(_){
          resolve(false);
        }finally{
          try{ input.remove(); }catch(_){}
        }
      };

      input.click();
    });
  }

  requestPersistentStorage().catch(()=>{});

  window.asterPortableMemory = {
    requestPersistentStorage,
    exportArchive,
    importArchive,
    importFromFile
  };
})();
