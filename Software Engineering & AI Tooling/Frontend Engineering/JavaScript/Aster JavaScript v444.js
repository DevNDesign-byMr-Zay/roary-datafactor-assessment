function getActiveTool(){
    const p = id("rtSidePanel");
    const t = (p && (p.dataset.tool || p.getAttribute("data-tool"))) || "";
    return String(t||"").toLowerCase();
  }
