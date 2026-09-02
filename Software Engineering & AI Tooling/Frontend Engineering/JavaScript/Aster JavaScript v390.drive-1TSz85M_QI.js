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
