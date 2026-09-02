function parseOutUrl(js){
    try{
      if(!js) return "";
      if(typeof js === "string") return js;

      // common base64 keys
      const b64 = js.image_b64 || js.b64 || js.base64 || js.output_b64 || js.result_b64;
      if(typeof b64 === "string" && b64.length > 64){
        // best-effort mime
        const mime = js.mime_type || js.mime || "image/png";
        return "data:" + mime + ";base64," + b64.replace(/^data:[^,]+,/, "");
      }

      // common url keys
      const direct =
        js.url || js.image_url || js.output_url || js.result_url || js.out_url ||
        (js.data && (js.data.url || js.data.image_url || js.data.output_url)) ||
        (js.result && (js.result.url || js.result.image_url || js.result.output_url)) ||
        (js.output && (js.output.url || js.output.image_url || js.output.output_url));

      if(typeof direct === "string") return direct;

      const arr =
        js.images || js.outputs || js.output_images || js.results || (js.data && (js.data.images || js.data.outputs));
      if(Array.isArray(arr) && arr.length){
        const a0 = arr[0];
        if(typeof a0 === "string") return a0;
        if(a0 && typeof a0 === "object"){
          return a0.url || a0.image_url || a0.output_url || a0.src || a0.href || "";
        }
      }
    }catch(e){}
    return "";
  }
