/* Aster JavaScript v048
Authenticated historical derivative: self-contained assistant message action toolbar fallback.
Protected reasoning/dock behavior, original product identity, proprietary prompts, credentials, and personal paths removed.
*/
(function(){
  if(window.__asterMessageActionsFallback) return;
  window.__asterMessageActionsFallback = true;

  const chat = document.getElementById("chatInner") || document.getElementById("chat");
  if(!chat) return;

  const actionButton = (action, label)=>
    `<button class="act-btn" type="button" data-act="${action}" title="${label}" aria-label="${label}">${label}</button>`;

  function buildRow(){
    const row = document.createElement("div");
    row.className = "msg-actions-row ready";
    row.innerHTML = `
      <div class="act-left">
        ${actionButton("copy","Copy")}
        ${actionButton("share","Share")}
        ${actionButton("like","Like")}
        ${actionButton("dislike","Dislike")}
        ${actionButton("regen","Regenerate")}
        <span class="act-more-wrap">
          ${actionButton("more","More")}
          <div class="act-drawer" role="menu" aria-label="More actions">
            <button class="act-item" type="button" data-item="branch" role="menuitem">Branch in new chat</button>
            <button class="act-item" type="button" data-item="doublecheck" role="menuitem">Cross-reference / double-check</button>
            <button class="act-item" type="button" data-item="export" role="menuitem">Export response (.txt)</button>
            <div class="act-divider"></div>
            <button class="act-item" type="button" data-item="report" role="menuitem">Report an issue</button>
          </div>
        </span>
      </div>
      <div class="act-right" aria-label="References"></div>`;
    return row;
  }

  function messageText(wrap){
    return String(
      wrap?.querySelector(".msg, .message, [data-message-content]")?.innerText ||
      wrap?.innerText ||
      ""
    ).trim();
  }

  function ensureActions(wrap){
    if(!wrap?.classList?.contains("assistant")) return;
    if(wrap.nextElementSibling?.classList?.contains("msg-actions-row")) return;

    const row = buildRow();
    chat.insertBefore(row, wrap.nextSibling);

    row.addEventListener("click", async event=>{
      const actionTarget = event.target.closest("[data-act]");
      const itemTarget = event.target.closest("[data-item]");

      if(actionTarget){
        const action = actionTarget.dataset.act;

        if(action === "more"){
          event.preventDefault();
          row.querySelector(".act-more-wrap")?.classList.toggle("open");
          return;
        }

        if(action === "copy"){
          try{ await navigator.clipboard.writeText(messageText(wrap)); }catch(_){}
        }else if(action === "share" && navigator.share){
          try{ await navigator.share({text:messageText(wrap)}); }catch(_){}
        }

        row.dispatchEvent(new CustomEvent("aster:message-action", {
          bubbles:true,
          detail:{action, message:wrap}
        }));
      }

      if(itemTarget){
        row.querySelector(".act-more-wrap")?.classList.remove("open");
        row.dispatchEvent(new CustomEvent("aster:message-more-action", {
          bubbles:true,
          detail:{action:itemTarget.dataset.item, message:wrap}
        }));
      }
    }, true);
  }

  document.querySelectorAll(".msg-wrap.assistant").forEach(ensureActions);

  const observer = new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes || []){
        if(!node || node.nodeType !== 1) continue;
        if(node.classList?.contains("msg-wrap") && node.classList.contains("assistant")){
          ensureActions(node);
        }else{
          node.querySelectorAll?.(".msg-wrap.assistant").forEach(ensureActions);
        }
      }
    }
  });

  observer.observe(chat, {childList:true, subtree:true});
})();
