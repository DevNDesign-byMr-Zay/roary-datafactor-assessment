const unprox=u=>{try{u=String(u||"");const m=u.match(/\/proxy\/image\?url=([^&]+)/i);return m?decodeURIComponent(m[1]):u}catch(_){return String(u||"")}};
