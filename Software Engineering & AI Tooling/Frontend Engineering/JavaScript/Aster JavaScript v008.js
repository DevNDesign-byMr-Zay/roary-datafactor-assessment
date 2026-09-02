
(()=>{
  if(window.__asterExpand8HandleFixLoaded) return;
  window.__asterExpand8HandleFixLoaded = true;

  const ids = {L:'rtExL',R:'rtExR',T:'rtExT',B:'rtExB'};
  const getInp = (k)=>document.getElementById(ids[k]);
  const clamp = (v,min,max)=>Math.max(min, Math.min(max, v));
  const toNum = (x, d=0)=>{ const n=parseFloat(x); return Number.isFinite(n)?n:d; };
  const setInp = (inp, v)=>{
    if(!inp) return;
    const min = toNum(inp.min, 0);
    const max = toNum(inp.max, 999999);
    const vv = Math.round(clamp(v, min, max));
    inp.value = String(vv);
    try{ inp.dispatchEvent(new Event('input', {bubbles:true})); }catch(_){ }
    try{ inp.dispatchEvent(new Event('change', {bubbles:true})); }catch(_){ }
  };

  function ensureFrame(){
    const overlay = document.getElementById('asterExpandOverlay');
    if(!overlay) return;
    if(overlay.querySelector('#rtExpandFrame8')) return;

    const frame = document.createElement('div');
    frame.id = 'rtExpandFrame8';

    for(const p of ['nw','n','ne','e','se','s','sw','w']){
      const d = document.createElement('div');
      d.className = 'pt ' + p;
      d.dataset.pt = p;
      frame.appendChild(d);
    }
    overlay.appendChild(frame);

    // wire drag
    let active = null;

    const getImg = ()=> overlay.querySelector('#asterExpandImg') || overlay.querySelector('img');

    const onMove = (ev)=>{
      if(!active) return;
      const img = getImg();
      if(!img) return;
      const r = img.getBoundingClientRect();
      const sx = (img.naturalWidth || 1) / Math.max(1, r.width);
      const sy = (img.naturalHeight || 1) / Math.max(1, r.height);
      const dx = ev.clientX - active.x;
      const dy = ev.clientY - active.y;

      let L = active.L, R = active.R, T = active.T, B = active.B;
      const p = active.p;

      if(p.includes('w')) L = active.L + (-dx * sx);
      if(p.includes('e')) R = active.R + ( dx * sx);
      if(p.includes('n')) T = active.T + (-dy * sy);
      if(p.includes('s')) B = active.B + ( dy * sy);

      // clamp to >= 0 (anti-crop)
      L = Math.max(0, L); R = Math.max(0, R); T = Math.max(0, T); B = Math.max(0, B);

      setInp(getInp('L'), L);
      setInp(getInp('R'), R);
      setInp(getInp('T'), T);
      setInp(getInp('B'), B);

      ev.preventDefault();
    };

    const end = ()=>{
      if(!active) return;
      try{ window.removeEventListener('pointermove', onMove, true); }catch(_){ }
      try{ window.removeEventListener('pointerup', end, true); }catch(_){ }
      try{ window.removeEventListener('pointercancel', end, true); }catch(_){ }
      active = null;
    };

    frame.querySelectorAll('.pt').forEach(pt=>{
      pt.addEventListener('pointerdown', (ev)=>{
        const inpL=getInp('L'), inpR=getInp('R'), inpT=getInp('T'), inpB=getInp('B');
        if(!inpL || !inpR || !inpT || !inpB) return;
        active = {
          p: (pt.dataset.pt || ''),
          x: ev.clientX,
          y: ev.clientY,
          L: toNum(inpL.value, 0),
          R: toNum(inpR.value, 0),
          T: toNum(inpT.value, 0),
          B: toNum(inpB.value, 0),
        };
        try{ pt.setPointerCapture(ev.pointerId); }catch(_){ }
        try{ window.addEventListener('pointermove', onMove, true); }catch(_){ }
        try{ window.addEventListener('pointerup', end, true); }catch(_){ }
        try{ window.addEventListener('pointercancel', end, true); }catch(_){ }
        ev.preventDefault();
        ev.stopPropagation();
      }, {passive:false});
    });
  }

  // observe for overlay appearing
  const mo = new MutationObserver(()=>ensureFrame());
  try{ mo.observe(document.documentElement, {subtree:true, childList:true}); }catch(_){ }

  // and try once on load
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ensureFrame, {once:true});
  } else {
    ensureFrame();
  }
})();
