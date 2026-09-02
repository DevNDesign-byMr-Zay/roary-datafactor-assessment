/* Aster JavaScript v134
Authenticated historical derivative: seamless animated expansion-ring preview rendered without image readback.
*/
(function(global){
  'use strict';
  function install(canvas,frame,image){if(!(canvas instanceof HTMLCanvasElement))return null;let raf=0,start=performance.now();const ctx=canvas.getContext('2d');function draw(now){const fr=frame.getBoundingClientRect(),ir=image.getBoundingClientRect(),w=Math.max(1,Math.round(fr.width)),h=Math.max(1,Math.round(fr.height));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}ctx.clearRect(0,0,w,h);const cx=(now-start)*.00015;const g=ctx.createLinearGradient(Math.sin(cx)*w,0,w,Math.cos(cx)*h);g.addColorStop(0,'rgba(75,35,130,.12)');g.addColorStop(.5,'rgba(145,85,220,.48)');g.addColorStop(1,'rgba(70,20,120,.12)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);const x=Math.max(0,ir.left-fr.left),y=Math.max(0,ir.top-fr.top),iw=Math.min(w,ir.width),ih=Math.min(h,ir.height);ctx.clearRect(x,y,iw,ih);raf=requestAnimationFrame(draw)}raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);}
  global.AsterExpandRingPreview={install};
})(window);
