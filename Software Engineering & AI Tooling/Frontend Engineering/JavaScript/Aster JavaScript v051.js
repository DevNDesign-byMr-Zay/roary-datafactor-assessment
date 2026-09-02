/* Aster JavaScript v051
Authenticated historical derivative: stability-clean incremental code enhancement and code-scroll isolation.
Original product identity, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
*/
(function(){
  "use strict";
  if(window.__asterStableCodeEngineV1) return;
  window.__asterStableCodeEngineV1 = true;

  const root = document.getElementById("chatInner") || document.getElementById("chat");
  if(!root) return;

  const MAX_CODE_CHARS = 160000;

  function preserveScroll(fn){
    const beforeTop = root.scrollTop;
    const beforeHeight = root.scrollHeight;
    const atBottom = beforeHeight - (beforeTop + root.clientHeight) < 6;

    const result = fn();

    requestAnimationFrame(()=>{
      if(atBottom){
        root.scrollTop = root.scrollHeight;
      }else{
        root.scrollTop = beforeTop + (root.scrollHeight - beforeHeight);
      }
    });
    return result;
  }

  function enhance(pre){
    if(!pre || !(pre instanceof Element)) return;
    if(pre.closest(".aster-codeframe")) return;

    const code = pre.querySelector("code") || pre;
    if((code.textContent || "").length > MAX_CODE_CHARS) return;

    if(typeof window.asterEnhanceCodePre === "function"){
      preserveScroll(()=>window.asterEnhanceCodePre(pre));
    }
  }

  function scanAdded(node){
    if(!node || node.nodeType !== 1) return;
    if(node.matches?.("pre")) enhance(node);
    node.querySelectorAll?.("pre").forEach(enhance);
  }

  root.querySelectorAll("pre").forEach(enhance);

  const observer = new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes || []) scanAdded(node);
    }
  });

  // childList only: avoids characterData/timestamp/animation churn.
  observer.observe(root,{childList:true,subtree:true});

  document.addEventListener("wheel",event=>{
    const pre = event.target?.closest?.(".aster-codepre");
    if(!pre) return;

    const max = pre.scrollHeight - pre.clientHeight;
    if(max <= 2) return;

    const dy = event.deltaY || 0;
    const canMoveDown = dy > 0 && pre.scrollTop < max - 1;
    const canMoveUp = dy < 0 && pre.scrollTop > 1;

    if(canMoveDown || canMoveUp) event.stopPropagation();
  },{capture:true,passive:true});

  window.__asterStableCodeObserver = observer;
})();
