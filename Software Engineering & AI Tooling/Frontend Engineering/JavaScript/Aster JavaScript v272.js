/* Aster JavaScript v272 — authenticated buyer-safe derivative: relight engine preset computation. Host state/dependencies are intentionally external. */
function computeRelightEnginePreset(mood, level){
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
