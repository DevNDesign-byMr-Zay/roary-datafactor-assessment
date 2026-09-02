/* Aster JavaScript v176
Authenticated historical derivative: portable single-conversation JSON export.
Distinct from full-memory archive export: this serializes one selected thread with a safe filename and deterministic URL cleanup.
*/
(function(global){
  "use strict";
  if(global.AsterConversationExport) return;

  function safeFilename(value,fallback="conversation"){
    const name=String(value||fallback)
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g," ")
      .replace(/\s+/g," ")
      .trim()
      .replace(/[. ]+$/,"");
    return (name||fallback).slice(0,96)+".json";
  }

  function serialize(thread){
    if(!thread || typeof thread!=="object") throw new Error("Conversation object required");
    return JSON.stringify(thread,null,2);
  }

  function makeDownload(thread,options={}){
    const blob=new Blob([serialize(thread)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const filename=safeFilename(thread.title,options.fallbackName||"conversation");

    const revoke=()=>{
      try{ URL.revokeObjectURL(url); }catch(_){}
    };

    return {blob,url,filename,revoke};
  }

  function download(thread,options={}){
    const resource=makeDownload(thread,options);
    const anchor=document.createElement("a");
    anchor.href=resource.url;
    anchor.download=resource.filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(resource.revoke,Math.max(0,Number(options.revokeDelayMs)||1000));
    return resource.filename;
  }

  global.AsterConversationExport={
    safeFilename,
    serialize,
    makeDownload,
    download
  };
})(window);
