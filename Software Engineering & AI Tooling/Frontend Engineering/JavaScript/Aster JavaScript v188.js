/* Aster JavaScript v188
Authenticated historical derivative: sidebar-collapse and composer-offset synchronization.
Persists collapse state, reflects toggle accessibility state, and keeps a CSS offset synchronized across resize and width transitions.
*/
(function(global){
  "use strict";
  if(global.AsterSidebarGeometry) return;

  function install(options={}){
    const sidebar=options.sidebar;
    const toggle=options.toggle||null;
    if(!(sidebar instanceof HTMLElement)) return null;

    const storage=options.storage||global.localStorage;
    const storageKey=String(options.storageKey||"aster.sidebarCollapsed");
    const cssVar=String(options.cssVar||"--composer-left");
    const extraOffset=Number.isFinite(Number(options.extraOffset))?Number(options.extraOffset):18;
    const root=options.root||document.documentElement;
    let observer=null;

    function computeOffset(){
      global.requestAnimationFrame(()=>{
        const width=sidebar.offsetWidth||0;
        root.style.setProperty(cssVar,`${width+extraOffset}px`);
        if(typeof options.onOffset==="function") options.onOffset(width+extraOffset,width);
      });
    }

    function isCollapsed(){return sidebar.classList.contains(options.collapsedClass||"collapsed");}

    function setCollapsed(collapsed,persist=true){
      const next=!!collapsed;
      sidebar.classList.toggle(options.collapsedClass||"collapsed",next);
      if(persist){
        try{storage?.setItem(storageKey,next?"1":"0");}catch(_){}
      }
      toggle?.setAttribute("aria-pressed",(!next).toString());
      computeOffset();
      return next;
    }

    function toggleCollapsed(){return setCollapsed(!isCollapsed(),true);}

    function onTransition(event){
      if(String(event.propertyName||"").includes("width")) computeOffset();
    }
    function onToggle(event){event.preventDefault();toggleCollapsed();}

    let initial=false;
    try{initial=storage?.getItem(storageKey)==="1";}catch(_){}
    setCollapsed(initial,false);
    global.addEventListener("resize",computeOffset);
    sidebar.addEventListener("transitionend",onTransition);
    toggle?.addEventListener("click",onToggle);
    if(typeof ResizeObserver!=="undefined"){
      observer=new ResizeObserver(computeOffset);
      observer.observe(sidebar);
    }
    computeOffset();

    function destroy(){
      global.removeEventListener("resize",computeOffset);
      sidebar.removeEventListener("transitionend",onTransition);
      toggle?.removeEventListener("click",onToggle);
      observer?.disconnect();
    }

    return {computeOffset,setCollapsed,toggleCollapsed,isCollapsed,destroy};
  }

  global.AsterSidebarGeometry={install};
})(typeof window!=="undefined"?window:globalThis);
