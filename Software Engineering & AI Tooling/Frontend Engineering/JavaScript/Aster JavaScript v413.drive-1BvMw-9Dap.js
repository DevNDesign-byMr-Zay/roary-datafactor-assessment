function stripAttachmentBlock(s){
        return (s||"").replace(/\n?---\nATTACHMENTS[\s\S]*?\n---/g,"");
      }
