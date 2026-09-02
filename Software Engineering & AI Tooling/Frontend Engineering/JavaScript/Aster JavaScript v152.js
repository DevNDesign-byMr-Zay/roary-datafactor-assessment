/* Aster JavaScript v152
Authenticated derivative: concurrent image/video reference discovery with query-intent detection,
basic relevance filtering, normalized outputs, and an optional persistence callback.
*/
(function(global){
  "use strict";
  if(global.AsterMediaReferenceSearch) return;

  function cleanBase(value){
    let base=String(value||"").trim();
    if(!base) return "";
    if(!/^https?:\/\//i.test(base)) base="http://"+base;
    return base.replace(/\/+$/,"");
  }

  function shouldSearchMedia(text){
    const value=String(text||"").toLowerCase();
    if(!value) return false;

    const phrases=[
      "show me images","pull images","image references","image refs",
      "pictures of","photos of","photo references","reference images",
      "image inspo","moodboard","inspiration board",
      "show me videos","pull videos","video references","video refs",
      "clips of","video inspo","reel ideas","youtube ideas"
    ];
    if(phrases.some(phrase=>value.includes(phrase))) return true;

    return /(image|images|pic|pics|picture|pictures|photo|photos|video|videos|clip|clips)/.test(value) &&
      /(show|find|search|pull|get|look up|look for|give me|send|fetch)/.test(value);
  }

  function terms(query){
    return String(query||"").toLowerCase().split(/\s+/).filter(word=>word.length>3);
  }

  function filterRelevant(items,query,fields){
    const list=Array.isArray(items)?items:[];
    const wanted=terms(query);
    if(!wanted.length) return list;

    const filtered=list.filter(item=>{
      const haystack=fields.map(field=>String(item?.[field]||"")).join(" ").toLowerCase();
      return wanted.some(word=>haystack.includes(word));
    });
    return filtered.length?filtered:list;
  }

  async function fetchCollection(base,path,query,count,key,fields,signal){
    const url=`${base}${path}?q=${encodeURIComponent(query)}&count=${count}`;
    try{
      const response=await fetch(url,{
        method:"GET",
        mode:"cors",
        credentials:"omit",
        cache:"no-store",
        signal
      });
      if(!response.ok) return [];
      const payload=await response.json();
      if(!payload||payload.ok===false||!Array.isArray(payload[key])) return [];
      return filterRelevant(payload[key],query,fields).slice(0,count);
    }catch(_){
      return [];
    }
  }

  async function discover(query,options={}){
    const q=String(query||"").trim();
    if(!q) return {images:[],videos:[],sources:[]};

    const base=cleanBase(options.base||"http://127.0.0.1:5055");
    const imageCount=Math.max(1,Math.min(20,Number(options.imageCount)||8));
    const videoCount=Math.max(1,Math.min(20,Number(options.videoCount)||6));

    const [images,videos]=await Promise.all([
      fetchCollection(base,"/tool/image_search",q,imageCount,"images",["title","source"],options.signal),
      fetchCollection(base,"/tool/video_search",q,videoCount,"videos",["title","source","channel"],options.signal)
    ]);

    const sources=[];
    const seen=new Set();

    function add(url,title,snippet){
      const value=String(url||"").trim();
      const key=value||("title:"+String(title||"").toLowerCase());
      if(!key||seen.has(key)) return;
      seen.add(key);
      sources.push({
        url:value,
        title:String(title||value||"Source"),
        snippet:String(snippet||"")
      });
    }

    for(const item of images){
      add(
        item.page_url||item.pageUrl||item.source_url||item.sourceUrl||item.url||item.href||item.link,
        item.title||item.source||item.site||"Image",
        item.source||item.site||""
      );
    }

    for(const item of videos){
      add(
        item.page_url||item.pageUrl||item.url||item.href||item.link,
        item.title||item.name||item.channel||"Video",
        item.channel||item.source||item.publisher||""
      );
    }

    const result={query:q,images,videos,sources};
    if(typeof options.persist==="function"){
      try{await options.persist(result);}catch(_){}
    }
    return result;
  }

  global.AsterMediaReferenceSearch={
    cleanBase,
    shouldSearchMedia,
    terms,
    filterRelevant,
    discover
  };
})(window);
