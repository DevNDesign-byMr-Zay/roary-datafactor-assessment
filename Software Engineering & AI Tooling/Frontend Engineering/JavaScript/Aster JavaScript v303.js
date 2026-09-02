/* Aster JavaScript v303 — authenticated buyer-safe derivative: relight control-surface construction. Host state/dependencies are intentionally external. */
function ensureICLightControls(){
    const panel=getPanel();
    if(!panel) return;
    const root=panel.querySelector('.tool-control-panel')||panel.querySelector('.rt-sidepanel-inner')||panel;
    if(!root) return;
    const intensityEl=root.querySelector('#asterRelightIntensity');
    if(!intensityEl) return;

    window.__asterRelightManualKnobs = window.__asterRelightManualKnobs || {};
    const manual = window.__asterRelightManualKnobs;

    // Expose preset applier globally so mood/intensity clicks can auto-tune knobs (Method B: don't override manual tweaks)
    window.__asterApplyICLightPreset = (mood, level)=>{
      try{
        const p = computeICLightPreset(mood, level);
        applyICLightPresetToUI(p);
        storeICLightParams();
      }catch(e){}
    };

    if(document.getElementById('asterRelightICLightControls')){
      // keep params in sync
      storeICLightParams();
      return;
    }

    const wrap=document.createElement('div');
    wrap.id='asterRelightICLightControls';
    wrap.style.marginTop='0';
    wrap.style.paddingTop='0';
    wrap.style.borderTop='0';
    wrap.style.display='none';
    wrap.setAttribute('aria-hidden','true');


    wrap.innerHTML = `
      <div style="display:none" aria-hidden="true">
        <input id="asterRelightNumImages" data-ic-key="num_images" type="range" min="1" max="3" step="1" value="1"/>
        <input id="asterRelightCfg" data-ic-key="cfg" type="range" min="0.5" max="3.0" step="0.1" value="1.0"/>
        <input id="asterRelightLowres" data-ic-key="lowres_denoise" type="range" min="0.50" max="0.98" step="0.01" value="0.78"/>
        <input id="asterRelightHighres" data-ic-key="highres_denoise" type="range" min="0.50" max="0.98" step="0.01" value="0.74"/>
        <input id="asterRelightDownscale" data-ic-key="hr_downscale" type="range" min="0.25" max="1.00" step="0.01" value="0.50"/>
        <input id="asterRelightGuidance" data-ic-key="guidance_scale" type="range" min="1.0" max="12.0" step="0.1" value="7.6"/>
        <input id="asterRelightSteps" data-ic-key="num_inference_steps" type="range" min="10" max="60" step="1" value="30"/>
        <select id="asterRelightInitialLatent">
          <option>None</option><option>Left</option><option>Right</option><option>Top</option><option>Bottom</option>
        </select>
        <input id="asterRelightHRFix" type="checkbox" checked/>
        <input id="asterRelightNumImagesVal" type="text" value="1"/>
        <input id="asterRelightCfgVal" type="text" value="1.0"/>
        <input id="asterRelightLowresVal" type="text" value="0.78"/>
        <input id="asterRelightHighresVal" type="text" value="0.74"/>
        <input id="asterRelightDownscaleVal" type="text" value="0.50"/>
        <input id="asterRelightGuidanceVal" type="text" value="7.6"/>
        <input id="asterRelightStepsVal" type="text" value="30"/>
      </div>
    `;

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

    // Inject just above intensity control block
    const intensityBlock=intensityEl.closest('.relight-block')||intensityEl.parentNode;
    intensityBlock.parentNode.insertBefore(wrap, intensityBlock);

    const bindRange=(id, key, parseFn=(x)=>parseFloat(x))=>{
      const r=document.getElementById(id);
      const v=document.getElementById(id+'Val');
      if(!r||!v) return;
      const sync=()=>{
        v.value=String(r.value);
        if(!r.__asterAuto) manual[key]=true;
        storeICLightParams();
      };
      r.addEventListener('input', sync);
      v.addEventListener('change', ()=>{
        const n=parseFn(v.value);
        if(!Number.isFinite(n)) return;
        r.value=String(n);
        sync();
      });
    };

    const getattr = 

    function storeICLightParams(){
      const params={
        num_images: parseInt($('#asterRelightNumImages')?.value||'1',10),
        cfg: parseFloat($('#asterRelightCfg')?.value||'1'),
        lowres_denoise: parseFloat($('#asterRelightLowres')?.value||'0.78'),
        highres_denoise: parseFloat($('#asterRelightHighres')?.value||'0.74'),
        hr_downscale: parseFloat($('#asterRelightDownscale')?.value||'0.50'),
        guidance_scale: parseFloat($('#asterRelightGuidance')?.value||'7.6'),
        num_inference_steps: parseInt($('#asterRelightSteps')?.value||'30',10),
        initial_latent: $('#asterRelightInitialLatent')?.value||'None',
        enable_hr_fix: !!$('#asterRelightHRFix')?.checked,
      };
      window.__asterRelightICLightParams=params;
    }

    function computeICLightPreset(mood, level){
      const i=clamp(parseFloat(level)||3,1,6);
      const k=clamp(i/6,0,1);
      const name=String(mood||'Cinematic');
      const base={
        Neutral:  {dir:'None',  g:6.0, steps:26, low:0.70, high:0.66, cfg:1.0, ds:0.52},
        Cinematic:{dir:'Top',   g:7.2, steps:30, low:0.74, high:0.70, cfg:1.0, ds:0.50},
        Studio:   {dir:'Left',  g:8.0, steps:32, low:0.70, high:0.66, cfg:1.0, ds:0.48},
        Neon:     {dir:'Right', g:8.8, steps:34, low:0.78, high:0.74, cfg:1.1, ds:0.48},
        Sunset:   {dir:'Left',  g:8.2, steps:33, low:0.76, high:0.72, cfg:1.0, ds:0.49},
        Dawn:     {dir:'Right', g:7.8, steps:32, low:0.74, high:0.70, cfg:1.0, ds:0.49},
      }[name] || {dir:'Top', g:7.2, steps:30, low:0.74, high:0.70, cfg:1.0, ds:0.50};

      // Hyperrealistic scaling with intensity (without letting the scene drift too far)
      const guidance = clamp(base.g + (1.2 + (name==='Neon'?0.8:0))*k, 1.0, 12.0);
      const steps = int(clamp(round(base.steps + 10*k), 10, 60));
      const low = clamp(base.low + 0.08*k, 0.50, 0.92);
      const high = clamp(base.high + 0.08*k, 0.50, 0.92);
      const ds = clamp(base.ds - 0.08*k, 0.25, 1.00);
      const cfg = clamp(base.cfg + 0.15*k, 0.5, 3.0);

      return {
        num_images: 1,
        cfg: cfg,
        lowres_denoise: low,
        highres_denoise: high,
        hr_downscale: ds,
        guidance_scale: guidance,
        num_inference_steps: steps,
        initial_latent: base.dir,
        enable_hr_fix: true,
      };

      function round(x){ return Math.round(x); }
      function int(x){ return parseInt(String(x),10); }
    }

    function applyICLightPresetToUI(p){
      // Method B: don't override manual knobs
      const setRange=(id, key, val)=>{
        const r=document.getElementById(id);
        const v=document.getElementById(id+'Val');
        if(!r) return;
        if(manual[key]) return;
        r.__asterAuto=1;
        r.value=String(val);
        if(v) v.value=String(val);
        setTimeout(()=>{ try{ r.__asterAuto=0; }catch(e){} },0);
      };

      setRange('asterRelightNumImages','num_images',p.num_images);
      setRange('asterRelightCfg','cfg',p.cfg);
      setRange('asterRelightLowres','lowres_denoise',p.lowres_denoise);
      setRange('asterRelightHighres','highres_denoise',p.highres_denoise);
      setRange('asterRelightDownscale','hr_downscale',p.hr_downscale);
      setRange('asterRelightGuidance','guidance_scale',p.guidance_scale);
      setRange('asterRelightSteps','num_inference_steps',p.num_inference_steps);

      const sel=$('#asterRelightInitialLatent');
      if(sel && !manual.initial_latent){ sel.__asterAuto=1; sel.value=p.initial_latent||'None'; setTimeout(()=>{try{sel.__asterAuto=0}catch(e){}},0); }
      const cb=$('#asterRelightHRFix');
      if(cb && !manual.enable_hr_fix){ cb.__asterAuto=1; cb.checked=!!p.enable_hr_fix; setTimeout(()=>{try{cb.__asterAuto=0}catch(e){}},0); }
    }

    // Bind and mark manual when user edits (unless auto-set)
    bindRange('asterRelightNumImages','num_images', (x)=>parseInt(x,10));
    bindRange('asterRelightCfg','cfg');
    bindRange('asterRelightLowres','lowres_denoise');
    bindRange('asterRelightHighres','highres_denoise');
    bindRange('asterRelightDownscale','hr_downscale');
    bindRange('asterRelightGuidance','guidance_scale');
    bindRange('asterRelightSteps','num_inference_steps', (x)=>parseInt(x,10));

    $('#asterRelightInitialLatent')?.addEventListener('change', (e)=>{
      if(e.target && e.target.__asterAuto) return;
      manual.initial_latent=true;
      storeICLightParams();
    });
    $('#asterRelightHRFix')?.addEventListener('change', (e)=>{
      if(e.target && e.target.__asterAuto) return;
      manual.enable_hr_fix=true;
      storeICLightParams();
    });

    $('#asterRelightICLightReset')?.addEventListener('click', ()=>{
      // Clear manual locks
      Object.keys(manual).forEach(k=>manual[k]=false);
      const mood=window.__asterRelightMood||'Cinematic';
      const lvl=clamp(parseFloat($('#asterRelightIntensity')?.value||3),1,6);
      // Apply fresh preset
      try{ window.__asterApplyICLightPreset && window.__asterApplyICLightPreset(mood,lvl); }catch(e){}
      // refresh previews
      applyPreview(mood,lvl);
    });

    // Initial seed
    storeICLightParams();
    try{
      const mood=window.__asterRelightMood||'Cinematic';
      const lvl=clamp(parseFloat($('#asterRelightIntensity')?.value||3),1,6);
      window.__asterApplyICLightPreset(mood,lvl);
    }catch(e){}
  }
