function openMenu(){
          btn.setAttribute("aria-expanded","true");
          document.addEventListener("click", outside, {capture:true});
          document.addEventListener("keydown", onKey);
          window.addEventListener("resize", positionMenu);
          portalOpen();
        }
