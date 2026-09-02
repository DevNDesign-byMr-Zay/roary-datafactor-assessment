async function tryJson(url,init){
          try{
            const r=await fetch(url,{
              method:init?.method || "GET",
              headers:init?.headers || {},
              body:init?.body || undefined,
              mode:"cors",
              credentials:"omit"
            });
            if(!r.ok){
              console.warn("[Aster:web] HTTP error",r.status,r.statusText);
              return null;
            }
            const text=await r.text();
            if(!text)return null;
            try{return JSON.parse(text);}catch(e){
              console.warn("[Aster:web] JSON parse error",e,text.slice(0,200));
              return null;
            }
          }catch(e){
            console.warn("[Aster:web] network/CORS error",e);
            return null;
          }
        }
