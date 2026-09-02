function parseAttachmentMetaFromContent(s){
        const m=(s||"").match(/---\nATTACHMENTS([\s\S]*?)\n---/);
        if(!m)return[];
        const body=m[1]||"";
        const lines=body.split(/\r?\n/);
        const out=[];
        for(let i=0;i<lines.length;i++){
          const ln=lines[i].trim();
          if(ln.startsWith("### ")){
            const name=ln.slice(4).trim();
            const l2=(lines[i+1]||"").trim();
            let size=null,type="";
            const sizeM=l2.match(/(\d[\d,]*)\s*bytes/);
            if(sizeM)size=parseInt(sizeM[1].replace(/,/g,""),10);
            const typeM=l2.match(/type:\s*([^\s•\]]+)/i);
            if(typeM)type=typeM[1];
            out.push({name,size,type});
          }
        }
        return out;
      }
