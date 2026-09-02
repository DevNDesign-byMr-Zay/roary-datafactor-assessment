async function rasterOcrPdf(file, maxChars = 120000) {
        if (!window.pdfjsLib) return "";
        try {
          const buf = await file.arrayBuffer();
          const doc = await pdfjsLib.getDocument({ data: buf }).promise;
          const MAX_PAGES = Math.min(doc.numPages || 0, 10);
          let out = "";

          for (let i = 1; i <= MAX_PAGES; i++) {
            const page = await doc.getPage(i);
            const viewportBase = page.getViewport({ scale: 1.0 });

            const tmpCanvas = document.createElement("canvas");
            const tmpCtx = tmpCanvas.getContext("2d", { willReadFrequently: true });

            // Render at 2x for sharper OCR
            tmpCanvas.width = Math.floor(viewportBase.width * 2.0);
            tmpCanvas.height = Math.floor(viewportBase.height * 2.0);

            const viewport = page.getViewport({
              scale: tmpCanvas.width / viewportBase.width
            });

            await page.render({ canvasContext: tmpCtx, viewport }).promise;

            const params = ocr_auto
              ? await chooseOcrParamsForRaster(tmpCanvas, file.name)
              : { oem: ocr_oem, psm: ocr_psm, whitelist: ocr_white, dpiScale: 2.0 };

            const txt = await runOcrOnCanvas(tmpCanvas, params, "eng");
            if (txt) {
              out += txt + "\n\n";
            }
            if (out.length >= maxChars) break;
          }

          return out.trim().slice(0, maxChars);
        } catch (e) {
          console.warn("[Aster:pdf] rasterOcrPdf failed", e);
          return "";
        }
      }
