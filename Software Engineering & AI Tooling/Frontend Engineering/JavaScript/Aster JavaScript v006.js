function asterNormalizeMediaSrc_v167(src){
    src = (src==null) ? '' : String(src);
    src = src.trim();
    if(!src) return '';

    // strip wrapping quotes
    if((src[0]==='"' && src[src.length-1]==='"') || (src[0]==="'" && src[src.length-1]==="'")) src = src.slice(1,-1).trim();

    // fix ./data:image... or .\\data:image...
    if(src.indexOf('data:image')===0 && (src.startsWith('./') || src.startsWith('.\\'))) src = src.replace(/^\.[\\/]+/,'');

    // if a file: prefix got prepended before data:image
    var di = src.indexOf('data:image');
    if(src.startsWith('file:') && di>=0) src = src.slice(di);

    // fix bare "png;base64," / "png.base64," / "png:base64," / "png;base64,"
    var m = src.match(/^(png|jpe?g|webp|gif)[\.;:]base64,(.+)$/i);
    if(m) src = 'data:image/'+m[1].toLowerCase()+';base64,'+m[2];

    // fix "png;base64," (with semicolon instead of dot/colon)
    m = src.match(/^(png|jpe?g|webp|gif);base64,(.+)$/i);
    if(m) src = 'data:image/'+m[1].toLowerCase()+';base64,'+m[2];

    // reject dead blob
    if(/^blob:null\//i.test(src)) return '';

    // reject undefined
    if(src==='undefined' || /\/undefined(?:\b|$)/i.test(src)) return '';

    // run old normalizer (keeps your existing behavior for local paths, etc.)
    if(__oldNorm){
      try{
        var out = __oldNorm(src) || src;
        // old can accidentally re-prepend file: before data:image
        if(out && out.startsWith('file:') && out.indexOf('data:image')>0) out = out.slice(out.indexOf('data:image'));
        if(out && out.startsWith('./data:image')) out = out.slice(2);
        return out;
      }catch(e){/* ignore */}
    }
    return src;
  }

function asterIsNoiseSrc(s){
    if(!s) return true;
    var x = String(s).toLowerCase();
    // ignore tiny 1x1 placeholder
    if(x.startsWith('data:image/png;base64,ivborw0kggoaaaansuheugaaaaeaaaabcayaaaaffcsjaaaac')) return true;
    // ignore obvious ui icons
    if(x.indexOf('favicon')>=0 || x.indexOf('sprite')>=0) return true;
    return false;
  }

async function asterRecoverMediaFromThreads_v167(opts){
    opts = opts||{};
    try{
      // wait briefly for threads to hydrate
      var start = Date.now();
      while(typeof dn==='undefined' && Date.now()-start<2500) await new Promise(function(r){setTimeout(r,80);});
      var threads = (typeof dn!=='undefined' && Array.isArray(dn)) ? dn : ((window.dn && Array.isArray(window.dn)) ? window.dn : []);
      if(!threads || !threads.length){
        try{ if(typeof Hn==='function') Hn(); }catch(e){}
        return {ok:false, reason:'no-threads'};
      }

      var existing = [];
      try{ if(typeof jn==='function') existing = await jn(5000); }catch(e){ existing=[]; }
      var existingSet = new Set();
      for(var i=0;i<(existing||[]).length;i++){
        var it = existing[i]||{};
        var norm0 = asterNormalizeMediaSrc_v167(it.src||it.url||'');
        if(norm0) existingSet.add(norm0);
      }

      var found = [];
      for(var ti=0; ti<threads.length; ti++){
        var bucket = [];
        asterExtractImageSrcs(threads[ti], bucket);
        for(var bi=0; bi<bucket.length; bi++){
          var norm = asterNormalizeMediaSrc_v167(bucket[bi]);
          if(!norm || asterIsNoiseSrc(norm)) continue;
          if(existingSet.has(norm)) continue;
          existingSet.add(norm);
          found.push(norm);
        }
      }

      if(!found.length){
        try{ if(typeof Hn==='function') Hn(); }catch(e){}
        return {ok:true, added:0};
      }

      var now = Date.now();
      var added = 0;
      for(var fi=0; fi<found.length; fi++){
        var s = found[fi];
        try{
          if(typeof Xn==='function') await Xn(s,{kind:'image',src:s,ts:now+fi,meta:{recovered:true,origin:'thread-scan'}});
          else if(typeof On==='function') await On(s,{kind:'image',meta:{recovered:true,origin:'thread-scan'}});
          added++;
        }catch(e){/* ignore */}
      }

      try{ if(typeof Hn==='function') Hn(); }catch(e){}
      return {ok:true, added:added};
    }catch(err){
      console.warn('[ASTER] recover media failed', err);
      try{ if(typeof Hn==='function') Hn(); }catch(e){}
      return {ok:false, error:String(err && err.message || err)};
    }
  }
