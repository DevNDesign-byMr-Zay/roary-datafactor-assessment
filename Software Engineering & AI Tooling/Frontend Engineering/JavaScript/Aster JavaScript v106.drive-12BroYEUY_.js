export function setAsterQuickActionAvailability(root,enabled){
  if(!root)return; root.querySelectorAll('[data-aster-quick-action]').forEach(el=>{el.hidden=!enabled;el.toggleAttribute('aria-hidden',!enabled);if('disabled'in el)el.disabled=!enabled});
  root.dataset.asterQuickActions=enabled?'enabled':'disabled';
}
