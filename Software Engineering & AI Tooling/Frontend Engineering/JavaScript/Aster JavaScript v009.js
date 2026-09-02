
// === Expand Drag Fix v1 (cursor-locked) ===
(function(){
  function getFrame(){
    return document.getElementById('rtExpandFrame') || document.querySelector('#rtExpandFrame');
  }
  function px(n){ return Math.max(0, Math.round(n||0)) + 'px'; }

  let mode=null, startX=0, startY=0, startRect=null;

  function onDown(ev){
    const frame=getFrame();
    if(!frame) return;
    // Disable legacy dragging when the 8-point handle system is present.
    try{ if(frame.querySelector && frame.querySelector('.rtExpandHandle2')) return; }catch(e){}
    const t=ev.target;
    // Only engage when user interacts with the frame or its children
    if(!(t===frame || (t.closest && t.closest('#rtExpandFrame')))) return;

    // If your UI has handles, they usually have data-edge / data-corner; detect and use
    const h = (t.closest && t.closest('[data-edge],[data-corner],.rtExpandHandle,.rtExpandGrip')) || null;
    mode = (h && (h.getAttribute('data-edge') || h.getAttribute('data-corner') || h.dataset?.edge || h.dataset?.corner)) || 'move';

    startX = ev.clientX;
    startY = ev.clientY;
    startRect = frame.getBoundingClientRect();

    try{ frame.setPointerCapture(ev.pointerId); }catch(e){}
    ev.preventDefault();
    ev.stopPropagation();
  }

  function onMove(ev){
    if(!mode || !startRect) return;
    const frame=getFrame();
    if(!frame) return;

    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;

    // apply deltas 1:1 (no acceleration)
    const parent = frame.offsetParent || frame.parentElement;
    const pr = parent ? parent.getBoundingClientRect() : {left:0, top:0};

    const curLeft = startRect.left - pr.left;
    const curTop  = startRect.top  - pr.top;
    let left = curLeft, top = curTop, w = startRect.width, h = startRect.height;

    if(mode==='move'){
      left = curLeft + dx;
      top  = curTop + dy;
    } else {
      // simple edge/corner resizing support
      const m = String(mode).toLowerCase();
      if(m.includes('w') || m==='left') { left = curLeft + dx; w = startRect.width - dx; }
      if(m.includes('e') || m==='right'){ w = startRect.width + dx; }
      if(m.includes('n') || m==='top')  { top = curTop + dy; h = startRect.height - dy; }
      if(m.includes('s') || m==='bottom'){ h = startRect.height + dy; }
    }

    // minimum size
    w = Math.max(64, w);
    h = Math.max(64, h);

    frame.style.left = px(left);
    frame.style.top  = px(top);
    frame.style.width  = px(w);
    frame.style.height = px(h);

    ev.preventDefault();
    ev.stopPropagation();
  }

  function onUp(ev){
    if(!mode) return;
    const frame=getFrame();
    if(frame){ try{ frame.releasePointerCapture(ev.pointerId); }catch(e){} }
    mode=null; startRect=null;
  }

  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('pointermove', onMove, true);
  document.addEventListener('pointerup', onUp, true);
  document.addEventListener('pointercancel', onUp, true);
})();
