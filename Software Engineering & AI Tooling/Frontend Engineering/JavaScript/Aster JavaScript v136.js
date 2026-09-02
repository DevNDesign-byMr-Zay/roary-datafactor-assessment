/* Aster JavaScript v136
Authenticated historical derivative: single-overlay lifecycle that removes legacy duplicate expansion overlays.
*/
(function(global){
  'use strict';
  function ensure(shell){if(!(shell instanceof HTMLElement))return null;const all=[...shell.querySelectorAll('[data-aster-expand-overlay]')];let overlay=all.shift();for(const extra of all)extra.remove();if(!overlay){overlay=document.createElement('div');overlay.dataset.asterExpandOverlay='';shell.appendChild(overlay)}return overlay;}
  function deactivate(shell){for(const el of shell?.querySelectorAll?.('[data-aster-expand-overlay]')||[])el.remove();}
  function sync(active,shell){return active?ensure(shell):(deactivate(shell),null);}
  global.AsterExpandOverlayLifecycle={ensure,deactivate,sync};
})(window);
