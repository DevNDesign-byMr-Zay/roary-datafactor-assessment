function renderMediaList(){
    const box = $("#listMedia");
    box.innerHTML = "";
    if(!state.media.length){
      box.innerHTML = `<div class="mini" style="padding:14px;color:var(--muted)">No media yet. Attach an image or generate a result to populate the library.</div>`;
      return;
    }
    for(const it of state.media){
      const row = document.createElement("div");
      row.className = "row";
      const u = mediaURL(it.id);
      row.innerHTML = `
        <div class="dot" style="opacity:.55"></div>
        <div class="meta">
          <div class="name">${escapeHtml(it.title||"Image")}</div>
          <div class="sub">${new Date(it.ts||Date.now()).toLocaleString()}</div>
        </div>
      `;
      row.onclick = ()=>{
        state.selectedMediaId = it.id;
        openEditor(it.id);
      };
      box.appendChild(row);
    }
  }
