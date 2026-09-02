function portalOpen(){
          if(portaled) return;
          renderMenu();
          positionMenu();
          document.body.appendChild(menu);
          portaled=true;
          requestAnimationFrame(()=>menu.classList.add("open"));
        }
