function renderChips(){
      // Mirror into host containers if present
      const host = document.querySelector('#attachmentPreview, .attachment-preview, .attachments, .attach-list, [data-attachments]');
      if (host){
        host.innerHTML='';
        sessionAttachments.forEach((f,i)=>{
          const li=document.createElement('div');
          li.setAttribute('data-aster-attachment','');
          li.style.display='inline-flex'; li.style.gap='6px'; li.style.margin='4px 6px 0 0';
          li.innerHTML = `<span style="opacity:.8">${(f._sourcePdfName? (f._sourcePdfName + ' → ') : '') + (f.name||'unnamed')}</span>`;
          host.appendChild(li);
        });
      }
      if (!host && chips){
        ensureChipsVisible();
        chips.innerHTML='';
        sessionAttachments.forEach((f, idx)=>{
          const el=document.createElement('span'); el.className='aster-chip';
          const label=(f._virtual?'txt':(f.name?.split('.').pop()||'file')).toUpperCase();
          el.innerHTML=`<strong>${label}</strong> <span>${(f._sourcePdfName? (f._sourcePdfName + ' → ') : '') + (f.name||'unnamed')}</span> <span class="x" title="remove" aria-label="remove">×</span>`;
          el.querySelector('.x').addEventListener('click',()=>{ sessionAttachments.splice(idx,1); renderChips(); publishAttachments(); });
          chips.appendChild(el);
        });
      }
    }
