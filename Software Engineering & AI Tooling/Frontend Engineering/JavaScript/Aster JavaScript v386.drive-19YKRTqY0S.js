function initGeolocation(){
        if(!("geolocation" in navigator)) return;
        navigator.geolocation.getCurrentPosition(
          (pos)=>{
            userContext.lat = pos.coords.latitude;
            userContext.lon = pos.coords.longitude;
            userContext.accuracy = pos.coords.accuracy;
            console.log("[Aster] geolocation set:", userContext.lat, userContext.lon);
          },
          (err)=>{
            console.warn("[Aster] geolocation denied/unavailable:", err);
          },
          {
            enableHighAccuracy:false,
            maximumAge:5*60_000,
            timeout:10_000
          }
        );
      }
