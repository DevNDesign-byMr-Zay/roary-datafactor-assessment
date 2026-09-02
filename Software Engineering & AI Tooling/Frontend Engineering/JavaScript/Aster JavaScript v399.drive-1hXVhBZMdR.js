function computeComposerOffset(){
        requestAnimationFrame(()=>{
          const w = leftSidebar ? (leftSidebar.offsetWidth||0) : 0;
          const chatPadLeft = 18;
          document.documentElement.style.setProperty("--composer-left",(w+chatPadLeft)+"px");
        });
      }
