export function resolveAsterPreviewSource(root=document){
  const candidates=[
    root.querySelector?.('[data-aster-active-image]'),
    root.querySelector?.('[data-aster-lightbox-image]'),
    root.querySelector?.('[data-aster-generated-image]:not([hidden])'),
    ...Array.from(root.images||[]).filter(img=>!img.hidden)
  ].filter(Boolean);
  for(const img of candidates){ const src=img.currentSrc||img.src||img.dataset?.originalSrc||''; if(src) return {img,src}; }
  return {img:null,src:''};
}
export function setAsterTilePreview(tile, source){ if(tile && source){ tile.style.backgroundImage=`url(${JSON.stringify(source)})`.slice(1,-1); tile.dataset.asterPreview='1'; } }
