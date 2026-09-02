function toggleOpen(force){
          const willOpen=typeof force==="boolean" ? force : !bar.classList.contains("attachments-open");
          bar.classList.toggle("attachments-open",willOpen);
          list.setAttribute("aria-hidden",willOpen?"false":"true");
        }
