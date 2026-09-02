/* Aster JavaScript v101
Authenticated historical derivative: prefer a native relight mood grid, deduplicate known moods, and inject only as fallback.
*/
(function(){
  "use strict";
  const DEFAULT=['Neutral','Cinematic','Studio','Neon','Sunset','Dawn'];
  function install(options={}){
    const panel=options.panel||document.querySelector(options.panelSelector||'[data-aster-relight-panel]'); if(!panel)return null;
    const names=options.moods||DEFAULT; let grid=panel.querySelector(options.nativeGridSelector||'[data-aster-native-mood-grid]');
    if(grid){
      panel.querySelectorAll('[data-aster-injected-mood-grid]').forEach(x=>x.remove());
      const tiles=[...grid.children], nameOf=el=>String(el.getAttribute('data-mood')||el.textContent||'').trim();
      const hasExtra=tiles.some(el=>nameOf(el)&&!names.includes(nameOf(el)));
      if(!hasExtra){const keep=[];for(const name of names){const found=tiles.find(el=>nameOf(el)===name);if(found&&!keep.includes(found))keep.push(found);} if(!keep.length)keep.push(...tiles.slice(0,names.length)); grid.replaceChildren(...keep); grid.style.overflowY='hidden';grid.style.maxHeight='';}
      else{grid.style.overflowY='auto';grid.style.maxHeight=String(options.maxHeight||'170px');}
    }else{
      grid=document.createElement('div');grid.setAttribute('data-aster-injected-mood-grid','');for(const name of names){const b=document.createElement('button');b.type='button';b.setAttribute('data-mood',name);b.textContent=name;grid.appendChild(b);} (options.mount||panel).appendChild(grid);
    }
    [...grid.children].forEach(tile=>{const mood=String(tile.getAttribute('data-mood')||tile.textContent||'').trim();if(mood)tile.setAttribute('data-mood',mood);if(!tile.dataset.asterMoodWired){tile.dataset.asterMoodWired='1';tile.addEventListener('click',()=>{[...grid.children].forEach(x=>x.classList.toggle('is-active',x===tile));if(typeof options.onMood==='function')options.onMood(mood,tile);});}});
    return grid;
  }
  window.installAsterNativeMoodGrid=install;
})();
