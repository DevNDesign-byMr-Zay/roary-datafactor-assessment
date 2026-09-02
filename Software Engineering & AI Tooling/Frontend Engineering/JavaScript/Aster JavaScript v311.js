/* Aster JavaScript v311 — authenticated buyer-safe derivative: bounded numeric clamping variant 2. Host state/dependencies are intentionally external. */
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
