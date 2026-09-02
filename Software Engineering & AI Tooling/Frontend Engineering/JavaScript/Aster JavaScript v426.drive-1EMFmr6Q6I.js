async function serverOcrIfWeak(pdfFile, currentText, onProgress){
    const trimmed = (currentText||"").replace(/\s+/g,"");
    if (trimmed.length >= 200) return { method: "client", text: currentText };

    const fd = new FormData();
    fd.append("file", pdfFile, pdfFile.name);
    fd.append("lang", "eng");
    fd.append("min_chars", "200");
    try{
      onProgress && onProgress(5);
      const res = await fetch(window.Aster_OCR_ENDPOINT, { method:"POST", body: fd });
      if (!res.ok) throw new Error("Server OCR error: " + res.status);
      const data = await res.json();
      return { method: data.method, text: data.text || "" };
    }catch(e){
      console.warn("Server OCR failed, using client text", e);
      return { method: "client-fallback", text: currentText||"" };
    }
  }
