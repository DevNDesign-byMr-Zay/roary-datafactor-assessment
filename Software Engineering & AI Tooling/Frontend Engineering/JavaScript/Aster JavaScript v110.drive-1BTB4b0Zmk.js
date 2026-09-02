(function (g) {
  'use strict';
  function blobToDataUrl(blob) {
    return new Promise(function(resolve,reject){
      var r=new FileReader(); r.onload=function(){resolve(String(r.result||''));}; r.onerror=function(){reject(r.error||new Error('Blob read failed'));}; r.readAsDataURL(blob);
    });
  }
  async function durableUrl(value) {
    var src=String(value||'');
    if (!/^blob:/i.test(src)) return src;
    var res=await fetch(src,{mode:'cors',credentials:'omit',cache:'no-store'});
    if (!res.ok) throw new Error('Blob fetch failed: HTTP '+res.status);
    return blobToDataUrl(await res.blob());
  }
  async function normalizeItem(item) {
    var out=Object.assign({},item||{});
    if (out.src) out.src=await durableUrl(out.src);
    if (out.url) out.url=await durableUrl(out.url);
    return out;
  }
  g.AsterDurableMedia = {blobToDataUrl:blobToDataUrl,durableUrl:durableUrl,normalizeItem:normalizeItem};
})(window);
