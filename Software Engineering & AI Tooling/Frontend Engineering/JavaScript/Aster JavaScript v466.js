function isRelightOpen(){
    try{
      const p=getPanel();
      if(!p) return false;
      const tool=(p.getAttribute('data-tool')||p.dataset.tool||'').toLowerCase();
      return document.body.classList.contains('rt-orbtool-open') && (tool==='relight' || document.body.dataset.rtOrbtool==='relight');
    }catch(e){return false;}
  }
