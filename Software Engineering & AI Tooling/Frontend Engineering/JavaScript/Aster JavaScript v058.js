/* Aster JavaScript v058
Authenticated historical derivative: outbound chat-memory injector for short-history JSON requests.
Identity-specific names, credentials, personal paths, proprietary prompt text, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterFetchMemoryInjectorV1) return;
  window.__asterFetchMemoryInjectorV1 = true;

  const originalFetch = window.fetch ? window.fetch.bind(window) : null;
  if(!originalFetch) return;

  function elementText(element){
    try{
      return String(element && (element.innerText || element.textContent) || "").trim();
    }catch(_){
      return "";
    }
  }

  function collectDomHistory(maxMessages=40){
    const containers = [
      document.querySelector(".messages"),
      document.getElementById("messages"),
      document.querySelector(".chat-messages"),
      document.getElementById("chatMessages")
    ].filter(Boolean);

    let messageElements = [];
    for(const container of containers){
      const found = container.querySelectorAll(".msg");
      if(found.length){
        messageElements = Array.from(found);
        break;
      }
    }
    if(!messageElements.length){
      messageElements = Array.from(document.querySelectorAll(".msg"));
    }

    const history = [];
    for(const element of messageElements){
      const role = element.classList.contains("user")
        ? "user"
        : element.classList.contains("assistant")
          ? "assistant"
          : null;
      if(!role) continue;

      const contentElement =
        element.querySelector(".msg-content") ||
        element.querySelector(".content") ||
        element;
      const content = elementText(contentElement);
      if(content) history.push({role,content});
    }

    return history.slice(-Math.max(1,Number(maxMessages) || 40));
  }

  function readOptionalContext(){
    let system = "";
    let persona = "";

    try{
      const element = document.getElementById("systemPrompt");
      if(element?.value) system = String(element.value).trim();
    }catch(_){}
    if(!system){
      try{ system = String(localStorage.getItem("aster.systemPrompt") || "").trim(); }catch(_){}
    }

    try{
      const element = document.getElementById("persona");
      if(element?.value) persona = String(element.value).trim();
    }catch(_){}
    if(!persona){
      try{ persona = String(localStorage.getItem("aster.persona") || "").trim(); }catch(_){}
    }

    if(persona){
      system = system
        ? system + "\n\nPersona:\n" + persona
        : "Persona:\n" + persona;
    }
    return system.trim();
  }

  function isChatEndpoint(url){
    const value = String(url || "");
    return /\/v1\/chat\/completions(?:\?|$)/.test(value) ||
           /\/chat(?:\?|$)/.test(value);
  }

  function hasJsonContentType(headers){
    try{
      if(!headers) return false;
      if(typeof headers.get === "function"){
        return String(headers.get("Content-Type") || "").toLowerCase().includes("application/json");
      }
      if(typeof headers === "object"){
        return String(headers["Content-Type"] || headers["content-type"] || "")
          .toLowerCase().includes("application/json");
      }
    }catch(_){}
    return false;
  }

  window.fetch = function(input,init){
    try{
      const url = typeof input === "string" ? input : input?.url || "";
      const method = String(init?.method || "GET").toUpperCase();

      if(
        method === "POST" &&
        typeof init?.body === "string" &&
        isChatEndpoint(url) &&
        hasJsonContentType(init.headers)
      ){
        let body = null;
        try{ body = JSON.parse(init.body); }catch(_){}

        if(body && Array.isArray(body.messages)){
          const hasLongHistory = body.messages.length >= 8;
          const domHistory = collectDomHistory(40);

          if(!hasLongHistory && domHistory.length){
            const context = readOptionalContext();
            const lastUser = [...body.messages].reverse()
              .find(message=>message && message.role === "user");

            const merged = [];
            if(context) merged.push({role:"system",content:context});
            merged.push(...domHistory);

            if(
              lastUser &&
              (
                !merged.length ||
                merged[merged.length-1].role !== "user" ||
                merged[merged.length-1].content !== lastUser.content
              )
            ){
              merged.push({role:"user",content:String(lastUser.content || "")});
            }

            body.messages = merged.slice(-45);
            init = {...init,body:JSON.stringify(body)};
          }
        }
      }
    }catch(_){}

    return originalFetch(input,init);
  };

  window.asterFetchMemory = {
    collectDomHistory,
    readOptionalContext,
    isChatEndpoint
  };
})();
