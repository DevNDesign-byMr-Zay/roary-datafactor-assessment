function renderCfg(){
    const box = $("#listCfg");
    box.innerHTML = `
      <div class="kv">
        <div class="k">Endpoints</div>
        <div class="mini" style="margin-bottom:10px">Set your local services. These default to Aster’s ports.</div>

        <label>Router base <span></span></label>
        <input id="cfgRouter" class="select" style="width:100%;border-radius:16px" value="${escapeAttr(state.cfg.routerBase)}" />

        <div style="height:10px"></div>
        <label>Image backend base <span></span></label>
        <input id="cfgImage" class="select" style="width:100%;border-radius:16px" value="${escapeAttr(state.cfg.imageBase)}" />

        <div style="height:10px"></div>
        <label>LLM base <span></span></label>
        <input id="cfgLLM" class="select" style="width:100%;border-radius:16px" value="${escapeAttr(state.cfg.llmBase)}" />

        <div style="height:10px"></div>
        <label>Master key <span></span></label>
        <input id="cfgKey" class="select" style="width:100%;border-radius:16px" value="${escapeAttr(state.cfg.llmKey)}" />

        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button class="btn primary" id="cfgSaveBtn">Save</button>
          <button class="btn" id="cfgTestBtn">Test</button>
        </div>

        <div class="mini" style="margin-top:10px;opacity:.9">
          Tip: For file:// testing, ensure your backends allow Origin <code>null</code> (CORS). If not, use <code>python -m http.server</code>.
        </div>
      </div>
    `;
    setTimeout(()=>{
      $("#cfgSaveBtn").onclick = ()=>{
        state.cfg.routerBase = $("#cfgRouter").value.trim().replace(/\/+$/,'');
        state.cfg.imageBase  = $("#cfgImage").value.trim().replace(/\/+$/,'');
        state.cfg.llmBase    = $("#cfgLLM").value.trim().replace(/\/+$/,'');
        state.cfg.llmKey     = $("#cfgKey").value.trim() || "sk-Aster-local";
        localStorage.setItem("Aster.routerBase", state.cfg.routerBase);
        localStorage.setItem("Aster.imageBackendBase", state.cfg.imageBase);
        localStorage.setItem("Aster.llmBase", state.cfg.llmBase);
        localStorage.setItem("Aster.masterKey", state.cfg.llmKey);
        $("#imgBaseShow").textContent = state.cfg.imageBase;
        $("#routerPill").textContent = (state.cfg.routerBase.split(":").pop()||"").replace("/","");
        $("#imgPill").textContent = (state.cfg.imageBase.split(":").pop()||"").replace("/","");
        $("#llmPill").textContent = (state.cfg.llmBase.split(":").pop()||"").replace("/v1","").replace("/","");
        toast("Saved config.", "ok");
      };
      $("#cfgTestBtn").onclick = async ()=>{
        const imgBase = $("#cfgImage").value.trim().replace(/\/+$/,'');
        const llmBase = $("#cfgLLM").value.trim().replace(/\/+$/,'');
        try{
          const r1 = await fetch(imgBase+"/healthz",{method:"GET"}).catch(()=>null);
          const ok1 = !!(r1 && r1.ok);
          const r2 = await fetch(llmBase.replace(/\/v1$/,'')+"/healthz",{method:"GET"}).catch(()=>null);
          const ok2 = !!(r2 && r2.ok);
          toast(`Test: Image=${ok1?"OK":"NO"} • LLM=${ok2?"OK":"NO"}`, ok1&&ok2?"ok":"bad");
        }catch(e){
          toast("Test failed (CORS or service down).", "bad");
        }
      };
    },0);
  }
