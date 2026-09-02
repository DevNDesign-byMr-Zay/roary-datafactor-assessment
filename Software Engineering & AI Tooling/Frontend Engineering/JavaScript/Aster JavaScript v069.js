/* Aster JavaScript v069
Authenticated historical derivative: expanded-menu clipping and stuck-state recovery.
Product identity, credentials, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterExpandedToolMenuRecoveryV1) return;
  window.__asterExpandedToolMenuRecoveryV1 = true;

  function bind(options={}){
    const wrap =
      options.wrap ||
      document.querySelector(options.wrapSelector || "[data-aster-tools-wrap]");
    const drawer =
      options.drawer ||
      document.querySelector(options.drawerSelector || "[data-aster-tools-drawer]");
    const toggle =
      options.toggle ||
      document.querySelector(options.toggleSelector || "[data-aster-tools-toggle]");
    const uploadButton =
      options.uploadButton ||
      drawer?.querySelector(
        options.uploadSelector || "[data-aster-upload-files]"
      );
    const fileInput =
      options.fileInput ||
      document.querySelector(
        options.fileInputSelector ||
        'input[type="file"][data-aster-attachment-input]'
      );

    if(!wrap || !drawer || !toggle) return null;

    const lockInput = ()=>{
      if(!fileInput) return;
      try{ fileInput.disabled = true; }catch(_){}
      fileInput.setAttribute("disabled","");
      fileInput.tabIndex = -1;
      fileInput.style.position = "fixed";
      fileInput.style.left = "-9999px";
      fileInput.style.top = "-9999px";
      fileInput.style.width = "1px";
      fileInput.style.height = "1px";
      fileInput.style.opacity = "0";
      fileInput.style.pointerEvents = "none";
    };

    const isOpen = ()=>wrap.classList.contains("aster-tools-open");

    const syncBody = ()=>{
      const open = isOpen();
      document.body.classList.toggle("aster-tools-open",open);
      toggle.setAttribute("aria-expanded",open ? "true" : "false");
      drawer.setAttribute("aria-hidden",open ? "false" : "true");
    };

    const open = ()=>{
      wrap.classList.add("aster-tools-open");
      syncBody();
    };

    const close = ()=>{
      wrap.classList.remove("aster-tools-open");
      syncBody();
      lockInput();
    };

    const toggleMenu = ()=>{
      if(isOpen()) close();
      else open();
    };

    lockInput();

    if(toggle.dataset.asterExpandRecoveryBound !== "1"){
      toggle.dataset.asterExpandRecoveryBound = "1";
      toggle.addEventListener("click",event=>{
        event.preventDefault();
        event.stopPropagation();
        toggleMenu();
      });
    }

    if(uploadButton && uploadButton.dataset.asterExpandUploadBound !== "1"){
      uploadButton.dataset.asterExpandUploadBound = "1";
      uploadButton.addEventListener("click",event=>{
        event.preventDefault();
        event.stopPropagation();

        if(!fileInput) return;
        try{
          fileInput.disabled = false;
          fileInput.removeAttribute("disabled");
          fileInput.click();
        }catch(_){}
        setTimeout(lockInput,80);
        close();
      });
    }

    document.addEventListener("pointerdown",event=>{
      if(!isOpen()) return;
      const target = event.target;
      if(
        wrap.contains(target) ||
        drawer.contains(target) ||
        toggle.contains(target)
      ) return;
      close();
    },true);

    document.addEventListener("keydown",event=>{
      if(event.key === "Escape" && isOpen()) close();
    });

    try{
      new MutationObserver(syncBody).observe(
        wrap,
        {attributes:true,attributeFilter:["class"]}
      );
    }catch(_){}

    // Repair stale open classes/attributes left by older controllers.
    if(
      drawer.getAttribute("aria-hidden") === "true" &&
      wrap.classList.contains("aster-tools-open")
    ){
      wrap.classList.remove("aster-tools-open");
    }
    syncBody();

    return {open,close,toggle:toggleMenu,lockInput,sync:syncBody};
  }

  window.asterExpandedToolMenuRecovery = {bind};
})();
