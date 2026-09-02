async function extractPdfTextSmart(file, maxChars = 120000) {
        // 1) Try dedicated OCR backend (Paddle + Tesseract) via /ocr_pdf
        if (ocr_backend_first && ocr_backend) {
          try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("max_chars", String(maxChars));
            const url = ocr_backend.replace(/\/+$/, "") + "/ocr_pdf";
            const r = await fetch(url, { method: "POST", body: fd });

            if (r.ok) {
              const j = await r.json();
              const txt = (j && j.text) || "";
              if (txt && txt.replace(/\s+/g, "").length > 40) {
                return txt.slice(0, maxChars);
              }
            }
          } catch (e) {
            console.warn("[Aster:pdf] backend /ocr_pdf failed, falling back", e);
          }
        }

        // 2) Try legacy PDF text backend if configured (FastAPI + PyMuPDF)
        if (PDF_BACKEND_URL) {
          try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("max_chars", String(maxChars));
            const url = PDF_BACKEND_URL.replace(/\/+$/, "") + "/pdf-text";
            const r = await fetch(url, { method: "POST", body: fd });

            if (r.ok) {
              const j = await r.json();
              const txt = (j && j.text) || "";
              if (txt && txt.replace(/\s+/g, "").length > 80) {
                return txt.slice(0, maxChars);
              }
            }
          } catch (e) {
            console.warn(
              "[Aster:pdf] backend /pdf-text failed, falling back to client pipeline",
              e
            );
          }
        }

        // 3) Fallback to in-browser pipeline: pdf.js layout + raster OCR
        const layout = await extractPdfTextLayout(file, maxChars);
        if (layout && layout.replace(/\s+/g, "").length > 80) {
          return layout.slice(0, maxChars);
        }

        const ocr = await rasterOcrPdf(file, maxChars);
        return (ocr || "").slice(0, maxChars);
      }
