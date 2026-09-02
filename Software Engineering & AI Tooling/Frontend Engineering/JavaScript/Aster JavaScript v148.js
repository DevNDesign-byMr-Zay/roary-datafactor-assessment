/* Aster JavaScript v148
Authenticated historical derivative: late-hydration binding recovery for a remove/erase command.
*/
(function(global){
  'use strict';
  function install(resolveCore,options={}){
    if(typeof resolveCore!=='function') throw new TypeError('resolveCore must be a function');
    const interval=Math.max(25,Number(options.intervalMs)||250),maxTries=Math.max(1,Number(options.maxTries)||20);
    let tries=0,timer=0,stopped=false;
    function bind(){
      if(stopped)return false;
      const core=resolveCore(); if(typeof core!=='function')return false;
      const command=async prompt=>core(String(prompt||'').trim(),{});
      global.AsterRemoveCommand=command; global.AsterEraseCommand=command; return true;
    }
    if(!bind()) timer=setInterval(()=>{tries++;if(bind()||tries>=maxTries){clearInterval(timer);timer=0;}},interval);
    return()=>{stopped=true;if(timer)clearInterval(timer);};
  }
  global.AsterLateToolBinding={install};
})(window);
