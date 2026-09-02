/* Aster JavaScript v322 — authenticated buyer-safe derivative: feature bootstrap and event binding. Host state/dependencies are intentionally external. */
function init(){
    moveSlotNextToLogo();

    const slot = document.getElementById('rtTopbarModelSlot');
    const btn  = document.getElementById('rtTopbarModelBtn');
    const menu = document.getElementById('rtTopbarModelMenu');
    const btnText = document.getElementById('rtTopbarModelBtnText');
    if(!slot || !btn || !menu || !btnText) return;
    try{ slot.style.display='inline-flex'; slot.style.opacity='1'; slot.style.pointerEvents='auto'; slot.setAttribute('aria-hidden','false'); }catch(_){ }

    const opts = Array.from(menu.querySelectorAll('.rt-model-opt'));

    // Ensure data-model maps to app keys
    opts.forEach(o=>{
      const mode = String(o.getAttribute('data-mode')||'').toLowerCase();
      o.setAttribute('data-model', mode === 'advanced' ? ADV_KEY : FAST_KEY);
    });

    function syncUI(){
      const m = deriveMode() === 'advanced' ? 'advanced' : 'instant';
      btnText.textContent = (m === 'advanced') ? 'ADVANCED' : 'FAST';
      opts.forEach(o=>{
        const isAdv = (String(o.getAttribute('data-mode')||'').toLowerCase() === 'advanced');
        o.classList.toggle('is-selected', (m === 'advanced') ? isAdv : !isAdv);
      });
    }

    function open(){
      slot.classList.add('open');
      btn.setAttribute('aria-expanded','true');
      try{ menu.setAttribute('aria-hidden','false'); }catch(_){ }
    }
    function close(){
      slot.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      try{ menu.setAttribute('aria-hidden','true'); }catch(_){ }
    }
    function toggle(){
      if(slot.classList.contains('open')) close(); else open();
    }

    // Click to toggle (stable)
    btn.addEventListener('click', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
      toggle();
    }, true);

    // Capture pointerdown so "click-outside" handlers can't eat the selection
    menu.addEventListener('pointerdown', function(ev){
      const t = ev.target;
      if(!t) return;
      const opt = t.closest('.rt-model-opt');
      if(!opt) return;
      ev.preventDefault();
      ev.stopPropagation();
      if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();

      const chosenMode = (String(opt.getAttribute('data-mode')||'').toLowerCase() === 'advanced') ? 'advanced' : 'instant';
      forceSet(chosenMode);
      syncUI();
      close();
    }, true);

    // Close on outside click (capture)
    document.addEventListener('pointerdown', function(ev){
      if(!slot.contains(ev.target)) close();
    }, true);

    // Close on Escape
    document.addEventListener('keydown', function(ev){
      if(ev.key === 'Escape') close();
    }, true);

    // Initial state
    syncUI();
  }
