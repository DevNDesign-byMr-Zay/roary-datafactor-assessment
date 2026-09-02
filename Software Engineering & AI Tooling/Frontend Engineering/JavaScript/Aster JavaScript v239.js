/* Aster JavaScript v239 — authenticated buyer-safe derivative: persisted active-tool key retrieval. Host state/dependencies are intentionally external. */
function getStoredTools(){
    try{
      const raw = localStorage.getItem("aster.tools.active") || "[]";
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    }catch(_){ return []; }
  }
