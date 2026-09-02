function renderMsgHTML(role,text){
        if(role==="assistant"){
          let html=marked.parse(text||"");
          html=DOMPurify.sanitize(html);
          const tmp=document.createElement("div");
          tmp.innerHTML=html;
          const pres=tmp.querySelectorAll("pre code.language-mermaid");
          pres.forEach(code=>{
            const graph=code.textContent || "";
            const container=document.createElement("div");
            container.className="mermaid";
            container.textContent=graph;
            const pre=code.closest("pre");
            pre.replaceWith(container);
          });
          try{mermaid.init(undefined,tmp.querySelectorAll(".mermaid"));}catch{}
          return tmp.innerHTML;
        }
        const clean=stripAttachmentBlock(text||"");
        return escapeHtml(clean);
      }
