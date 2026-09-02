async function runOcrOnCanvas(canvas, params, lang) {
        const language = lang || "eng";

        // Prefer backend OCR when configured (Paddle/Tesseract server)
        if (ocr_backend_first && ocr_backend) {
          try {
            const blob = await new Promise((res) =>
              canvas.toBlob(res, "image/png")
            );

            const fd = new FormData();
            fd.append("file", blob, "page.png");
            fd.append("lang", language);
            if (params?.oem != null) fd.append("oem", String(params.oem));
            if (params?.psm != null) fd.append("psm", String(params.psm));
            if (params?.whitelist) fd.append("whitelist", params.whitelist);

            const url = ocr_backend.replace(/\/+$/, "") + "/ocr";
            const r = await fetch(url, { method: "POST", body: fd });

            if (r.ok) {
              const j = await r.json();
              if (j && j.text != null) {
                return String(j.text).trim();
              }
            }
          } catch (e) {
            console.warn(
              "[Aster:ocr] backend /ocr failed, using browser Tesseract",
              e
            );
          }
        }

        // Browser Tesseract.js fallback
        if (!window.Tesseract || !Tesseract.createWorker) return "";

        try {
          const worker = await Tesseract.createWorker(language);

          await worker.setParameters({
            tessedit_ocr_engine_mode: Number(params?.oem ?? ocr_oem ?? 1),
            tessedit_pageseg_mode: Number(params?.psm ?? ocr_psm ?? 6),
            tessedit_char_whitelist: params?.whitelist || ocr_white || ""
          });

          const { data } = await worker.recognize(canvas);
          await worker.terminate();

          return (data && data.text ? data.text : "").trim();
        } catch (e) {
          console.warn("[Aster:ocr] Tesseract fallback failed", e);
          return "";
        }
      }
