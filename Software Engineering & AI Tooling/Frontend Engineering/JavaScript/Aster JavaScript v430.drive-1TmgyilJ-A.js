function asterToast(msg){
  try{ if(typeof toast === 'function') return toast(msg); }catch{}
  let t = document.getElementById('__aster_toast__');
  if(!t){
    t = document.createElement('div');
    t.id = '__aster_toast__';
    t.style.cssText = 'position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:#151515;border:1px solid rgba(255,255,255,.25);color:#fff;padding:8px 10px;border-radius:10px;z-index:99999;font-size:13px;opacity:0;transition:opacity .2s ease';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(()=> t.style.opacity = '0', 1800);
}
