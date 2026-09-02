/* Aster JavaScript v253 — authenticated buyer-safe derivative: persisted image/video library tab switching. Host state/dependencies are intentionally external. */
function setMediaTab(tab){
    tab = (tab||'images').toLowerCase()==='videos' ? 'videos' : 'images';
    state.mediaTab = tab;
    try{ localStorage.setItem('aster.mediaTab', tab); }catch(_){ }
    setBodyAttr('data-rt-media-tab', tab);

    if(state.topbarMode==='media'){
      btnText.textContent = tab.toUpperCase();
    }

    // toggle grids (keep identical styling)
    if(tab==='videos'){
    }

    if(tab==='videos'){
      if(state.imagesGridHTML===null) state.imagesGridHTML = imgGrid.innerHTML;
      imgGrid.style.display='none';
      vidGrid.style.display='';
      if(!vidGrid.__rtInit){
        vidGrid.__rtInit = 1;
        vidGrid.innerHTML = `
          <div class="rt-media-empty">
            <div class="t1">VIDEOS</div>
            <div class="t2">Your videos library is ready. When you start generating videos, they’ll land here automatically.</div>
          </div>`;
      }
    } else {
      vidGrid.style.display='none';
      imgGrid.style.display='';
    }

    // selected styling
    try{ mediaOpts().forEach(o=>o.classList.toggle('is-selected', o.dataset.rtMedia===tab)); }catch(_){ }
  }
