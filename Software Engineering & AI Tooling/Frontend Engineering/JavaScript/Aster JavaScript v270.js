/* Aster JavaScript v270 — authenticated buyer-safe derivative: relight control-row factory. Host state/dependencies are intentionally external. */
function ctlRow(label,id,min,max,step,val,key){
      return `
        <div class="rt-ctl-row" style="display:flex;align-items:center;gap:12px;">
          <div style="flex:1;min-width:140px;">
            <div style="font-weight:800;opacity:.85;font-size:12px;margin-bottom:6px;">${label}</div>
            <input id="${id}" data-ic-key="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${val}" style="width:100%;"/>
          </div>
          <input id="${id}Val" type="text" value="${val}" style="width:76px;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:rgba(255,255,255,.92);padding:8px 10px;outline:none;"/>
        </div>
      `;
    }
