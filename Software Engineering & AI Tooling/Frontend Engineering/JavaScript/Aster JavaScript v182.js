/* Aster JavaScript v182
   Authenticated historical derivative: combined image/video result gallery.
   Media records are normalized into safe linked cards with bounded titles, thumbnail checks,
   optional source/channel/duration metadata, and an accessible disclosure toggle.
*/
(function(global){
  "use strict";
  if(global.AsterMediaResultGallery) return;

  function text(value,max=80){
    const result=String(value||"").trim();
    return result.length>max?result.slice(0,max-1)+"…":result;
  }

  function normalize(media, options={}){
    const maxItems=Math.max(1,Math.min(100,Number(options.maxItems)||30));
    const images=(Array.isArray(media?.images)?media.images:[]).map(item=>({
      kind:"image",
      href:String(item?.page_url||item?.url||item?.link||item?.src||"").trim(),
      thumb:String(item?.thumbnail||item?.src||item?.image||"").trim(),
      title:text(item?.title||item?.source||"Image"),
      meta:text(item?.source||item?.site||"",120)
    }));
    const videos=(Array.isArray(media?.videos)?media.videos:[]).map(item=>({
      kind:"video",
      href:String(item?.page_url||item?.url||item?.watch_url||item?.src||"").trim(),
      thumb:String(item?.thumbnail||item?.preview||item?.image||"").trim(),
      title:text(item?.title||item?.source||"Video"),
      meta:[item?.channel,item?.source||item?.platform,item?.duration]
        .map(value=>text(value,60)).filter(Boolean).join(" • ")
    }));
    return images.concat(videos).filter(item=>item.thumb).slice(0,maxItems);
  }

  function safeHref(value){
    const href=String(value||"").trim();
    return /^https?:\/\//i.test(href)?href:"";
  }

  function create(media, options={}){
    const items=normalize(media,options);
    if(!items.length) return null;

    const root=document.createElement("section");
    root.className=options.className||"aster-media-gallery";
    root.setAttribute("aria-label",options.ariaLabel||"Media results");

    const toggle=document.createElement("button");
    toggle.type="button";
    toggle.className="aster-media-toggle";
    toggle.setAttribute("aria-expanded","false");
    toggle.textContent=options.label||`Media (${items.length})`;

    const grid=document.createElement("div");
    grid.className="aster-media-grid";
    grid.hidden=true;

    for(const item of items){
      const card=document.createElement(item.href?"a":"div");
      card.className=`aster-media-card ${item.kind}`;
      const href=safeHref(item.href);
      if(card.tagName==="A"){
        if(href){card.href=href;card.target="_blank";card.rel="noopener noreferrer";}
        else{card.removeAttribute("href");card.setAttribute("role","group");}
      }

      const image=document.createElement("img");
      image.src=item.thumb;
      image.alt=item.title||`${item.kind} result`;
      image.loading="lazy";
      card.appendChild(image);

      const overlay=document.createElement("span");
      overlay.className="aster-media-overlay";
      const title=document.createElement("span");
      title.className="aster-media-title";
      title.textContent=item.title||item.kind;
      overlay.appendChild(title);
      if(item.meta){
        const meta=document.createElement("span");
        meta.className="aster-media-meta";
        meta.textContent=item.meta;
        overlay.appendChild(meta);
      }
      if(item.kind==="video"){
        const badge=document.createElement("span");
        badge.className="aster-media-badge";
        badge.textContent="Video";
        overlay.appendChild(badge);
      }
      card.appendChild(overlay);
      grid.appendChild(card);
    }

    function setOpen(open){
      const value=Boolean(open);
      root.classList.toggle("is-open",value);
      toggle.setAttribute("aria-expanded",value?"true":"false");
      grid.hidden=!value;
    }
    toggle.addEventListener("click",()=>setOpen(grid.hidden));
    root.append(toggle,grid);
    root.setOpen=setOpen;
    return root;
  }

  global.AsterMediaResultGallery={normalize,safeHref,create};
})(typeof window!=="undefined"?window:globalThis);
