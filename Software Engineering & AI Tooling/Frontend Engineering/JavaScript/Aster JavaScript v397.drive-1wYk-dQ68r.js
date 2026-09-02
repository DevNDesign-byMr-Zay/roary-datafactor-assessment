function closeMenu(){
          btn.setAttribute("aria-expanded","false");
          document.removeEventListener("click", outside, {capture:true});
          document.removeEventListener("keydown", onKey);
          window.removeEventListener("resize", positionMenu);
          portalClose();
        }
