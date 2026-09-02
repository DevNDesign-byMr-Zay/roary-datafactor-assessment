function positionMenu(){
          const rect = btn.getBoundingClientRect();
          menu.style.position="fixed";
          menu.style.left=rect.left+"px";
          menu.style.top=(rect.bottom+8)+"px";
          menu.style.minWidth=Math.max(260,rect.width)+"px";
        }
