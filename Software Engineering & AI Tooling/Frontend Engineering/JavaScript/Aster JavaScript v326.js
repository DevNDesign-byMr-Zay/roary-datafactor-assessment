/* Aster JavaScript v326 — authenticated buyer-safe derivative: control-surface UI bootstrap. Host state/dependencies are intentionally external. */
function ensureUI(){
    const sp=document.getElementById('rtSidePanel');
    if(!sp) return;
    if(String(sp.getAttribute('data-tool')||'')!=='enhance') return;

    // hide the raw Steps slider control, keep it for state
    const stepsEl=sp.querySelector('#asterEnhanceSteps');
    const stepsControl=stepsEl?stepsEl.closest('.rtp-control'):null;
    if(stepsControl) stepsControl.style.display='none';

    // inject preset control once
    if(sp.querySelector('[data-aster="depthpop-quality"]')) return;

    const controls=sp.querySelector('.rtp-controls')||sp;
    const wrap=document.createElement('div');
    wrap.className='rtp-control';
    wrap.setAttribute('data-aster','depthpop-quality');
    wrap.innerHTML=`
      <label title="Render Quality maps to speed vs detail behind the scenes.">Render Quality</label>
      <div class="rtp-quality-row">
        <div class="rtp-quality-btns">
          ${PRESETS.map(p=>`<button type="button" class="rtp-qbtn" data-preset="${p.id}">${p.label}</button>`).join('')}
        </div>
        <div class="rtp-qmeta" data-aster="depthpop-quality-meta">steps</div>
      </div>
    `;
    // Insert near the bottom to keep layout compact
    controls.appendChild(wrap);

    wrap.querySelectorAll('.rtp-qbtn').forEach(btn=>{
      btn.addEventListener('click',()=>setPreset(btn.dataset.preset, sp));
    });

    // init from stored / current steps
    let presetId=null;
    try{ presetId=localStorage.getItem('__asterDepthPopQuality'); }catch(e){}
    if(!presetId) presetId=stepsToPreset(stepsEl?stepsEl.value:22);
    setPreset(presetId, sp);
  }
