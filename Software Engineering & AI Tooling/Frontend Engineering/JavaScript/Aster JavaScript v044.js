/* Aster JavaScript v044
Authenticated historical derivative: stale abort-controller guard for object-removal UI execution.
Original product identity, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
*/
(function(){
  const previousRunner = window.asterRunRemoveFromUI;
  if(typeof previousRunner !== "function") return;

  window.asterRunRemoveFromUI = async function(){
    try{
      const controller = window.__asterToolAbort;
      if(controller?.signal?.aborted){
        window.__asterToolAbort = null;
      }
    }catch(_){}

    return await previousRunner.apply(this, arguments);
  };
})();
