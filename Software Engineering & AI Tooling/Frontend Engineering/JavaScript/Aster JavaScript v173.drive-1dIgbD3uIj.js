/* Aster JavaScript v173
Authenticated historical derivative: diff-aware persisted toggle synchronization.
Only mutates button state when stored and rendered values diverge, preventing needless re-render/focus/hover churn.
*/
(function(global){
  "use strict";
  if(global.AsterPersistedToggleSync) return;

  function readSet(storageKey,storage=localStorage){
    try{
      const raw=storage.getItem(storageKey);
      const parsed=JSON.parse(raw||"[]");
      return new Set(Array.isArray(parsed)?parsed.map(String):[]);
    }catch(_){
      return new Set();
    }
  }

  function currentState(button){
    if(!(button instanceof HTMLElement)) return false;
    return button.dataset.active==="1" ||
      button.getAttribute("aria-pressed")==="true" ||
      button.classList.contains("active") ||
      button.classList.contains("is-on");
  }

  function applyState(button,on,options={}){
    if(!(button instanceof HTMLElement)) return false;
    const desired=!!on;
    if(currentState(button)===desired) return false;

    button.dataset.active=desired?"1":"0";
    button.setAttribute("aria-pressed",desired?"true":"false");
    button.classList.toggle(options.activeClass||"active",desired);

    if(typeof options.onChange==="function"){
      try{options.onChange(button,desired);}catch(_){}
    }
    return true;
  }

  function sync(definitions,storageKey,options={}){
    const stored=readSet(storageKey,options.storage||localStorage);
    let changes=0;

    for(const def of Array.from(definitions||[])){
      const button=
        def?.element ||
        (def?.id ? document.getElementById(def.id) : null);

      if(!(button instanceof HTMLElement)) continue;
      const desired=stored.has(String(def.key||def.id||""));
      if(applyState(button,desired,options)) changes++;
    }

    return changes;
  }

  function watch(definitions,storageKey,options={}){
    const interval=Math.max(100,Number(options.intervalMs)||500);
    const tick=()=>sync(definitions,storageKey,options);
    tick();
    const timer=setInterval(tick,interval);

    return {
      sync:tick,
      stop(){clearInterval(timer);}
    };
  }

  global.AsterPersistedToggleSync={
    readSet,
    currentState,
    applyState,
    sync,
    watch
  };
})(window);
