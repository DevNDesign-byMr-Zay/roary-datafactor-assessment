/* Aster JavaScript v137
Authenticated historical derivative: upgraded eraser brush controller with local binary mask output.
No remote image pixels are read.
*/
(function(global){
  'use strict';
  function install(canvas,mask,options={}){if(!(canvas instanceof HTMLCanvasElement)||!(mask instanceof HTMLCanvasElement))return null;const c=canvas.getContext('2d'),m=mask.getContext('2d');let drawing=false,last=null,brush=Math.max(4,Number(options.brush)||48);function pt(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}function stroke(a,b){for(const [g,color] of [[c,'rgba(145,80,230,.72)'],[m,'#fff']]){g.lineWidth=brush;g.lineCap='round';g.lineJoin='round';g.strokeStyle=color;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}}const down=e=>{drawing=true;last=pt(e);canvas.setPointerCapture?.(e.pointerId);stroke(last,last);e.preventDefault()};const move=e=>{if(!drawing)return;const p=pt(e);stroke(last,p);last=p;e.preventDefault()};const up=()=>{drawing=false;last=null};canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);return{setBrush:v=>brush=Math.max(4,Number(v)||brush),hasMask:()=>{const d=m.getContext('2d',{willReadFrequently:true}).getImageData(0,0,m.width,m.height).data;for(let i=3;i<d.length;i+=4)if(d[i]>16)return true;return false},clear(){c.clearRect(0,0,canvas.width,canvas.height);m.clearRect(0,0,mask.width,mask.height)}};}
  global.AsterEraserBrush={install};
})(window);
