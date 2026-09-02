function cacheBust(u){
    u = String(u||"");
    if(!u) return u;
    if(u.startsWith("data:")) return u;
    const sep = u.includes("?") ? "&" : "?";
    return u + sep + "cb=" + Date.now();
  }
