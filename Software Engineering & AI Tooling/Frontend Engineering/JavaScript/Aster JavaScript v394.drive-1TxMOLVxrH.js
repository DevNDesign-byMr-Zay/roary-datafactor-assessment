function createConversation(){
        const id="c_"+Date.now();
        const c={id,title:"New Chat",pinned:false,archived:false,messages:[]};
        conversationsArr.unshift(c);
        activeId=id;
        persistConversations();
        renderConversations();
        renderActiveConversation();
        composer?.focus();
      }
