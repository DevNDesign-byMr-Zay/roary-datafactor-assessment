/* Aster JavaScript v097
Authenticated historical derivative: adaptive execution progress using persisted EMA durations across tools.
*/
(function(){
  "use strict";
  const STORE='aster.exec.ema.v1', ALPHA=.22, DEFAULT_MS=4200;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=t=>t*t*(3-2*t);
  const now=()=>performance?.now?.()??Date.now();
  let ema={}; try{ema=JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch{}
  const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(ema));}catch{}};
  const expected=key=>Number.isFinite(ema[key])&&ema[key]>150?ema[key]:DEFAULT_MS;
  const learn=(key,ms)=>{if(!(ms>0&&Number.isFinite(ms)))return; ema[key]=clamp(expected(key)*(1-ALPHA)+ms*ALPHA,250,60000); save();};
  function start(button,key='default',options={}){
    if(!button||button.dataset.asterBusy==='1') return null;
    button.dataset.asterBusy='1'; button.disabled=true; button.classList.add('is-loading');
    const started=now(); let estimate=Number(options.expectedMs)||expected(key), raf=0;
    const report=typeof options.onProgress==='function'?options.onProgress:p=>{const fill=button.querySelector('[data-aster-progress-fill]'); const pct=button.querySelector('[data-aster-progress-pct]'); if(fill)fill.style.width=`${(p*100).toFixed(1)}%`; if(pct)pct.textContent=`${Math.round(p*100)}%`;};
    const tick=()=>{const elapsed=now()-started; if(elapsed>estimate*.98) estimate=elapsed/.98*1.15; report(smooth(clamp(elapsed/estimate,0,.96))); raf=requestAnimationFrame(tick);};
    raf=requestAnimationFrame(tick); return {button,key,started,raf,report};
  }
  function end(handle,ok=true){if(!handle)return; cancelAnimationFrame(handle.raf); const elapsed=now()-handle.started; learn(handle.key,elapsed); handle.report(1); const button=handle.button; setTimeout(()=>{if(!button)return; button.classList.remove('is-loading'); button.disabled=false; button.dataset.asterBusy='0'; handle.report(0);},ok?520:900);}
  async function run(key,button,fn,options={}){const h=start(button,key,options); try{const result=await fn(); end(h,true); return result;}catch(e){end(h,false); throw e;}}
  window.AsterExecutionProgress={start,end,run};
})();
