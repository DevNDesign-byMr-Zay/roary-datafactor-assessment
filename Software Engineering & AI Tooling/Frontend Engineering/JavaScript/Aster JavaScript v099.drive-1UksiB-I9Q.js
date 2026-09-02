export function bindAsterExecutionProgress({button, tracker, tool, task}){
  if(!button || !tracker || typeof task!=='function') throw new TypeError('button, tracker, and task are required');
  return async function run(){
    button.disabled=true; button.dataset.asterRunning='1';
    tracker.start(tool,(pct)=>{ button.style.setProperty('--aster-progress',`${pct}%`); button.setAttribute('aria-valuenow',String(Math.round(pct))); });
    try{ return await task(); }
    finally{ tracker.end(tool,(pct)=>{ button.style.setProperty('--aster-progress',`${pct}%`); button.setAttribute('aria-valuenow','100'); }); delete button.dataset.asterRunning; button.disabled=false; }
  };
}
