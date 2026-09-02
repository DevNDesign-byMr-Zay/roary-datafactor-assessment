/* Aster JavaScript v305 — authenticated buyer-safe derivative: relight preset-to-control synchronization. Host state/dependencies are intentionally external. */
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
