/* Aster JavaScript v089
Authenticated historical derivative: live relight preview controller.
Product identity, credentials, provider-specific model identities, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterRelightPreviewV1) return;
  window.__asterRelightPreviewV1 = true;

  function install(options={}){
    const image = options.image || document.querySelector(options.imageSelector || "[data-aster-relight-image]");
    const moodGrid = options.moodGrid || document.querySelector(options.moodGridSelector || "[data-aster-relight-moods]");
    const intensityInput = options.intensityInput || document.querySelector(options.intensitySelector || "[data-aster-relight-intensity]");
    const isActive = typeof options.isActive === "function" ? options.isActive : () => true;
    const maxIntensity = Number(options.maxIntensity || 6);
    const profiles = Object.assign({
      Neutral:[1.00,1.00,1.00,0.00,0],
      Cinematic:[0.98,1.10,0.96,0.06,-8],
      Studio:[1.06,1.08,1.02,0.00,0],
      Neon:[1.00,1.12,1.18,0.02,10],
      Sunset:[1.02,1.07,1.10,0.18,-22],
      Dawn:[1.01,1.08,0.98,0.10,20]
    }, options.profiles || {});
    if(!image) return null;

    const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
    const getMood=()=>{
      const activeButton=moodGrid && moodGrid.querySelector("[data-mood].is-active");
      return activeButton?.getAttribute("data-mood") || String(options.defaultMood || "Cinematic");
    };
    const getIntensity=()=>{
      const value=parseFloat(intensityInput?.value || "0");
      return Number.isFinite(value) ? clamp(value,0,maxIntensity) : 0;
    };

    function apply(){
      if(!isActive()){
        if(image.dataset.asterOriginalFilter !== undefined){
          image.style.filter=image.dataset.asterOriginalFilter || "";
          delete image.dataset.asterOriginalFilter;
          delete image.dataset.asterRelightPreview;
        }
        return;
      }
      if(image.dataset.asterOriginalFilter === undefined) image.dataset.asterOriginalFilter=image.style.filter || "";
      const strength=clamp(getIntensity()/Math.max(1,maxIntensity),0,1);
      const profile=profiles[getMood()] || profiles.Cinematic || [1,1,1,0,0];
      const brightness=1+(profile[0]-1)*strength;
      const contrast=1+(profile[1]-1)*strength;
      const saturation=1+(profile[2]-1)*strength;
      const sepia=clamp(profile[3]*strength,0,0.45);
      const hue=profile[4]*strength;
      image.style.filter=`brightness(${brightness.toFixed(3)}) contrast(${contrast.toFixed(3)}) saturate(${saturation.toFixed(3)}) sepia(${sepia.toFixed(3)}) hue-rotate(${hue.toFixed(1)}deg)`;
      image.dataset.asterRelightPreview="1";
    }

    let raf=0;
    const schedule=()=>{
      if(raf) cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{raf=0;apply();});
    };

    if(moodGrid && !moodGrid.dataset.asterRelightPreviewWired){
      moodGrid.dataset.asterRelightPreviewWired="1";
      moodGrid.addEventListener("click",event=>{ if(event.target.closest?.("[data-mood]")) schedule(); });
    }
    if(intensityInput && !intensityInput.dataset.asterRelightPreviewWired){
      intensityInput.dataset.asterRelightPreviewWired="1";
      intensityInput.addEventListener("input",schedule,{passive:true});
      intensityInput.addEventListener("change",schedule);
    }
    if(!image.dataset.asterRelightPreviewWired){
      image.dataset.asterRelightPreviewWired="1";
      image.addEventListener("load",schedule,{passive:true});
      new MutationObserver(schedule).observe(image,{attributes:true,attributeFilter:["src"]});
    }
    schedule();
    return {apply,schedule};
  }

  window.installAsterRelightPreview=install;
})();
