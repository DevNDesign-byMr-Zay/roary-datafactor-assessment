/** Aster JavaScript v119 — one-click JSON import picker that delegates to an existing importer. */
(function (global) {
  'use strict';
  function pickJsonFile(options) {
    const o=options||{}, importer=o.importer;
    if(typeof importer!=='function') return Promise.reject(new TypeError('importer callback required'));
    return new Promise(resolve=>{
      const input=document.createElement('input'); input.type='file'; input.accept='application/json,.json'; input.hidden=true; document.body.appendChild(input);
      const cleanup=()=>{ try{input.remove();}catch(_){} };
      input.onchange=async()=>{ try{ const file=input.files&&input.files[0]; if(!file){resolve(false);return;} const text=await file.text(); const data=JSON.parse(text); resolve(Boolean(await importer(data,{fileName:file.name}))); }catch(_){resolve(false);}finally{cleanup();} };
      input.oncancel=()=>{cleanup();resolve(false);}; input.click();
    });
  }
  global.AsterJsonImportPicker = { pickJsonFile };
})(window);
