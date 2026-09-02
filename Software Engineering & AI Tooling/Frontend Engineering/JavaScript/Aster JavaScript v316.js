/* Aster JavaScript v316 — authenticated buyer-safe derivative: layout and control-state synchronization variant 2. Host state/dependencies are intentionally external. */
function sync(){
    const open = isMediaOpen();
    if(open){
      setTopbarMode('media');
      setMediaTab(state.mediaTab);
    } else {
      setTopbarMode('models');
      setBodyAttr('data-rt-media-tab', state.mediaTab);
    }
  }
