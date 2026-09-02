/* Aster JavaScript v177
   Authenticated historical derivative: portable assistant-response plain-text export.
   Distinct from conversation JSON export: one response string becomes a UTF-8 text download
   with a safe filename and deterministic ObjectURL cleanup.
*/
(function(global){
  "use strict";

  if(global.AsterResponseTextExport) return;

  function safeFilename(value, fallback="assistant_response"){
    const base=String(value || fallback)
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[. ]+$/, "");
    const bounded=(base || fallback).slice(0, 96);
    return /\.txt$/i.test(bounded) ? bounded : `${bounded}.txt`;
  }

  function makeDownload(text, options={}){
    const blob=new Blob([String(text || "")], {type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const filename=safeFilename(options.filename, options.fallbackName || "assistant_response");
    const revoke=()=>{
      try{ URL.revokeObjectURL(url); }catch(_){ }
    };
    return {blob, url, filename, revoke};
  }

  function download(text, options={}){
    const resource=makeDownload(text, options);
    const anchor=document.createElement("a");
    anchor.href=resource.url;
    anchor.download=resource.filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    resource.revoke();
    return resource.filename;
  }

  global.AsterResponseTextExport={safeFilename, makeDownload, download};
})(window);
