/* Aster JavaScript v217 — authenticated buyer-safe derivative: media-library row renderer with selection handling. Host state/dependencies are intentionally external. */
function renderMediaList(){
    const box = $("#listMedia"); box.innerHTML="";
    if(!state.media.length){
      box.innerHTML = `<div class="mini" style="padding:14px;color:var(--muted)">No media yet. Attach an image.</div>`;
      return;
    }
    for(const it of state.media){
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `
        <div class="dot" style="opacity:.55"></div>
        <div class="meta">
          <div class="name">${escapeHtml(it.title||"Image")}</div>
          <div class="sub">${new Date(it.ts||Date.now()).toLocaleString()}</div>
        </div>`;
      row.onclick = ()=>{ state.selectedMediaId = it.id; openEditor(it.id); };
      box.appendChild(row);
    }
  }
