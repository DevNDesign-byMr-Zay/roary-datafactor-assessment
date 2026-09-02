/* Aster JavaScript v060
Authenticated historical derivative: media original/variation grouping and sidebar preview renderer.
Product identity, credentials, proprietary prompts, and protected reasoning/visualization code removed.
*/
(function(){
  "use strict";
  if(window.__asterMediaVariationGroupsV1) return;
  window.__asterMediaVariationGroupsV1 = true;

  function normalize(value){
    if(typeof window.asterNormalizeMediaSrc === "function"){
      try{ return window.asterNormalizeMediaSrc(value) || ""; }catch(_){}
    }
    return String(value || "").trim();
  }

  function fixedSrc(item){
    if(!item) return "";
    return normalize(item.__srcFixed || item.src || "");
  }

  function groupMediaItems(items){
    const groups = new Map();

    for(const item of Array.isArray(items) ? items : []){
      try{
        const src = fixedSrc(item);
        const parent = normalize(item?.parentSrc || "");
        const root = parent || src;

        if(!root || /^blob:null\//i.test(root)) continue;

        if(!groups.has(root)){
          groups.set(root,{
            root,
            items:[],
            original:null,
            latestTs:0,
            variationCount:0
          });
        }

        const group = groups.get(root);
        const fixed = {...item,__srcFixed:src,__parentFixed:parent};
        group.items.push(fixed);

        const ts = Number(item?.ts || 0);
        if(ts > group.latestTs) group.latestTs = ts;
        if(!parent) group.original = fixed;
      }catch(_){}
    }

    const output = Array.from(groups.values());
    for(const group of output){
      group.variationCount = Math.max(
        0,
        group.items.filter(item=>{
          const itemSrc = fixedSrc(item);
          const parent = normalize(item?.parentSrc || "");
          return !!parent || (!!itemSrc && itemSrc !== group.root);
        }).length
      );
    }

    output.sort((a,b)=>(b.latestTs || 0) - (a.latestTs || 0));
    return output;
  }

  function pickRepresentative(group){
    if(!group) return null;
    if(group.original) return group.original;
    return group.items?.reduce((best,current)=>{
      if(!best) return current;
      return Number(current?.ts || 0) > Number(best?.ts || 0) ? current : best;
    },null) || null;
  }

  async function renderSidebar(options={}){
    const container =
      options.container ||
      document.getElementById(options.containerId || "mediaLibPreview");
    const listItems = options.listItems || window.asterListMediaItems;
    const onOpen = options.onOpen || window.asterOpenMediaItem;

    if(!container || typeof listItems !== "function") return [];

    let items = [];
    try{ items = await listItems(Number(options.scanLimit || 2600)) || []; }
    catch(_){ items = []; }

    const groups = groupMediaItems(items);
    const max = Math.max(1,Math.min(300,Number(options.maxGroups || 18)));
    container.innerHTML = "";

    for(const group of groups.slice(0,max)){
      const representative = pickRepresentative(group);
      const src = fixedSrc(representative);
      if(!src) continue;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "media-lib-thumb";
      button.dataset.src = src;

      const image = document.createElement("img");
      image.src = src;
      image.alt = "Generated image";
      image.loading = "lazy";
      image.decoding = "async";
      button.appendChild(image);

      if(group.variationCount > 0){
        const badge = document.createElement("span");
        badge.className = "aster-var-badge";
        badge.textContent = String(group.variationCount);
        badge.setAttribute("aria-label",group.variationCount + " variations");
        button.appendChild(badge);
      }

      button.addEventListener("click",async event=>{
        event.preventDefault();
        if(typeof onOpen !== "function") return;

        const latest = group.items.reduce((best,current)=>{
          if(!best) return current;
          return Number(current?.ts || 0) > Number(best?.ts || 0) ? current : best;
        },representative);

        try{ await onOpen(latest || representative,group); }catch(_){}
      });

      container.appendChild(button);
    }

    return groups;
  }

  window.asterMediaGroups = {
    group:groupMediaItems,
    representative:pickRepresentative,
    renderSidebar
  };
})();
