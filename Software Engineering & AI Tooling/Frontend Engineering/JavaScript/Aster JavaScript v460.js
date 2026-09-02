const sync=()=>{
    try{
      if(typeof window.__asterMiniChatGetActiveThreadId==='function'){
        window.__asterMiniChatCurrentThreadId=window.__asterMiniChatGetActiveThreadId()||null;
      }
      if(typeof window.__asterMiniChatGetActiveThread==='function'){
        window.__asterMiniChatCurrentThread=window.__asterMiniChatGetActiveThread()||null;
      }
    }catch{}
  };
