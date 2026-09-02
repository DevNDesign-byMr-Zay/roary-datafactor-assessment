export class AsterQuickActionGate {
  constructor(){ this.blocks=new Set(); }
  disable(reason='busy'){ this.blocks.add(String(reason)); return this; }
  enable(reason='busy'){ this.blocks.delete(String(reason)); return this; }
  get enabled(){ return this.blocks.size===0; }
  guard(fn){ return (...args)=>{ if(!this.enabled) return; return fn(...args); }; }
  bind(button){ const sync=()=>{button.disabled=!this.enabled;button.setAttribute('aria-disabled',String(!this.enabled))}; return {sync,disable:r=>{this.disable(r);sync()},enable:r=>{this.enable(r);sync()}}; }
}
