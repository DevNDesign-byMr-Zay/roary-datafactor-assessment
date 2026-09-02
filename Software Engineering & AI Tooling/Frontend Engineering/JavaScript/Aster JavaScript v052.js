/* Aster JavaScript v052
Authenticated historical derivative: assistant message sources/action-detail controller.
Original product identity, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
*/
(function(){
  "use strict";
  if(window.__asterSourcesControllerV1) return;
  window.__asterSourcesControllerV1 = true;

  const detail = ()=>document.getElementById("actions-detail");

  function normalizeResults(payload){
    const raw = Array.isArray(payload)
      ? payload
      : payload?.results || payload?.sources || payload?.citations ||
        payload?.web_results || payload?.items || payload?.links || [];

    const output = [];
    const seen = new Set();

    for(const item of Array.isArray(raw) ? raw : []){
      const url = String(item?.url || item?.href || item?.link || "").trim();
      const title = String(item?.title || item?.name || item?.label || url || "Source").trim();
      if(!url || seen.has(url)) continue;
      seen.add(url);
      output.push({
        title,
        url,
        snippet:String(item?.snippet || item?.description || item?.text || "").trim()
      });
    }
    return output;
  }

  function openDetail(title,body,hint){
    const panel = detail();
    if(!panel) return false;

    panel.querySelector(".ad-title").textContent = String(title || "");
    panel.querySelector(".ad-body").textContent = String(body || "");
    panel.querySelector(".ad-hint").textContent = String(hint || "");
    panel.setAttribute("aria-hidden","false");
    panel.classList.add("open");
    return true;
  }

  function closeDetail(){
    const panel = detail();
    if(!panel) return;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden","true");
  }

  function attachSources(actionRow,payload){
    if(!actionRow) return;
    const sources = normalizeResults(payload);

    let host = actionRow.querySelector(".aster-sources-wrap");
    if(!host){
      host = document.createElement("span");
      host.className = "aster-sources-wrap";
      actionRow.appendChild(host);
    }
    host.replaceChildren();

    if(!sources.length) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "act-btn";
    button.textContent = `Sources (${sources.length})`;
    button.setAttribute("aria-expanded","false");

    const drawer = document.createElement("div");
    drawer.className = "aster-sources-drawer";
    drawer.setAttribute("role","menu");

    sources.forEach((source,index)=>{
      const item = document.createElement("button");
      item.type = "button";
      item.className = "aster-source-item";
      item.textContent = `${index + 1}. ${source.title}`;
      item.addEventListener("click",()=>{
        openDetail(source.title,source.snippet || source.url,source.url);
      });
      drawer.appendChild(item);
    });

    button.addEventListener("click",()=>{
      const open = !host.classList.contains("open");
      host.classList.toggle("open",open);
      button.setAttribute("aria-expanded",String(open));
    });

    host.append(button,drawer);
  }

  document.addEventListener("click",event=>{
    if(event.target?.closest?.("#actions-detail .ad-close")){
      closeDetail();
    }
  },true);

  window.asterMessageSources = {
    normalize:normalizeResults,
    attach:attachSources,
    openDetail,
    closeDetail
  };
})();
