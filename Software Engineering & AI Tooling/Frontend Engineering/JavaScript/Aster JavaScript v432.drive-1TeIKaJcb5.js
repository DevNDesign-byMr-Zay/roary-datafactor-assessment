async function ocrPdfWithTesseract(pdf){
      const langs='eng'; let text='';
      for(let i=1;i<=pdf.numPages;i++){
        updateProgress(40+Math.round((i-1)/pdf.numPages*55),`OCR page ${i}/${pdf.numPages}`);
        const page=await pdf.getPage(i);
        const canvas=await renderPageToCanvas(page,2);
        const dataUrl=canvas.toDataURL('image/png');
        const res=await Tesseract.recognize(dataUrl,langs,{ logger:m=>{
          if(m.status && m.progress!=null){
            const base=40+Math.round((i-1+m.progress)/pdf.numPages*55);
            updateProgress(base,`${m.status} (p${i})`);
          }}
        });
        text += (res?.data?.text||'') + '\\n\\n';
      }
      return text;
    }
