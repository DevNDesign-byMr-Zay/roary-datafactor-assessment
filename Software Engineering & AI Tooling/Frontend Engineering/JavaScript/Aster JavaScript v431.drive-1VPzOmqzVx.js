function appendMessage(role, text, persist=true){
  const div = document.createElement("div");
  div.className = "msg "+(role==="user"?"user":"assistant");
  div.innerHTML = renderMsgHTML(role, text);
  chatInner?.appendChild(div);
  const sc=chatInner?.parentElement; if(sc) sc.scrollTop=sc.scrollHeight;
  if(persist){
    const c=getActive(); if(!c) return div;
    c.messages.push({role, content:text});
    if((c.title||"").toLowerCase()==="new chat" && role==="user"){
      c.title = (text||"").slice(0,40).replace(/\s+/g," ").trim() || "New Chat";
    }
    persistConversations(); renderConversations();
  }
  return div;
}
