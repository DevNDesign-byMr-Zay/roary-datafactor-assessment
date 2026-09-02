/* Aster JavaScript v248 — authenticated buyer-safe derivative: bounded composer auto-grow behavior. Host state/dependencies are intentionally external. */
function applyAutoGrow(inputEl, shellEl){
    if(!inputEl || !shellEl) return;
    // grow up to ~4 lines, then allow textarea scroll
    const MAX_H = 140; // px
    inputEl.style.height = 'auto';
    const h = Math.min(MAX_H, inputEl.scrollHeight || 0);
    // keep at least one-line height
    inputEl.style.height = Math.max(44, h) + 'px';
    try { shellEl.style.setProperty('--aster-ta-h', inputEl.style.height); } catch(_) {}
    const needsScroll = (inputEl.scrollHeight || 0) > MAX_H;
    inputEl.style.overflowY = needsScroll ? 'auto' : 'hidden';

    // multiline state class (newline OR wraps to > 1 line)
    const isMulti = (inputEl.value && inputEl.value.indexOf('\n') >= 0) || ((inputEl.scrollHeight || 0) > 44);
    shellEl.classList.toggle('composer--is-multiline', !!isMulti);
  }
