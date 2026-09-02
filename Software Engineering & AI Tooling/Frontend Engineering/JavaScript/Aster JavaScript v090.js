/* Aster JavaScript v090
Authenticated historical derivative: host-supplied relight model selection.
No provider-specific model identifier is embedded in this buyer-safe artifact.
*/
(function(){
  "use strict";
  function appendRelightModel(formData, options={}){
    if(!(formData instanceof FormData)) throw new TypeError("formData must be FormData");
    const modelId=String(options.modelId || "").trim();
    if(!modelId) return formData;
    const fieldName=String(options.fieldName || "model").trim() || "model";
    formData.set(fieldName,modelId);
    return formData;
  }
  window.appendAsterRelightModel=appendRelightModel;
})();
