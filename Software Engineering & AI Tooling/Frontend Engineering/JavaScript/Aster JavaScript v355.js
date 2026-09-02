async function renderChat(){
    const box = $("#chat");
    box.innerHTML = "";
    const t = await dbGet("threads", state.currentThreadId);
    if(!t){
      box.innerHTML = `<div class="mini" style="max-width:920px;margin:0 auto;color:var(--muted)">No thread loaded.</div>`;
      return;
    }
    if(!t.messages.length){
      box.innerHTML = `<div class="mini" style="max-width:920px;margin:0 auto;color:var(--muted)">
        Drop an image in the chat ( + ) then click it to open the Editor. Or just talk to Aster.
      </div>`;
    }
    for(const m of t.messages){
      const msg = document.createElement("div");
      msg.className = "msg";
      msg.innerHTML = `
        <div class="avatar">${m.role==="assistant"?"R":"You"}</div>
        <div class="bubble">
          <div class="role">
            <span>${m.role==="assistant"?"Aster":"You"}</span>
            <span>${new Date(m.ts||Date.now()).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</span>
          </div>
          <div class="content">${escapeHtml(m.content||"")}</div>
          ${m.mediaIds && m.mediaIds.length ? `<div class="media">${m.mediaIds.map(id=>{
              const u = mediaURL(id);
              return `<div class="thumb" data-mid="${escapeAttr(id)}">
                        <img src="${escapeAttr(u)}" alt="media"/>
                        <div class="tbar">
                          <div class="chip">Open</div>
                          <div class="chip" style="opacity:.8">${escapeHtml((state.media.find(x=>x.id===id)?.title)||"Image")}</div>
                        </div>
                      </div>`;
            }).join("")}</div>` : ""}
        </div>
      `;
      box.appendChild(msg);
    }
    // thumb click handler
    $$(".thumb", box).forEach(el=>{
      el.onclick = ()=>{
        const mid = el.getAttribute("data-mid");
        state.selectedMediaId = mid;
        openEditor(mid);
      };
    });
    // scroll bottom
    setTimeout(()=> box.scrollTop = box.scrollHeight + 9999, 0);
  }
