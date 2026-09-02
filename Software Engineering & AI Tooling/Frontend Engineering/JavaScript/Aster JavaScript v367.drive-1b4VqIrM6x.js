function mountMediaGallery(chatInnerEl, afterMsgEl, media, query){
        if(!chatInnerEl) return;
        const images = Array.isArray(media?.images) ? media.images : [];
        const videos = Array.isArray(media?.videos) ? media.videos : [];
        if(!images.length && !videos.length) return;

        const wrap = document.createElement("div");
        wrap.className = "image-gallery";
        wrap.setAttribute("role","region");
        wrap.setAttribute("aria-label","Media references");

        const head = document.createElement("div");
        head.className = "image-gallery-head";
        head.setAttribute("role","button");
        head.setAttribute("tabindex","0");

        const titleSpan = document.createElement("span");
        titleSpan.className = "title";
        titleSpan.textContent = "Media references";
        head.appendChild(titleSpan);

        if(query){
          const subtitle = document.createElement("span");
          subtitle.className = "subtitle";
          subtitle.textContent = `for “${query.slice(0,80)}”`;
          head.appendChild(subtitle);
        }

        const caret = document.createElement("span");
        caret.className = "images-caret";
        caret.textContent = "▾";
        head.appendChild(caret);

        wrap.appendChild(head);

        const grid = document.createElement("div");
        grid.className = "image-gallery-grid";

        // Images
        images.forEach(img => {
          const card = document.createElement("a");
          card.className = "image-card";

          const targetUrl = img.page_url || img.src || img.thumbnail;
          if(targetUrl){
            card.href = targetUrl;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
          } else {
            card.href = "#";
          }

          const inner = document.createElement("div");
          inner.className = "image-card-inner";

          const im = document.createElement("img");
          const thumb = img.thumbnail || img.src;
          if(!thumb) return;
          im.src = thumb;
          im.alt = img.title || img.source || "Image result";
          inner.appendChild(im);

          const overlay = document.createElement("div");
          overlay.className = "image-card-overlay";

          const t = document.createElement("span");
          t.className = "image-card-title";
          t.textContent = (img.title || "").slice(0,80) || "Image";

          const srcHostRaw = (img.source || "").toString();
          const srcHost = srcHostRaw.replace(/^https?:\/\//,"");
          const s = document.createElement("span");
          s.className = "image-card-source";
          s.textContent = srcHost || "";

          overlay.appendChild(t);
          if(srcHost) overlay.appendChild(s);

          inner.appendChild(overlay);
          card.appendChild(inner);
          grid.appendChild(card);
        });

        // Videos
        videos.forEach(v => {
          const card = document.createElement("a");
          card.className = "image-card";

          const targetUrl = v.page_url || v.url || v.watch_url || v.src;
          if(targetUrl){
            card.href = targetUrl;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
          } else {
            card.href = "#";
          }

          const inner = document.createElement("div");
          inner.className = "image-card-inner";

          const im = document.createElement("img");
          const thumb = v.thumbnail || v.preview || v.image;
          if(!thumb) return;
          im.src = thumb;
          im.alt = v.title || v.source || "Video result";
          inner.appendChild(im);

          const overlay = document.createElement("div");
          overlay.className = "image-card-overlay";

          const t = document.createElement("span");
          t.className = "image-card-title";
          t.textContent = (v.title || "").slice(0,80) || "Video";

          const infoLine = document.createElement("span");
          infoLine.className = "image-card-source";
          const parts = [];
          if(v.channel) parts.push(v.channel);
          const srcHostRaw = (v.source || v.platform || "").toString();
          const srcHost = srcHostRaw.replace(/^https?:\/\//,"");
          if(srcHost) parts.push(srcHost);
          if(v.duration) parts.push(v.duration);
          infoLine.textContent = parts.join(" • ");

          overlay.appendChild(t);
          if(infoLine.textContent) overlay.appendChild(infoLine);

          const badge = document.createElement("span");
          badge.style.cssText = "position:absolute;top:6px;right:6px;font-size:10px;padding:2px 6px;border-radius:999px;background:rgba(0,0,0,.75);color:#fff;border:1px solid rgba(255,255,255,.35);";
          badge.textContent = "Video";
          inner.appendChild(badge);

          card.appendChild(inner);
          grid.appendChild(card);
        });

        wrap.appendChild(grid);

        function toggleOpen(force){
          const willOpen = typeof force === "boolean"
            ? force
            : !wrap.classList.contains("images-open");
          wrap.classList.toggle("images-open", willOpen);
        }

        head.addEventListener("click", ()=>toggleOpen());
        head.addEventListener("keydown", e=>{
          if(e.key === "Enter" || e.key === " "){
            e.preventDefault();
            toggleOpen();
          }
        });

        if(afterMsgEl && afterMsgEl.parentElement === chatInnerEl){
          chatInnerEl.insertBefore(wrap, afterMsgEl.nextSibling);
        } else {
          chatInnerEl.appendChild(wrap);
        }

        const sc = chatInnerEl.parentElement;
        if(sc) sc.scrollTop = sc.scrollHeight;

        return wrap;
      }
