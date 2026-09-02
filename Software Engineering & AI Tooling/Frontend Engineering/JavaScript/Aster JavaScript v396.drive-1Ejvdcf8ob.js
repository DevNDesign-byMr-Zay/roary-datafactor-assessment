function setSidebarCollapsed(collapsed){
        leftSidebar.classList.toggle("collapsed",!!collapsed);
        localStorage.setItem("aster.sidebarCollapsed",collapsed?"1":"0");
        computeComposerOffset();
        sidebarToggle.setAttribute("aria-pressed",(!collapsed).toString());
      }
