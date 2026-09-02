export function installAsterCompactRelightPanel(root,{hideAdvanced=true,disableScroll=true}={}){
  if(!root)return ()=>{}; root.dataset.asterRelightCompact='1';
  if(hideAdvanced) root.querySelectorAll('[data-aster-relight-advanced]').forEach(n=>n.hidden=true);
  if(disableScroll){root.dataset.asterRelightNoScroll='1';}
  return ()=>{delete root.dataset.asterRelightCompact;delete root.dataset.asterRelightNoScroll;root.querySelectorAll('[data-aster-relight-advanced]').forEach(n=>n.hidden=false)};
}
