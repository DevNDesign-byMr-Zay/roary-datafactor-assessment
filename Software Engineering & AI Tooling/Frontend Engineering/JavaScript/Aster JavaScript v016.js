/* Aster robust object-removal transport with backend discovery and file:// resilience. */
/* ===== ASTER PATCH v7: Fix Object Removal/Erase Execute when running from file:// (no minified deps) ===== */
(function(){
  if (window.__asterPatchV7) return;
  window.__asterPatchV7 = true;

  const log  = (...a)=>{ try{ console.log('[ASTER][Patchv7]', ...a); }catch(e){} };
  const warn = (...a)=>{ try{ console.warn('[ASTER][Patchv7]', ...a); }catch(e){} };
  const err  = (...a)=>{ try{ console.error('[ASTER][Patchv7]', ...a); }catch(e){} };

  function getLS(key){ try{ return localStorage.getItem(key)||''; }catch(e){ return ''; } }

  function normBase(b){
    b = String(b||'').trim();
    if(!b) return '';
    if(!/^https?:\/\//i.test(b)) b = 'http://' + b;
    return b.replace(/\/+$/,'');
  }

  function pickBases(){
    const bases = [];
    const push = (b)=>{ b = normBase(b); if(b && !bases.includes(b)) bases.push(b); };
    push(getLS('aster.imageToolBase'));
    push(getLS('aster.imageBackendBase'));
    push(getLS('aster.imageApiBase'));
    push(getLS('aster.imgApi'));
    push(getLS('aster.imageApi'));
    try{ if(window.aster_image_orb_base) push(window.aster_image_orb_base); }catch(e){}
    push('http://127.0.0.1:5151');
    return bases;
  }

  function dataURLToBlob(dataURL){
    try{
      const parts = String(dataURL||'').split(',');
      if(parts.length < 2) return null;
      const header = parts[0];
      const b64 = parts.slice(1).join(',');
      const m = /data:([^;]+);base64/i.exec(header);
      const mime = (m && m[1]) ? m[1] : 'image/png';
      const bin = atob(b64);
      const len = bin.length;
      const arr = new Uint8Array(len);
      for(let i=0;i<len;i++) arr[i] = bin.charCodeAt(i);
      return new Blob([arr], { type: mime });
    }catch(e){ return null; }
  }

  async function fetchAsBlob(url){
    url = String(url||'').trim();
    if(!url) return null;
    if(/^data:/i.test(url)) return dataURLToBlob(url);
    try{
      const resp = await fetch(url, { cache: 'no-store' });
      if(resp && resp.ok) return await resp.blob();
    }catch(e){}
    return null;
  }

  async function imageElToBlob(imgEl){
    try{
      if(!imgEl) return null;
      const w = imgEl.naturalWidth || imgEl.width || 0;
      const h = imgEl.naturalHeight || imgEl.height || 0;
      if(!w || !h) return null;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(imgEl, 0, 0, w, h);
      return await new Promise(resolve=>{
        try{ c.toBlob(b=>resolve(b||null), 'image/png'); }
        catch(e){ resolve(null); }
      });
    }catch(e){ return null; }
  }

  function getModalImageEl(){
    try{ return document.getElementById('imageModalImg') || document.querySelector('#imageModal img') || document.querySelector('.img-modal img') || null; }
    catch(e){ return null; }
  }

  async function getActiveImageBlob(){
    const imgEl = getModalImageEl();
    const src = imgEl ? (imgEl.currentSrc || imgEl.src || '').trim() : '';
    let blob = null;

    // Prefer fetch for blob/data/http(s)
    if(src && !/^file:/i.test(src)) blob = await fetchAsBlob(src);

    // Fallback: draw from element (works for file:// and blob://, unless tainted)
    if(!blob && imgEl) blob = await imageElToBlob(imgEl);

    // Last attempt: try fetch even for file:// (often blocked, but harmless)
    if(!blob && src) blob = await fetchAsBlob(src);

    return { imgEl, src, blob };
  }

  function getMaskDataURL(){
    // Try common eraser/mask exports
    try{
      const er = window.__asterErase || window.__asterRemove || null;
      const candidates = [
        'getMaskDataURL','exportMaskDataURL','getMaskPngDataURL','getMask','maskDataURL','toDataURL'
      ];
      if(er){
        for(const name of candidates){
          try{
            if(typeof er[name] === 'function'){
              const d = er[name]();
              if(d && /^data:image\//i.test(String(d))) return String(d);
            }
          }catch(e){}
        }
      }
    }catch(e){}

    // Canvas fallbacks
    const ids = ['rtRemoveMaskCanvas','rtRemoveCanvas','rtMaskCanvas','rtEraseMask','rtEraseCanvas','removeMaskCanvas'];
    for(const id of ids){
      try{
        const c = document.getElementById(id);
        if(c && typeof c.toDataURL === 'function'){
          const d = c.toDataURL('image/png');
          if(d && /^data:image\//i.test(d)) return d;
        }
      }catch(e){}
    }

    // Class / data-attr fallbacks
    try{
      const c = document.querySelector('canvas[data-remove-mask], canvas.rt-remove-mask, canvas[data-mask="remove"], canvas[data-tool-mask]');
      if(c && typeof c.toDataURL === 'function'){
        const d = c.toDataURL('image/png');
        if(d && /^data:image\//i.test(d)) return d;
      }
    }catch(e){}

    return '';
  }

  function parseOutUrl(obj){
    try{
      if(!obj) return '';
      const u = obj?.images?.[0]?.url || obj?.image?.url || obj?.url || '';
      return (typeof u === 'string') ? u : '';
    }catch(e){ return ''; }
  }

  async function postRemove(base, path, buildForm, timeoutMs){
    const url = base.replace(/\/+$/,'') + path;
    const ac = new AbortController();
    const to = setTimeout(()=>{ try{ ac.abort(); }catch(e){} }, timeoutMs||45000);
    try{
      const resp = await fetch(url, { method: 'POST', body: buildForm(), signal: ac.signal });
      if(!resp) throw new Error('No response');
      if(resp.status === 404 || resp.status === 405) return { ok:false, skip:true, status:resp.status, url };
      if(!resp.ok){
        const t = await resp.text().catch(()=> '');
        throw new Error(`HTTP ${resp.status} ${t||resp.statusText||''}`.trim());
      }
      const ct = (resp.headers.get('content-type')||'').toLowerCase();
      if(ct.includes('application/json')){
        const js = await resp.json().catch(()=> ({}));
        const out = parseOutUrl(js);
        if(out) return { ok:true, url: out, raw: js };
        throw new Error('Remove returned JSON with no image url');
      }
      if(ct.startsWith('image/')){
        const b = await resp.blob();
        const out = URL.createObjectURL(b);
        return { ok:true, url: out, raw: null };
      }
      const t = await resp.text().catch(()=> '');
      try{
        const js = JSON.parse(t);
        const out = parseOutUrl(js);
        if(out) return { ok:true, url: out, raw: js };
      }catch(e){}
      if(/^https?:\/\//i.test((t||'').trim())) return { ok:true, url: t.trim(), raw: null };
      throw new Error('Remove returned unrecognized response');
    }finally{
      try{ clearTimeout(to); }catch(e){}
    }
  }

  async function removeViaBackend(prompt, opts){
    opts = opts || {};
    const bases = pickBases();
    const { blob: imgBlob, src } = await getActiveImageBlob();

    const maskDataURL = getMaskDataURL();
    const maskBlob = maskDataURL ? dataURLToBlob(maskDataURL) : null;

    // If we can’t make an image blob but we have a non-data src, send as image_url.
    const imgUrlFallback = (!imgBlob || !imgBlob.size) ? (src && !/^data:/i.test(src) ? src : '') : '';

    if((!imgBlob || !imgBlob.size) && !imgUrlFallback) throw new Error('No image available for removal.');

    // Build a fresh FormData for each request.
    function buildForm(){
      const fd = new FormData();
      const p = String(prompt || '').trim();
      if(p) fd.append('prompt', p);
      fd.append('backend_hint', 'object_removal');

      if(imgBlob && imgBlob.size){
        fd.append('image', new File([imgBlob], 'image.png', { type: imgBlob.type || 'image/png' }));
      }else if(imgUrlFallback){
        fd.append('image_url', imgUrlFallback);
        fd.append('fetch_and_upload', '1');
        fd.append('force_upload', '1');
      }

      if(maskBlob && maskBlob.size){
        fd.append('mask', new File([maskBlob], 'mask.png', { type: maskBlob.type || 'image/png' }));
      }

      // common knobs (harmless if backend ignores)
      if(opts.strength != null) fd.append('strength', String(opts.strength));
      if(opts.guidance != null) fd.append('guidance', String(opts.guidance));
      if(opts.seed != null) fd.append('seed', String(opts.seed));
      if(opts.steps != null) fd.append('steps', String(opts.steps));

      return fd;
    }

    // Try endpoints in order.
    const paths = maskBlob && maskBlob.size
      ? ['/tool/remove', '/tool/erase', '/tool/inpaint_remove', '/tool/object_remove']
      : ['/tool/remove', '/tool/inpaint_remove', '/tool/object_remove', '/tool/erase'];

    let last = null;
    for(const base of bases){
      for(const path of paths){
        try{
          const res = await postRemove(base, path, buildForm, 45000);
          if(res && res.ok && res.url) return res.url;
        }catch(e){
          last = e;
          continue;
        }
      }
    }
    throw last || new Error('Object removal backend call failed.');
  }

  // Public alias used by Patch v6 (and older patches)
  window.removeCurrentModalImage = async function(prompt, opts){
    return await removeViaBackend(prompt, opts);
  };
  window.removeCurrentModalImage.__aster_patch = 'v7';

  // Ensure Execute button triggers removal even if other handlers are broken.
  function bindExecute(){
    const btn = document.getElementById('asterToolApplyBtn') || document.querySelector('.rtp-exec, .rtp-exec#asterToolApplyBtn');
    if(!btn || btn.dataset.removePatchV7Bound) return;
    btn.dataset.removePatchV7Bound = '1';

    btn.addEventListener('click', async (ev)=>{
      try{
        const panel = document.getElementById('rtSidePanel');
        const activeTool = panel ? (panel.dataset.tool || '') : '';
        if(activeTool !== 'remove') return; // only hijack for remove tool

        ev.preventDefault();
        ev.stopPropagation();

        const promptEl = document.getElementById('rtRemovePrompt') || document.querySelector('#rtSidePanel[data-tool="remove"] textarea, #rtSidePanel[data-tool="remove"] input[type="text"]');
        const prompt = promptEl ? (promptEl.value || '') : '';

        log('Execute remove Object');
        btn.disabled = true;
        btn.classList.add('is-busy');

        const outUrl = await window.removeCurrentModalImage(prompt, {});
        if(!outUrl) throw new Error('Remove returned no image');

        // Apply result to modal image
        const img = getModalImageEl();
        if(img){
          try{ img.src = outUrl; }catch(e){}
          try{ img.dataset.currentSrc = outUrl; }catch(e){}
        }

        // Best-effort refresh (keeps mini chat stable)
        try{ if(typeof window.asterImageModalResetMiniChat === 'function') window.asterImageModalResetMiniChat(outUrl); }catch(e){}

        log('Remove ok');
      }catch(e){
        err('Remove failed:', e);
        try{ window.asterToast && window.asterToast(String(e && e.message ? e.message : e)); }catch(_){}
      }finally{
        try{
          const btn = document.getElementById('asterToolApplyBtn') || document.querySelector('.rtp-exec, .rtp-exec#asterToolApplyBtn');
          if(btn){ btn.disabled = false; btn.classList.remove('is-busy'); }
        }catch(e){}
      }
    }, true);
  }

  // Keep binding resilient
  try{ bindExecute(); }catch(e){}
  try{ new MutationObserver(()=>{ try{ bindExecute(); }catch(e){} }).observe(document.documentElement, { childList:true, subtree:true }); }catch(e){}

  // Optional: expand tool glow behind image (visual only, does not change layout)
  try{
    const style = document.createElement('style');
    style.id = 'asterPatchV7ExpandGlow';
    style.textContent = `
      @keyframes asterExpandGlowPulse { 0%{ filter: drop-shadow(0 0 18px rgba(168,85,247,.40)) drop-shadow(0 0 40px rgba(168,85,247,.18)); } 50%{ filter: drop-shadow(0 0 26px rgba(168,85,247,.60)) drop-shadow(0 0 70px rgba(168,85,247,.26)); } 100%{ filter: drop-shadow(0 0 18px rgba(168,85,247,.40)) drop-shadow(0 0 40px rgba(168,85,247,.18)); } }
      #rtSidePanel.open[data-tool="expand"] ~ #imageModal .img-shell img,
      #rtSidePanel.open[data-tool="expand"] ~ #imageModal #imageModalImg,
      #rtSidePanel.open[data-tool="expand"] ~ #imageModalImg,
      #imageModal[data-tool="expand"] #imageModalImg { animation: asterExpandGlowPulse 2.4s ease-in-out infinite; }
    `;
    document.head.appendChild(style);
  }catch(e){}

  log('Patch v7 active (remove backend execute + expand glow)');
})();
