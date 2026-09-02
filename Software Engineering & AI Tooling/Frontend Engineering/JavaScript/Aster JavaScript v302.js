/* Aster JavaScript v302 — authenticated buyer-safe derivative: bounded numeric clamping. Host state/dependencies are intentionally external. */
function clamp(n,a,b){ n=Number(n); if(!isFinite(n)) n=a; return Math.max(a, Math.min(b,n)); }
