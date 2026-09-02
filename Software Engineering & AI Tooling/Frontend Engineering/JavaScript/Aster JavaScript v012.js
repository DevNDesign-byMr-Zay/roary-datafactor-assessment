/*
  ASTER Remove/Object Removal bind v2
  - DO NOT touch Expand (8-point frame + animation preserved as-is)
  - DO NOT touch localStorage/IndexedDB keys
  - Ensure removeCurrentModalImage exists and calls the already-implemented Remove core (Ee)
  - Avoid AbortError by never passing an external aborted signal
*/
(function(){
  try{
    function bind(){
      try{
        const core = (typeof window.Ee === "function") ? window.Ee : null;
        if(!core) return false;

        // Canonical binding (used by tool runner)
        window.removeCurrentModalImage = async function(prompt){
          // prompt can be empty; mask drives the remove
          return await core(String(prompt||"").trim(), {}); // no signal
        };

        // Also create a real global identifier for older call sites (non-window resolution)
        try{ window.removeCurrentModalImage = window.removeCurrentModalImage; }catch(_){}
        try{
          // eslint-disable-next-line no-var
          var removeCurrentModalImage = window.removeCurrentModalImage;
          window.removeCurrentModalImage = removeCurrentModalImage;
        }catch(_){}

        return true;
      }catch(_){ return false; }
    }

    // Try now, then retry after late scripts hydrate
    if(!bind()){
      let tries=0;
      const t=setInterval(function(){
        tries++;
        if(bind() || tries>20) clearInterval(t);
      }, 250);
    }
  }catch(_){}
})();
