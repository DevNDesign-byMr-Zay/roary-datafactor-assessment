export function normalizeAsterMoodGrid(root, {selector='[data-aster-mood]', allowed=[]}={}){
  if(!root) return [];
  const seen=new Set(), keep=[]; const allow=new Set(allowed.map(String));
  root.querySelectorAll(selector).forEach(el=>{
    const key=String(el.getAttribute('data-aster-mood')||el.textContent||'').trim();
    if(!key || seen.has(key) || (allow.size && !allow.has(key))) return el.remove();
    seen.add(key); keep.push(el); el.setAttribute('data-aster-mood',key); el.tabIndex=0;
  });
  return keep;
}
