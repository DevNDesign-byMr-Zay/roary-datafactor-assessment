function derivePromptForImages(){
        let prompt = (composer?.value || "").trim();
        if(prompt) return prompt;
        const c = getActive();
        if(!c || !Array.isArray(c.messages)) return "";
        for(let i=c.messages.length-1;i>=0;i--){
          const m = c.messages[i];
          if(m.role === "user" && m.content){
            const stripped = stripAttachmentBlock(m.content).trim();
            if(stripped){
              return stripped.slice(0,400);
            }
          }
        }
        return "";
      }
