/* Aster JavaScript v130
Authenticated historical derivative: tool-scoped local mask painter with binary export.
All network execution is delegated to an existing port-5151 request adapter.
*/
(function(global){
  'use strict';
  function install(shell,image,options={}){
    if(!(shell instanceof HTMLElement)||!(image instanceof HTMLImageElement))return null;
    const canvas=document.createElement('canvas'),mask=document.createElement('canvas');canvas.setAttribute('data-aster-mask-layer','');mask.hidden=true;shell.append(canvas,mask);
    const ctx=canvas.getContext('2d'),mctx=mask.getContext('2d'),size=()=>Math.max(1,Number(options.brushSize)||64);let drawing=false,last=null;
    function resize(){const sr=shell.getBoundingClientRect(),ir=image.getBoundingClientRect(),w=Math.max(1,Math.round(ir.width)),h=Math.max(1,Math.round(ir.height));Object.assign(canvas.style,{left:`${Math.round(ir.left-sr.left)}px`,top:`${Math.round(ir.top-sr.top)}px`,width:`${w}px`,height:`${h}px`});if(canvas.width!==w||canvas.height!==h){canvas.width=mask.width=w;canvas.height=mask.height=h;ctx.clearRect(0,0,w,h);mctx.clearRect(0,0,w,h);}}
    function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
    function line(a,b){for(const g of [ctx,mctx]){g.lineCap='round';g.lineJoin='round';g.lineWidth=size();g.strokeStyle=g===ctx?'rgba(160,100,255,.72)':'#fff';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();}}
    const down=e=>{drawing=true;last=point(e);canvas.setPointerCapture?.(e.pointerId);line(last,last);e.preventDefault();};const move=e=>{if(!drawing)return;const p=point(e);line(last,p);last=p;e.preventDefault();};const up=()=>{drawing=false;last=null;};
    canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);window.addEventListener('resize',resize,{passive:true});resize();
    const clear=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);mctx.clearRect(0,0,mask.width,mask.height);};
    const getMaskBlob=()=>global.AsterHardMask?.build?.(mask,{growPx:Math.max(2,Math.round(size()*.12))})||null;
    return{canvas,maskCanvas:mask,clear,getMaskBlob,destroy(){window.removeEventListener('resize',resize);canvas.remove();mask.remove();}};
  }
  global.AsterMaskPainter={install};
})(window);
