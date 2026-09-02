/* Aster JavaScript v312 — authenticated buyer-safe derivative: relight preview application. Host state/dependencies are intentionally external. */
function apply(){
    const i=img();
    if(!i) return;
    if(!active()){
      if(i.dataset.rtorigf!=null){
        i.style.filter=i.dataset.rtorigf||'';
        delete i.dataset.rtorigf;
        delete i.dataset.rtRelightPreview;
      }
      return;
    }
    if(i.dataset.rtorigf==null) i.dataset.rtorigf=i.style.filter||'';
    const k=clamp(intensity()/6,0,1);
    const m=mood();
    const prof=moods[m]||moods.Cinematic;
    const br=1+(prof[0]-1)*k;
    const co=1+(prof[1]-1)*k;
    const sa=1+(prof[2]-1)*k;
    const se=clamp(prof[3]*k,0,0.45);
    const hu=prof[4]*k;
    i.style.filter=`brightness(${br.toFixed(3)}) contrast(${co.toFixed(3)}) saturate(${sa.toFixed(3)}) sepia(${se.toFixed(3)}) hue-rotate(${hu.toFixed(1)}deg)`;
    i.dataset.rtRelightPreview='1';
  }
