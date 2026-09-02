function wireExistingAttachButtons(){
      const nodes = Array.from(document.querySelectorAll('button, .btn, [role=button], [data-action], [aria-label]')).filter(el=>{
        const t=(el.textContent||'').toLowerCase();
        const a=(el.getAttribute('aria-label')||'').toLowerCase();
        const d=(el.dataset.action||'').toLowerCase();
        const cl=(el.className||'').toLowerCase();
        return /attach|upload|paperclip|file/.test(t+a+d+cl);
      });
      nodes.forEach(btn=>{ if (btn.dataset.asterWired) return; btn.addEventListener('click', ()=> setTimeout(()=>fileInput?.click(),0)); btn.dataset.asterWired='1'; });
    }
