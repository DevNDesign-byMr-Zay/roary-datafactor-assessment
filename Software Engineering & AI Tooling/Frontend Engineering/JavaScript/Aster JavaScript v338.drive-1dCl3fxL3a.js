function dataUrlToBlob(dataUrl){
    try{
      const s = String(dataUrl);
      const parts = s.split(',');
      const m = parts[0].match(/data:([^;]+);base64/i);
      const mime = (m && m[1]) || 'image/png';
      const bin = atob(parts[1]||'');
      const arr = new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
      return new Blob([arr], {type:mime});
    }catch(e){ return null; }
  }
