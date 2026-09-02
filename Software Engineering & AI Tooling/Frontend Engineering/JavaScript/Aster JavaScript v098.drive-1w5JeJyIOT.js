export function buildAsterImageEditBody({prompt='',imageUrl,referenceImages=[],maskDataUrl=null,mode='edit',variants=1,backendHint=null}={}){
  if(!imageUrl) throw new TypeError('imageUrl is required');
  const body={prompt:String(prompt),mode:String(mode),image_url:String(imageUrl),reference_images:[...referenceImages].filter(Boolean),variants:Math.max(1,Math.min(8,Number(variants)||1))};
  if(maskDataUrl) body.mask_data_url=String(maskDataUrl);
  if(backendHint) body.backend_hint=String(backendHint);
  return body;
}
