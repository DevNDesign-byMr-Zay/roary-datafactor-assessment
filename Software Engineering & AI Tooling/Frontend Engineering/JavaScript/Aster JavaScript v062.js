/* Aster JavaScript v062
Authenticated historical derivative: render-quality preset controller.
Product identity, model credentials, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterRenderQualityPresetsV1) return;
  window.__asterRenderQualityPresetsV1 = true;

  const PRESETS = Object.freeze([
    {id:"fast", label:"Fast", steps:14},
    {id:"balanced", label:"Balanced", steps:22},
    {id:"cinematic", label:"Cinematic", steps:34}
  ]);

  const STORAGE_KEY = "aster.renderQuality";

  function clamp(value,min,max){
    return Math.max(min,Math.min(max,value));
  }

  function stepsToPreset(steps){
    const value = Number(steps) || 22;
    if(value <= 17) return "fast";
    if(value <= 27) return "balanced";
    return "cinematic";
  }

  function getStoredPreset(){
    try{
      return localStorage.getItem(STORAGE_KEY) || "";
    }catch(_){
      return "";
    }
  }

  function setStoredPreset(value){
    try{ localStorage.setItem(STORAGE_KEY,value); }catch(_){}
  }

  function applyPreset(presetId,root=document){
    const preset = PRESETS.find(item=>item.id===presetId) || PRESETS[1];
    const stepsInput =
      root.querySelector("[data-aster-render-steps]") ||
      root.querySelector("#asterRenderSteps");

    if(stepsInput){
      const min = Number(stepsInput.min || 8);
      const max = Number(stepsInput.max || 50);
      stepsInput.value = String(clamp(preset.steps,min,max));
      try{ stepsInput.dispatchEvent(new Event("input",{bubbles:true})); }catch(_){}
      try{ stepsInput.dispatchEvent(new Event("change",{bubbles:true})); }catch(_){}
    }

    setStoredPreset(preset.id);
    window.__asterRenderQuality = preset.id;
    window.__asterRenderSteps = preset.steps;

    const meta = root.querySelector("[data-aster-quality-meta]");
    if(meta) meta.textContent = `steps ${preset.steps}`;

    root.querySelectorAll("[data-aster-quality-preset]").forEach(button=>{
      button.classList.toggle(
        "is-active",
        button.getAttribute("data-aster-quality-preset") === preset.id
      );
    });

    document.dispatchEvent(new CustomEvent("aster:render-quality-change",{
      detail:{...preset}
    }));

    return preset;
  }

  function ensureUI(options={}){
    const root =
      options.root ||
      document.querySelector("[data-aster-render-panel]") ||
      document.getElementById("asterRenderPanel");

    if(!root) return null;

    const stepsInput =
      root.querySelector("[data-aster-render-steps]") ||
      root.querySelector("#asterRenderSteps");

    const rawControl = stepsInput?.closest("[data-aster-step-control]");
    if(rawControl && options.hideRawSteps !== false){
      rawControl.hidden = true;
    }

    let wrap = root.querySelector("[data-aster-quality]");
    if(!wrap){
      wrap = document.createElement("div");
      wrap.className = "aster-quality-control";
      wrap.setAttribute("data-aster-quality","1");

      const label = document.createElement("label");
      label.className = "aster-quality-label";
      label.textContent = options.label || "Render Quality";
      wrap.appendChild(label);

      const row = document.createElement("div");
      row.className = "aster-quality-row";

      const buttons = document.createElement("div");
      buttons.className = "aster-quality-buttons";

      for(const preset of PRESETS){
        const button = document.createElement("button");
        button.type = "button";
        button.className = "aster-quality-button";
        button.setAttribute("data-aster-quality-preset",preset.id);
        button.textContent = preset.label;
        button.addEventListener("click",()=>applyPreset(preset.id,root));
        buttons.appendChild(button);
      }

      const meta = document.createElement("div");
      meta.className = "aster-quality-meta";
      meta.setAttribute("data-aster-quality-meta","1");

      row.append(buttons,meta);
      wrap.appendChild(row);

      const mount =
        root.querySelector("[data-aster-render-controls]") ||
        root;
      mount.appendChild(wrap);
    }

    const initial =
      getStoredPreset() ||
      stepsToPreset(stepsInput?.value || 22);

    applyPreset(initial,root);
    return wrap;
  }

  window.asterRenderQuality = {
    presets:PRESETS,
    stepsToPreset,
    applyPreset,
    ensureUI
  };
})();
