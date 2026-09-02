/* Aster JavaScript v173
Authenticated historical derivative: normalize image-tool outputs across legacy and current JSON envelopes.
*/
(function(global){
  "use strict";
  if(global.AsterImageResultNormalizer) return;

  function firstUrl(payload){
    if(!payload || typeof payload!=="object") return "";

    const candidates=[
      payload.images?.[0]?.url,
      payload.image?.url,
      payload.output?.[0]?.url,
      payload.result?.url,
      payload.url
    ];

    for(const value of candidates){
      const text=String(value||"").trim();
      if(text) return text;
    }

    const encoded=String(
      payload.image_base64 ||
      payload.image?.base64 ||
      payload.b64 ||
      payload.file_data ||
      ""
    ).trim();

    if(encoded){
      return /^data:/i.test(encoded)
        ? encoded
        : `data:${payload.mime_type||"image/png"};base64,${encoded}`;
    }

    return "";
  }

  async function fromResponse(response){
    if(!response) return "";

    const contentType=String(response.headers?.get?.("content-type")||"").toLowerCase();

    if(contentType.includes("application/json")){
      const payload=await response.json().catch(()=>null);
      return firstUrl(payload);
    }

    if(contentType.startsWith("image/")){
      const blob=await response.blob();
      return URL.createObjectURL(blob);
    }

    const text=String(await response.text().catch(()=>"")).trim();
    if(/^https?:\/\//i.test(text) || /^data:image\//i.test(text) || /^blob:/i.test(text)){
      return text;
    }

    return "";
  }

  global.AsterImageResultNormalizer={firstUrl,fromResponse};
})(window);
