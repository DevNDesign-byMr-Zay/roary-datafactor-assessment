async function pdfToTextAuto(file){
      showOverlay('Converting PDF to text…','Trying embedded text first, then OCR if needed.');
      updateProgress(3,'Loading PDF…');
      const ab=await file.arrayBuffer();
      const pdf=await pdfjsLib.getDocument({data:ab}).promise;
      const first=await extractTextWithPdfjs(pdf);
      let finalText=first.text; let usedOCR=false;
      const low=(first.charCount < Math.max(100, first.pages*10));
      if (low){ usedOCR=true; finalText=await ocrPdfWithTesseract(pdf); }
      updateProgress(100, usedOCR?'OCR complete':'Text extracted');
      setTimeout(hideOverlay,350);
      return {text:finalText, usedOCR};
    }
