function ensureRelightEngineControls(){
    const panel=getPanel();
    if(!panel) return;
    const root=panel.querySelector('.tool-control-panel')||panel.querySelector('.rt-sidepanel-inner')||panel;
    if(!root) return;
    const intensityEl=root.querySelector('#asterRelightIntensity');
    if(!intensityEl) return;

    if(document.getElementById('asterRelightRelightEngineControls')) return;

    const wrap=document.createElement('div');
    wrap.id='asterRelightRelightEngineControls';
    wrap.style.marginTop='10px';
    wrap.style.paddingTop='8px';
    wrap.style.borderTop='1px solid rgba(255,255,255,.08)';

    wrap.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin:6px 0 10px;">
        <div style="font-weight:700;opacity:.92;">IC-Light Controls</div>
        <button type="button" id="asterRelightRelightEngineReset" class="rt-mini-btn" style="background:transparent;border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.9);border-radius:999px;padding:6px 10px;font-weight:700;font-size:12px;cursor:pointer;">Reset</button>
      </div>

      <div class="rt-ctl-grid" style="display:grid;grid-template-columns:1fr;gap:10px;">
        ${ctlRow('Num Images','asterRelightNumImages',1,3,1,1)}
        ${ctlRow('CFG','asterRelightCfg',0.5,3.0,0.1,1.0)}
        ${ctlRow('Lowres Denoise','asterRelightLowres',0.50,0.98,0.01,0.92)}
        ${ctlRow('Highres Denoise','asterRelightHighres',0.50,0.98,0.01,0.90)}
        ${ctlRow('HR Downscale','asterRelightDownscale',0.25,1.00,0.01,0.50)}
        ${ctlRow('Guidance Scale','asterRelightGuidance',1.0,12.0,0.1,6.5)}
        ${ctlRow('Inference Steps','asterRelightSteps',10,60,1,28)}

        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <label style="font-weight:700;opacity:.85;font-size:12px;">Initial Latent</label>
          <select id="asterRelightInitialLatent" style="width:160px;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:rgba(255,255,255,.92);padding:8px 10px;outline:none;">
            <option>None</option><option>Left</option><option>Right</option><option>Top</option><option>Bottom</option>
          </select>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <label style="font-weight:700;opacity:.85;font-size:12px;">HR Fix</label>
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;">
            <input id="asterRelightHRFix" type="checkbox" checked style="accent-color:#a100ff; transform:scale(1.1);"/>
            <span style="font-size:12px;opacity:.85;">Enabled</span>
          </label>
        </div>
      </div>
    `;

    function ctlRow(label,id,min,max,step,val){
      return `
        <div class="rt-ctl-row" style="display:flex;align-items:center;gap:12px;">
          <div style="flex:1;min-width:120px;">
            <div style="font-weight:700;opacity:.85;font-size:12px;margin-bottom:6px;">${label}</div>
            <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${val}" style="width:100%;"/>
          </div>
          <input id="${id}Val" type="text" value="${val}" style="width:72px;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:rgba(255,255,255,.92);padding:8px 10px;outline:none;"/>
        </div>
      `;
    }

    // inject before intensity block
    const intensityBlock=intensityEl.closest('.relight-block')||intensityEl.parentNode;
    intensityBlock.parentNode.insertBefore(wrap, intensityBlock);

    const bindRange=(id, parseFn=(x)=>parseFloat(x))=>{
      const r=document.getElementById(id);
      const v=document.getElementById(id+'Val');
      if(!r||!v) return;
      const sync=()=>{ v.value=String(r.value); store(); };
      r.addEventListener('input', sync);
      v.addEventListener('change', ()=>{ const n=parseFn(v.value); if(!Number.isFinite(n)) return; r.value=String(n); sync(); });
    };

    function store(){
      const params={
        num_images: parseInt($('#asterRelightNumImages')?.value||'1',10),
        cfg: parseFloat($('#asterRelightCfg')?.value||'1'),
        lowres_denoise: parseFloat($('#asterRelightLowres')?.value||'0.92'),
        highres_denoise: parseFloat($('#asterRelightHighres')?.value||'0.90'),
        hr_downscale: parseFloat($('#asterRelightDownscale')?.value||'0.50'),
        guidance_scale: parseFloat($('#asterRelightGuidance')?.value||'6.5'),
        num_inference_steps: parseInt($('#asterRelightSteps')?.value||'28',10),
        initial_latent: $('#asterRelightInitialLatent')?.value||'None',
        enable_hr_fix: !!$('#asterRelightHRFix')?.checked,
      };
      window.__asterRelightRelightEngineParams=params;
    }

    bindRange('asterRelightNumImages', (x)=>parseInt(x,10));
    bindRange('asterRelightCfg');
    bindRange('asterRelightLowres');
    bindRange('asterRelightHighres');
    bindRange('asterRelightDownscale');
    bindRange('asterRelightGuidance');
    bindRange('asterRelightSteps', (x)=>parseInt(x,10));

    $('#asterRelightInitialLatent')?.addEventListener('change', ()=>{store();});
    $('#asterRelightHRFix')?.addEventListener('change', ()=>{store();});

    $('#asterRelightRelightEngineReset')?.addEventListener('click', ()=>{
      const defaults={
        asterRelightNumImages:1,
        asterRelightCfg:1.0,
        asterRelightLowres:0.92,
        asterRelightHighres:0.90,
        asterRelightDownscale:0.50,
        asterRelightGuidance:6.5,
        asterRelightSteps:28,
      };
      Object.keys(defaults).forEach(k=>{ const el=document.getElementById(k); const val=defaults[k]; if(el){ el.value=String(val); const tv=document.getElementById(k+'Val'); if(tv) tv.value=String(val);} });
      const sel=$('#asterRelightInitialLatent'); if(sel) sel.value='None';
      const cb=$('#asterRelightHRFix'); if(cb) cb.checked=true;
      store();
      // refresh previews
      const mood=window.__asterRelightMood||'Cinematic';
      const lvl=clamp(parseFloat($('#asterRelightIntensity')?.value||3),1,6);
      applyPreview(mood,lvl);
    });

    // initial store
    store();
  }
