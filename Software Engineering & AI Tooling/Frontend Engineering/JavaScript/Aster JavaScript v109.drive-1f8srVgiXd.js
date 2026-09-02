export async function toAsterPortableMediaUrl(src){
  const value=String(src||'').trim(); if(!value)return value;
  if(/^data:image\//i.test(value)||/^https?:/i.test(value))return value;
  if(!/^blob:/i.test(value))return value;
  const blob=await fetch(value,{credentials:'omit'}).then(r=>{if(!r.ok)throw new Error(`Blob read failed (${r.status})`);return r.blob()});
  return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error||new Error('FileReader failed'));reader.readAsDataURL(blob)});
}
