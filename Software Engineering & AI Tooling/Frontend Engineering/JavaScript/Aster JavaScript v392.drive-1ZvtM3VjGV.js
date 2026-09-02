function setSettingsOpen(open){
        settingsPanel.classList.toggle("open",!!open);
        overlay.classList.toggle("show",!!open);
        const aria = open ? "false" : "true";
        settingsPanel.setAttribute("aria-hidden",aria);
        overlay.setAttribute("aria-hidden",aria);
        openSettingsBtn.setAttribute("aria-expanded", (!!open).toString());
      }
