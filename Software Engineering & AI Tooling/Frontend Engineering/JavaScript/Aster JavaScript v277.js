/* Aster JavaScript v277 — authenticated buyer-safe derivative: current modal-image object-removal execution. Host state/dependencies are intentionally external. */
async function removeCurrentModalImage(opts){
    const imgEl = getModalImgEl();
    const src = imgEl && imgEl.src ? imgEl.src : "";
    if(!src) throw new Error("No active image to remove from.");

    const maskCanvas = getMaskCanvas();
    if(!maskCanvas) throw new Error("No mask canvas found. Paint the object first.");

    if(!maskHasInk(maskCanvas)){
      throw new Error("Mask is empty. Paint over the object you want removed.");
    }

    const prompt = getRemovePrompt();
    const quality = getRemoveQuality();          // low_quality|medium_quality|high_quality|best_quality
    const expansion = getMaskExpansion();        // 0..50

    const fd = new FormData();
    const imgBlob = await dataUrlToBlob(src);
    fd.append("image", new File([imgBlob], "image.png", { type: imgBlob.type || "image/png" }));

    const maskPng = maskCanvas.toDataURL("image/png");
    const maskBlob = await dataUrlToBlob(maskPng);
    fd.append("mask", new File([maskBlob], "mask.png", { type: "image/png" }));

    if(prompt) fd.append("prompt", prompt);
    if(quality) fd.append("model", quality);
    if(expansion) fd.append("mask_expansion", expansion);

    asterLog("[ASTER][RemoveFix] POST /tool/remove", { hasMask: true, promptLen: (prompt||"").length, model: quality||"(default)", mask_expansion: expansion||"(default)" });

    const outUrl = await postRemove(fd);
    return outUrl;
  }
