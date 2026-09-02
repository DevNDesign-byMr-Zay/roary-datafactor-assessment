export class AsterBoundedStore {
  constructor({storage=localStorage,key='aster.state',maxItems=80}={}){Object.assign(this,{storage,key,maxItems});}
  parse(raw,fallback=[]){ try{const v=JSON.parse(raw);return Array.isArray(v)?v:fallback}catch{return fallback} }
  read(){ return this.parse(this.storage.getItem(this.key)||'[]',[]); }
  write(items){ const clean=(Array.isArray(items)?items:[]).slice(-this.maxItems); try{this.storage.setItem(this.key,JSON.stringify(clean))}catch{} return clean; }
  push(item){ const items=this.read(); items.push(item); return this.write(items); }
}
