function renderAttachments(){
        if(!attachmentsRow)return;
        attachmentsRow.innerHTML="";
        sessionAttachments.forEach((a,idx)=>{
          const el=document.createElement("div");
          el.className="chip";
          el.innerHTML=`<span>${fileIcon(a.name,a.type)} ${escapeHtml(a.name)}</span><button title="Remove" type="button" data-idx="${idx}">✕</button>`;
          attachmentsRow.appendChild(el);
        });
        attachmentsRow.querySelectorAll("button[data-idx]").forEach(btn=>{
          btn.addEventListener("click",()=>{
            const i=Number(btn.dataset.idx);
            sessionAttachments.splice(i,1);
            renderAttachments();
          });
        });
      }
