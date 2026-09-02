/* Aster JavaScript v250 — authenticated buyer-safe derivative: download menu media-format option injection. Host state/dependencies are intentionally external. */
function ensureMediaOpts(){
    if(menu.querySelector('.rt-media-opt')) return;

    const sep = document.createElement('div');
    sep.className='rt-media-sep';
    sep.style.height='1px';
    sep.style.margin='8px 0';
    sep.style.background='rgba(245,240,255,.12)';
    sep.style.opacity='0.55';

    const makeOpt = (key, title, sub, icoSvg) => {
      const opt = document.createElement('div');
      opt.className='rt-model-opt rt-media-opt';
      opt.setAttribute('role','menuitem');
      opt.tabIndex = 0;
      opt.dataset.rtMedia = key;
      opt.innerHTML = `
        <span class="rt-model-opt-ico" aria-hidden="true">${icoSvg}</span>
        <div class="rt-model-opt-txt">
          <div class="rt-model-opt-title">${title}</div>
          <div class="rt-model-opt-sub">${sub}</div>
        </div>`;
      return opt;
    };

    const icoImg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5-5-4 4-2-2-5 5"/></svg>`;
    const icoVid = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 10l4-2v8l-4-2z"/></svg>`;

    const optImages = makeOpt('images','IMAGES','Browse generated images', icoImg);
    const optVideos = makeOpt('videos','VIDEOS','Browse generated videos', icoVid);

    menu.appendChild(sep);
    menu.appendChild(optImages);
    menu.appendChild(optVideos);
  }
