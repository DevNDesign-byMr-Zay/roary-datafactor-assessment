/* Aster JavaScript v071
Authenticated historical derivative: media-library image/video tab controller.
Product identity, credentials, proprietary prompts, and protected reasoning/visualization code removed.
*/
(function(){
  "use strict";
  if(window.__asterMediaLibraryTabsV1) return;
  window.__asterMediaLibraryTabsV1 = true;

  const STORAGE_KEY = "aster.mediaTab";

  function normalizeTab(value){
    return String(value || "").toLowerCase() === "videos" ? "videos" : "images";
  }

  function bind(options={}){
    const view =
      options.view ||
      document.querySelector(options.viewSelector || "[data-aster-media-view]");
    const menu =
      options.menu ||
      document.querySelector(options.menuSelector || "[data-aster-library-menu]");
    const label =
      options.label ||
      document.querySelector(options.labelSelector || "[data-aster-library-label]");
    const imageGrid =
      options.imageGrid ||
      document.querySelector(options.imageGridSelector || "[data-aster-image-grid]");

    if(!view || !menu || !imageGrid) return null;

    let videoGrid =
      options.videoGrid ||
      document.querySelector(options.videoGridSelector || "[data-aster-video-grid]");

    if(!videoGrid){
      videoGrid = document.createElement("div");
      videoGrid.className = "aster-media-grid";
      videoGrid.setAttribute("data-aster-video-grid","1");
      videoGrid.setAttribute("role","region");
      videoGrid.setAttribute("aria-label","Generated videos library");
      imageGrid.insertAdjacentElement("afterend",videoGrid);
    }

    function readStored(){
      try{ return normalizeTab(localStorage.getItem(STORAGE_KEY)); }
      catch(_){ return "images"; }
    }

    function writeStored(tab){
      try{ localStorage.setItem(STORAGE_KEY,tab); }catch(_){}
    }

    function ensureOptions(){
      if(menu.querySelector("[data-aster-media-tab]")) return;

      const definitions = [
        ["images","IMAGES","Browse generated images"],
        ["videos","VIDEOS","Browse generated videos"]
      ];

      for(const [tab,title,subtitle] of definitions){
        const button = document.createElement("button");
        button.type = "button";
        button.className = "aster-media-tab-option";
        button.setAttribute("data-aster-media-tab",tab);
        button.innerHTML =
          `<span class="aster-media-tab-title">${title}</span>` +
          `<span class="aster-media-tab-subtitle">${subtitle}</span>`;
        menu.appendChild(button);
      }
    }

    function ensureVideoEmptyState(){
      if(videoGrid.childElementCount) return;
      const empty = document.createElement("div");
      empty.className = "aster-media-empty";
      empty.innerHTML =
        '<strong>VIDEOS</strong>' +
        '<span>Generated videos will appear here.</span>';
      videoGrid.appendChild(empty);
    }

    function setTab(value){
      const tab = normalizeTab(value);
      writeStored(tab);
      document.body?.setAttribute("data-aster-media-tab",tab);

      const videos = tab === "videos";
      imageGrid.hidden = videos;
      videoGrid.hidden = !videos;
      if(videos) ensureVideoEmptyState();

      menu.querySelectorAll("[data-aster-media-tab]").forEach(node=>{
        const selected = node.getAttribute("data-aster-media-tab") === tab;
        node.classList.toggle("is-selected",selected);
        node.setAttribute("aria-selected",selected ? "true" : "false");
      });

      if(label) label.textContent = tab.toUpperCase();

      document.dispatchEvent(new CustomEvent("aster:media-tab-change",{
        detail:{tab}
      }));
      return tab;
    }

    function isViewOpen(){
      const aria = view.getAttribute("aria-hidden");
      return aria === null || aria === "false";
    }

    function syncMode(){
      const open = isViewOpen();
      document.body?.setAttribute(
        "data-aster-topbar-mode",
        open ? "media" : "models"
      );
      if(open) setTab(readStored());
    }

    ensureOptions();

    menu.addEventListener("click",event=>{
      const option = event.target.closest?.("[data-aster-media-tab]");
      if(!option) return;
      event.preventDefault();
      setTab(option.getAttribute("data-aster-media-tab"));
    });

    menu.addEventListener("keydown",event=>{
      if(event.key !== "Enter" && event.key !== " ") return;
      const option = event.target.closest?.("[data-aster-media-tab]");
      if(!option) return;
      event.preventDefault();
      setTab(option.getAttribute("data-aster-media-tab"));
    });

    try{
      const observer = new MutationObserver(syncMode);
      observer.observe(view,{
        attributes:true,
        attributeFilter:["aria-hidden","class","style"]
      });
      view.__asterMediaTabObserver = observer;
    }catch(_){}

    setTab(readStored());
    syncMode();

    return {setTab,syncMode,videoGrid};
  }

  window.asterMediaLibraryTabs = {
    normalizeTab,
    bind
  };
})();
