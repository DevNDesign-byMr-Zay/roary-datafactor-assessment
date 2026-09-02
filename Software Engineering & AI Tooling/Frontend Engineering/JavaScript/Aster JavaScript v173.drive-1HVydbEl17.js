/* Aster JavaScript v173
Authenticated historical derivative: accessible mixed-media reference gallery.
Renders normalized image/video search results into a collapsible keyboard-operable region.
*/
(function(global){
  "use strict";
  if(global.AsterMediaReferenceGallery) return;

  function safeUrl(value){
    const text=String(value||"").trim();
    if(!text) return "";
    try{
      const url=new URL(text,location.href);
      return /^https?:$/.test(url.protocol)?url.href:"";
    }catch(_){
      return "";
    }
  }

  function normalizeImage(item){
    const href=safeUrl(
      item?.page_url||item?.pageUrl||item?.source_url||
      item?.sourceUrl||item?.url||item?.href||item?.link
    );
    const preview=safeUrl(
      item?.thumbnail||item?.thumbnail_url||item?.image||
      item?.src||item?.url
    );
    return {
      kind:"image",
      href,
      preview,
      title:String(item?.title||item?.source||item?.site||"Image").trim()
    };
  }

  function normalizeVideo(item){
    const href=safeUrl(
      item?.page_url||item?.pageUrl||item?.url||
      item?.href||item?.link
    );
    const preview=safeUrl(
      item?.thumbnail||item?.thumbnail_url||item?.image||""
    );
    return {
      kind:"video",
      href,
      preview,
      title:String(item?.title||item?.name||item?.channel||"Video").trim(),
      source:String(item?.channel||item?.source||item?.publisher||"").trim()
    };
  }

  function toggle(head,grid,open){
    const isOpen=open ?? grid.hidden;
    grid.hidden=!isOpen;
    head.setAttribute("aria-expanded",isOpen?"true":"false");
    return isOpen;
  }

  function build(media,options={}){
    const images=(Array.isArray(media?.images)?media.images:[])
      .map(normalizeImage)
      .filter(item=>item.href||item.preview);

    const videos=(Array.isArray(media?.videos)?media.videos:[])
      .map(normalizeVideo)
      .filter(item=>item.href||item.preview);

    if(!images.length&&!videos.length) return null;

    const wrap=document.createElement("section");
    wrap.className=String(options.className||"aster-media-reference-gallery");
    wrap.setAttribute("aria-label",String(options.label||"Media references"));

    const head=document.createElement("button");
    head.type="button";
    head.className="aster-media-reference-toggle";
    head.textContent=String(options.title||"Media references");
    head.setAttribute("aria-expanded","true");

    const grid=document.createElement("div");
    grid.className="aster-media-reference-grid";

    for(const item of [...images,...videos]){
      const card=document.createElement(item.href?"a":"div");
      card.className=`aster-media-card aster-media-${item.kind}`;

      if(item.href && card instanceof HTMLAnchorElement){
        card.href=item.href;
        card.target="_blank";
        card.rel="noopener noreferrer";
      }

      if(item.preview){
        const image=document.createElement("img");
        image.src=item.preview;
        image.alt="";
        image.loading="lazy";
        image.referrerPolicy="no-referrer";
        card.appendChild(image);
      }

      const label=document.createElement("span");
      label.className="aster-media-card-title";
      label.textContent=item.title||item.kind;
      card.appendChild(label);

      if(item.kind==="video" && item.source){
        const source=document.createElement("small");
        source.textContent=item.source;
        card.appendChild(source);
      }

      grid.appendChild(card);
    }

    head.addEventListener("click",()=>toggle(head,grid));
    head.addEventListener("keydown",event=>{
      if(event.key==="Enter"||event.key===" "){
        event.preventDefault();
        toggle(head,grid);
      }
    });

    wrap.append(head,grid);
    return wrap;
  }

  global.AsterMediaReferenceGallery={
    safeUrl,
    normalizeImage,
    normalizeVideo,
    toggle,
    build
  };
})(window);
