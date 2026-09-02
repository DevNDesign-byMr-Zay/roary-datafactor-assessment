/* Aster JavaScript v244 — authenticated buyer-safe derivative: active-tool chip rendering. Host state/dependencies are intentionally external. */
function renderToolChips(){
    const host = chipsHost();
    if (!host) return;
    host.innerHTML = "";

    const active = readActiveTools();
    active.forEach(t=>{
      const chip = document.createElement("div");
      chip.className = "tool-chip";
      chip.setAttribute("data-tool-key", t.key);
      chip.setAttribute("role", "group");

      const iconWrap = document.createElement("span");
      iconWrap.className = "tool-chip-icon";
      if (t.svg){
        try{
          // Ensure outlined icon
          t.svg.setAttribute("fill","none");
          t.svg.setAttribute("stroke","currentColor");
          iconWrap.appendChild(t.svg);
        }catch(_){ }
      }else{
        const dot = document.createElement("span");
        dot.textContent = (t.title || t.key || "•").slice(0,1).toUpperCase();
        dot.style.fontWeight="800";
        iconWrap.appendChild(dot);
      }
      chip.appendChild(iconWrap);

      const label = document.createElement("span");
      label.className = "tool-chip-label";
      label.textContent = t.title || t.key;
      chip.appendChild(label);

      const x = document.createElement("button");
      x.type = "button";
      x.className = "aster-attach-x";
      x.setAttribute("aria-label", `Remove ${label.textContent}`);
      x.textContent = "✕";
      x.addEventListener("click", (ev)=>{
        ev.preventDefault(); ev.stopPropagation();
        toggleToolByKey(t.key, false);
      });
      chip.appendChild(x);

      host.appendChild(chip);
    });
  }
