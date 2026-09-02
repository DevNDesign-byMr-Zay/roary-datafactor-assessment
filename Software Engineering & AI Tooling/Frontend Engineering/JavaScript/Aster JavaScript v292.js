/* Aster JavaScript v292 — authenticated buyer-safe derivative: relight preview request and render pipeline. Host state/dependencies are intentionally external. */
async function runPreview(){
    const sel=getRelightSelection();
    const img=document.getElementById('imageModalImg');
    if(!sel||!img) return;

    const imgKey=(img.currentSrc||img.src||'');
    const key=imgKey+'|'+sel.mood+'|'+(Math.round(sel.intensity*10)/10);
    lastKey=key;

    const overlay=ensurePreviewOverlay();
    if(!overlay) return;

    if(cache.has(key)){
      overlay.src=cache.get(key);
      overlay.style.opacity='1';
      return;
    }

    // cancel previous
    try{ inflight?.abort?.(); }catch(e){}
    const ac=new AbortController();
    inflight=ac;

    const base=getImageBackendBase();
    const url=base.replace(/\/$/,'') + '/tool/iclight_v2_relight_preview';

    const blob=await getActiveImageBlob();
    if(!blob) return;

    const fd=new FormData();
    fd.append('image', new File([blob],'image.png',{type:blob.type||'image/png'}));

    // map your UI moods -> prompt style (keeps existing vibe but pushes iclight)
    const moodMap={
      Neutral: 'neutral cinematic lighting, balanced exposure',
      Cinematic: 'cinematic key light, dramatic contrast, controlled shadows',
      Studio: 'studio softbox lighting, clean highlights, minimal noise',
      Neon: 'neon rim light, vibrant magenta and cyan gels, glossy reflections',
      Sunset: 'warm sunset glow, golden hour highlights, soft falloff',
      Dawn: 'cool dawn ambience, gentle blue fill, subtle haze'
    };
    const prompt=moodMap[sel.mood] || moodMap.Neutral;
    fd.append('prompt', prompt);

    // intensity -> guidance_scale (iclight-style). keep in sane range but responsive
    const gs=Math.max(1, Math.min(12, 1 + sel.intensity));
    fd.append('guidance_scale', String(gs));

    // keep it preview-fast server side
    fd.append('steps', '12');

    try{
      const res=await fetch(url,{method:'POST',body:fd,signal:ac.signal});
      if(!res.ok) throw new Error('preview http '+res.status);
      const j=await res.json();
      const outUrl=j.image_url||j.url||j.output||j.result||'';
      if(!outUrl) throw new Error('no preview url');
      // if a newer preview was queued, discard
      if(lastKey!==key) return;
      overlay.src=outUrl;
      overlay.style.opacity='1';
      cache.set(key,outUrl);
    }catch(e){
      // fail silently; CSS preview still works
    }
  }
