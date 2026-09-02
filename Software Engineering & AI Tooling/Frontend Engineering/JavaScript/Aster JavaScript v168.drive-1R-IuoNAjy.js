/* Aster JavaScript v168
Authenticated historical derivative: prompt recovery for image-generation actions.
If the composer is empty, recover the latest usable user prompt while stripping persisted attachment blocks.
*/
(function(global){
  "use strict";
  if(global.AsterImagePromptRecovery) return;

  function stripAttachmentBlock(content){
    return String(content||"")
      .replace(/\n?---\nATTACHMENTS[\s\S]*?\n---/g,"")
      .trim();
  }

  function derive(options={}){
    const typed=String(options.composerValue||"").trim();
    if(typed) return typed.slice(0,Number(options.maxChars)||400);

    const messages=Array.isArray(options.messages)?options.messages:[];
    for(let index=messages.length-1;index>=0;index--){
      const message=messages[index];
      if(message?.role!=="user" || !message?.content) continue;
      const candidate=stripAttachmentBlock(message.content);
      if(candidate) return candidate.slice(0,Number(options.maxChars)||400);
    }
    return "";
  }

  global.AsterImagePromptRecovery={stripAttachmentBlock,derive};
})(window);
