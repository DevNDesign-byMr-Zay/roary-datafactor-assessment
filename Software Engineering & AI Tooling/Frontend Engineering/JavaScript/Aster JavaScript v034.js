/* Aster JavaScript v034
Authenticated historical derivative: capture-phase object-removal Execute coordinator.
Original product identity, private prompts, personal paths, credentials, and protected internal architecture removed.
*/
(function(){
  function activeTool(){
    const panel = document.getElementById("rtSidePanel");
    return String(panel?.dataset?.tool || panel?.getAttribute("data-tool") || "").toLowerCase();
  }

  function promptValue(){
    return String(
      document.getElementById("asterToolPrompt")?.value ||
      document.querySelector('#rtSidePanel textarea, #rtSidePanel input[type="text"]')?.value ||
      ""
    ).trim();
  }

  function maskIsPresent(){
    try{
      return !!(
        window.__asterErase &&
        typeof window.__asterErase.hasMask === "function" &&
        window.__asterErase.hasMask()
      );
    }catch(_){
      return false;
    }
  }

  function showMessage(message){
    try{
      if(typeof window.asterToast === "function"){
        window.asterToast(message);
        return;
      }
    }catch(_){}
    try{ console.log("[Aster]", message); }catch(_){}
  }

  async function executeRemoval(){
    const tool = activeTool();
    if(tool !== "remove" && tool !== "erase") return;

    if(typeof window.asterRemoveCurrentModalImage !== "function"){
      throw new Error("Removal implementation is unavailable.");
    }

    if(!maskIsPresent()){
      showMessage("Paint a mask first, then Execute.");
    }

    const image =
      (typeof window.getModalImageEl === "function" && window.getModalImageEl()) ||
      document.getElementById("imageModalImg");

    try{
      if(typeof window.setCenterImageBusy === "function"){
        window.setCenterImageBusy(true, "Removing…");
      }

      const output = await window.asterRemoveCurrentModalImage(promptValue(), {});
      if(!output) throw new Error("Removal returned no output.");

      const committed =
        typeof window.asterCacheBust === "function"
          ? window.asterCacheBust(output)
          : output;

      if(typeof window.commitNewImage === "function"){
        window.commitNewImage(committed);
      }else if(image){
        image.src = committed;
      }

      showMessage("Done.");
    }finally{
      try{
        if(typeof window.setCenterImageBusy === "function"){
          window.setCenterImageBusy(false);
        }
      }catch(_){}
    }
  }

  document.addEventListener("click", function(event){
    const button = event.target?.closest?.(
      "#asterToolApplyBtn, #rtToolApplyBtn, [data-tool-apply]"
    );
    if(!button) return;

    const tool = activeTool();
    if(tool === "remove" || tool === "erase"){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      button.disabled = false;
      executeRemoval().catch(error => showMessage(error?.message || String(error)));
    }else if(tool === "expand"){
      try{ window.asterEnsureExpandUnderlay?.(); }catch(_){}
    }
  }, true);
})();
