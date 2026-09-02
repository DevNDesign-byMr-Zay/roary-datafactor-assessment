/* Aster JavaScript v023
Authenticated historical derivative: image-backend detection and route probing.
Original product identity, private architecture, prompts, credentials, and personal paths removed.
*/
async function asterImageBase(){
  // Detect the *image* backend (OrbTools). Avoid accidentally picking OCR backend (5152).
  // We validate by probing the remove endpoint (should return 422/400/200, not 404/405).
  const c=[];
  const push=(u)=>{
    if(!u) return;
    u=String(u).trim().replace(/\/+$/,'');
    if(!u) return;
    if(!c.includes(u)) c.push(u);
  };

  // user overrides
  try{push(localStorage.getItem("aster.imageBackendBase"))}catch(e){}
  try{push(localStorage.getItem("aster.imageToolBase"))}catch(e){}

  // defaults (IMAGE backend)
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
    finally{ try{clearTimeout(to)}catch(e){} }
  };

  const probe=async(base)=>{
    // Probe for image tools existence. 422/400 means route exists but missing form fields.
    const url=base+"/tool/remove";
    const ac=new AbortController();
    const to=setTimeout(()=>ac.abort(),1600);
    try{
      const r=await fetch(url,{method:"POST",body:"",headers:{"Content-Type":"application/x-www-form-urlencoded"},signal:ac.signal});
      if(!r) return false;
      if(r.status===404 || r.status===405) return false;
      // any other status implies the route exists on this backend
      return true;
    }catch(e){ return false; }
    finally{ try{clearTimeout(to)}catch(e){} }
  };

  for(const base of c){
    if(base && await ping(base)){
      if(await probe(base)) return base;
    }
  }
  // last resort: try 5151 even if ping was slow on first attempt
  return "http://127.0.0.1:5151";
}
