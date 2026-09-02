import { resolveAsterImageToolBase } from './Aster JavaScript v092.js';
import { buildAsterRelightControls } from './Aster JavaScript v094.js';
export async function requestAsterRelightSafe({imageUrl,state,signal}={}){
  if(!imageUrl) throw new TypeError('imageUrl is required');
  const body={image_url:imageUrl,...buildAsterRelightControls(state),output_format:'png'};
  const res=await fetch(`${resolveAsterImageToolBase()}/tool/relight`,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  const data=await res.json().catch(()=>({}));
  if(!res.ok || data.ok===false) throw new Error(data.detail||data.error||`Relight failed (${res.status})`);
  return data;
}
