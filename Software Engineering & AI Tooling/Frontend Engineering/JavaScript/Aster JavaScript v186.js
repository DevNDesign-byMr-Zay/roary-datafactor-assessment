/* Aster JavaScript v186
Authenticated historical derivative: local clock and optional browser geolocation context capture.
Maintains a refreshable local-time snapshot and exposes permission-gated location acquisition without embedding remote lookup services.
*/
(function(global){
  "use strict";
  if(global.AsterLocalContext) return;

  const context={
    timeISO:null,
    timePretty:null,
    timezone:null,
    latitude:null,
    longitude:null,
    accuracy:null
  };

  let timer=null;

  function updateTime(now=new Date()){
    const value=now instanceof Date?now:new Date(now);
    context.timeISO=value.toISOString();
    context.timePretty=value.toLocaleString();
    try{
      context.timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||"local";
    }catch(_){
      context.timezone="local";
    }
    return snapshot();
  }

  function snapshot(){
    return {...context};
  }

  function requestLocation(options={}){
    if(!global.navigator?.geolocation){
      return Promise.resolve({ok:false,reason:"unsupported",context:snapshot()});
    }
    const settings={
      enableHighAccuracy:options.enableHighAccuracy===true,
      maximumAge:Math.max(0,Number(options.maximumAge)||300000),
      timeout:Math.max(1000,Number(options.timeout)||10000)
    };
    return new Promise(resolve=>{
      global.navigator.geolocation.getCurrentPosition(
        position=>{
          context.latitude=position.coords.latitude;
          context.longitude=position.coords.longitude;
          context.accuracy=position.coords.accuracy;
          resolve({ok:true,context:snapshot()});
        },
        error=>resolve({
          ok:false,
          reason:error?.code||"unavailable",
          message:String(error?.message||"Location unavailable"),
          context:snapshot()
        }),
        settings
      );
    });
  }

  function start(options={}){
    stop();
    updateTime();
    const refreshMs=Math.max(1000,Number(options.refreshMs)||60000);
    timer=global.setInterval(updateTime,refreshMs);
    if(options.requestLocation!==false) requestLocation(options.location||{});
    return snapshot();
  }

  function stop(){
    if(timer!==null){global.clearInterval(timer);timer=null;}
  }

  global.AsterLocalContext={context,snapshot,updateTime,requestLocation,start,stop};
})(typeof window!=="undefined"?window:globalThis);
