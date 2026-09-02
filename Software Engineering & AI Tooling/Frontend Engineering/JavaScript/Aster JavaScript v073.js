/* Aster JavaScript v073
Authenticated historical derivative: browser fetch-failure diagnostics for configurable local services.
No credentials, personal paths, product identity, fixed chat ports, or Image Orb fallbacks are embedded.
*/
(function(){
  "use strict";
  if(window.__asterLocalFetchDiagnosticsV1) return;
  window.__asterLocalFetchDiagnosticsV1 = true;

  function normalizeBase(value){
    return String(value || "").trim().replace(/\/+$/,"");
  }

  async function diagnose(base,options={}){
    const target = normalizeBase(base);
    if(!target){
      return {
        kind:"invalid-base",
        reachable:false,
        message:"No local service URL is configured."
      };
    }

    const probePath =
      String(options.probePath || "/").startsWith("/")
        ? String(options.probePath || "/")
        : "/" + String(options.probePath || "/");

    try{
      await fetch(target + probePath,{
        mode:"no-cors",
        cache:"no-store",
        credentials:"omit"
      });

      return {
        kind:"cors-or-request-policy",
        reachable:true,
        base:target,
        message:
          "The local service is reachable, but the browser request may be blocked by CORS or another request policy."
      };
    }catch(error){
      return {
        kind:"unreachable",
        reachable:false,
        base:target,
        message:"The configured local service could not be reached.",
        error:String(error?.message || error || "")
      };
    }
  }

  async function explainFailure(error,base,options={}){
    const message = String(error?.message || error || "");
    if(!/failed to fetch|networkerror|load failed|network request failed/i.test(message)){
      return {
        kind:"request-error",
        reachable:null,
        base:normalizeBase(base),
        message
      };
    }
    return diagnose(base,options);
  }

  async function renderDiagnostic(container,error,base,options={}){
    if(!container) return null;

    container.textContent = options.pendingText || "Diagnosing…";
    const result = await explainFailure(error,base,options);

    if(result?.message){
      container.textContent = result.message;
      container.dataset.asterDiagnosticKind = result.kind || "";
    }else{
      container.remove();
    }

    return result;
  }

  window.asterLocalFetchDiagnostics = {
    normalizeBase,
    diagnose,
    explainFailure,
    renderDiagnostic
  };
})();
