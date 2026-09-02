/* Aster JavaScript v147
Authenticated historical derivative: resilient masked-remove transport with internal timeout and endpoint fallback.
Cross-origin image sources are fetched to Blob with CORS; no image-element canvas readback is used.
*/
(function(global){
  'use strict';
  const BASE='http://127.0.0.1:5151';
  const PATHS=['/tool/remove','/tool/erase','/tool/inpaint_remove'];
  function dataUrlToBlob(value){
    const m=/^data:([^;,]+)?(;base64)?,(.*)$/s.exec(String(value||''));
    if(!m) return null;
    const mime=m[1]||'application/octet-stream';
    const raw=m[2]?atob(m[3]):decodeURIComponent(m[3]);
    const bytes=new Uint8Array(raw.length); for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    return new Blob([bytes],{type:mime});
  }
  async function sourceToBlob(source){
    if(source instanceof Blob) return source;
    const src=String(source||'').trim();
    if(/^data:/i.test(src)){const b=dataUrlToBlob(src);if(b)return b;}
    if(/^blob:/i.test(src)||/^https?:/i.test(src)){
      const r=await fetch(src,{method:'GET',mode:'cors',credentials:'omit',cache:'no-store'});
      if(!r.ok) throw new Error(`Image fetch failed (${r.status})`);
      return r.blob();
    }
    throw new Error('Unsupported image source');
  }
  function outputUrl(p={}){return p.images?.[0]?.url||p.images?.[0]?.data_url||p.image?.url||p.image?.data_url||p.image_url||p.url||p.data_url||p.output_url||p.output||'';}
  async function run(options={}){
    const image=await sourceToBlob(options.imageBlob||options.imageSource);
    let mask=options.maskBlob||null;
    if(!mask&&options.maskDataUrl) mask=dataUrlToBlob(options.maskDataUrl);
    const prompt=String(options.prompt||'').trim();
    const timeoutMs=Math.max(60000,Number(options.timeoutMs)||240000);
    const ac=new AbortController(); const timer=setTimeout(()=>ac.abort(),timeoutMs);
    let last=null;
    try{
      for(const path of PATHS){
        const fd=new FormData();
        fd.append('image',new File([image],'image.png',{type:image.type||'image/png'}));
        if(mask instanceof Blob) fd.append('mask',new File([mask],'mask.png',{type:mask.type||'image/png'}));
        fd.append('prompt',prompt);
        try{
          const r=await fetch(`${BASE}${path}`,{method:'POST',body:fd,signal:ac.signal,mode:'cors',credentials:'omit',cache:'no-store'});
          if(!r.ok){if(r.status===404||r.status===405){last=new Error(`Unavailable endpoint (${r.status})`);continue;}throw new Error(`Remove failed (${r.status})`);}
          const p=await r.json().catch(()=>({})); const out=outputUrl(p); if(out)return{url:out,payload:p,path};
          last=new Error('Remove returned no output');
        }catch(e){last=e;if(e?.name==='AbortError')break;}
      }
    } finally { clearTimeout(timer); }
    throw last||new Error('Remove tool unavailable');
  }
  global.AsterRemoveFallbackTransport={base:BASE,paths:[...PATHS],sourceToBlob,run};
})(window);
