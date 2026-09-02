/* Aster JavaScript v254 — authenticated buyer-safe derivative: download menu media-option event binding. Host state/dependencies are intentionally external. */
function bindMedia(){
    mediaOpts().forEach(opt=>{
      if(opt.__rtBound) return;
      opt.__rtBound = 1;
      opt.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        setMediaTab(opt.dataset.rtMedia||'images');
        closeMenu();
      });
      opt.addEventListener('keydown', (e)=>{
        if(e.key==='Enter' || e.key===' '){
          e.preventDefault();
          opt.click();
        }
      });
    });
  }
