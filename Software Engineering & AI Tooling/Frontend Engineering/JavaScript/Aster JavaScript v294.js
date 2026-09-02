/* Aster JavaScript v294 — authenticated buyer-safe derivative: relight preset selection retrieval. Host state/dependencies are intentionally external. */
function getRelightSelection(){
    const grid=document.getElementById('rtRelightMoodGrid');
    const slider=document.getElementById('rtRelightIntensity');
    if(!grid||!slider) return null;
    const active=grid.querySelector('.rtRelightMood.active') || grid.querySelector('.rtRelightMood[aria-selected="true"]');
    const mood=(active && (active.getAttribute('data-mood')||active.dataset?.mood)) || 'Neutral';
    const intensity=parseFloat(slider.value||'5')||5;
    return {mood,intensity};
  }
