export function syncAsterRelightVisibility({root=document,lightboxOpen=false}={}){
  root.querySelectorAll('[data-aster-mini-relight]').forEach(el=>{el.hidden=true});
  root.querySelectorAll('[data-aster-lightbox-relight]').forEach(el=>{el.hidden=!lightboxOpen});
}
