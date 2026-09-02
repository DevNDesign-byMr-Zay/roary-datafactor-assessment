/* Aster JavaScript v229 — authenticated buyer-safe derivative: generated-image action-button recovery. Host state/dependencies are intentionally external. */
function ensureChatButtons(root){
    root.querySelectorAll(".generated-image-frame").forEach(f=>{
      let b=f.querySelector(".image-download-btn");
      const img=f.querySelector("img");
      if(!img) return;

      if(!b){
        b=d.createElement("button");
        b.type="button";
        b.className="image-download-btn";
        b.setAttribute("aria-label","Download");
        f.appendChild(b);
      }

      // icon sync
      if(!b.__rtIconSet){ b.innerHTML=MODAL_SVG; b.__rtIconSet=true; }

      if(!b.__rtBound){
        b.__rtBound=true;
        b.addEventListener("click",(e)=>{
          e.preventDefault(); e.stopPropagation();
          const src=img.src||getImgSrc(b);
          const s = isSaveOn() ? loadSettings() : {...DEFAULTS};
          download(src,s);
        });
      }
    });
  }
