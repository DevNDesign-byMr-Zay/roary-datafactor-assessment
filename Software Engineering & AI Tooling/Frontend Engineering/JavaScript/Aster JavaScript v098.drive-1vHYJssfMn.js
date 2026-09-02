/* Aster JavaScript v098
Authenticated historical derivative: minimum-visible completion state for execution progress.
*/
(function(){
  "use strict";
  function create(options={}){
    const minimum=Math.max(0,Number(options.minimumVisibleMs)||650); let started=0;
    return {
      begin(){started=performance?.now?.()??Date.now();},
      async finish(callback){const now=performance?.now?.()??Date.now(); const wait=Math.max(0,minimum-(now-started)); if(wait) await new Promise(r=>setTimeout(r,wait)); if(typeof callback==='function') return callback();}
    };
  }
  window.createAsterMinimumVisibleProgress=create;
})();
