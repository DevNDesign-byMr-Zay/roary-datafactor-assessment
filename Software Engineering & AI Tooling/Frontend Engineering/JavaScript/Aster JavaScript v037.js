/* Aster JavaScript v037
Authenticated historical derivative: deterministic /tool/remove contract with mask validation and UI quality controls.
Original product identity, private prompts, personal paths, credentials, and protected internal architecture removed.
Backend is locked to http://127.0.0.1:5151.
*/
(function(){
  const BASE = "http://127.0.0.1:5151";

  function removePanel(){
    const panel = document.getElementById("rtSidePanel");
    if(panel?.dataset?.tool === "remove") return panel;
    return document.querySelector('[data-tool="remove"]') || panel;
  }

  function readPrompt(){
    const panel = removePanel();
    return String(
      panel?.querySelector("textarea")?.value ||
      panel?.querySelector('input[type="text"], input:not([type])')?.value ||
      ""
    ).trim();
  }

  function readQuality(){
    const panel = removePanel();
    const select = panel?.querySelector(
      'select[name="model"], select[data-remove-quality], select#rtRemoveQuality'
    );
    if(select?.value) return String(select.value);

    const active = panel?.querySelector(
      '[data-remove-quality].active, [data-remove-quality][aria-pressed="true"]'
    );
    return String(active?.getAttribute("data-remove-quality") || "");
  }

  function readMaskExpansion(){
    const panel = removePanel();
    const input = panel?.querySelector(
      'input[name="mask_expansion"], input[data-mask-expansion], input#rtRemoveMaskExpansion'
    );
    const number = parseInt(String(input?.value ?? ""), 10);
    return Number.isFinite(number)
      ? String(Math.max(0, Math.min(50, number)))
      : "";
  }

  function maskCanvas(){
    return document.getElementById("rtEraseMaskCanvas2") ||
      document.getElementById("rtEraseMaskCanvas") ||
      document.getElementById("rtRemoveMaskCanvas") ||
      document.querySelector("canvas[data-remove-mask]") ||
      null;
  }

  function maskHasInk(canvas){
    try{
      const context = canvas.getContext("2d", {willReadFrequently:true});
      const width = canvas.width;
      const height = canvas.height;
      if(!context || !width || !height) return false;

      const pixels = context.getImageData(0, 0, width, height).data;
      const stepX = Math.max(1, Math.floor(width / 56));
      const stepY = Math.max(1, Math.floor(height / 56));

      for(let y = 0; y < height; y += stepY){
        for(let x = 0; x < width; x += stepX){
          const index = (y * width + x) * 4;
          if(
            pixels[index] > 200 &&
            pixels[index + 1] > 200 &&
            pixels[index + 2] > 200
          ){
            return true;
          }
        }
      }
      return false;
    }catch(_){
      return true;
    }
  }

  async function sourceToBlob(source){
    const response = await fetch(source, {cache:"no-store"});
    if(!response.ok) throw new Error(`Failed to read source (${response.status}).`);
    return await response.blob();
  }

  function outputUrl(json){
    const data = json?.data || json || {};
    return (
      data.image_url ||
      data.url ||
      data.images?.[0]?.url ||
      data.image?.url ||
      json?.image_url ||
      json?.url ||
      json?.images?.[0]?.url ||
      ""
    );
  }

  async function executeDeterministicRemove(){
    const image =
      (typeof window.getModalImageEl === "function" && window.getModalImageEl()) ||
      document.getElementById("imageModalImg") ||
      document.querySelector(".image-modal img");

    const source = String(image?.currentSrc || image?.src || "");
    if(!source) throw new Error("No active image is available.");

    const canvas = maskCanvas();
    if(!canvas) throw new Error("No mask canvas was found.");
    if(!maskHasInk(canvas)) throw new Error("Mask is empty.");

    const form = new FormData();
    const imageBlob = await sourceToBlob(source);
    form.append(
      "image",
      new File([imageBlob], "image.png", {type:imageBlob.type || "image/png"})
    );

    const maskDataUrl = canvas.toDataURL("image/png");
    const maskBlob = await sourceToBlob(maskDataUrl);
    form.append("mask", new File([maskBlob], "mask.png", {type:"image/png"}));

    const prompt = readPrompt();
    const quality = readQuality();
    const expansion = readMaskExpansion();

    if(prompt) form.append("prompt", prompt);
    if(quality) form.append("model", quality);
    if(expansion) form.append("mask_expansion", expansion);

    const response = await fetch(BASE + "/tool/remove", {
      method:"POST",
      body:form,
      mode:"cors",
      credentials:"omit",
      cache:"no-store"
    });

    const text = await response.text();
    let json = {};
    try{ json = JSON.parse(text); }catch(_){}

    if(!response.ok){
      throw new Error(json?.detail || json?.error || `HTTP ${response.status}`);
    }

    const url = outputUrl(json);
    if(!url) throw new Error("Removal returned no image URL.");
    return url;
  }

  window.asterDeterministicRemove = executeDeterministicRemove;
})();
