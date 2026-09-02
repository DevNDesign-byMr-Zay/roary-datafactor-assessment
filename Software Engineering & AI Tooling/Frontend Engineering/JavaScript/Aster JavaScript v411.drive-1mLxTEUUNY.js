function takeFirstLines(text,n=8){
        return (text||"").split(/\r?\n/).filter(Boolean).slice(0,n).join("\n");
      }
