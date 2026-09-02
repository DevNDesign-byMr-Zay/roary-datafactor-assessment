/* Aster JavaScript v025
Authenticated historical derivative: stricter backend normalization/probing plus
error-preserving remove-endpoint fallback.
Original product identity, private architecture, prompts, credentials, and personal paths removed.
*/
async function asterImageBase(){
  // Pick the *image/orb* backend (5151), not OCR (5152). Validate by probing /tool/remove.
  const c=[];
  const norm=(u)=>{
    if(!u) return "";
    u=String(u).trim().replace(/\/+$/,'');
    // normalize if user stored ".../tool"
    u=u.replace(/\/tool$/i,'');
    return u;
  };
  const push=(u)=>{u=norm(u); if(u && !c.includes(u)) c.push(u);};

  // user overrides
  try{ push(localStorage.getItem("aster.imageBackendBase")); }catch(e){}
  try{ push(localStorage.getItem("aster.imageToolBase")); }catch(e){}

  // defaults (image backend)
  push("http://127.0.0.1:5151");
  push("http://localhost:5151");

  const ping=async(base)=>{
    const url=base+"/healthz";
    const ac=new AbortController();
    const to=setTimeout(()=>ac.abort(),1800);
    try{
      const r=await fetch(url,{method:"GET",cache:"no-store",signal:ac.signal});
      return !!(r&&r.ok);
    }catch(e){ return false; }
    finally{ try{ clearTimeout(to); }catch(e){} }
  };

  const probe=async(base)=>{
    // POST probe: 422/400 means route exists but missing fields; 404/405 means wrong server.
    const url=base+"/tool/remove";
    const ac=new AbortController();
    const to=setTimeout(()=>ac.abort(),1700);
    try{
      const r=await fetch(url,{method:"POST",body:"",headers:{"Content-Type":"application/x-www-form-urlencoded"},cache:"no-store",signal:ac.signal});
      if(!r) return false;
      if(r.status===404 || r.status===405) return false;
      return true;
    }catch(e){ return false; }
    finally{ try{ clearTimeout(to); }catch(e){} }
  };

  for(const base of c){
    if(!base) continue;
    if(await ping(base)){
      if(await probe(base)) return base;
    }
  }
  // fallback
  return "http://127.0.0.1:5151";
}
async function asterRemoveWithFallback(base, formData, opts) {
  const endpoints = ["/tool/erase", "/tool/remove", "/tool/inpaint_remove"];
  let lastError = null;
  for (const path of endpoints) {
    const url = base + path;
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        signal: opts && opts.signal ? opts.signal : undefined
      });
      if (!response.ok) {
        if (response.status === 404 || response.status === 405) {
          lastError = lastError || new Error(`Remove endpoint missing at ${url}`);
          continue;
        }
        const body = await response.text().catch(() => "");
        lastError = new Error(`Remove failed (${response.status}): ${body || response.statusText}`);
        continue;
      }
      const payload = await response.json().catch(() => ({}));
      const imageUrl =
        payload?.images?.[0]?.url ||
        payload?.image?.url ||
        payload?.url || "";
      if (imageUrl) return imageUrl;
      lastError = new Error("Remove returned no image URL.");
    } catch (error) {
      lastError = error || lastError;
    }
  }
  throw (lastError || new Error("Remove tool unavailable on the selected image backend."));
}
