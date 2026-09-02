/* Aster JavaScript v127
Authenticated historical derivative: load a backend-served UI compatibility module from the locked local service.
*/
(function(global){
  'use strict';
  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;
  function load(options={}){const base=String(options.baseUrl||global.__asterToolBackendBase||'http://127.0.0.1:5151').replace(/\/+$/,'');if(!LOCAL_5151.test(base+'/'))return Promise.reject(new Error('UI module backend must use localhost port 5151'));return new Promise((resolve,reject)=>{const s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src=`${base}/ui/import.js`;s.onload=()=>resolve(true);s.onerror=()=>reject(new Error('UI compatibility module failed to load'));document.head.appendChild(s);});}
  global.AsterUiImportLoader={load};
})(window);
