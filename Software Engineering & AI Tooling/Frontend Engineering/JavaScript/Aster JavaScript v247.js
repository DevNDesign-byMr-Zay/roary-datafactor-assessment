/* Aster JavaScript v247 — authenticated buyer-safe derivative: outlined SVG icon cloning. Host state/dependencies are intentionally external. */
function cloneOutlinedIcon(btn){
    const svg = btn?.querySelector?.("svg");
    if(!svg) return null;
    const c = svg.cloneNode(true);
    try{
      c.setAttribute("fill","none");
      c.setAttribute("stroke","currentColor");
      c.querySelectorAll("*").forEach(el=>{
        if(!el || !el.setAttribute) return;
        el.setAttribute("fill","none");
        el.setAttribute("stroke","currentColor");
        // keep existing stroke-width if present; otherwise light
        if(!el.getAttribute("stroke-width")) el.setAttribute("stroke-width","1.7");
      });
    }catch(_){}
    return c;
  }
