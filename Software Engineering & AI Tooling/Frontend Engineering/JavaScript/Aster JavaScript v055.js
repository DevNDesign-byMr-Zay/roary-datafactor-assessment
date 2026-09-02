/* Aster JavaScript v055
Authenticated historical derivative: multi-provider web-search controller and composer-driven search trigger.
Runtime API keys are read from local settings; no credentials are embedded.
Image-tool port 5151 is not used here. Port 5055 is reserved for the separate local web-search router.
Identity-specific names, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterWebSearchV1) return;
  window.__asterWebSearchV1 = true;

  const DEFAULT_WEB_ROUTER_BASE = "http://127.0.0.1:5055";

  function readConfig(){
    const get = key => {
      try{ return localStorage.getItem(key) || ""; }catch(_){ return ""; }
    };
    const count = Math.max(1,Math.min(20,Number(get("aster.maxSources")) || 8));
    return {
      base: get("aster.webToolBase") || DEFAULT_WEB_ROUTER_BASE,
      braveKey: get("aster.braveKey"),
      tavilyKey: get("aster.tavilyKey"),
      serpKey: get("aster.serpKey"),
      engine: get("aster.serpEngine") || "google",
      maxSources: count
    };
  }

  function normalizeUrl(value){
    let url = String(value || "").trim();
    if(!url) return "";

    try{
      const parsed = new URL(url,location.href);
      if(/duckduckgo\.com$/i.test(parsed.hostname)){
        const redirected = parsed.searchParams.get("uddg") || parsed.searchParams.get("rut");
        if(redirected){
          try{ url = decodeURIComponent(redirected); }
          catch(_){ url = redirected; }
        }
      }
    }catch(_){}
    return url;
  }

  function normalizeResults(payload){
    const raw = Array.isArray(payload)
      ? payload
      : payload?.results || payload?.sources || payload?.items ||
        payload?.web_results || payload?.organic_results || [];

    const out = [];
    const seen = new Set();

    for(const item of Array.isArray(raw) ? raw : []){
      const url = normalizeUrl(item?.url || item?.href || item?.link);
      if(!url || seen.has(url)) continue;
      seen.add(url);
      out.push({
        title: String(item?.title || item?.name || url).trim(),
        url,
        snippet: String(item?.snippet || item?.description || item?.content || item?.text || "").trim(),
        source: String(item?.source || item?.provider || "").trim()
      });
    }
    return out;
  }

  async function fetchJson(url,options={}){
    const response = await fetch(url,{
      cache:"no-store",
      credentials:"omit",
      ...options
    });
    if(!response.ok) throw new Error("Search request failed with HTTP " + response.status);
    return response.json();
  }

  async function searchRouter(query,count,config){
    const base = String(config.base || DEFAULT_WEB_ROUTER_BASE).replace(/\/+$/,"");
    const q = encodeURIComponent(query);
    const candidates = [
      `${base}/debug/web_search?q=${q}&count=${count}`,
      `${base}/debug/search?q=${q}&count=${count}`
    ];

    for(const url of candidates){
      try{
        const results = normalizeResults(await fetchJson(url));
        if(results.length) return results;
      }catch(_){}
    }
    return [];
  }

  async function searchTavily(query,count,key){
    if(!key) return [];
    try{
      const data = await fetchJson("https://api.tavily.com/search",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer " + key
        },
        body:JSON.stringify({
          query,
          max_results:count,
          search_depth:"basic",
          include_answer:false,
          include_raw_content:false
        })
      });
      return normalizeResults(data);
    }catch(_){
      return [];
    }
  }

  async function searchBrave(query,count,key){
    if(!key) return [];
    try{
      const url = new URL("https://api.search.brave.com/res/v1/web/search");
      url.searchParams.set("q",query);
      url.searchParams.set("count",String(count));
      const data = await fetchJson(url.toString(),{
        headers:{
          "Accept":"application/json",
          "X-Subscription-Token":key
        }
      });
      return normalizeResults(data?.web?.results || data);
    }catch(_){
      return [];
    }
  }

  async function searchSerpApi(query,count,key,engine){
    if(!key) return [];
    try{
      const url = new URL("https://serpapi.com/search.json");
      url.searchParams.set("q",query);
      url.searchParams.set("num",String(count));
      url.searchParams.set("engine",engine || "google");
      url.searchParams.set("api_key",key);
      return normalizeResults(await fetchJson(url.toString()));
    }catch(_){
      return [];
    }
  }

  async function webSearchAll(query,count,config=readConfig()){
    const q = String(query || "").trim();
    if(!q) return [];

    const requested = Math.max(1,Math.min(20,Number(count) || config.maxSources || 8));
    let results = await searchRouter(q,requested,config);
    if(results.length) return results.slice(0,requested);

    results = await searchTavily(q,requested,config.tavilyKey);
    if(results.length) return results.slice(0,requested);

    results = await searchBrave(q,requested,config.braveKey);
    if(results.length) return results.slice(0,requested);

    results = await searchSerpApi(q,requested,config.serpKey,config.engine);
    return results.slice(0,requested);
  }

  function shouldAutoSearch(text){
    const value = String(text || "").trim();
    if(!value) return false;
    const lower = value.toLowerCase();

    if(/\b(search the web|search web|web search|look up|lookup|find online|browse|google|duckduckgo|ddg|tavily|serpapi|brave search)\b/.test(lower)){
      return true;
    }
    return /\b(search|find|look\s*up)\b/i.test(value) && /\b(web|google|online)\b/i.test(value);
  }

  async function searchComposerText(text,options={}){
    const query = String(text || "").trim();
    if(!shouldAutoSearch(query)) return [];
    const config = {...readConfig(),...(options.config || {})};
    const results = await webSearchAll(query,options.count || config.maxSources,config);
    document.dispatchEvent(new CustomEvent("aster:web-search-results",{
      detail:{query,results}
    }));
    return results;
  }

  window.asterWeb = {
    readConfig,
    normalizeResults,
    shouldAutoSearch,
    webSearchAll,
    searchComposerText
  };
})();
