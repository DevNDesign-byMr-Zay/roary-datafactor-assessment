/* Aster JavaScript v138
Authenticated historical derivative: image-tool availability probing locked to localhost port 5151.
*/
(function(global){
  'use strict';
  const BASE='http://127.0.0.1:5151';
  async function exists(tool,timeoutMs=1800){const name=String(tool||'').replace(/[^a-z0-9_-]/gi,'');if(!name)return false;for(const method of ['GET','POST']){const ac=new AbortController(),to=setTimeout(()=>ac.abort(),timeoutMs);try{const r=await fetch(`${BASE}/tool/${name}`,{method,body:method==='POST'?'':undefined,headers:method==='POST'?{'Content-Type':'application/x-www-form-urlencoded'}:undefined,mode:'cors',credentials:'omit',cache:'no-store',signal:ac.signal});if(r.ok||[400,401,405,422].includes(r.status))return true}catch{}finally{clearTimeout(to)}}return false;}
  global.AsterToolProbe={base:BASE,exists};
})(window);
