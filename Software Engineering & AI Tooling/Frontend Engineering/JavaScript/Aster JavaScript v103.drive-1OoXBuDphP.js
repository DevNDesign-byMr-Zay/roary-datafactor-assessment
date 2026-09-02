export function getAsterActiveImage(root=document){
  const candidates=[...root.querySelectorAll('[data-aster-active-image], [data-aster-lightbox-image], [data-aster-carousel] img')];
  return candidates.find(img=>{const r=img.getBoundingClientRect();const s=getComputedStyle(img);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'})||candidates[0]||null;
}
