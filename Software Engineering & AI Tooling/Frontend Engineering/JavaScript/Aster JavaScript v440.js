function dataUrlToBlob(dataUrl){
    const m = String(dataUrl||"").match(/^data:([^;]+);base64,(.*)$/);
    if(!m) return null;
    const mime = m[1] || "application/octet-stream";
    const b64 = m[2] || "";
    const bin = atob(b64);
    const len = bin.length;
    const arr = new Uint8Array(len);
    for(let i=0;i<len;i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], {type:mime});
  }
