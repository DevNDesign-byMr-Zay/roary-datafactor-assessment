/* Aster JavaScript v327 — authenticated buyer-safe derivative: feature bootstrap and event binding variant 2. Host state/dependencies are intentionally external. */
function init(){
    ensureModalDropdown();
    const chat=d.getElementById("miniChatMessages")||d.querySelector(".mini-chat-messages")||d.body;
    if(chat && w.MutationObserver){
      const obs=new MutationObserver(()=>ensureChatButtons(chat));
      obs.observe(chat,{childList:true,subtree:true});
      ensureChatButtons(chat);
    }
    if(w.MutationObserver){
      const obs2=new MutationObserver(()=>ensureModalDropdown());
      obs2.observe(d.body,{childList:true,subtree:true});
    }
  }
