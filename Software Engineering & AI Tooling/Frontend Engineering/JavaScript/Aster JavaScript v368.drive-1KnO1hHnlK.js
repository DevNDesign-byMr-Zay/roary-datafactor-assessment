function renderConversations(){
        if(!convList)return;
        convList.innerHTML="";
        conversationsArr
          .filter(c=>!c.archived)
          .sort((a,b)=>Number(b.pinned)-Number(a.pinned))
          .forEach(c=>{
            const item=document.createElement("div");
            item.className="conv-item"+(c.pinned?" pinned":"");
            item.dataset.id=c.id;
            item.innerHTML=`
              <span class="pin">★</span>
              <div class="conv-name">${escapeHtml(c.title)}</div>
              <div class="conv-3dots" style="position:relative;">
                <button class="kebab" type="button" title="Actions" aria-haspopup="menu" aria-expanded="false">⋯</button>
                <div class="conv-menu" role="menu">
                  <button data-act="rename" role="menuitem" type="button">Rename</button>
                  <button data-act="pin" role="menuitem" type="button">${c.pinned?"Unpin":"Pin"}</button>
                  <button data-act="download" role="menuitem" type="button">Download</button>
                  <button data-act="archive" role="menuitem" type="button">Archive</button>
                  <button data-act="delete" role="menuitem" type="button" style="color:#ff9c9c">Delete</button>
                </div>
              </div>`;
            item.addEventListener("click",ev=>{
              if(ev.target.closest(".conv-3dots"))return;
              activeId=c.id;
              persistConversations();
              renderActiveConversation();
            });
            const kebab=item.querySelector(".kebab");
            const menu=item.querySelector(".conv-menu");
            kebab.addEventListener("click",e=>{
              e.stopPropagation();
              $$(".conv-menu.open").forEach(m=>m!==menu && m.classList.remove("open"));
              menu.classList.toggle("open");
              kebab.setAttribute("aria-expanded",menu.classList.contains("open").toString());
            });
            menu.addEventListener("click",e=>{
              e.stopPropagation();
              const act=e.target.dataset.act;if(!act)return;
              if(act==="rename"){
                const nv=prompt("Rename conversation:",c.title||"Untitled");
                if(nv!==null)c.title=nv.trim()||"Untitled";
              }else if(act==="pin"){
                c.pinned=!c.pinned;
              }else if(act==="archive"){
                c.archived=true;
                if(c.id===activeId){
                  activeId=conversationsArr.find(x=>!x.archived)?.id || null;
                }
              }else if(act==="download"){
                const blob=new Blob([JSON.stringify(c,null,2)],{type:"application/json"});
                const url=URL.createObjectURL(blob);
                const a=document.createElement("a");
                a.href=url;
                a.download=(c.title||"conversation")+".json";
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(()=>URL.revokeObjectURL(url),1000);
              }else if(act==="delete"){
                if(confirm("Delete this conversation? This can't be undone.")){
                  const idx=conversationsArr.findIndex(x=>x.id===c.id);
                  if(idx>-1)conversationsArr.splice(idx,1);
                  if(activeId===c.id){
                    activeId=(conversationsArr.find(x=>!x.archived)?.id) || (conversationsArr[0]?.id) || null;
                  }
                  if(!conversationsArr.length){
                    const id="c_"+Date.now();
                    conversationsArr=[{id,title:"New Chat",pinned:false,archived:false,messages:[]}];
                    activeId=id;
                  }
                }
              }
              persistConversations();
              renderConversations();
              renderActiveConversation();
            });
            convList.appendChild(item);
          });
      }
