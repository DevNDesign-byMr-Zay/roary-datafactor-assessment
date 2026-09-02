const probe=async(base)=>{
    const url=base+"/tool/remove";
    // GET probe (backend exposes this to support availability checks)
    {
      const ac=new AbortController();
      const to=setTimeout(()=>ac.abort(),900);
      try{const r=await fetch(url,{method:"GET",cache:"no-store",signal:ac.signal,credentials:"include"});if(r&&r.ok)return true;}catch(e){}finally{try{clearTimeout(to)}catch(e){}}
    }
    // POST fallback probe (422/400/401 means route exists)
    const ac=new AbortController();
    const to=setTimeout(()=>ac.abort(),900);
    try{
      const r=await fetch(url,{method:"POST",body:"",headers:{"Content-Type":"application/x-www-form-urlencoded"},cache:"no-store",signal:ac.signal,credentials:"include"});
      if(!r) return false;
      if(r.status===404||r.status===405) return false;
      if(r.ok||r.status===400||r.status===401||r.status===422) return true;
      return false;
    }catch(e){return false;}
    finally{try{clearTimeout(to)}catch(e){}}
  };
