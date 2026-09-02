/* Aster JavaScript v267 — authenticated buyer-safe derivative: relight mood-tile style injection. Host state/dependencies are intentionally external. */
function ensureRelightMoodTileStyle(){
    if(document.getElementById('rtRelightMoodTileFxStyle')) return;
    const st=document.createElement('style');
    st.id='rtRelightMoodTileFxStyle';
    st.textContent = `
      .rt-relight-thumb{ position:relative; overflow:hidden; border-radius:14px; }
      .rt-relight-thumb-img{ position:absolute; inset:0; z-index:0; background-size:cover; background-position:center; transform:scale(1.02); }
      .rt-relight-thumb-fx{ position:absolute; inset:0; z-index:1; pointer-events:none; mix-blend-mode:soft-light; transition:opacity 120ms ease, background 120ms ease; }
      .rt-relight-thumb > :not(.rt-relight-thumb-img):not(.rt-relight-thumb-fx){ position:relative; z-index:2; }
    `;
    document.head.appendChild(st);
  }
