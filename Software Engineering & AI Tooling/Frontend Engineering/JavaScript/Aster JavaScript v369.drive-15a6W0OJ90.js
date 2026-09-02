function buildFloatSelect(mount,name){
        if(!mount) return {setLabel:()=>{},closeMenu:()=>{},renderMenu:()=>{}};
        mount.innerHTML = `
          <button class="fs-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
            <span class="fs-label"></span>
            <span class="fs-caret">▾</span>
          </button>
          <div class="fs-menu" role="listbox"></div>
        `;
        const btn = mount.querySelector(".fs-btn");
        const menu = mount.querySelector(".fs-menu");
        const label = mount.querySelector(".fs-label");

        function renderMenu(){
          menu.innerHTML = "";
          MODEL_OPTS.forEach(opt=>{
            const div = document.createElement("div");
            div.className="fs-opt";
            div.setAttribute("role","option");
            div.dataset.value=opt.value;
            div.innerHTML = `<div>${opt.label}</div><small>${opt.hint}</small>`;
            div.addEventListener("click",()=>{setModel(opt.value);closeMenu();});
            menu.appendChild(div);
          });
        }

        let portaled=false;
        function positionMenu(){
          const rect = btn.getBoundingClientRect();
          menu.style.position="fixed";
          menu.style.left=rect.left+"px";
          menu.style.top=(rect.bottom+8)+"px";
          menu.style.minWidth=Math.max(260,rect.width)+"px";
        }
        function portalOpen(){
          if(portaled) return;
          renderMenu();
          positionMenu();
          document.body.appendChild(menu);
          portaled=true;
          requestAnimationFrame(()=>menu.classList.add("open"));
        }
        function portalClose(){
          if(!portaled) return;
          menu.classList.remove("open");
          setTimeout(()=>{
            mount.appendChild(menu);
            menu.removeAttribute("style");
            portaled=false;
          },180);
        }

        function openMenu(){
          btn.setAttribute("aria-expanded","true");
          document.addEventListener("click", outside, {capture:true});
          document.addEventListener("keydown", onKey);
          window.addEventListener("resize", positionMenu);
          portalOpen();
        }
        function closeMenu(){
          btn.setAttribute("aria-expanded","false");
          document.removeEventListener("click", outside, {capture:true});
          document.removeEventListener("keydown", onKey);
          window.removeEventListener("resize", positionMenu);
          portalClose();
        }
        function onKey(e){if(e.key==="Escape")closeMenu();}
        function outside(e){
          if(e.target===btn || btn.contains(e.target))return;
          if(menu.contains(e.target))return;
          closeMenu();
        }

        btn.addEventListener("click", e=>{
          e.stopPropagation();
          if(menu.classList.contains("open")) closeMenu();
          else openMenu();
        });

        mount.setLabel = (val)=>{
          const opt = MODEL_OPTS.find(o=>o.value===val) || MODEL_OPTS[0];
          label.textContent = `${opt.label} — ${opt.hint}`;
        };
        mount.closeMenu = closeMenu;
        mount.renderMenu = renderMenu;
        mount.setAttribute("data-name",name);
        mount.setLabel(currentModel);
        return mount;
      }
