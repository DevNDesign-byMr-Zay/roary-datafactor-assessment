/* Aster JavaScript v040
Authenticated historical derivative: explicit remove/erase Execute bridge to an existing image-edit core.
Original product identity, obfuscated symbol names, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
*/
(function(){
  async function executeCurrentRemoval(options){
    const opts = options || {};
    let tool = "remove";

    try{
      const panel = document.getElementById("rtSidePanel");
      const selected =
        (panel && ((panel.dataset && panel.dataset.tool) || panel.getAttribute("data-tool"))) ||
        "";
      if(String(selected).toLowerCase() === "erase"){
        tool = "erase";
      }
    }catch(_){}

    const core = window.asterRemoveCore;
    if(typeof core !== "function"){
      throw new Error("Removal core is unavailable.");
    }

    return await core(tool, opts);
  }

  window.asterRemoveCurrentModalImage = executeCurrentRemoval;
})();
