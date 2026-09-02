const setPct=p=>{
    p=clamp(p);
    try{pctEl&&(pctEl.textContent=p+"%")}catch(e){}
    try{fillEl&&(fillEl.style.width=p+"%")}catch(e){}
  };
