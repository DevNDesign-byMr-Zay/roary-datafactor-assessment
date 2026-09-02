async function toDataURLFromEl(img,maxDim=2048,quality=0.92){
    try{
      if(!img||!img.naturalWidth||!img.naturalHeight) return '';
      const w=img.naturalWidth, h=img.naturalHeight;
      const s=Math.min(1, maxDim/Math.max(w,h));
      const cw=Math.max(2, Math.round(w*s));
      const ch=Math.max(2, Math.round(h*s));
      const c=document.createElement('canvas');
      c.width=cw; c.height=ch;
      const ctx=c.getContext('2d',{alpha:false,desynchronized:true});
      ctx.drawImage(img,0,0,cw,ch);
      return c.toDataURL('image/jpeg', quality);
    }catch{return ''}
  }
