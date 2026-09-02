/* Aster JavaScript v278 — authenticated buyer-safe derivative: object-removal backend request assembly and response handling. Host state/dependencies are intentionally external. */
async function postRemove(formData){
    const bases = asterToolBases();
    let lastErr = null;

    for(const base of bases){
      try{
        const url = base.replace(/\/+$/,'') + "/tool/remove";
        const resp = await fetch(url, {
          method: "POST",
          body: formData,
          mode: "cors",
          credentials: "omit",
          cache: "no-store"
        });

        const text = await resp.text();
        let js = null;
        try{ js = JSON.parse(text); }catch(e){ js = { raw: text }; }

        if(!resp.ok){
          lastErr = new Error((js && (js.detail||js.error)) ? (js.detail||js.error) : ("HTTP "+resp.status));
          continue;
        }

        const data = (js && (js.data||js)) || {};
        const outUrl =
          data.image_url || data.url ||
          (data.images && data.images[0] && data.images[0].url) ||
          (data.image && data.image.url) ||
          (js && js.image_url) || (js && js.url) ||
          (js && js.images && js.images[0] && js.images[0].url) ||
          "";

        if(outUrl){
          asterLsSet("aster.imageToolBase", base.replace(/\/+$/,''));
          return outUrl;
        }

        lastErr = new Error("Remove returned no image URL");
      }catch(err){
        lastErr = err;
      }
    }

    throw (lastErr || new Error("Remove tool failed"));
  }
