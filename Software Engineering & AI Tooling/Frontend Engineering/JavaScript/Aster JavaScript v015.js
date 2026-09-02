/* Aster early media proxy and local image-backend base lock. */
/* Early Media Proxy Patch (loads before other scripts)
   Proxies fal.media / fal.run images through http://127.0.0.1:5151/media to avoid QUIC/CORS weirdness when running from file:// */
(function(){
  try{
    if (HTMLImageElement.prototype.__asterMediaProxyPatched) return;

    function getBackendBase(){
      try{
        let b =
          (window.__asterImageBackendBase ||
           window.__asterImageToolBase ||
           (typeof localStorage!=="undefined" && (localStorage.getItem("aster.imageBackendBase") || localStorage.getItem("aster.imageToolBase"))) ||
           "http://127.0.0.1:5151");
        b = String(b||"").trim().replace(/\/+$/,"");
        if (/\/tool$/i.test(b)) b = b.replace(/\/tool$/i,"");
        return b || "http://127.0.0.1:5151";
      }catch(e){ return "http://127.0.0.1:5151"; }
    }

    function shouldProxy(u){
      try{ return /^https?:\/\/([^\/]+\.)?(fal\.media|fal\.run)(\/|$)/i.test(String(u||"")); }catch(e){ return false; }
    }

    function proxify(u){
      return getBackendBase() + "/media?url=" + encodeURIComponent(String(u||""));
    }

    const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
    if (desc && typeof desc.set === "function"){
      Object.defineProperty(HTMLImageElement.prototype, "src", {
        get: desc.get,
        set: function(v){
          try{
            if (typeof v === "string" && shouldProxy(v)) return desc.set.call(this, proxify(v));
          }catch(e){}
          return desc.set.call(this, v);
        },
        configurable: true,
        enumerable: true
      });
      HTMLImageElement.prototype.__asterMediaProxyPatched = true;
    }
  }catch(e){}
})();



(()=>{try{
  const k1="aster.imageBackendBase",k2="aster.imageToolBase";
  const v=localStorage.getItem(k1)||localStorage.getItem(k2);
  if(!v||!/5151/.test(v)){
    localStorage.setItem(k1,"http://127.0.0.1:5151");
    localStorage.setItem(k2,"http://127.0.0.1:5151");
  }
}catch(e){}})();
