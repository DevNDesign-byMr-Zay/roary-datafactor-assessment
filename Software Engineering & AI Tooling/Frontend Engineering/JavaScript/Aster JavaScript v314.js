/* Aster JavaScript v314 — authenticated buyer-safe derivative: layout and control-state synchronization. Host state/dependencies are intentionally external. */
function sync(shell, ta){
    if(!shell || !ta) return;
    const composer = ta.closest('.composer');
    if(!composer) return;
    if(composer.classList.contains('composer--has-attachments')) return;

    const val = ta.value || '';
    const hasNL = val.indexOf('\n') >= 0;
    const rectH = (ta.getBoundingClientRect && ta.getBoundingClientRect().height) || 44;
    const scrollH = ta.scrollHeight || 0;

    // "multiline" = explicit newline OR wrapped to > 1 line / grown taller
    const multi = hasNL || (scrollH > 60) || (rectH > 46 && val.trim().length > 0);

    try{ shell.classList.toggle('composer--is-multiline', !!multi); }catch(_){ }

    if(!multi){
      // Hard lock to one clean line (prevents "placeholder drifting" from inherited padding)
      try{ ta.style.height = '44px'; }catch(_){ }
      try{ shell.style.setProperty('--aster-ta-h','44px'); }catch(_){ }

      const cs = getComputedStyle(ta);
      let lh = parseFloat(cs.lineHeight);
      if(!isFinite(lh) || lh <= 0) lh = 20;

      const H = 44;
      const padT = Math.max(0, Math.round((H - lh) / 2));
      const padB = Math.max(0, H - lh - padT);

      // Drive the !important CSS via vars so it always wins cleanly
      root.style.setProperty('--aster-one-line-lh', lh + 'px');
      root.style.setProperty('--aster-one-pad-top', padT + 'px');
      root.style.setProperty('--aster-one-pad-bottom', padB + 'px');
    } else {
      // Defensive: ensure it grows cleanly even if other patches fight for height
      try{
        const MAX_H = 140;
        ta.style.height = 'auto';
        const sh = ta.scrollHeight || 0;
        const h = Math.min(MAX_H, sh);
        ta.style.height = Math.max(44, h) + 'px';
        shell.style.setProperty('--aster-ta-h', ta.style.height);
        const needsScroll = sh > MAX_H;
        ta.style.overflowY = needsScroll ? 'auto' : 'hidden';
      }catch(_){ }
    }
  }
