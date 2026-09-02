/* Aster JavaScript v215 — authenticated buyer-safe derivative: conversation-list renderer with active-thread selection. Host state/dependencies are intentionally external. */
function renderChatsList(){
    const box = $("#listChats"); box.innerHTML="";
    for(const t of state.threads){
      const row = document.createElement("div");
      row.className = "row" + (t.id===state.currentThreadId ? " active" : "");
      row.innerHTML = `
        <div class="dot"></div>
        <div class="meta">
          <div class="name">${escapeHtml(t.title||"Chat")}</div>
          <div class="sub">${new Date(t.updatedAt||t.createdAt||Date.now()).toLocaleString()}</div>
        </div>`;
      row.onclick = ()=>{ state.currentThreadId = t.id; renderChatsList(); renderChat(); };
      box.appendChild(row);
    }
    const ct = state.threads.find(x=>x.id===state.currentThreadId);
    $("#threadTitle").textContent = ct?.title || "Chat";
  }
