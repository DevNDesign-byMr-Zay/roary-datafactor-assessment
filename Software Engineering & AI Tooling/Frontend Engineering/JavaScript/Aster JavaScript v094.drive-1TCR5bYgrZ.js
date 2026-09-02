/* Aster JavaScript v094
Authenticated historical derivative: relight requests carry explicit mood and intensity/level fields.
*/
(function(){
  "use strict";
  function append(formData,options={}){
    if(!(formData instanceof FormData)) throw new TypeError('formData must be FormData');
    const mood=String(options.mood||'').trim();
    const level=Number(options.level);
    if(mood) formData.set('mood',mood);
    if(Number.isFinite(level)) formData.set('level',String(level));
    return formData;
  }
  window.appendAsterRelightMoodLevel=append;
})();
