async function toDataURLFromSrc(src){
    src=String(src||'').trim();
    if(!src) return '';
    if(/^data:/i.test(src)) return src;
    // try canvas first (works for blob/data/local)
    try{
      const el=("function"==typeof getModalImageEl?getModalImageEl():null)||V||document.getElementById('imageModalImg');
      if(el&&(el.currentSrc||el.src)&&String(el.currentSrc||el.src)===src){
        const d=await toDataURLFromEl(el,2048,0.92);
        if(d) return d;
      }
    }catch{}
    // fallback: fetch -> blob -> dataURL
    try{
      const b=await fetch(src).then(r=>r.blob());
      return await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result||''));fr.onerror=()=>rej(new Error('read'));fr.readAsDataURL(b);});
    }catch{
      return src; // last resort (backend can fetch https URLs)
    }
  }
