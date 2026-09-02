/* Aster JavaScript v068
Authenticated historical derivative: portalized composer tools/upload menu.
Product identity, credentials, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterComposerToolMenuV1) return;
  window.__asterComposerToolMenuV1 = true;

  function bind(options={}){
    const drawer =
      options.drawer ||
      document.querySelector(options.drawerSelector || "[data-aster-tools-drawer]");
    if(!drawer) return null;

    const anchorSelector =
      options.anchorSelector ||
      "[data-aster-tools-toggle], [data-aster-attach-toggle]";
    const anchors = Array.from(document.querySelectorAll(anchorSelector));
    const uploadButton =
      options.uploadButton ||
      drawer.querySelector(
        options.uploadSelector || "[data-aster-upload-files]"
      );
    const fileInputs = Array.from(document.querySelectorAll(
      options.fileInputSelector ||
      'input[type="file"][data-aster-attachment-input]'
    ));

    const placeholder = document.createComment("aster-tools-drawer-home");
    if(drawer.parentNode){
      drawer.parentNode.insertBefore(placeholder,drawer);
    }

    let scrim = document.querySelector("[data-aster-tools-scrim]");
    if(!scrim){
      scrim = document.createElement("div");
      scrim.className = "aster-tools-scrim";
      scrim.setAttribute("data-aster-tools-scrim","1");
      scrim.setAttribute("aria-hidden","true");
      document.body.appendChild(scrim);
    }

    if(drawer.parentElement !== document.body){
      document.body.appendChild(drawer);
    }
    drawer.setAttribute("data-aster-tools-portal","1");
    drawer.setAttribute("aria-hidden","true");

    const lockFileInput = input=>{
      if(!input) return;
      try{ input.disabled = true; }catch(_){}
      input.tabIndex = -1;
      input.style.position = "fixed";
      input.style.left = "-9999px";
      input.style.top = "-9999px";
      input.style.width = "1px";
      input.style.height = "1px";
      input.style.opacity = "0";
      input.style.pointerEvents = "none";
    };

    const unlockAndChoose = input=>{
      if(!input) return false;
      try{
        input.disabled = false;
        input.removeAttribute("disabled");
        input.click();
        setTimeout(()=>lockFileInput(input),80);
        return true;
      }catch(_){
        lockFileInput(input);
        return false;
      }
    };

    fileInputs.forEach(lockFileInput);

    let lastAnchor = anchors[0] || null;

    const isOpen = ()=>drawer.getAttribute("aria-hidden") === "false";

    const syncOpenState = ()=>{
      const open = isOpen();
      scrim.dataset.open = open ? "1" : "0";
      scrim.setAttribute("aria-hidden",open ? "false" : "true");
      document.body.classList.toggle("aster-tools-menu-open",open);
    };

    const position = anchor=>{
      if(!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const previousHidden = drawer.getAttribute("aria-hidden");

      drawer.setAttribute("aria-hidden","false");
      drawer.style.visibility = "hidden";
      drawer.style.pointerEvents = "none";

      const width = Math.max(240,drawer.offsetWidth || 320);
      const height = Math.max(140,drawer.offsetHeight || 220);

      drawer.setAttribute("aria-hidden",previousHidden || "true");
      drawer.style.visibility = "";
      drawer.style.pointerEvents = "";

      const pad = 12;
      let left = Math.round(rect.left);
      left = Math.max(
        pad,
        Math.min(window.innerWidth - width - pad,left)
      );

      let top = Math.round(rect.top - height - 10);
      if(top < pad) top = Math.round(rect.bottom + 10);
      top = Math.max(
        pad,
        Math.min(window.innerHeight - height - pad,top)
      );

      drawer.style.left = left + "px";
      drawer.style.top = top + "px";
      drawer.style.right = "auto";
      drawer.style.bottom = "auto";
    };

    const setOpen = open=>{
      drawer.setAttribute("aria-hidden",open ? "false" : "true");
      if(open && lastAnchor) position(lastAnchor);
      syncOpenState();
    };

    const toggleAt = anchor=>{
      lastAnchor = anchor || lastAnchor;
      setOpen(!isOpen());
    };

    anchors.forEach(anchor=>{
      if(anchor.dataset.asterToolsMenuBound === "1") return;
      anchor.dataset.asterToolsMenuBound = "1";
      anchor.addEventListener("click",event=>{
        event.preventDefault();
        event.stopPropagation();
        toggleAt(anchor);
      });
    });

    if(uploadButton && uploadButton.dataset.asterUploadBound !== "1"){
      uploadButton.dataset.asterUploadBound = "1";
      uploadButton.addEventListener("click",event=>{
        event.preventDefault();
        event.stopPropagation();

        const preferred = fileInputs.find(input=>!input.dataset.asterSecondary);
        const selected = preferred || fileInputs[0] || null;
        if(unlockAndChoose(selected)) setOpen(false);
      });
    }

    scrim.addEventListener("click",()=>setOpen(false));
    document.addEventListener("keydown",event=>{
      if(event.key === "Escape") setOpen(false);
    });

    try{
      new MutationObserver(syncOpenState).observe(
        drawer,
        {attributes:true,attributeFilter:["aria-hidden"]}
      );
    }catch(_){}

    syncOpenState();

    return {
      open:anchor=>{
        lastAnchor = anchor || lastAnchor;
        setOpen(true);
      },
      close:()=>setOpen(false),
      toggle:toggleAt,
      position,
      lockFileInput,
      restoreHome:()=>{
        try{
          if(placeholder.parentNode){
            placeholder.parentNode.insertBefore(drawer,placeholder.nextSibling);
          }
        }catch(_){}
      }
    };
  }

  window.asterComposerToolMenu = {bind};
})();
