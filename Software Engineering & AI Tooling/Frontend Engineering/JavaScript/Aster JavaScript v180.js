/* Aster JavaScript v180
   Authenticated historical derivative: accessible source-result disclosure panel.
   Search results are normalized, bounded, rendered with DOM text nodes, and external links
   receive noopener/noreferrer protection. No provider-specific identity is required.
*/
(function(global){
  "use strict";
  if(global.AsterSourceDisclosure) return;

  function normalize(results, options={}){
    const maxItems=Math.max(1,Math.min(50,Number(options.maxItems)||12));
    const maxSnippet=Math.max(40,Math.min(1000,Number(options.maxSnippet)||180));
    return (Array.isArray(results)?results:[])
      .map(item=>{
        const value=item&&typeof item==="object"?item:{};
        const url=String(value.url||value.link||value.href||"").trim();
        const title=String(value.title||value.name||url||"Untitled").trim();
        let snippet=String(value.snippet||value.description||value.content||"").trim();
        if(snippet.length>maxSnippet) snippet=snippet.slice(0,maxSnippet-1)+"…";
        return {url,title,snippet};
      })
      .filter(item=>item.url||item.title||item.snippet)
      .slice(0,maxItems);
  }

  function hostOf(url){
    try{
      const parsed=new URL(String(url||""),global.location?.href||"http://localhost/");
      if(!/^https?:$/.test(parsed.protocol)) return "";
      return parsed.hostname.replace(/^www\./i,"");
    }catch{return "";}
  }

  function create(results, options={}){
    const items=normalize(results,options);
    if(!items.length) return null;

    const root=document.createElement("section");
    root.className=options.className||"aster-sources";
    root.setAttribute("aria-label",options.ariaLabel||"Sources");

    const head=document.createElement("button");
    head.type="button";
    head.className="aster-sources-toggle";
    head.setAttribute("aria-expanded","false");
    head.textContent=options.label||"Sources";

    const list=document.createElement("ul");
    list.className="aster-sources-list";
    list.hidden=true;

    for(const item of items){
      const li=document.createElement("li");
      const host=hostOf(item.url);
      const link=document.createElement("a");
      link.textContent=host||item.title||"Source";
      if(/^https?:\/\//i.test(item.url)){
        link.href=item.url;
        link.target="_blank";
        link.rel="noopener noreferrer";
      }else{
        link.href="#";
        link.addEventListener("click",event=>event.preventDefault());
      }
      li.appendChild(link);

      if(item.snippet){
        const text=document.createElement("div");
        text.className="aster-sources-snippet";
        text.textContent=item.snippet;
        li.appendChild(text);
      }
      list.appendChild(li);
    }

    function setOpen(open){
      const value=Boolean(open);
      root.classList.toggle("is-open",value);
      head.setAttribute("aria-expanded",value?"true":"false");
      list.hidden=!value;
    }
    head.addEventListener("click",()=>setOpen(list.hidden));
    root.append(head,list);
    root.setOpen=setOpen;
    return root;
  }

  global.AsterSourceDisclosure={normalize,hostOf,create};
})(typeof window!=="undefined"?window:globalThis);
