export function buildAsterImageEditJson({image, mask, instruction, options={}}={}){
  const body={};
  if(typeof image==='string' && image.trim()) body.image=image.trim();
  if(typeof mask==='string' && mask.trim()) body.mask=mask.trim();
  if(typeof instruction==='string' && instruction.trim()) body.instruction=instruction.trim();
  for(const [k,v] of Object.entries(options||{})) if(v!==undefined && v!==null) body[k]=v;
  return body;
}
export function serializeAsterImageEditJson(input, {maxBytes=8_000_000}={}){
  const text=JSON.stringify(buildAsterImageEditJson(input));
  const bytes=new TextEncoder().encode(text).byteLength;
  if(bytes>maxBytes) throw new RangeError(`Image-edit JSON exceeds ${maxBytes} bytes`);
  return text;
}
