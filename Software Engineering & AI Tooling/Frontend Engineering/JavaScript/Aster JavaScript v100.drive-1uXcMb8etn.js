export function normalizeAsterMoodGrid(root, orderedMoods=[]){
  const grid=root?.querySelector?.('[data-aster-mood-grid]'); if(!grid)return null;
  const seen=new Set();
  [...grid.querySelectorAll('[data-aster-mood]')].forEach(tile=>{const key=String(tile.dataset.asterMood||'').toLowerCase(); if(!key||seen.has(key))tile.remove(); else seen.add(key)});
  if(orderedMoods.length){ const rank=new Map(orderedMoods.map((m,i)=>[String(m).toLowerCase(),i])); [...grid.children].sort((a,b)=>(rank.get((a.dataset.asterMood||'').toLowerCase())??999)-(rank.get((b.dataset.asterMood||'').toLowerCase())??999)).forEach(n=>grid.appendChild(n)); }
  grid.querySelectorAll('[data-aster-mood]').forEach(tile=>{tile.tabIndex=0;tile.setAttribute('role','button')}); return grid;
}
