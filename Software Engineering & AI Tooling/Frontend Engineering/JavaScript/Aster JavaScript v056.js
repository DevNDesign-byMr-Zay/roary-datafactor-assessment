/* Aster JavaScript v056
Authenticated historical derivative: composer height synchronization and scroll-to-bottom positioning controller.
Identity-specific names and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterComposerGeometryV1) return;
  window.__asterComposerGeometryV1 = true;

  const root = document.documentElement;
  const shell = document.getElementById("composerShell");
  const textarea = document.getElementById("composerInput");
  const scrollButton = document.getElementById("scrollToBottomBtn");
  if(!shell) return;

  function syncHeight(){
    try{
      const rect = shell.getBoundingClientRect();
      const height = Math.max(60,Math.round(rect.height || shell.offsetHeight || 0));
      root.style.setProperty("--aster-composer-h",height + "px");
    }catch(_){}
  }

  function syncMultiline(){
    if(!textarea) return;
    const value = textarea.value || "";
    const hasNewline = value.includes("\n");
    const scrollHeight = textarea.scrollHeight || 0;
    const rectHeight = textarea.getBoundingClientRect?.().height || 44;
    const multiline = hasNewline || scrollHeight > 60 || (rectHeight > 46 && value.trim().length > 0);

    shell.classList.toggle("aster-composer-multiline",multiline);

    if(multiline){
      const maxHeight = 140;
      textarea.style.height = "auto";
      const height = Math.max(44,Math.min(maxHeight,textarea.scrollHeight || 44));
      textarea.style.height = height + "px";
      textarea.style.overflowY = (textarea.scrollHeight || 0) > maxHeight ? "auto" : "hidden";
    }else{
      textarea.style.height = "44px";
      textarea.style.overflowY = "hidden";
    }

    requestAnimationFrame(syncHeight);
  }

  function sync(){
    syncMultiline();
    syncHeight();
  }

  if(textarea){
    textarea.addEventListener("input",()=>requestAnimationFrame(sync),{passive:true});
  }

  try{
    const observer = new MutationObserver(()=>requestAnimationFrame(sync));
    observer.observe(shell,{attributes:true,childList:true,subtree:true});
    window.__asterComposerGeometryObserver = observer;
  }catch(_){}

  window.addEventListener("resize",()=>requestAnimationFrame(sync),{passive:true});
  window.addEventListener("orientationchange",()=>requestAnimationFrame(sync),{passive:true});

  if(scrollButton) scrollButton.dataset.asterComposerFollow = "1";

  sync();
  setTimeout(sync,80);
  setTimeout(sync,220);

  window.asterComposerGeometry = {sync};
})();
