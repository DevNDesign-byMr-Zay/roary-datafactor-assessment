/* Aster image-backend base normalization and stale-abort isolation. */
(function(){
  const LOG_PREFIX="[ASTER][ImgBaseFix]";
  const log=(...a)=>{ try{ console.log(LOG_PREFIX,...a); }catch(e){} };

  function norm(u){
    if(!u) return "";
    u=String(u).trim();
    if(!u) return "";
    u=u.replace(/\s+/g,"");
    u=u.replace(/\/+$/,"");
    // If stored a tool base or endpoint, reduce to backend base (scheme://host:port)
    u=u.replace(/(https?:\/\/[^\/]+)\/tool(?:\/.*)?$/,"$1");
    u=u.replace(/(https?:\/\/[^\/]+)\/.*$/,"$1");
    return u;
  }

  // Override asterImageBase to avoid /tool/tool mismatches from stored overrides.
  window.asterImageBase = async function(){
    const cands=[];
    try{
      cands.push(localStorage.getItem("aster.imageBackendBase"));
      cands.push(localStorage.getItem("aster.imageToolBase"));
      cands.push(localStorage.getItem("aster.imgApi"));
      cands.push(localStorage.getItem("aster.imageApiBase"));
    }catch(e){}
    cands.push("http://127.0.0.1:5151","http://localhost:5151");
    for(let u of cands){
      u=norm(u);
      if(/^https?:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(u)) return u;
    }
    return "http://127.0.0.1:5151";
  };

  window.__asterGetImageToolBase = async function(){
    const b = await window.asterImageBase();
    return b.replace(/\/+$/,"") + "/tool";
  };

  // Wrap removeCurrentModalImage to prevent stale-aborted signals.
  const origRemove = window.removeCurrentModalImage;
  if(typeof origRemove === "function"){
    window.removeCurrentModalImage = async function(prompt, opts){
      opts = opts || {};
      const upstream = opts.signal;
      const timeoutMs = Number(opts.timeoutMs || 180000);
      const ac = new AbortController();
      if(upstream && typeof upstream.addEventListener==="function" && !upstream.aborted){
        upstream.addEventListener("abort", ()=>ac.abort(), {once:true});
      }
      const tm = setTimeout(()=>ac.abort(), timeoutMs);
      const clean = Object.assign({}, opts, {signal: ac.signal});
      try{
        // Legacy hint: some older patches look for aster_imageToolBase
        try{ window.aster_imageToolBase = await window.__asterGetImageToolBase(); }catch(e){}
        return await origRemove.call(this, prompt, clean);
      } finally {
        clearTimeout(tm);
      }
    };
    log("remove/erase base + signal fix applied");
  } else {
    log("removeCurrentModalImage missing at patch time; base fix still applied");
  }

  window.__asterDebugImageBases = async function(){
    const backendBase = await window.asterImageBase();
    const toolBase = await window.__asterGetImageToolBase();
    log("backendBase=", backendBase, "toolBase=", toolBase);
    return { backendBase, toolBase };
  };
})();
