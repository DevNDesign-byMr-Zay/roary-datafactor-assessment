/* Aster JavaScript v154
Authenticated historical derivative: allowlisted JSON settings import and typed persistence.
Credential-bearing fields are intentionally unsupported.
*/
(function(global){
  "use strict";
  if(global.AsterSafeSettingsImport) return;

  const SCHEMA = Object.freeze({
    web_tool_base:      {storage:"aster.webToolBase", type:"url"},
    max_sources:        {storage:"aster.maxSources", type:"integer", min:1, max:20},
    ocr_backend:        {storage:"aster.ocrBackend", type:"string", maxLength:80},
    ocr_backend_first:  {storage:"aster.ocrBackendFirst", type:"boolean"},
    ocr_auto:           {storage:"aster.ocrAuto", type:"boolean"},
    ocr_oem:            {storage:"aster.ocrOem", type:"integer", min:0, max:10},
    ocr_psm:            {storage:"aster.ocrPsm", type:"integer", min:0, max:20},
    ocr_whitelist:      {storage:"aster.ocrWhitelist", type:"string", maxLength:500},
    auto_vision:        {storage:"aster.autoVisionDescribe", type:"boolean"}
  });

  const FORBIDDEN_KEY = /(api[_-]?key|secret|password|master[_-]?key|access[_-]?token|brave[_-]?key|tavily[_-]?key|serp[_-]?key)/i;

  function parseInput(value){
    if(value && typeof value === "object" && !Array.isArray(value)) return value;
    const parsed = JSON.parse(String(value || ""));
    if(!parsed || typeof parsed !== "object" || Array.isArray(parsed)){
      throw new Error("Settings import must be a JSON object");
    }
    return parsed;
  }

  function normalize(spec,value){
    if(spec.type === "boolean"){
      if(typeof value === "boolean") return value ? "1" : "0";
      if(value === "1" || value === 1 || value === "true") return "1";
      if(value === "0" || value === 0 || value === "false") return "0";
      return null;
    }

    if(spec.type === "integer"){
      const n = Number.parseInt(value,10);
      if(!Number.isFinite(n)) return null;
      const bounded = Math.max(spec.min,Math.min(spec.max,n));
      return String(bounded);
    }

    if(spec.type === "url"){
      let text = String(value || "").trim();
      if(!text) return null;
      try{
        const parsed = new URL(text);
        if(!/^https?:$/.test(parsed.protocol)) return null;
      }catch(_){
        return null;
      }
      return text.replace(/\/+$/,"");
    }

    const text = String(value ?? "");
    if(spec.maxLength && text.length > spec.maxLength){
      return text.slice(0,spec.maxLength);
    }
    return text;
  }

  function importSettings(input,options={}){
    const data = parseInput(input);
    const applied = {};
    const ignored = [];

    for(const [key,value] of Object.entries(data)){
      if(FORBIDDEN_KEY.test(key)){
        ignored.push(key);
        continue;
      }

      const spec = SCHEMA[key];
      if(!spec){
        ignored.push(key);
        continue;
      }

      const normalized = normalize(spec,value);
      if(normalized === null){
        ignored.push(key);
        continue;
      }

      try{
        localStorage.setItem(spec.storage,normalized);
        applied[key] = normalized;
      }catch(_){
        ignored.push(key);
      }
    }

    document.dispatchEvent(new CustomEvent("aster:settings-imported",{
      detail:{applied,ignored}
    }));

    if(typeof options.onApplied === "function"){
      try{ options.onApplied(applied,ignored); }catch(_){}
    }

    return {applied,ignored};
  }

  global.AsterSafeSettingsImport = {
    schema:SCHEMA,
    parseInput,
    normalize,
    importSettings
  };
})(window);
