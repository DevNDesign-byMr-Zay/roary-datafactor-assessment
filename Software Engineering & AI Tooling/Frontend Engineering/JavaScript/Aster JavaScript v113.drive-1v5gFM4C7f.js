import { toAsterPortableMediaUrl } from './Aster JavaScript v109.js';
export async function ingestAsterMediaItem(item,write){
  if(typeof write!=='function')throw new TypeError('write callback is required');
  const src=await toAsterPortableMediaUrl(item?.src||item?.url||'');
  if(!src)throw new TypeError('media source is required');
  return write({...item,src,url:src,portable:/^data:image\//i.test(src)||/^https?:/i.test(src)});
}
