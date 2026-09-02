/* Aster JavaScript v141
Authenticated historical derivative: active-image cache busting and fade-safe replacement after tool execution.
*/
(function(global){
  'use strict';
  function cacheBust(url){if(!/^https?:/i.test(String(url||'')))return url;const u=new URL(url,location.href);u.searchParams.set('_aster_t',Date.now().toString(36));return u.toString();}
  async function replace(image,url,options={}){if(!(image instanceof HTMLImageElement))throw new TypeError('image required');const next=/^https?:/i.test(url)?cacheBust(url):url;await new Promise((resolve,reject)=>{const probe=new Image();probe.onload=resolve;probe.onerror=reject;probe.src=next});image.style.transition=`opacity ${Math.max(0,Number(options.fadeMs)||160)}ms ease`;image.style.opacity='0';requestAnimationFrame(()=>{image.src=next;image.onload=()=>{image.style.opacity='1';image.onload=null}});return next;}
  global.AsterImageReplace={cacheBust,replace};
})(window);
