/* Aster JavaScript v032
Authenticated historical derivative: tool-dispatcher alias to an existing object-removal core.
Original minified symbol names, product identity, private prompts, credentials, personal paths, and protected reasoning architecture removed.
*/
(function(){
  try{
    if(typeof window.asterRemoveCurrentModalImage !== "function"){
      const core = window.asterRemoveCore;
      if(typeof core === "function"){
        window.asterRemoveCurrentModalImage = async function(request){
          if(request && typeof request === "object"){
            const prompt =
              request.prompt ??
              request.text ??
              request.userPrompt ??
              request.query ??
              request.caption ??
              "";
            return await core(String(prompt || "").trim(), request);
          }
          return await core(String(request ?? "").trim(), {});
        };
      }
    }
  }catch(_){}
})();
