/* Aster JavaScript v174
Authenticated historical derivative: sanitized rich-message rendering with optional diagram-block promotion.
Raw assistant text is parsed, sanitized, then eligible fenced diagram blocks are replaced by safe render targets.
*/
(function(global){
  "use strict";
  if(global.AsterSafeRichMessageRenderer) return;

  function escapeText(value){
    return String(value||"").replace(/[&<>"]/g,ch=>(
      ch==="&"?"&amp;":
      ch==="<"?"&lt;":
      ch===">"?"&gt;":"&quot;"
    ));
  }

  function renderAssistant(text,options={}){
    const parser=options.parseMarkdown;
    const sanitizer=options.sanitizeHTML;
    if(typeof parser!=="function" || typeof sanitizer!=="function"){
      return escapeText(text).replace(/\n/g,"<br>");
    }

    const parsed=String(parser(String(text||""))||"");
    const clean=String(sanitizer(parsed)||"");
    const container=document.createElement("div");
    container.innerHTML=clean;

    const selector=String(options.diagramSelector||"pre code.language-mermaid");
    const nodes=Array.from(container.querySelectorAll(selector));

    for(const code of nodes){
      const source=String(code.textContent||"");
      const target=document.createElement("div");
      target.className=String(options.diagramClass||"diagram");
      target.textContent=source;
      code.closest("pre")?.replaceWith(target);
    }

    if(nodes.length && typeof options.renderDiagrams==="function"){
      try{
        options.renderDiagrams(container.querySelectorAll("."+String(options.diagramClass||"diagram")));
      }catch(_){}
    }

    return container.innerHTML;
  }

  function renderUser(text,options={}){
    const strip=typeof options.stripAttachments==="function"
      ? options.stripAttachments
      : value=>String(value||"");
    return escapeText(strip(text));
  }

  global.AsterSafeRichMessageRenderer={
    escapeText,
    renderAssistant,
    renderUser
  };
})(window);
