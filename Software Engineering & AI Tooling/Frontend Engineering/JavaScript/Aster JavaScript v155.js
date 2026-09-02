/* Aster JavaScript v155
Authenticated historical derivative: specialized weather/current-information adapter for the local knowledge router.
Port 5055 is the separate web/knowledge router. Image Orb traffic remains locked to port 5151 elsewhere.
*/
(function(global){
  "use strict";
  if(global.AsterWeatherKnowledge) return;

  const DEFAULT_BASE = "http://127.0.0.1:5055";

  function normalizeBase(value){
    return String(value || DEFAULT_BASE).trim().replace(/\/+$/,"");
  }

  function isWeatherQuery(text){
    const value = String(text || "").toLowerCase();
    return /\b(weather|temperature|forecast)\b/.test(value);
  }

  function extractLocation(text,fallback=""){
    const value = String(text || "");
    const match = value.match(/\bweather\s+(?:in|for)\s+([^.?]+)/i);
    if(match?.[1]) return match[1].trim();

    const temp = value.match(/\b(?:temperature|forecast)\s+(?:in|for)\s+([^.?]+)/i);
    if(temp?.[1]) return temp[1].trim();

    return String(fallback || "").trim();
  }

  async function fetchWeather(query,options={}){
    if(!isWeatherQuery(query)) return null;

    const fallbackLocation = Array.isArray(options.locationParts)
      ? options.locationParts.filter(Boolean).join(", ")
      : String(options.fallbackLocation || "");

    const location = extractLocation(query,fallbackLocation);
    if(!location) return null;

    const base = normalizeBase(options.base || DEFAULT_BASE);
    const days = Math.max(1,Math.min(10,Number(options.days) || 3));
    const params = new URLSearchParams({q:location,days:String(days)});

    try{
      const response = await fetch(`${base}/knowledge/weather?${params.toString()}`,{
        method:"GET",
        mode:"cors",
        credentials:"omit",
        cache:"no-store",
        signal:options.signal
      });

      if(!response.ok){
        document.dispatchEvent(new CustomEvent("aster:knowledge-weather-error",{
          detail:{location,status:response.status}
        }));
        return null;
      }

      const payload = await response.json().catch(()=>null);
      if(!payload || payload.ok === false) return null;

      document.dispatchEvent(new CustomEvent("aster:knowledge-weather",{
        detail:{location,payload}
      }));
      return payload.weather ?? payload;
    }catch(error){
      document.dispatchEvent(new CustomEvent("aster:knowledge-weather-error",{
        detail:{location,error:String(error?.message || error || "")}
      }));
      return null;
    }
  }

  global.AsterWeatherKnowledge = {
    defaultBase:DEFAULT_BASE,
    normalizeBase,
    isWeatherQuery,
    extractLocation,
    fetchWeather
  };
})(window);
