/* Aster JavaScript v096
Authenticated historical derivative: time-accurate execution progress with server progress polling.
Local backend is locked to port 5151.
*/
(function(){
  "use strict";
  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function base(options={}){
    const value=String(options.baseUrl||window.__asterToolBackendBase||'http://127.0.0.1:5151').replace(/\/+$/,'');
    if(!LOCAL_5151.test(value+'/')) throw new Error('Progress backend must use localhost port 5151');
    return value;
  }
  function id(){return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;}
  async function run(options={}){
    const progressId=id(), eta=Math.max(250,Number(options.etaMs)||4200), started=performance.now();
    const onProgress=typeof options.onProgress==='function'?options.onProgress:()=>{};
    let stopped=false, raf=0, timer=0, serverPct=0;
    const animate=()=>{if(stopped)return; const elapsed=performance.now()-started; const local=clamp(elapsed/eta,0,.92); onProgress(Math.max(local,serverPct)); raf=requestAnimationFrame(animate);};
    raf=requestAnimationFrame(animate);
    const poll=async()=>{if(stopped)return; try{const r=await fetch(`${base(options)}/tool/progress/${encodeURIComponent(progressId)}`,{mode:'cors',credentials:'omit',cache:'no-store'}); const p=await r.json().catch(()=>({})); const n=Number(p.progress??p.pct); if(Number.isFinite(n)) serverPct=clamp(n>1?n/100:n,0,.98);}catch{} timer=setTimeout(poll,240);};
    timer=setTimeout(poll,240);
    try{
      const form=typeof options.makeFormData==='function'?await options.makeFormData(progressId):new FormData();
      if(!(form instanceof FormData)) throw new TypeError('makeFormData must return FormData');
      form.set('progress_id',progressId);
      const tool=String(options.tool||'').replace(/^\/+|\/+$/g,''); if(!tool) throw new Error('tool is required');
      const response=await fetch(`${base(options)}/tool/${tool}`,{method:'POST',body:form,mode:'cors',credentials:'omit',cache:'no-store'});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||payload.ok===false) throw new Error(payload.detail||payload.error||`Tool failed (${response.status})`);
      onProgress(1); return payload;
    }finally{stopped=true; cancelAnimationFrame(raf); clearTimeout(timer);}
  }
  window.runAsterTimedProgress=run;
})();
