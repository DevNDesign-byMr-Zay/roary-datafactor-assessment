/* Aster JavaScript v172
Authenticated historical derivative: conversation lifecycle state reducer.
Supports rename, pin, archive and delete while preserving a valid active conversation.
*/
(function(global){
  "use strict";
  if(global.AsterConversationLifecycle) return;

  function normalizeConversation(value){
    return {
      id:String(value?.id||""),
      title:String(value?.title||"New Chat").trim()||"New Chat",
      pinned:!!value?.pinned,
      archived:!!value?.archived,
      messages:Array.isArray(value?.messages)?value.messages:[]
    };
  }

  function nextActive(conversations,currentId){
    const list=conversations.map(normalizeConversation);
    const current=list.find(item=>item.id===currentId && !item.archived);
    if(current) return current.id;

    const visible=list.find(item=>!item.archived);
    if(visible) return visible.id;

    return list[0]?.id||null;
  }

  function apply(state,action){
    const conversations=(Array.isArray(state?.conversations)?state.conversations:[])
      .map(normalizeConversation);
    let activeId=String(state?.activeId||"")||null;

    const id=String(action?.id||"");
    const index=conversations.findIndex(item=>item.id===id);

    switch(String(action?.type||"")){
      case "rename":{
        if(index<0) break;
        conversations[index].title=String(action?.title||"").trim()||"Untitled";
        break;
      }

      case "toggle-pin":{
        if(index<0) break;
        conversations[index].pinned=!conversations[index].pinned;
        break;
      }

      case "archive":{
        if(index<0) break;
        conversations[index].archived=true;
        activeId=nextActive(conversations,activeId);
        break;
      }

      case "delete":{
        if(index<0) break;
        conversations.splice(index,1);
        activeId=nextActive(conversations,activeId);
        break;
      }

      case "activate":{
        if(index>=0 && !conversations[index].archived){
          activeId=conversations[index].id;
        }
        break;
      }
    }

    return {conversations,activeId};
  }

  function sortedVisible(state){
    return (Array.isArray(state?.conversations)?state.conversations:[])
      .map(normalizeConversation)
      .filter(item=>!item.archived)
      .sort((a,b)=>Number(b.pinned)-Number(a.pinned));
  }

  global.AsterConversationLifecycle={
    normalizeConversation,
    nextActive,
    apply,
    sortedVisible
  };
})(window);
