function toast(msg){
        const id="__aster_toast__";
        let t=document.getElementById(id);
        if(!t){
          t=document.createElement("div");
          t.id=id;
          t.style.cssText="position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:#151515;border:1px solid rgba(255,255,255,.25);color:#fff;padding:8px 10px;border-radius:10px;z-index:99999;font-size:13px;opacity:0;transition:opacity .2s ease";
          document.body.appendChild(t);
        }
        t.textContent=msg;
        t.style.opacity="1";
        setTimeout(()=>t.style.opacity="0",2000);
      }
