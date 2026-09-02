async function extractPdfTextLayout(file,maxChars=120000){
        if(!window.pdfjsLib)return null;
        try{
          const buf=await file.arrayBuffer();
          const doc=await pdfjsLib.getDocument({data:buf}).promise;
          let out="";
          const maxPages=Math.min(doc.numPages,20);
          for(let i=1;i<=maxPages;i++){
            const page=await doc.getPage(i);
            const tc=await page.getTextContent();
            if((tc.items||[]).length>40){
              const rows={};
              const tol=2;
              for(const item of tc.items){
                const tr=item.transform || item.fontMatrix || [1,0,0,1,0,0];
                const x=tr[4],y=tr[5];
                let rowKey=null;
                for(const k in rows){if(Math.abs(Number(k)-y)<=tol){rowKey=k;break;}}
                if(rowKey===null)rowKey=y;
                (rows[rowKey] ||= []).push({x,str:item.str||""});
              }
              const ykeys=Object.keys(rows).map(Number).sort((a,b)=>b-a);
              for(const y of ykeys){
                const line=rows[y].sort((a,b)=>a.x-b.x).map(s=>s.str).join(" ").replace(/\s+/g," ").trim();
                if(line)out+=line+"\n";
                if(out.length>=maxChars)break;
              }
              out+="\n";
            }
          }
          const compact=(out||"").replace(/\s+/g,"");
          return compact.length>80 ? out.slice(0,maxChars) : null;
        }catch{return null;}
      }
