/* Aster JavaScript v070
Authenticated historical derivative: minimal composer tools binder that preserves native send/submit ownership.
Product identity, credentials, provider/model identities, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterNativeComposerOwnershipV1) return;
  window.__asterNativeComposerOwnershipV1 = true;

  function bind(options={}){
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

    if(!drawer || !toggle) return null;

    // This controller intentionally does not bind the composer send button,
    // submit event, textarea Enter key, conversation creation, or generation
    // request pipeline. Those remain owned by the host application.
    const isOpen = ()=>drawer.getAttribute("aria-hidden") === "false";

    const position = ()=>{
      const rect = toggle.getBoundingClientRect();
      const pad = 12;

      const previous = drawer.getAttribute("aria-hidden");
      drawer.setAttribute("aria-hidden","false");
      drawer.style.visibility = "hidden";

      const width = Math.max(240,drawer.offsetWidth || 320);
      const height = Math.max(140,drawer.offsetHeight || 220);

      drawer.setAttribute("aria-hidden",previous || "true");
      drawer.style.visibility = "";

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

      drawer.style.position = "fixed";
      drawer.style.left = left + "px";
      drawer.style.top = top + "px";
      drawer.style.right = "auto";
      drawer.style.bottom = "auto";
    };

    const setOpen = open=>{
      if(open) position();
      drawer.setAttribute("aria-hidden",open ? "false" : "true");
      toggle.setAttribute("aria-expanded",open ? "true" : "false");
      document.body.classList.toggle("aster-tools-menu-open",open);
    };

    if(toggle.dataset.asterNativeMenuBound !== "1"){
      toggle.dataset.asterNativeMenuBound = "1";
      toggle.addEventListener("click",event=>{
        event.preventDefault();
        event.stopPropagation();
        setOpen(!isOpen());
      });
    }

    if(uploadButton && uploadButton.dataset.asterNativeUploadBound !== "1"){
      uploadButton.dataset.asterNativeUploadBound = "1";
      uploadButton.addEventListener("click",event=>{
        event.preventDefault();
        event.stopPropagation();
        if(!fileInput) return;

        try{
          fileInput.disabled = false;
          fileInput.removeAttribute("disabled");
          fileInput.click();
        }catch(_){}

        setTimeout(()=>{
          try{
            fileInput.disabled = true;
            fileInput.setAttribute("disabled","");
          }catch(_){}
        },80);

        setOpen(false);
      });
    }

    document.addEventListener("pointerdown",event=>{
      if(!isOpen()) return;
      const target = event.target;
      if(toggle.contains(target) || drawer.contains(target)) return;
      setOpen(false);
    },true);

    document.addEventListener("keydown",event=>{
      if(event.key === "Escape" && isOpen()) setOpen(false);
    });

    return {
      open:()=>setOpen(true),
      close:()=>setOpen(false),
      toggle:()=>setOpen(!isOpen()),
      position
    };
  }

  window.asterNativeComposerOwnership = {bind};
})();
