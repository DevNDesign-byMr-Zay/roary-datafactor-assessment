/* Aster JavaScript v175
Authenticated historical derivative: conversation lifecycle manager with active-thread invariants.
Archive/delete operations always repair active selection and deletion never leaves an unusable empty store.
*/
(function(global){
  "use strict";
  if(global.AsterConversationLifecycle) return;

  function makeId(now=Date.now()){
    return "c_"+String(now);
  }

  function create(title="New Chat",now=Date.now()){
    return {
      id:makeId(now),
      title:String(title||"New Chat"),
      pinned:false,
      archived:false,
      messages:[]
    };
  }

  function cloneThreads(value){
    return Array.isArray(value)
      ? value.filter(Boolean).map(thread=>({...thread}))
      : [];
  }

  function chooseActive(threads,preferredId=""){
    const list=cloneThreads(threads);
    const preferred=list.find(item=>String(item.id)===String(preferredId) && !item.archived);
    if(preferred) return String(preferred.id);

    const visible=list.find(item=>!item.archived);
    if(visible) return String(visible.id);

    return list[0]?.id ? String(list[0].id) : "";
  }

  function apply(state,action={}){
    let threads=cloneThreads(state?.threads);
    let activeId=String(state?.activeId||"");
    const id=String(action.id||"");

    switch(String(action.type||"")){
      case "create":{
        const thread=create(action.title||"New Chat",action.now||Date.now());
        threads.unshift(thread);
        activeId=thread.id;
        break;
      }
      case "select":{
        if(threads.some(item=>String(item.id)===id && !item.archived)) activeId=id;
        break;
      }
      case "rename":{
        const thread=threads.find(item=>String(item.id)===id);
        if(thread) thread.title=String(action.title||"").trim()||"Untitled";
        break;
      }
      case "toggle-pin":{
        const thread=threads.find(item=>String(item.id)===id);
        if(thread) thread.pinned=!thread.pinned;
        break;
      }
      case "archive":{
        const thread=threads.find(item=>String(item.id)===id);
        if(thread) thread.archived=true;
        if(activeId===id) activeId=chooseActive(threads,"");
        break;
      }
      case "delete":{
        threads=threads.filter(item=>String(item.id)!==id);
        if(!threads.length){
          const replacement=create("New Chat",action.now||Date.now());
          threads=[replacement];
          activeId=replacement.id;
        }else if(activeId===id || !threads.some(item=>String(item.id)===activeId)){
          activeId=chooseActive(threads,"");
        }
        break;
      }
    }

    activeId=chooseActive(threads,activeId) || activeId;
    return {threads,activeId};
  }

  function visibleSorted(threads){
    return cloneThreads(threads)
      .filter(item=>!item.archived)
      .sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned));
  }

  global.AsterConversationLifecycle={
    makeId,
    create,
    chooseActive,
    apply,
    visibleSorted
  };
})(window);
