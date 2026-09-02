import { resolveAsterImageToolBase } from './Aster JavaScript v092.js';
export async function postAsterJsonTool(path,payload,{signal}={}){
  const clean=String(path||'').trim(); if(!/^\/tool\/[a-z0-9_/-]+$/i.test(clean)) throw new TypeError('A local /tool/ path is required');
  const url=`${resolveAsterImageToolBase()}${clean}`;
  const res=await fetch(url,{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal});
  const text=await res.text(); let data; try{data=JSON.parse(text)}catch{data={text}};
  if(!res.ok) throw Object.assign(new Error(data?.error||`Tool request failed (${res.status})`),{status:res.status,data});
  return data;
}
