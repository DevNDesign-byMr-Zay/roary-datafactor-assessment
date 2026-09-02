/* Aster JavaScript v045
Authenticated historical derivative: early media proxy routing for generated-image hosts.
Original product identity, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
Image-tool media routing is locked to 127.0.0.1:5151.
*/
(function(){
  const DEFAULT_BASE = "http://127.0.0.1:5151";

  function backendBase(){
    try{
      const candidate = String(
        window.__asterToolBackendBase ||
        window.__asterImageBackendBase ||
        localStorage.getItem("aster.imageBackendBase") ||
        localStorage.getItem("aster.imageToolBase") ||
        DEFAULT_BASE
      ).trim().replace(/\/+$/, "").replace(/\/tool$/i, "");

      return /^https?:\/\/(?:127\.0\.0\.1|localhost):5151$/i.test(candidate)
        ? candidate
        : DEFAULT_BASE;
    }catch(_){
      return DEFAULT_BASE;
    }
  }

  function shouldProxy(url){
    try{
      return /^https?:\/\/([^/]+\.)?(fal\.media|fal\.run)(\/|$)/i.test(String(url || ""));
    }catch(_){
      return false;
    }
  }

  function proxify(url){
    return backendBase() + "/media?url=" + encodeURIComponent(String(url || ""));
  }

  try{
    if(HTMLImageElement.prototype.__asterMediaProxyPatched) return;

    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
    if(!descriptor || typeof descriptor.set !== "function") return;

    Object.defineProperty(HTMLImageElement.prototype, "src", {
      get: descriptor.get,
      set: function(value){
        try{
          if(typeof value === "string" && shouldProxy(value)){
            return descriptor.set.call(this, proxify(value));
          }
        }catch(_){}
        return descriptor.set.call(this, value);
      },
      configurable: true,
      enumerable: true
    });

    HTMLImageElement.prototype.__asterMediaProxyPatched = true;
  }catch(_){}
})();
