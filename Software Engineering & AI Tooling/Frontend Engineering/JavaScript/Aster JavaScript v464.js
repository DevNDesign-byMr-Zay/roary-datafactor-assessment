const bindRange=(id, parseFn=(x)=>parseFloat(x))=>{
      const r=document.getElementById(id);
      const v=document.getElementById(id+'Val');
      if(!r||!v) return;
      const sync=()=>{ v.value=String(r.value); store(); };
      r.addEventListener('input', sync);
      v.addEventListener('change', ()=>{ const n=parseFn(v.value); if(!Number.isFinite(n)) return; r.value=String(n); sync(); });
    };
