const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class AsterRelightPreviewScheduler {
  constructor({getImage,getMood,getLevel,apply,clear,delay=80}={}){ Object.assign(this,{getImage,getMood,getLevel,apply,clear,delay}); this.timer=0; }
  schedule(){ clearTimeout(this.timer); this.timer=setTimeout(()=>this.refresh(),this.delay); }
  refresh(){
    const img=this.getImage?.(); if(!img){ this.clear?.(); return; }
    const mood=String(this.getMood?.()||'neutral'); const level=clamp(Number(this.getLevel?.()??0.5),0,1);
    this.apply?.(img,{mood,level});
  }
  bind(root=document){ root.addEventListener('input',()=>this.schedule(),{passive:true}); root.addEventListener('click',()=>this.schedule(),{passive:true}); window.addEventListener('resize',()=>this.schedule(),{passive:true}); return this; }
}
