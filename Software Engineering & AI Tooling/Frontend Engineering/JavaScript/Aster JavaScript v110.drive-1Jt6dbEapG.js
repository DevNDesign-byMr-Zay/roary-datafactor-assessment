export function normalizeAsterToolResult(data={}){
  const images=[];
  const add=v=>{ if(typeof v==='string'&&v) images.push(v); else if(v&&typeof v.url==='string') images.push(v.url); };
  (Array.isArray(data.images)?data.images:[]).forEach(add); add(data.image); (Array.isArray(data.output)?data.output:[]).forEach(add); add(data.result);
  return {ok:data.ok!==false,images:[...new Set(images)],detail:data.detail||data.error||'',raw:data};
}
export async function runAsterToolJsonFirst(request,payload){ return normalizeAsterToolResult(await request(payload)); }
