/* Aster JavaScript v099
Authenticated historical derivative: relight mood-grid injection with intensity-aware live previews.
*/
(function(){
  "use strict";
  const DEFAULT_MOODS=['Neutral','Cinematic','Studio','Neon','Sunset','Dawn'];
  function install(options={}){
    const root=options.root||document.querySelector(options.rootSelector||'[data-aster-relight-panel]');
    const intensity=options.intensity||root?.querySelector('[data-aster-relight-intensity]');
    const image=options.image||document.querySelector(options.imageSelector||'[data-aster-relight-image]');
    if(!root||!intensity||!image)return null;
    let grid=root.querySelector('[data-aster-relight-moods]');
    if(!grid){grid=document.createElement('div');grid.setAttribute('data-aster-relight-moods','');intensity.parentNode?.insertBefore(grid,intensity);}
    if(!grid.dataset.asterBuilt){grid.dataset.asterBuilt='1'; (options.moods||DEFAULT_MOODS).forEach(name=>{const b=document.createElement('button');b.type='button';b.setAttribute('data-mood',name);b.textContent=name;grid.appendChild(b);});}
    const active=()=>grid.querySelector('[data-mood].is-active')?.getAttribute('data-mood')||options.defaultMood||'Cinematic';
    const refresh=()=>{const level=Number(intensity.value)||0; grid.querySelectorAll('[data-mood]').forEach(tile=>{tile.style.setProperty('--aster-preview-strength',String(Math.max(0,Math.min(1,level/6)))); tile.style.setProperty('--aster-preview-image',`url("${image.currentSrc||image.src||''}")`);}); if(typeof options.onPreview==='function') options.onPreview(active(),level,image);};
    grid.addEventListener('click',e=>{const b=e.target.closest('[data-mood]');if(!b)return;grid.querySelectorAll('[data-mood]').forEach(x=>x.classList.toggle('is-active',x===b));refresh();});
    intensity.addEventListener('input',refresh,{passive:true}); image.addEventListener('load',refresh,{passive:true}); new MutationObserver(refresh).observe(image,{attributes:true,attributeFilter:['src']}); refresh(); return {grid,refresh};
  }
  window.installAsterRelightMoodGrid=install;
})();
