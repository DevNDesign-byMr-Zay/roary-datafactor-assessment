/* Aster JavaScript v150
Authenticated derivative: resilient local search-router compatibility layer.
Supports heterogeneous endpoint names and response envelopes without exposing product identity,
credentials, private prompts, or protected reasoning/visualization architecture.
*/
(function(global){
  "use strict";
  if(global.AsterSearchRouterCompat) return;

  function cleanBase(value){
    let base=String(value||"").trim();
    if(!base) return "";
    if(!/^https?:\/\//i.test(base)) base="http://"+base;
    return base.replace(/\/+$/,"");
  }

  async function fetchPayload(url,options={}){
    try{
      const response=await fetch(url,{
        method:options.method||"GET",
        headers:options.headers||{},
        body:options.body,
        mode:"cors",
        credentials:"omit",
        cache:"no-store",
        signal:options.signal
      });
      if(!response.ok) return null;
      const text=await response.text();
      if(!text) return null;
      try{return JSON.parse(text);}catch(_){return null;}
    }catch(_){
      return null;
    }
  }

  function extractArray(payload){
    if(!payload) return [];
    if(Array.isArray(payload)) return payload;

    const direct=[
      "sources","citations","results","web_results","items","links","organic_results"
    ];
    for(const key of direct){
      if(Array.isArray(payload[key])) return payload[key];
    }

    const nested=[payload.web,payload.data,payload.tool_result];
    for(const node of nested){
      if(!node) continue;
      for(const key of ["sources","results","web_results","items","links"]){
        if(Array.isArray(node[key])) return node[key];
      }
    }
    return [];
  }

  function normalizeItems(payload){
    const rows=extractArray(payload);
    const seen=new Set();
    const out=[];

    for(const item of rows){
      if(!item) continue;
      const url=String(
        item.url||item.link||item.href||item.page_url||item.pageUrl||
        item.source_url||item.sourceUrl||item.source||""
      ).trim();
      const title=String(
        item.title||item.name||item.heading||item.publisher||url||"Untitled"
      ).trim();
      const snippet=String(
        item.snippet||item.description||item.content||item.body||
        item.text||item.summary||""
      ).trim();

      const dedupeKey=url||("title:"+title.toLowerCase());
      if(!dedupeKey||seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      out.push({url,title,snippet});
    }
    return out;
  }

  function buildQuery(query,count,engine){
    const params=new URLSearchParams();
    params.set("q",String(query||""));
    for(const key of ["count","max_results","max","limit"]){
      params.set(key,String(count));
    }
    if(engine){
      params.set("backend_hint",engine);
      params.set("backend",engine);
      params.set("engine",engine);
    }
    return params;
  }

  async function tryPaths(base,paths,query,count,engine,signal){
    const params=buildQuery(query,count,engine);
    for(const path of paths){
      const payload=await fetchPayload(
        `${base}${path}?${params.toString()}`,
        {signal}
      );
      const results=normalizeItems(payload);
      if(results.length){
        return {
          engine:String(
            payload?.backend||payload?.engine||payload?.provider||
            engine||path.replace(/^\/(?:tool|debug)\//,"")
          ),
          results:results.slice(0,count),
          path
        };
      }
    }
    return null;
  }

  async function search(query,options={}){
    const q=String(query||"").trim();
    if(!q) return {engine:"",results:[],path:""};

    const base=cleanBase(options.base||"http://127.0.0.1:5055");
    const count=Math.max(1,Math.min(20,Number(options.count)||6));
    const engine=String(options.engine||"").trim();
    const signal=options.signal;

    const normal=await tryPaths(
      base,
      ["/tool/web_search","/tool/search","/tool/web","/tool/text_search"],
      q,count,engine,signal
    );
    if(normal) return normal;

    const debug=await tryPaths(
      base,
      ["/debug/web_search","/debug/search"],
      q,count,engine,signal
    );
    if(debug) return debug;

    for(const adapter of Array.isArray(options.fallbackAdapters)?options.fallbackAdapters:[]){
      if(typeof adapter!=="function") continue;
      try{
        const value=await adapter(q,{count,engine,signal});
        const results=normalizeItems(value?.results||value);
        if(results.length){
          return {
            engine:String(value?.engine||value?.provider||"adapter"),
            results:results.slice(0,count),
            path:"adapter"
          };
        }
      }catch(_){}
    }

    return {engine:"",results:[],path:""};
  }

  global.AsterSearchRouterCompat={
    cleanBase,
    fetchPayload,
    extractArray,
    normalizeItems,
    buildQuery,
    search
  };
})(window);
