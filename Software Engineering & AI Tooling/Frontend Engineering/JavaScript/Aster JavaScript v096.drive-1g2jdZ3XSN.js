const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class AsterExecutionProgress {
  constructor({storage=localStorage,key='aster.exec.ema',alpha=.22,defaults={}}={}){
    this.storage=storage; this.key=key; this.alpha=alpha; this.defaults=defaults; this.active=new Map();
  }
  read(){ try{return {...this.defaults,...JSON.parse(this.storage.getItem(this.key)||'{}')}}catch{return {...this.defaults}} }
  estimate(tool){ return Math.max(650, Number(this.read()[tool]||2500)); }
  start(tool,onTick){ const started=performance.now(), estimate=this.estimate(tool); let raf;
    const tick=()=>{ const elapsed=performance.now()-started; const pct=clamp((elapsed/estimate)*92,1,92); onTick?.(pct,elapsed,estimate); raf=requestAnimationFrame(tick)};
    raf=requestAnimationFrame(tick); this.active.set(tool,{started,raf}); return started;
  }
  end(tool,onTick){ const a=this.active.get(tool); if(!a)return; cancelAnimationFrame(a.raf); const ms=performance.now()-a.started;
    const data=this.read(), old=Number(data[tool]||ms); data[tool]=Math.round(old*(1-this.alpha)+ms*this.alpha);
    try{this.storage.setItem(this.key,JSON.stringify(data))}catch{} this.active.delete(tool); onTick?.(100,ms,data[tool]);
  }
}
