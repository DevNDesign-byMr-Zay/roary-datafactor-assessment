async function postForm(url, form){
    const r = await fetch(url, { method:"POST", body: form });
    if(!r.ok){
      const t = await r.text().catch(()=> "");
      const msg = ("HTTP " + r.status + " " + (t||r.statusText||"")).trim();
      throw new Error(msg);
    }
    const ct = (r.headers.get("content-type")||"").toLowerCase();
    if(ct.includes("application/json")){
      return await r.json().catch(()=> ({}));
    }
    // if backend ever returns raw image
    const blob = await r.blob();
    return { blob };
  }
