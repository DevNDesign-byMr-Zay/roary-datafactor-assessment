/* Aster JavaScript v064
Authenticated historical derivative: stable model-selector drawer interaction.
Specific provider/model identifiers, credentials, product identity, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterModelDrawerV1) return;
  window.__asterModelDrawerV1 = true;

  const MODEL_KEY = "aster.model";
  const MODE_KEY = "aster.modelMode";
  const OPEN_CLASS = "aster-model-drawer-open";
  const CLOSING_CLASS = "aster-model-drawer-closing";
  const CLOSE_DELAY_MS = 260;

  function bindModelDrawer(options={}){
    const wrap =
      options.wrap ||
      document.querySelector("[data-aster-model-wrap]") ||
      document.getElementById("asterModelWrap");
    const toggle =
      options.toggle ||
      wrap?.querySelector("[data-aster-model-toggle]") ||
      document.getElementById("asterModelToggle");
    const drawer =
      options.drawer ||
      wrap?.querySelector("[data-aster-model-drawer]") ||
      document.getElementById("asterModelDrawer");

    if(!wrap || !toggle || !drawer) return null;
    if(wrap.dataset.asterModelBound === "1") return wrap.__asterModelController || null;
    wrap.dataset.asterModelBound = "1";

    let closeTimer = null;

    const clearClose = ()=>{
      if(closeTimer){
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    };

    const optionsList = ()=>{
      return Array.from(
        drawer.querySelectorAll("[data-aster-model]")
      );
    };

    const currentModel = ()=>{
      try{ return localStorage.getItem(MODEL_KEY) || ""; }
      catch(_){ return ""; }
    };

    const syncSelected = ()=>{
      const active = currentModel();
      let matched = false;

      for(const button of optionsList()){
        const value = button.getAttribute("data-aster-model") || "";
        const selected = !!active && value === active;
        button.classList.toggle("is-selected",selected);
        button.setAttribute("aria-selected",selected ? "true" : "false");
        if(selected) matched = true;
      }

      if(!matched){
        let mode = "";
        try{ mode = String(localStorage.getItem(MODE_KEY) || "").toLowerCase(); }
        catch(_){}

        const fallback =
          drawer.querySelector(`[data-aster-model-slot="${mode || "instant"}"]`) ||
          drawer.querySelector("[data-aster-model]");

        if(fallback){
          fallback.classList.add("is-selected");
          fallback.setAttribute("aria-selected","true");
        }
      }
    };

    const placeDrawer = ()=>{
      if(!drawer.classList.contains(OPEN_CLASS)) return;

      const toggleRect = toggle.getBoundingClientRect();
      const previousVisibility = drawer.style.visibility;
      drawer.style.visibility = "hidden";
      drawer.style.position = "fixed";
      drawer.style.right = "auto";
      drawer.style.bottom = "auto";

      const drawerRect = drawer.getBoundingClientRect();
      const width = drawerRect.width || 220;
      const height = drawerRect.height || 180;

      let left = toggleRect.right - width;
      left = Math.max(8,Math.min(left,window.innerWidth - width - 8));

      let top = toggleRect.top - height - 10;
      if(top < 8) top = toggleRect.bottom + 10;
      top = Math.max(8,Math.min(top,window.innerHeight - height - 8));

      drawer.style.left = left + "px";
      drawer.style.top = top + "px";
      drawer.style.visibility = previousVisibility || "";
    };

    const setAria = open=>{
      toggle.setAttribute("aria-expanded",open ? "true" : "false");
      drawer.setAttribute("aria-hidden",open ? "false" : "true");
    };

    const open = ()=>{
      clearClose();
      drawer.classList.remove(CLOSING_CLASS);
      drawer.classList.add(OPEN_CLASS);
      setAria(true);
      syncSelected();
      requestAnimationFrame(placeDrawer);
    };

    const close = ()=>{
      clearClose();
      drawer.classList.add(CLOSING_CLASS);
      drawer.classList.remove(OPEN_CLASS);
      setAria(false);

      setTimeout(()=>{
        if(drawer.classList.contains(OPEN_CLASS)) return;
        drawer.classList.remove(CLOSING_CLASS);
        drawer.style.position = "";
        drawer.style.left = "";
        drawer.style.top = "";
        drawer.style.right = "";
        drawer.style.bottom = "";
      },220);
    };

    const isHovered = ()=>{
      try{
        return wrap.matches(":hover") ||
          toggle.matches(":hover") ||
          drawer.matches(":hover");
      }catch(_){
        return false;
      }
    };

    const scheduleClose = ()=>{
      clearClose();
      closeTimer = setTimeout(()=>{
        if(!isHovered()) close();
      },CLOSE_DELAY_MS);
    };

    for(const target of [wrap,toggle,drawer]){
      target.addEventListener("pointerenter",open);
      target.addEventListener("pointerleave",scheduleClose);
      target.addEventListener("focusin",open);
      target.addEventListener("focusout",scheduleClose);
    }

    toggle.addEventListener("click",event=>{
      event.preventDefault();
      if(drawer.classList.contains(OPEN_CLASS)) close();
      else open();
    });

    drawer.addEventListener("click",async event=>{
      const button = event.target.closest?.("[data-aster-model]");
      if(!button) return;
      if(
        button.disabled ||
        button.classList.contains("is-disabled") ||
        button.getAttribute("aria-disabled") === "true"
      ) return;

      const model = button.getAttribute("data-aster-model") || "";
      if(!model) return;

      const slot = String(button.getAttribute("data-aster-model-slot") || "").toLowerCase();

      try{
        localStorage.setItem(MODEL_KEY,model);
        if(slot) localStorage.setItem(MODE_KEY,slot);
      }catch(_){}

      try{
        if(typeof options.onSelect === "function"){
          await options.onSelect(model,button);
        }else if(typeof window.asterApplyModel === "function"){
          await window.asterApplyModel(model,button);
        }
      }catch(_){}

      syncSelected();
      close();

      document.dispatchEvent(new CustomEvent("aster:model-change",{
        detail:{model,slot}
      }));
    });

    document.addEventListener("pointerdown",event=>{
      if(!drawer.classList.contains(OPEN_CLASS)) return;
      const target = event.target;
      if(target && (wrap.contains(target) || drawer.contains(target))) return;
      close();
    },true);

    window.addEventListener("resize",()=>{
      if(drawer.classList.contains(OPEN_CLASS)) placeDrawer();
    },{passive:true});

    window.addEventListener("scroll",()=>{
      if(drawer.classList.contains(OPEN_CLASS)) placeDrawer();
    },true);

    syncSelected();

    const controller = {open,close,syncSelected,placeDrawer};
    wrap.__asterModelController = controller;
    return controller;
  }

  window.asterModelDrawer = {bind:bindModelDrawer};
})();
