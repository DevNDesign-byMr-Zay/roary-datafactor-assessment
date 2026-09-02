/* Aster JavaScript v063
Authenticated historical derivative: image-tool percentage progress controller.
The buyer-safe transport is locked to the local image-tool backend on port 5151.
Product identity, credentials, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterImageToolProgressV1) return;
  window.__asterImageToolProgressV1 = true;

  const REQUIRED_PORT = "5151";
  const DEFAULT_BASE = "http://127.0.0.1:5151";

  function normalizeBackendBase(value){
    let candidate = String(value || DEFAULT_BASE).trim();
    if(!candidate) candidate = DEFAULT_BASE;

    try{
      const url = new URL(candidate);
      if(url.protocol !== "http:" && url.protocol !== "https:"){
        throw new Error("Unsupported image-tool protocol.");
      }
      if(url.port !== REQUIRED_PORT){
        throw new Error("Image-tool backend must use port 5151.");
      }
      return url.origin;
    }catch(error){
      if(candidate === DEFAULT_BASE) return DEFAULT_BASE;
      throw error;
    }
  }

  function backendBase(){
    return normalizeBackendBase(
      window.__asterToolBackendBase ||
      window.__asterImageToolBackendBase ||
      DEFAULT_BASE
    );
  }

  function createProgressId(){
    return "job_" + Date.now().toString(36) + "_" +
      Math.random().toString(36).slice(2,8);
  }

  function attachProgressUI(button){
    if(!button) return null;
    button.classList.add("aster-exec-progress");

    let label = button.querySelector(".aster-exec-label");
    if(!label){
      label = document.createElement("span");
      label.className = "aster-exec-label";
      label.textContent = button.textContent.trim() || "EXECUTE";
      button.textContent = "";
      button.appendChild(label);
    }

    let percent = button.querySelector(".aster-exec-percent");
    if(!percent){
      percent = document.createElement("span");
      percent.className = "aster-exec-percent";
      percent.textContent = "0%";
      button.appendChild(percent);
    }

    let bar = button.querySelector(".aster-exec-bar");
    if(!bar){
      bar = document.createElement("span");
      bar.className = "aster-exec-bar";
      bar.setAttribute("aria-hidden","true");
      const fill = document.createElement("span");
      fill.className = "aster-exec-bar-fill";
      bar.appendChild(fill);
      button.appendChild(bar);
    }

    button.setAttribute("aria-live","polite");

    return {
      button,
      label,
      percent,
      fill:bar.querySelector(".aster-exec-bar-fill")
    };
  }

  function setPercent(ui,value){
    if(!ui) return 0;
    const percent = Math.max(0,Math.min(100,Math.floor(Number(value) || 0)));
    if(ui.percent) ui.percent.textContent = percent + "%";
    if(ui.fill) ui.fill.style.width = percent + "%";
    return percent;
  }

  function setLoading(ui,on){
    if(!ui) return;
    ui.button.classList.toggle("is-loading",!!on);
    ui.button.disabled = !!on;
  }

  function startProgress(options={}){
    const ui = attachProgressUI(options.button);
    const progressId = options.progressId || createProgressId();
    const pollEvery = Math.max(150,Number(options.pollEveryMs || 250));
    const fakeEvery = Math.max(120,Number(options.fakeEveryMs || 180));
    const signal = options.signal || null;

    let fake = 1;
    let stopped = false;
    let fakeTimer = null;
    let pollTimer = null;

    setLoading(ui,true);
    setPercent(ui,1);

    fakeTimer = setInterval(()=>{
      if(stopped || fake >= 92) return;
      fake += fake < 35 ? 2 : fake < 70 ? 1 : .5;
      setPercent(ui,fake);
    },fakeEvery);

    pollTimer = setInterval(async ()=>{
      if(stopped || signal?.aborted) return;
      try{
        const response = await fetch(
          `${backendBase()}/tool/progress/${encodeURIComponent(progressId)}`,
          {
            method:"GET",
            mode:"cors",
            credentials:"omit",
            cache:"no-store",
            signal:signal || undefined
          }
        );
        if(!response.ok) return;
        const payload = await response.json().catch(()=>null);
        if(!payload || payload.ok === false) return;

        if(payload.percent != null){
          setPercent(ui,payload.percent);
        }
        if(payload.status === "done" || payload.status === "error"){
          stop(payload.status === "done" ? 100 : null);
        }
      }catch(_){}
    },pollEvery);

    function stop(finalPercent=100){
      if(stopped) return;
      stopped = true;
      try{ clearInterval(fakeTimer); }catch(_){}
      try{ clearInterval(pollTimer); }catch(_){}
      fakeTimer = null;
      pollTimer = null;
      if(finalPercent != null) setPercent(ui,finalPercent);
      setLoading(ui,false);
    }

    return {
      id:progressId,
      ui,
      setPercent:value=>setPercent(ui,value),
      stop
    };
  }

  window.asterImageToolProgress = {
    requiredPort:Number(REQUIRED_PORT),
    backendBase,
    normalizeBackendBase,
    createProgressId,
    attachProgressUI,
    startProgress
  };
})();
