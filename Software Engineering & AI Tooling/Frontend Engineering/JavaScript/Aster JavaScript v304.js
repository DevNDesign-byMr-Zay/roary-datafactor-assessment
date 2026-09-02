/* Aster JavaScript v304 — authenticated buyer-safe derivative: relight mood-grid construction. Host state/dependencies are intentionally external. */
function ensureMoodGrid(){
    const panel=getPanel();
    if(!panel) return;

    const baseOrder = ['Neutral','Cinematic','Studio','Neon','Sunset','Dawn'];

    // If the native panel provides a mood grid (preferred), use it and prevent duplicate UI.
    const nativeGrid = panel.querySelector('.rtp-mood-grid');
    if(nativeGrid){
      // Remove any injected duplicate mood UI from earlier versions
      panel.querySelectorAll('.relight-moods-wrap').forEach(w=>w.remove());

      // Ensure compatibility with code that expects #asterRelightMoodGrid
      if(nativeGrid.id!=='asterRelightMoodGrid') nativeGrid.id='asterRelightMoodGrid';

      // Deduplicate + decide whether extra presets exist
      const allTiles = Array.from(nativeGrid.children);
      const keep=[];
      const seen=new Set();
      let hasNonBase=false;

      const getName=(el)=>{
        const a=(el.getAttribute('data-mood')||el.dataset?.mood||'').trim();
        if(a) return a;
        const sp=el.querySelector && el.querySelector('span');
        const t=(sp?sp.textContent:el.textContent)||'';
        return String(t).trim();
      };

      allTiles.forEach(el=>{
        const nm=getName(el);
        if(nm && !baseOrder.includes(nm)) hasNonBase=true;
      });

      // Keep exactly one tile per base mood (in base order) unless we detect real extra presets
      if(!hasNonBase){
        // strip duplicates / unknowns
        baseOrder.forEach(nm=>{
          const found = allTiles.find(el=>getName(el)===nm);
          if(found) keep.push(found);
        });
        // If we couldn't find names (some templates hide labels), just keep first 6
        if(keep.length===0) keep.push(...allTiles.slice(0,6));

        // Remove everything, then append back the kept tiles to preserve layout
        nativeGrid.innerHTML='';
        keep.forEach(el=>nativeGrid.appendChild(el));

        // Disable scrolling (no need)
        nativeGrid.style.overflowY='hidden';
        nativeGrid.style.maxHeight='';
      } else {
        // There are additional presets: enable scrolling so the panel stays clean
        nativeGrid.style.overflowY='auto';
        nativeGrid.style.maxHeight='170px';
        nativeGrid.style.paddingRight='6px';
      }

      // Ensure each tile is clickable and carries data-mood
      // If tiles aren't buttons, wrap behavior with pointer styles.
      const tiles = Array.from(nativeGrid.children);
      tiles.forEach(el=>{
        const nm=getName(el);
        if(nm) el.setAttribute('data-mood', nm);
        el.style.cursor='pointer';
        el.addEventListener('click',()=>{
          tiles.forEach(x=>x.classList.remove('is-active'));
          el.classList.add('is-active');
          window.__asterRelightMood = nm || window.__asterRelightMood || 'Cinematic';
          const active=document.getElementById('asterRelightMoodActive') || panel.querySelector('#rtpRelightMoodVal');
          if(active) active.textContent = window.__asterRelightMood;
          const lvl=document.getElementById('asterRelightIntensity');
          const level=clamp(parseFloat(lvl?.value||window.__asterRelightLevel||3),1,6);
          window.__asterRelightLevel=level;
          try{ window.__asterApplyICLightPreset && window.__asterApplyICLightPreset(window.__asterRelightMood, level); }catch(e){}
          applyPreview(window.__asterRelightMood, level);
        }, {passive:true});
      });

      // Default active
      if(!tiles.some(t=>t.classList.contains('is-active'))){
        const def = tiles.find(t=>getName(t)==='Cinematic') || tiles[1] || tiles[0];
        if(def) def.classList.add('is-active');
        window.__asterRelightMood='Cinematic';
      }

      // Ensure thumbs use the active image for visual previews
      const i=getActiveImg();
      const src=i && (i.dataset?.origSrc || i.currentSrc || i.src) || '';
      if(src){
        tiles.forEach(el=>{
          // common template: .rtp-mood-preview is the tile itself, or has a nested box.
          const box = el.querySelector && (el.querySelector('.rtp-mood-preview') || el.querySelector('.rtp-mood-thumb') || el);
          if(box && (!box.style.backgroundImage || box.style.backgroundImage==='none')){
            box.style.backgroundImage = `url(${src})`;
            box.style.backgroundSize='cover';
            box.style.backgroundPosition='center';
          }
        });
      }

      return;
    }

    // Fallback: inject a compact mood grid if the native one isn't present
    let grid=document.getElementById('asterRelightMoodGrid');
    if(!grid){
      const root=panel.querySelector('.tool-control-panel')||panel.querySelector('.rt-sidepanel-inner')||panel;
      const intensityRow=root.querySelector('.relight-intensity-row')||root.querySelector('#asterRelightIntensity')?.closest('.rtp-control')||root.querySelector('.rtp-control');
      const wrap=document.createElement('div');
      wrap.className='relight-moods-wrap';
      wrap.setAttribute('data-aster-injected','1');
      wrap.innerHTML=`
        <div class="relight-moods-head">
          <div class="relight-moods-label">Mood</div>
          <div class="relight-moods-active" id="asterRelightMoodActive">Cinematic</div>
        </div>
        <div class="relight-moods" id="asterRelightMoodGrid"></div>
      `;
      intensityRow?.parentNode?.insertBefore(wrap, intensityRow);
      grid=document.getElementById('asterRelightMoodGrid');
    }

    if(grid && !grid.dataset.built){
      grid.dataset.built='1';
      grid.innerHTML='';
      const MOODS=[
        {key:'Neutral',  label:'Neutral',  profile:[1.00,1.00,1.00,0.00,0]},
        {key:'Cinematic',label:'Cinem…',   profile:[0.98,1.10,0.96,0.06,-8]},
        {key:'Studio',   label:'Studio',   profile:[1.06,1.08,1.02,0.00,0]},
        {key:'Neon',     label:'Neon',     profile:[1.00,1.12,1.18,0.02,10]},
        {key:'Sunset',   label:'Sunset',   profile:[1.02,1.07,1.10,0.18,-22]},
        {key:'Dawn',     label:'Dawn',     profile:[1.01,1.08,0.98,0.10,20]},
      ];

      const img=getActiveImg();
      const src=img && (img.dataset?.origSrc || img.currentSrc || img.src) || '';

      MOODS.forEach((m, idx)=>{
        const b=document.createElement('button');
        b.type='button';
        b.className='relight-mood-btn';
        b.setAttribute('data-mood', m.key);

        const thumb=document.createElement('div');
        thumb.className='relight-mood-thumb';
        thumb.style.backgroundImage = src ? `url(${src})` : 'none';
        const name=document.createElement('span');
        name.textContent=m.label;
        thumb.appendChild(name);
        b.appendChild(thumb);

        b.addEventListener('click',()=>{
          $$('#asterRelightMoodGrid [data-mood]').forEach(x=>x.classList.remove('is-active'));
          b.classList.add('is-active');
          window.__asterRelightMood=m.key;
          const lvl=document.getElementById('asterRelightIntensity');
          const level=clamp(parseFloat(lvl?.value||window.__asterRelightLevel||3),1,6);
          window.__asterRelightLevel=level;
          const active=document.getElementById('asterRelightMoodActive');
          if(active) active.textContent=m.key;
          try{ window.__asterApplyICLightPreset && window.__asterApplyICLightPreset(m.key, level); }catch(e){}
          applyPreview(m.key, level);
        });

        if(idx===1) b.classList.add('is-active');
        grid.appendChild(b);
      });
    }
  }
