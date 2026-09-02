/* Aster JavaScript v047
Authenticated historical derivative: message-action backfill observer for already-rendered and newly-added assistant messages.
Protected reasoning/dock behavior, original product identity, proprietary prompts, credentials, and personal paths removed.
*/
(function(){
  if(window.__asterMessageActionsBackfill) return;
  window.__asterMessageActionsBackfill = true;

  const chat = document.getElementById("chatInner") || document.getElementById("chat");
  if(!chat) return;

  function ensureActions(messageWrap){
    try{
      if(!messageWrap?.classList?.contains("assistant")) return;
      const next = messageWrap.nextElementSibling;
      if(next?.classList?.contains("msg-actions-row")) return;

      const renderer = window.asterRenderMessageActions;
      if(typeof renderer === "function"){
        renderer(chat, messageWrap, true);
      }
    }catch(_){}
  }

  document.querySelectorAll(".msg-wrap.assistant").forEach(ensureActions);

  const observer = new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes || []){
        if(!node || node.nodeType !== 1) continue;

        if(node.classList?.contains("msg-wrap") && node.classList.contains("assistant")){
          ensureActions(node);
          continue;
        }

        node.querySelectorAll?.(".msg-wrap.assistant").forEach(ensureActions);
      }
    }
  });

  observer.observe(chat, {childList:true, subtree:true});
  window.__asterMessageActionsObserver = observer;
})();
