export function normalizeAsterRelightRequest(input={}){
  const image=String(input.image_url||input.imageUrl||'').trim(); if(!image)throw new TypeError('image URL is required');
  const mood=String(input.mood||'neutral').trim().toLowerCase(); const level=Math.max(0,Math.min(1,Number(input.level??0.5)));
  const out={image_url:image,mood,level,output_format:String(input.output_format||'png')};
  if(input.mask_data_url) out.mask_data_url=String(input.mask_data_url); return out;
}
