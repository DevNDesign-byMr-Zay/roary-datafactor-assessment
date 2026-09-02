/** Aster JavaScript v114 — media-source classifier with strict local image-backend policy. */
(function (global) {
  'use strict';
  const IMAGE_EXT = /\.(?:png|jpe?g|webp|gif|bmp|avif)(?:[?#].*)?$/i;
  const IMAGE_PATH = /\/(?:media|image|images|files|downloads?)(?:\/|\?|$)/i;
  function isLikelyMediaSrc(value) {
    const s=String(value||'').trim(); if(!s||/^(?:undefined|null)$/i.test(s)||/^blob:|^file:/i.test(s)) return false;
    if(/^data:image\//i.test(s)) return true;
    let u; try{u=new URL(s,location.href);}catch(_){return IMAGE_EXT.test(s);}
    if((u.hostname==='127.0.0.1'||u.hostname==='localhost')) {
      if(u.port!=='5151') return false;
      return IMAGE_EXT.test(u.pathname)||IMAGE_PATH.test(u.pathname);
    }
    return /^https?:$/i.test(u.protocol)&&(IMAGE_EXT.test(u.pathname)||IMAGE_PATH.test(u.pathname));
  }
  function normalizeLocalMedia(value) {
    const s=String(value||'').trim(); if(!isLikelyMediaSrc(s)) return '';
    try{ const u=new URL(s,location.href); if((u.hostname==='127.0.0.1'||u.hostname==='localhost')&&u.port==='5151') return u.toString(); }catch(_){}
    return s;
  }
  global.AsterMediaSourcePolicy = { isLikelyMediaSrc, normalizeLocalMedia };
})(window);
