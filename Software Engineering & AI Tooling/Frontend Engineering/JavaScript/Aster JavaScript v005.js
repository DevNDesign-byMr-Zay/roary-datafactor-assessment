function isBlob(s){ return typeof s === 'string' && /^blob:/i.test(s.trim()); }

async function blobToDataURL(blobUrl){
    try{
      var r = await fetch(blobUrl);
      var blob = await r.blob();
      return await new Promise(function(res, rej){
        var fr = new FileReader();
        fr.onload = function(){ res(fr.result); };
        fr.onerror = function(){ rej(new Error('FileReader failed')); };
        fr.readAsDataURL(blob);
      });
    }catch(e){ return null; }
  }

function findAltForBlob(blobUrl){
    try{
      var imgs = Array.prototype.slice.call(document.images || []);
      for(var i=0;i<imgs.length;i++){
        var img = imgs[i];
        var s = (img.currentSrc || img.src || '');
        if(s !== blobUrl) continue;
        var ds = img.dataset || {};
        var alt = ds.origSrc || ds.asterOrigSrc || ds.originalSrc || ds.source || img.getAttribute('data-orig-src') || '';
        if(alt) return alt;
      }
    }catch(e){}
    return '';
  }
