/* Aster JavaScript v140
Authenticated historical derivative: blob-safe active-image source normalization for image-tool execution.
*/
(function(global){
  'use strict';
  function source(image){return String(image?.dataset?.originalSrc||image?.currentSrc||image?.src||'').trim();}
  async function toBlob(src){src=String(src||'');if(!src)throw new Error('Missing image source');if(/^data:image\//i.test(src)){const r=await fetch(src);return r.blob()}if(/^blob:/i.test(src)||/^https?:/i.test(src)){const r=await fetch(src,{mode:'cors',credentials:'omit',cache:'no-store'});if(!r.ok)throw new Error(`Image fetch failed (${r.status})`);return r.blob()}throw new Error('Unsupported image source');}
  global.AsterActiveImageBlob={source,toBlob};
})(window);
