/* Aster JavaScript v286 — authenticated buyer-safe derivative: data-URL to Blob conversion. Host state/dependencies are intentionally external. */
async function dataUrlToBlob(url){
    const r = await fetch(url, { cache: "no-store" });
    if(!r.ok) throw new Error("Failed to read source ("+r.status+")");
    return await r.blob();
  }
