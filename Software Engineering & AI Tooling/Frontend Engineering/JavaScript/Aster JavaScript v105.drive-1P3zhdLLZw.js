export function configureAsterRelightPanel(panel,{compact=true,allowScroll=false,showAdvanced=false}={}){
  if(!panel) return;
  panel.classList.toggle('aster-relight-compact',!!compact);
  panel.classList.toggle('aster-relight-no-scroll',!allowScroll);
  panel.querySelectorAll('[data-aster-advanced]').forEach(el=>{ el.hidden=!showAdvanced; el.setAttribute('aria-hidden',String(!showAdvanced)); });
  panel.querySelectorAll('[data-aster-mood-grid]').forEach(grid=>{ grid.style.overflowY=allowScroll?'auto':'hidden'; });
}
