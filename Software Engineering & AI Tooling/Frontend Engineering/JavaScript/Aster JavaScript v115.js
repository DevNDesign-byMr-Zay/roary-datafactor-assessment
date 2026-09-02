/** Aster JavaScript v115 — repairs common persisted media-source corruption without network rewriting. */
(function (global) {
  'use strict';
  function normalizeMediaSrc(value) {
    if (value == null) return '';
    let s=String(value).trim().replace(/^(?:["'])(.*)(?:["'])$/s,'$1');
    if(!s||/^(?:undefined|null)$/i.test(s)||/^blob:null/i.test(s)) return '';
    const dataIndex=s.indexOf('data:image'); if(dataIndex>0) s=s.slice(dataIndex);
    const encoded=s.indexOf('data%3Aimage'); if(encoded>=0){ try{s=decodeURIComponent(s.slice(encoded));}catch(_){s=s.slice(encoded).replace(/^data%3A/i,'data:');} }
    if(/^\.\/data:image/i.test(s)) s=s.slice(2);
    if(/^file:/i.test(s)){ const di=s.indexOf('data:image'); if(di>=0) return s.slice(di); const bi=s.indexOf('blob:'); if(bi>=0) return s.slice(bi); return ''; }
    if(/^(?:png|jpe?g|webp|gif);base64,/i.test(s)) s='data:image/'+s;
    return s;
  }
  function repairItems(items) { return (Array.isArray(items)?items:[]).map(item=>({...item,src:normalizeMediaSrc(item?.src)})).filter(item=>item.src); }
  global.AsterMediaSourceRepair = { normalizeMediaSrc, repairItems };
})(window);
