function rewriteToolUrl(u){
    try{
      const url = new URL(u, location.href);
      if(!url.pathname.startsWith("/tool/")) return u;
      const name = (url.pathname.split("/")[2]||"").trim();
      if(!TOOL_ALLOW.has(name)) return u;
      if(REWRITE_PORTS.has(url.port)){
        url.protocol = "http:";
        url.hostname = "127.0.0.1";
        url.port = "5151";
        return url.toString();
      }
    }catch(e){}
    return u;
  }
