function augmentAttachmentChips(){
    if (!attachmentsRow) return;
    const chips = attachmentsRow.querySelectorAll('.chip');
    chips.forEach((chip, idx)=>{
      const att = SA[idx]; if(!att) return;
      ensureFields(att);
      let status = chip.querySelector('.att-status');
      if(!status){
        status = document.createElement('div');
        status.className = 'att-status';
        status.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:11px;color:#bfc7d9;margin-top:6px';
        const barWrap = document.createElement('div');
        barWrap.style.cssText = 'width:110px;height:6px;border-radius:6px;background:#1c2230;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)';
        const bar = document.createElement('span');
        bar.className = 'att-bar';
        bar.style.cssText = 'display:block;height:100%;width:0%;background:linear-gradient(90deg,#6f86ff,#a0b3ff);transition:width .25s ease';
        barWrap.appendChild(bar);
        const label = document.createElement('span');
        label.className = 'att-label';
        label.textContent = att._progress>=100 ? 'Ready' : `Processing… ${att._progress}%`;
        status.appendChild(barWrap); status.appendChild(label);
        chip.appendChild(status);
      }
      const barEl = status.querySelector('.att-bar');
      const labEl = status.querySelector('.att-label');
      barEl.style.width = Math.max(0,Math.min(100,Math.round(att._progress||0))) + '%';
      labEl.textContent = att._progress>=100 ? 'Ready' : `Processing… ${Math.round(att._progress||0)}%`;

      // Add download .txt if available
      if (att.text && !chip.querySelector('a.att-dl')){
        const a = document.createElement('a');
        a.className = 'att-dl';
        const blob = new Blob([att.text], {type:'text/plain'});
        a.href = URL.createObjectURL(blob);
        const txtName = (/\.txt$/i.test(att.name) ? att.name : att.name.replace(/\.[^.]+$/, '') + '.txt');
        a.download = txtName;
        a.textContent = '↓ .txt';
        a.style.cssText = 'margin-left:8px;color:#d6e5ff;text-decoration:none;font-size:12px';
        a.onmouseenter = ()=> a.style.textDecoration='underline';
        a.onmouseleave = ()=> a.style.textDecoration='none';
        status.appendChild(a);
      }
    });
  }
