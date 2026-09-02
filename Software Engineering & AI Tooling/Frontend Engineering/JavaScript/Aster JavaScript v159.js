/* Aster JavaScript v159
Authenticated historical derivative: timeout-bounded IndexedDB open with graceful failure state.
Product identity, credentials, proprietary prompts, and protected reasoning/visualization architecture removed.
*/
(function(global){
  "use strict";
  if(global.AsterResilientIndexedDBOpen) return;

  function open(options={}){
    const dbName=String(options.dbName||"aster_media_library_v1");
    const version=Math.max(1,Number(options.version)||1);
    const storeName=String(options.storeName||"items");
    const timeoutMs=Math.max(250,Number(options.timeoutMs)||15000);

    let promise=null;
    let failed=false;

    function get(){
      if(promise) return promise;

      promise=new Promise((resolve,reject)=>{
        let request;
        let done=false;
        let timer=null;

        const finish=(fn,value)=>{
          if(done) return;
          done=true;
          if(timer) clearTimeout(timer);
          fn(value);
        };

        try{
          request=indexedDB.open(dbName,version);
        }catch(error){
          failed=true;
          reject(error);
          return;
        }

        timer=setTimeout(()=>{
          failed=true;
          try{ request?.result?.close?.(); }catch(_){}
          finish(reject,new Error("IndexedDB open timeout"));
        },timeoutMs);

        request.onupgradeneeded=()=>{
          try{
            const db=request.result;
            if(!db.objectStoreNames.contains(storeName)){
              const store=db.createObjectStore(storeName,{keyPath:"id"});
              try{ store.createIndex("ts","ts",{unique:false}); }catch(_){}
              try{ store.createIndex("src","src",{unique:true}); }catch(_){}
            }else{
              const store=request.transaction?.objectStore(storeName);
              if(store){
                try{
                  if(!store.indexNames.contains("ts")){
                    store.createIndex("ts","ts",{unique:false});
                  }
                }catch(_){}
                try{
                  if(!store.indexNames.contains("src")){
                    store.createIndex("src","src",{unique:true});
                  }
                }catch(_){}
              }
            }
          }catch(_){}
        };

        request.onsuccess=()=>{
          failed=false;
          finish(resolve,request.result);
        };
        request.onerror=()=>{
          failed=true;
          finish(reject,request.error||new Error("IndexedDB open error"));
        };
        request.onblocked=()=>{
          document.dispatchEvent(new CustomEvent("aster:indexeddb-blocked",{
            detail:{dbName,storeName}
          }));
        };
      }).catch(error=>{
        failed=true;
        promise=null;
        document.dispatchEvent(new CustomEvent("aster:indexeddb-failed",{
          detail:{
            dbName,
            storeName,
            error:String(error?.message||error||"")
          }
        }));
        return null;
      });

      return promise;
    }

    return {
      get,
      reset(){
        promise=null;
        failed=false;
      },
      get failed(){ return failed; }
    };
  }

  global.AsterResilientIndexedDBOpen={open};
})(window);
