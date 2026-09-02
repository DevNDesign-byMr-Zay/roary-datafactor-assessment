/* Aster JavaScript v059
Authenticated historical derivative: broken-media auto-prune and source repair controller.
Product identity, credentials, proprietary prompts, and protected reasoning/visualization code removed.
*/
(function(){
  "use strict";
  if(window.__asterBrokenMediaPrunerV1) return;
  window.__asterBrokenMediaPrunerV1 = true;

  function defaultNormalize(value){
    if(value == null) return "";
    let src = String(value).trim();
    if(!src || src === "undefined" || src === "null") return "";

    const dataIndex = src.indexOf("data:image");
    if(/^file:/i.test(src) && dataIndex >= 0) src = src.slice(dataIndex);

    if(/^blob:null\//i.test(src)) return "";
    if(/\/undefined(?:\b|$)/i.test(src)) return "";

    if(/^(data:image\/|blob:|https?:|file:)/i.test(src)) return src;
    try{ return new URL(src,location.href).href; }
    catch(_){ return src; }
  }

  function defaultIsLikelyMediaSrc(value){
    const src = String(value || "").trim();
    if(!src) return false;
    if(/^blob:null\//i.test(src)) return false;
    if(/\/undefined(?:\b|$)/i.test(src)) return false;
    return /^(data:image\/|blob:|https?:|file:)/i.test(src);
  }

  async function pruneBrokenMedia(options={}){
    const listItems = options.listItems || window.asterListMediaItems;
    const deleteBySrc = options.deleteBySrc || window.asterDeleteMediaBySrc;
    const upsert = options.upsert || window.asterUpsertMediaItem;
    const refresh = options.refresh || window.asterRefreshMediaLibrary;
    const normalize = options.normalize || window.asterNormalizeMediaSrc || defaultNormalize;
    const isLikely = options.isLikely || defaultIsLikelyMediaSrc;

    if(typeof listItems !== "function" || typeof deleteBySrc !== "function"){
      return {removed:0,fixed:0,skipped:true};
    }

    const requested = Number(options.maxItems || 300);
    const cap = Math.max(60,Math.min(600,Number.isFinite(requested) ? requested : 300));

    let items = [];
    try{ items = await listItems(cap) || []; }
    catch(_){ items = []; }

    let removed = 0;
    let fixed = 0;

    for(const item of items){
      try{
        const raw = item && item.src ? String(item.src) : "";
        const normalized = normalize(raw);

        if(!normalized || !isLikely(normalized)){
          if(raw){
            try{
              if(await deleteBySrc(raw)) removed += 1;
            }catch(_){}
          }
          continue;
        }

        if(normalized !== raw && typeof upsert === "function"){
          try{
            await deleteBySrc(raw);
            await upsert(normalized,{
              ...item,
              id:item?.id || ("m_" + Date.now().toString(36) + Math.random().toString(36).slice(2,6)),
              src:normalized
            });
            fixed += 1;
          }catch(_){}
        }
      }catch(_){}
    }

    if((removed || fixed) && typeof refresh === "function"){
      try{ await refresh(); }catch(_){}
    }

    return {removed,fixed,skipped:false};
  }

  function scheduleInitialPrune(options={}){
    const delay = Math.max(0,Number(options.delayMs ?? 650) || 0);
    return setTimeout(()=>{
      pruneBrokenMedia(options).catch(()=>{});
    },delay);
  }

  window.asterBrokenMedia = {
    normalize:defaultNormalize,
    isLikelyMediaSrc:defaultIsLikelyMediaSrc,
    prune:pruneBrokenMedia,
    schedule:scheduleInitialPrune
  };
})();
