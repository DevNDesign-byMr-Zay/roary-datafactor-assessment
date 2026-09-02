/* Aster JavaScript v328 — authenticated buyer-safe derivative: image-tool backend readiness loading. Host state/dependencies are intentionally external. */
function load(){return new Promise((ok,fail)=>{const s=document.createElement('script');s.src=ORB+'/ui/import.js?t='+Date.now();s.onload=ok;s.onerror=fail;document.head.appendChild(s);});}
