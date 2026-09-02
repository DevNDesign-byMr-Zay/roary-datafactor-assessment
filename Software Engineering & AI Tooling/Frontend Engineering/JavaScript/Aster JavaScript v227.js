/* Aster JavaScript v227 — authenticated buyer-safe derivative: fullscreen-image hover stabilization. Host state/dependencies are intentionally external. */
function asterFsHover(root){
    try{
      if(!root || root.__asterFsHoverFix) return;
      root.__asterFsHoverFix = 1;
      const btn = root.querySelector(".fs-btn");
      const menu = root.querySelector(".fs-menu");
      if(!btn || !menu) return;

      let closeTimer = null;
      const clearClose = ()=>{ try{ if(closeTimer){ clearTimeout(closeTimer); closeTimer=null; } }catch(e){} };
      const isOpen = ()=> menu.classList.contains("open") || btn.getAttribute("aria-expanded")==="true";

      const openNow = ()=>{
        clearClose();
        if(isOpen()) return;
        try{
          btn.dispatchEvent(new MouseEvent("click",{bubbles:true}));
        }catch(e){
          try{ btn.click && btn.click(); }catch(e2){}
        }
      };

      const scheduleClose = ()=>{
        clearClose();
        closeTimer = setTimeout(()=>{
          try{
            if(root.closeMenu) root.closeMenu();
          }catch(e){}
        }, 160);
      };

      btn.addEventListener("mouseenter", openNow);
      btn.addEventListener("mouseleave", scheduleClose);
      menu.addEventListener("mouseenter", clearClose);
      menu.addEventListener("mouseleave", scheduleClose);

      // If menu is open and user hovers back on root, keep it open
      root.addEventListener("mouseenter", clearClose);
    }catch(e){}
  }
