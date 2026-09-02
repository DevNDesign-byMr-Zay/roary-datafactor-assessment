/* Aster JavaScript v057
Authenticated historical derivative: active-thread synchronization and unload persistence guard.
Identity-specific names, credentials, personal paths, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterMemoryLifecycleGuardV1) return;
  window.__asterMemoryLifecycleGuardV1 = true;

  function syncActiveThread(){
    try{
      if(typeof window.asterGetActiveThreadId === "function"){
        window.asterCurrentThreadId = window.asterGetActiveThreadId() || null;
      }
      if(typeof window.asterGetActiveThread === "function"){
        window.asterCurrentThread = window.asterGetActiveThread() || null;
      }
    }catch(_){}
  }

  syncActiveThread();
  const intervalId = setInterval(syncActiveThread,700);

  window.addEventListener("beforeunload",()=>{
    try{
      if(typeof window.asterSaveThreads === "function") window.asterSaveThreads();
    }catch(_){}
    try{
      if(typeof window.asterMediaSave === "function") window.asterMediaSave();
    }catch(_){}
  },{capture:true});

  window.asterMemoryLifecycle = {
    sync:syncActiveThread,
    stop:()=>clearInterval(intervalId)
  };
})();
