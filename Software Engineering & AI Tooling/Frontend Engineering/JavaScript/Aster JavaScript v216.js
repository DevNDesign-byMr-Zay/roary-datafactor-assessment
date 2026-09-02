/* Aster JavaScript v216 — authenticated buyer-safe derivative: diagnostic panel renderer with escaped recent entries. Host state/dependencies are intentionally external. */
function renderDiag(){
    const box = $("#listDiag");
    box.innerHTML = `
      <div class="kv">
        <div class="k">CLI sanity check</div>
        <div class="mini">If you see: <code>Cannot bind argument to parameter 'Path' because it is null.</code> then <code>$img</code> / <code>$mask</code> were never set.</div>
      </div>
      <div class="kv" style="margin-top:10px">
        <div class="k">Recent</div>
        <div class="mini">${state.lastDiag.slice(0,18).map(x=>escapeHtml(x)).join("<br/>") || "—"}</div>
      </div>
    `;
  }
