/* Aster JavaScript v301 — authenticated buyer-safe derivative: deferred media-library recovery scheduling. Host state/dependencies are intentionally external. */
function __schedule(){
    var run = function(){ asterRecoverMediaFromThreads_v167().catch(function(){}); };
    if(document.readyState==='complete' || document.readyState==='interactive') setTimeout(run,140);
    else window.addEventListener('DOMContentLoaded', function(){ setTimeout(run,140); }, {once:true});
    window.addEventListener('focus', function(){ setTimeout(run,60); }, {passive:true});
  }
