function ensureMoodGrid(){
    const panel=getPanel();
    if(!panel) return;
    const root=panel.querySelector('.tool-control-panel')||panel.querySelector('.rt-sidepanel-inner')||panel;
    if(!root) return;

    // find insertion point (before intensity)
    const intensityRow=root.querySelector('#asterRelightIntensity')?.closest('.relight-block') || root.querySelector('.relight-block') || root;
    if(!intensityRow) return;

    let grid=document.getElementById('asterRelightMoodGrid');
    if(!grid){
      const wrap=document.createElement('div');
      wrap.className='relight-moods-wrap';
      wrap.style.marginTop='10px';
      wrap.innerHTML=`
        <div class="relight-title" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;">
          <div style="font-weight:700;">Mood</div>
          <div class="relight-mood-active" id="asterRelightMoodActive" style="opacity:.85;font-size:12px;">Cinematic</div>
        </div>
        <div class="relight-moods" id="asterRelightMoodGrid"></div>
      `;
      intensityRow.parentNode.insertBefore(wrap, intensityRow);
      grid=wrap.querySelector('#asterRelightMoodGrid');
    }

    // build buttons
    if(grid && !grid.dataset.built){
      grid.dataset.built='1';
      grid.style.display='grid';
      grid.style.gridTemplateColumns='repeat(3, minmax(0,1fr))';
      grid.style.gap='10px';

      const currentSrc=(getActiveImg()?.dataset?.origSrc||getActiveImg()?.dataset?.asterOrigSrc||getActiveImg()?.currentSrc||getActiveImg()?.src||'');

      MOODS.forEach((m,idx)=>{
        const b=document.createElement('button');
        b.type='button';
        b.className='relight-mood-btn';
        b.setAttribute('data-mood', m.key);
        b.style.position='relative';
        b.style.borderRadius='14px';
        b.style.overflow='hidden';
        b.style.border='1px solid rgba(255,255,255,.14)';
        b.style.background='rgba(255,255,255,.06)';
        b.style.padding='0';
        b.style.aspectRatio='1 / 1';
        b.style.cursor='pointer';
        b.style.transition='transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease';

        const thumb=document.createElement('div');
        thumb.className='relight-mood-thumb';
        thumb.style.position='absolute';
        thumb.style.inset='0';
        thumb.style.backgroundImage=currentSrc?`url("${currentSrc}")`:'';
        thumb.style.backgroundSize='cover';
        thumb.style.backgroundPosition='center';
        thumb.style.filter=presetFor(m.key).filter(3);
        thumb.style.opacity='0.95';
        b.appendChild(thumb);

        const scrim=document.createElement('div');
        scrim.style.position='absolute';
        scrim.style.inset='0';
        scrim.style.background=presetFor(m.key).overlay(3);
        scrim.style.opacity=String(clamp(presetFor(m.key).op(3),0,0.85));
        scrim.style.mixBlendMode='soft-light';
        b.appendChild(scrim);

        const label=document.createElement('div');
        label.textContent=m.short;
        label.style.position='absolute';
        label.style.left='10px';
        label.style.bottom='10px';
        label.style.right='10px';
        label.style.padding='6px 10px';
        label.style.borderRadius='999px';
        label.style.fontWeight='700';
        label.style.fontSize='12px';
        label.style.letterSpacing='0.2px';
        label.style.color='rgba(255,255,255,.95)';
        label.style.background='linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.55))';
        label.style.backdropFilter='blur(6px)';
        b.appendChild(label);

        b.addEventListener('mouseenter',()=>{b.style.transform='translateY(-1px) scale(1.01)';});
        b.addEventListener('mouseleave',()=>{b.style.transform='';});

        b.addEventListener('click',()=>{
          $$('#asterRelightMoodGrid button[data-mood]').forEach(x=>x.classList.remove('is-active'));
          b.classList.add('is-active');
          window.__asterRelightMood=m.key;
          const lvl=document.getElementById('asterRelightIntensity');
          const level=clamp(parseFloat(lvl?.value||window.__asterRelightLevel||3),1,6);
          window.__asterRelightLevel=level;
          const active=document.getElementById('asterRelightMoodActive');
          if(active) active.textContent=m.key;
          applyPreview(m.key, level);
        });

        if(idx===1) b.classList.add('is-active');
        grid.appendChild(b);
      });
    }
  }
