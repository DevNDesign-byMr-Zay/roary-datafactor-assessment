/* Aster JavaScript v095
Authenticated historical derivative: grade-only relight execution path.
Historical provider/model parameters and proprietary prompt text removed; prompt is host supplied.
*/
(function(){
  "use strict";
  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;
  function base(options={}){
    const value=String(options.baseUrl||window.__asterToolBackendBase||'http://127.0.0.1:5151').replace(/\/+$/,'');
    if(!LOCAL_5151.test(value+'/')) throw new Error('Relight backend must use localhost port 5151');
    return value;
  }
  async function run(options={}){
    const form=new FormData();
    if(options.image instanceof Blob) form.set('image',options.image,'image.png');
    else if(options.imageUrl) form.set('image_url',String(options.imageUrl));
    else throw new Error('image or imageUrl is required');
    if(options.mood) form.set('mood',String(options.mood));
    if(Number.isFinite(Number(options.level))) form.set('level',String(Number(options.level)));
    if(options.prompt) form.set('prompt',String(options.prompt));
    form.set('output_format',String(options.outputFormat||'png'));
    const response=await fetch(`${base(options)}/tool/relight_grade`,{method:'POST',body:form,mode:'cors',credentials:'omit',cache:'no-store'});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok||payload.ok===false) throw new Error(payload.detail||payload.error||`Relight failed (${response.status})`);
    const url=payload.images?.[0]?.url||payload.image?.url||payload.output?.[0]?.url||payload.result?.url||'';
    if(!url) throw new Error('Relight backend returned no image');
    return url;
  }
  window.runAsterGradeRelight=run;
})();
