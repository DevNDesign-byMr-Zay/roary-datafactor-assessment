/* Aster JavaScript v271 — authenticated buyer-safe derivative: relight parameter persistence. Host state/dependencies are intentionally external. */
function storeRelightEngineParams(){
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
      window.__asterRelightRelightEngineParams=params;
    }
