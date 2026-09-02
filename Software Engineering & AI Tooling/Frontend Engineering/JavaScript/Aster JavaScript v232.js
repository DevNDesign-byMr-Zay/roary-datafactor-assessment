/* Aster JavaScript v232 — authenticated buyer-safe derivative: lightbox download-dropdown bootstrap. Host state/dependencies are intentionally external. */
function ensureModalDropdown(){
    const btn=d.getElementById("imageModalDownload");
    if(!btn) return;

    let wrap=btn.closest("#imageModalDownloadWrap");
    if(!wrap){
      wrap=d.createElement("div");
      wrap.id="imageModalDownloadWrap";
      wrap.className="rt-modal-dl-wrap";
      btn.parentNode.insertBefore(wrap,btn);
      wrap.appendChild(btn);
    }

    let panel=wrap.querySelector(".rt-modal-dl-panel");
    if(panel) return;

    panel=d.createElement("div");
    panel.className="rt-modal-dl-panel";
    buildPanel(panel);
    wrap.appendChild(panel);

    let s=loadSettings();

    // hydrate inputs
    panel.querySelector("#rtDlFormat").value=s.format;
    panel.querySelector("#rtDlScalePick").value=String(s.scale||100);
    syncScaleLabels(panel);
    panel.querySelector("#rtDlQuality").value=String(s.quality);
    panel.querySelector("#rtDlTransparent").checked=!!s.transparent;
    panel.querySelector("#rtDlCompress").checked=!!s.compress;
    panel.querySelector("#rtDlSave").checked=isSaveOn();

    updatePanel(panel,s);

    // keep size labels synced to the active lightbox image
    const _rtDlImg=getModalSize().el;
    if(_rtDlImg && !_rtDlImg.__rtDlSyncBound){
      _rtDlImg.__rtDlSyncBound=true;
      _rtDlImg.addEventListener("load",()=>{ try{ syncScaleLabels(panel); updatePanel(panel,s); }catch(_){} });
      if(w.MutationObserver){
        const _rtDlMO=new MutationObserver(()=>{ try{ syncScaleLabels(panel); updatePanel(panel,s); }catch(_){} });
        _rtDlMO.observe(_rtDlImg,{attributes:true,attributeFilter:["src"]});
      }
    }

    const setAndMaybePersist=(next)=>{
      s={...s,...next};
      s.format=["png","jpg","webp",""].includes((s.format||"").toLowerCase())?(s.format||"png").toLowerCase():"png";
      
      let sc=parseInt(s.scale||100,10); if(sc===1||sc===2||sc===3||sc===4) sc=sc*100; if(![100,200,300,400].includes(sc)) sc=100; s.scale=sc;
      s.quality=clamp(parseInt(s.quality||95,10),40,100);
      s.transparent=!!s.transparent;
      s.compress=!!s.compress;
      if(isSaveOn()) persistSettings(s);
      updatePanel(panel,s);
    };

    panel.querySelector("#rtDlFormat").addEventListener("change",(e)=>setAndMaybePersist({format:e.target.value}));
    panel.querySelector("#rtDlScalePick").addEventListener("change",(e)=>setAndMaybePersist({scale:parseInt(e.target.value,10)}));    panel.querySelector("#rtDlQuality").addEventListener("input",(e)=>setAndMaybePersist({quality:parseInt(e.target.value,10)}));
    panel.querySelector("#rtDlTransparent").addEventListener("change",(e)=>setAndMaybePersist({transparent:!!e.target.checked}));
    panel.querySelector("#rtDlCompress").addEventListener("change",(e)=>setAndMaybePersist({compress:!!e.target.checked}));
    panel.querySelector("#rtDlSave").addEventListener("change",(e)=>{ setSaveOn(!!e.target.checked); if(!!e.target.checked) persistSettings(s); });
    panel.querySelector("#rtDlReset").addEventListener("click",(e)=>{ e.preventDefault(); e.stopPropagation(); s={...DEFAULTS}; 
      panel.querySelector("#rtDlFormat").value=s.format;
      panel.querySelector("#rtDlScalePick").value="100";      panel.querySelector("#rtDlQuality").value=String(s.quality);
      panel.querySelector("#rtDlTransparent").checked=!!s.transparent;
      panel.querySelector("#rtDlCompress").checked=!!s.compress;
      updatePanel(panel,s);
      if(isSaveOn()) persistSettings(s);
    });
    panel.querySelector("#rtDlDownload").addEventListener("click",(e)=>{ e.preventDefault(); e.stopPropagation(); const src=getModalURL(); if(!src) return; download(src,s); if(isSaveOn()) persistSettings(s); });

    // touch devices: click toggles open
    btn.addEventListener("click",(e)=>{
      if(w.matchMedia && w.matchMedia("(hover: none)").matches){
        e.preventDefault(); e.stopPropagation();
        wrap.classList.toggle("rt-open");
      }else{ e.preventDefault(); e.stopPropagation(); }
    });
    d.addEventListener("click",(e)=>{ if(!wrap.contains(e.target)) wrap.classList.remove("rt-open"); }, true);
  }
