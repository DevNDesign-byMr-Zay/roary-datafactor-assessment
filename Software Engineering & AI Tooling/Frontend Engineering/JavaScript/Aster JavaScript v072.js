/* Aster JavaScript v072
Authenticated historical derivative: periodic reachability gate for the separate local web-tool router.
Port 5055 is reserved here for the web-tool/search router; Image Orb remains locked to port 5151.
Historical secondary image-backend fallback logic is intentionally excluded.
*/
(function(){
  "use strict";
  if(window.__asterWebToolReachabilityV1) return;
  window.__asterWebToolReachabilityV1 = true;

  const DEFAULT_WEB_TOOL_BASE = "http://127.0.0.1:5055";

  function normalizeBase(value){
    return String(value || "").trim().replace(/\/+$/,"");
  }

  function configuredBase(){
    let stored = "";
    try{ stored = localStorage.getItem("aster.webToolBase") || ""; }
    catch(_){}

    return normalizeBase(
      window.__asterWebToolBase ||
      stored ||
      DEFAULT_WEB_TOOL_BASE
    );
  }

  async function ping(base=configuredBase()){
    const target = normalizeBase(base);
    if(!target) return false;

    try{
      // Reachability probe only. It does not authorize Image Orb routing.
      await fetch(target + "/",{
        mode:"no-cors",
        cache:"no-store",
        credentials:"omit"
      });
      window.__asterWebToolReachable = true;
      document.dispatchEvent(new CustomEvent("aster:web-tool-reachability",{
        detail:{base:target,reachable:true}
      }));
      return true;
    }catch(_){
      window.__asterWebToolReachable = false;
      document.dispatchEvent(new CustomEvent("aster:web-tool-reachability",{
        detail:{base:target,reachable:false}
      }));
      return false;
    }
  }

  function start(options={}){
    const intervalMs = Math.max(
      1500,
      Number(options.intervalMs || 4500)
    );

    let timer = null;
    const run = ()=>ping(options.base || configuredBase()).catch(()=>false);

    run();
    timer = setInterval(run,intervalMs);

    return {
      stop(){
        if(timer) clearInterval(timer);
        timer = null;
      },
      ping:run
    };
  }

  window.asterWebToolReachability = {
    defaultBase:DEFAULT_WEB_TOOL_BASE,
    configuredBase,
    ping,
    start
  };
})();
