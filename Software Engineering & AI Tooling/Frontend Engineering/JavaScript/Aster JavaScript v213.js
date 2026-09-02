/* Aster JavaScript v213 — authenticated buyer-safe derivative: local endpoint configuration renderer with escaped values. Host state/dependencies are intentionally external. */
function renderCfg(){
    const box = $("#listCfg");
    box.innerHTML = `
      <div class="kv">
        <div class="k">Endpoints</div>
        <div class="mini" style="margin-bottom:10px">Set your local services. Defaults match ASTER ports.</div>

        <label>Image backend base <span></span></label>
        <input id="cfgImage" class="select" style="width:100%;border-radius:16px" value="${escapeAttr(state.cfg.imageBase)}" />

        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button class="btn primary small" id="cfgSaveBtn">Save</button>
        </div>
      </div>
    `;
    setTimeout(()=>{
      $("#cfgSaveBtn").onclick = ()=>{
        state.cfg.imageBase  = $("#cfgImage").value.trim().replace(/\/+$/,'');
        localStorage.setItem("aster.imageBackendBase", state.cfg.imageBase);
        $("#imgBaseShow").textContent = state.cfg.imageBase;
        toast("Saved config.", "ok");
      };
    },0);
  }
