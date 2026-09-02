/* Aster JavaScript v143
Authenticated historical derivative: stable erase/remove command alias with one execution path.
*/
(function(global){
  'use strict';
  function bind(run){if(typeof run!=='function')throw new TypeError('run must be a function');const execute=async options=>run(options||{});global.AsterRemove=execute;global.AsterErase=execute;return execute;}
  function bindButton(button,run,getOptions=()=>({})){if(!(button instanceof HTMLElement))return()=>{};const fn=async e=>{e.preventDefault();if(button.dataset.asterBusy==='1')return;button.dataset.asterBusy='1';try{await run(await getOptions())}finally{delete button.dataset.asterBusy}};button.addEventListener('click',fn);return()=>button.removeEventListener('click',fn);}
  global.AsterRemoveAlias={bind,bindButton};
})(window);
