import { resolveAsterImageToolBase } from './Aster JavaScript v092.js';
export async function requestAsterJsonTool(tool,payload,{signal}={}){
  const name=String(tool||'').replace(/^\/+|\/+$/g,''); if(!name) throw new TypeError('tool is required');
  const res=await fetch(`${resolveAsterImageToolBase()}/tool/${encodeURIComponent(name)}`,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload||{}),signal});
  const data=await res.json().catch(()=>({})); if(!res.ok||data.ok===false) throw new Error(data.detail||data.error||`Tool failed (${res.status})`); return data;
}
