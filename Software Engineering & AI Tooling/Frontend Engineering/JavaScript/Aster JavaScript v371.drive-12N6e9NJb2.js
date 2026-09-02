function mountAttachmentsBar(chatInnerEl,afterMsgEl,atts){
        const items=(atts||[]).map(a=>({name:a.name || "file",type:a.type || "",size:a.size || 0}));
        if(!items.length)return;
        const bar=document.createElement("div");
        bar.className="attachments-bar";
        bar.setAttribute("role","region");
        bar.setAttribute("aria-label","Attachments");

        const head=document.createElement("div");
        head.className="attachments-head";
        head.setAttribute("role","button");
        head.setAttribute("tabindex","0");
        head.innerHTML=`
          <span class="title">Attachments</span>
          <div class="chips"></div>
          <span class="attachments-caret">›</span>
        `;
        const chips=head.querySelector(".chips");
        items.forEach(it=>{
          const chip=document.createElement("span");
          chip.className="attachments-chip";
          chip.textContent=fileIcon(it.name,it.type);
          chips.appendChild(chip);
        });

        const list=document.createElement("div");
        list.className="attachments-list";
        list.setAttribute("aria-hidden","true");
        list.innerHTML=items.map((it)=>`
          <div class="attachments-item">
            <div class="favicon">${fileIcon(it.name,it.type)}</div>
            <div>
              <div class="name">${escapeHtml(it.name)}</div>
              <small>${escapeHtml(it.type || "binary")}${it.size?` • ${formatBytes(it.size)}`:""}</small>
            </div>
          </div>`).join("");

        function toggleOpen(force){
          const willOpen=typeof force==="boolean" ? force : !bar.classList.contains("attachments-open");
          bar.classList.toggle("attachments-open",willOpen);
          list.setAttribute("aria-hidden",willOpen?"false":"true");
        }
        head.addEventListener("click",()=>toggleOpen());
        head.addEventListener("keydown",e=>{
          if(e.key==="Enter" || e.key===" "){
            e.preventDefault();
            toggleOpen();
          }
        });

        bar.appendChild(head);
        bar.appendChild(list);

        if(afterMsgEl && afterMsgEl.parentElement===chatInnerEl){
          chatInnerEl.insertBefore(bar,afterMsgEl.nextSibling);
        }else{
          chatInnerEl.appendChild(bar);
        }
        return bar;
      }
