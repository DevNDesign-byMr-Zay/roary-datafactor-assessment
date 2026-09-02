/* Aster JavaScript v053
Authenticated historical derivative: user-prompt copy/edit actions with inline edit state.
Original product identity, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
*/
(function(){
  "use strict";
  if(window.__asterUserPromptActionsV1) return;
  window.__asterUserPromptActionsV1 = true;

  const states = new WeakMap();
  const root = ()=>document.getElementById("chatInner") || document.getElementById("chat") || document.body;

  function messageElement(wrap){
    return wrap?.querySelector(".msg.user .msg-text, .msg.user, .msg .msg-text, .msg");
  }

  function messageText(wrap){
    return String(messageElement(wrap)?.innerText || messageElement(wrap)?.textContent || "").trim();
  }

  async function copyText(text){
    const value = String(text || "").trim();
    if(!value) return false;
    try{
      await navigator.clipboard.writeText(value);
      return true;
    }catch(_){
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      let ok = false;
      try{ ok = document.execCommand("copy"); }catch(__){}
      textarea.remove();
      return ok;
    }
  }

  function finishEdit(wrap,save){
    const state = states.get(wrap);
    if(!state) return;

    if(save){
      const next = state.editor.value.trim();
      if(next){
        state.target.textContent = next;
        wrap.dispatchEvent(new CustomEvent("aster:user-prompt-edited",{
          bubbles:true,
          detail:{text:next,previousText:state.original}
        }));
      }
    }

    state.editor.remove();
    state.target.hidden = false;
    state.actions.hidden = false;
    states.delete(wrap);
  }

  function beginEdit(wrap,actions){
    if(states.has(wrap)) return;
    const target = messageElement(wrap);
    if(!target) return;

    const original = messageText(wrap);
    const editor = document.createElement("textarea");
    editor.className = "aster-user-inline-editor";
    editor.value = original;
    editor.rows = Math.max(2,Math.min(10,original.split("\n").length + 1));

    const controls = document.createElement("div");
    controls.className = "aster-user-edit-controls";

    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "Save";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "Cancel";

    controls.append(save,cancel);
    editor.insertAdjacentElement("afterend",controls);

    target.hidden = true;
    actions.hidden = true;
    target.insertAdjacentElement("afterend",editor);

    states.set(wrap,{target,editor,actions,controls,original});

    save.addEventListener("click",()=>{ controls.remove(); finishEdit(wrap,true); });
    cancel.addEventListener("click",()=>{ controls.remove(); finishEdit(wrap,false); });

    editor.addEventListener("keydown",event=>{
      if(event.key === "Escape"){
        event.preventDefault();
        controls.remove();
        finishEdit(wrap,false);
      }
      if((event.metaKey || event.ctrlKey) && event.key === "Enter"){
        event.preventDefault();
        controls.remove();
        finishEdit(wrap,true);
      }
    });

    editor.focus();
    editor.setSelectionRange(editor.value.length,editor.value.length);
  }

  function ensureActions(wrap){
    if(!wrap?.classList?.contains("user")) return;
    if(wrap.nextElementSibling?.classList?.contains("user-prompt-actions-row")) return;

    const actions = document.createElement("div");
    actions.className = "user-prompt-actions-row";
    actions.dataset.ready = "1";

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "act-btn";
    copy.dataset.act = "copy";
    copy.textContent = "Copy";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "act-btn";
    edit.dataset.act = "edit";
    edit.textContent = "Edit";

    copy.addEventListener("click",()=>copyText(messageText(wrap)));
    edit.addEventListener("click",()=>beginEdit(wrap,actions));

    actions.append(copy,edit);
    wrap.parentNode?.insertBefore(actions,wrap.nextSibling);
  }

  root().querySelectorAll(".msg-wrap.user").forEach(ensureActions);

  const observer = new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes || []){
        if(node?.nodeType !== 1) continue;
        if(node.matches?.(".msg-wrap.user")) ensureActions(node);
        node.querySelectorAll?.(".msg-wrap.user").forEach(ensureActions);
      }
    }
  });
  observer.observe(root(),{childList:true,subtree:true});
})();
