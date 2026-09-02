/* Aster no-fetch CORS reveal and stable media-variant persistence path. */
(function(){
  const raf = ()=>new Promise(r=>requestAnimationFrame(()=>r()));
  const sleep = (ms)=>new Promise(r=>setTimeout(r, ms));

  function pickModalImg(){
    const sels = [
      '#rtLightbox img.rt-main',
      '#rtLightbox img',
      '.rt-lightbox img',
      '#asterLightbox img',
      '.aster-lightbox img',
      'img.rtp-img',
      '.rtp-img img',
      '#rtModal img',
      '.rt-modal img'
    ];
    for(const sel of sels){
      const el = document.querySelector(sel);
      if(el && el.tagName==='IMG') return el;
    }
    const dlg = document.querySelector('dialog[open], .rt-lightbox.open, #rtLightbox.open, #rtLightbox');
    if(dlg){
      const el = dlg.querySelector('img');
      if(el) return el;
    }
    return null;
  }

  function getOutUrl(json){
    return (json && (json.image_url || json.url)) ||
      (json && json.image && (json.image.url || json.image.image_url || json.image_url)) ||
      (json && Array.isArray(json.images) && json.images[0] && (json.images[0].url || json.images[0].image_url)) ||
      null;
  }

  function backendBase(){
    const b = (window.__ASTER_BACKEND_BASE || window.__asterBackendBase || window.__ASTER_ORB_BASE || 'http://127.0.0.1:5151');
    return String(b).replace(/\/+$/,'');
  }

  // IMPORTANT: No fetch() used (avoids CORS from origin 'null').
  // We preload via <img> and then swap the visible modal image.
  function proxiedUrl(raw){
    const u = raw + (raw.includes('?')?'&':'?') + 'aster_cb=' + Date.now();
    return backendBase() + '/media?url=' + encodeURIComponent(u);
  }

  function stripCacheParams(u){
    try{
      if(!u) return u;
      // If proxy url, normalize underlying url, strip cache-bust, then rebuild proxy
      const b = backendBase();
      const s = String(u);
      const m = s.match(/\/media\?url=([^#]+)/i);
      if(m){
        let raw = m[1];
        try{ raw = decodeURIComponent(raw); }catch(_){}
        const uu = new URL(raw);
        uu.searchParams.delete('aster_cb');
        uu.searchParams.delete('cb');
        const clean = uu.toString();
        return b + '/media?url=' + encodeURIComponent(clean);
      }
      // direct url
      const uu = new URL(s);
      uu.searchParams.delete('aster_cb');
      uu.searchParams.delete('cb');
      return uu.toString();
    }catch(_){ return u; }
  }

  async function asterSaveVariantToLibrary(parentSrc, rawOutUrl, promptText){
    try{
      const OnFn = (window.On || window.asterMediaUpsert || null);
      // On is defined as a global function in this file; if not, fallback to noop.
      const upsert = (typeof OnFn === 'function') ? OnFn : (typeof window.On === 'function' ? window.On : (typeof On === 'function' ? On : null));
      if(!upsert) return;

      const parent = asterNormalizeMediaSrc(stripCacheParams(parentSrc||""));
      if(parent && !/^blob:/i.test(parent)){
        await upsert(parent, { kind: "image", prompt: "", title: "", parentSrc: null });
      }

      const variantStable = stripCacheParams(proxiedUrl(rawOutUrl));
      const variant = asterNormalizeMediaSrc(variantStable);
      if(variant && !/^blob:/i.test(variant)){
        await upsert(variant, { kind: "variant", prompt: promptText||"", title: promptText||"", parentSrc: parent || null });
      }
    }catch(_){}
  }

  function preloadImg(url, timeoutMs=9000){
    return new Promise((resolve, reject)=>{
      const im = new Image();
      // DO NOT set crossOrigin -> prevents CORS enforcement for display
      let done = false;
      const t = setTimeout(()=>{
        if(done) return;
        done = true;
        try{ im.src=''; }catch(_){}
        reject(new Error('preload timeout'));
      }, timeoutMs);

      im.onload = ()=>{
        if(done) return;
        done = true;
        clearTimeout(t);
        resolve(im);
      };
      im.onerror = ()=>{
        if(done) return;
        done = true;
        clearTimeout(t);
        reject(new Error('preload error'));
      };
      im.src = url;
      if(im.complete && im.naturalWidth>0){
        done = true;
        clearTimeout(t);
        resolve(im);
      }
    });
  }

  async function swapWhenLoaded(rawOutUrl){
    const imgEl = pickModalImg();
    if(!imgEl) return false;

    const pUrl = proxiedUrl(rawOutUrl);

    // Preload proxied url first
    try{ await preloadImg(pUrl, 9000); }catch(e){
      // fallback: try direct (also cache-busted)
      const direct = rawOutUrl + (rawOutUrl.includes('?')?'&':'?') + 'aster_cb=' + Date.now();
      await preloadImg(direct, 9000);
      imgEl.src = direct;
      await raf(); await raf();
      return true;
    }

    // Swap into view
    imgEl.src = pUrl;

    // Wait until the element reports loaded, then paint 2 frames for "reveal"
    const t0 = performance.now();
    while(performance.now()-t0 < 4000){
      if(imgEl.complete && imgEl.naturalWidth>0){
        await raf(); await raf();
        return true;
      }
      await sleep(30);
    }
    await raf(); await raf();
    return true;
  }

  // Animated paint controls
  function startAnim(){
    if(typeof window.asterStartPaintAnim === 'function') window.asterStartPaintAnim();
    if(typeof window.asterStartEraseLoadingAnim === 'function') window.asterStartEraseLoadingAnim();
  }
  function stopAnimAndClearAll(){
    if(typeof window.asterStopPaintAnim === 'function') window.asterStopPaintAnim(true);
    if(typeof window.asterStopEraseLoadingAnim === 'function') window.asterStopEraseLoadingAnim(true);
    try{
      const c = document.getElementById('rtEraseCanvas2');
      if(c && c.getContext){
        const ctx = c.getContext('2d');
        ctx.setTransform(1,0,0,1,0,0);
        ctx.globalCompositeOperation='source-over';
        ctx.globalAlpha=1;
        ctx.clearRect(0,0,c.width,c.height);
      }
      if(c) c.style.pointerEvents='auto';
    }catch(_){}
  }

  // Optional: smooth fade of animated paint into clear, after swap is visible
  async function clearWithRevealFade(){
    const c = document.getElementById('rtEraseCanvas2');
    if(!c){ stopAnimAndClearAll(); return; }
    // Let existing overlay fade function run if you already have one
    if(typeof window.asterFadeOutEraseOverlay === 'function'){
      try{
        window.asterFadeOutEraseOverlay(520);
      }catch(_){}
      // ensure hard stop after fade completes
      setTimeout(()=>{ stopAnimAndClearAll(); }, 560);
      return;
    }
    stopAnimAndClearAll();
  }

  function wrapOnce(){
    if(typeof window.postRemove === 'function' && !window.postRemove.__asterV43){
      const _postRemove = window.postRemove;
      window.postRemove = async function(){
        startAnim();
        const imgEl0 = pickModalImg();
        const baseBefore = imgEl0 ? (imgEl0.currentSrc || imgEl0.src || "") : "";
        const json = await _postRemove.apply(this, arguments);

        const outUrl = getOutUrl(json);
        if(outUrl){
          // Keep anim running until image is actually loaded & swapped into view
          await swapWhenLoaded(outUrl);
          try{ await asterSaveVariantToLibrary(baseBefore, outUrl, ""); }catch(_){ }
          // Now clear (reveal)
          await raf();
          await raf();
          await clearWithRevealFade();
        } else {
          // No URL: stop animation but keep mask? (safe default: stop+keep)
          if(typeof window.asterStopPaintAnim === 'function') window.asterStopPaintAnim(false);
          if(typeof window.asterStopEraseLoadingAnim === 'function') window.asterStopEraseLoadingAnim(false);
        }
        return json;
      };
      window.postRemove.__asterV43 = true;
      console.log('[ASTER][v43] postRemove wrapped: NO fetch(), swap on img load, then clear');
      return true;
    }

    if(typeof window.removeViaBackend === 'function' && !window.removeViaBackend.__asterV43){
      const _rvb = window.removeViaBackend;
      window.removeViaBackend = async function(){
        startAnim();
        const imgEl0 = pickModalImg();
        const baseBefore = imgEl0 ? (imgEl0.currentSrc || imgEl0.src || "") : "";
        const json = await _rvb.apply(this, arguments);
        const outUrl = getOutUrl(json);
        if(outUrl){
          await swapWhenLoaded(outUrl);
          try{ await asterSaveVariantToLibrary(baseBefore, outUrl, ""); }catch(_){ }
          await raf();
          await raf();
          await clearWithRevealFade();
        } else {
          if(typeof window.asterStopPaintAnim === 'function') window.asterStopPaintAnim(false);
          if(typeof window.asterStopEraseLoadingAnim === 'function') window.asterStopEraseLoadingAnim(false);
        }
        return json;
      };
      window.removeViaBackend.__asterV43 = true;
      console.log('[ASTER][v43] removeViaBackend wrapped: NO fetch(), swap on img load, then clear');
      return true;
    }
    return false;
  }

  if(!wrapOnce()){
    window.addEventListener('DOMContentLoaded', ()=>{ wrapOnce(); });
    setTimeout(()=>{ wrapOnce(); }, 1200);
  }
})();
