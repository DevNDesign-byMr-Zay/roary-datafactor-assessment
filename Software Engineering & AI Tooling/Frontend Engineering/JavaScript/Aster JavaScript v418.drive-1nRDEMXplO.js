async function handleIncomingFiles(files){
  if(!files || !files.length) return;
  for (const f of files) {
    const att = { name: f.name, type: f.type || "", size: f.size, text: null, summary: null, file: f, extracted:false };
    sessionAttachments.push(att);
    renderAttachments();

    if (f.type === 'application/pdf'){
      try{
        const t = await extractPdfTextSmart(f, 120000);
        if(t){
          att.text=t; att.extracted=true;
          att.download = blobUrlFromText(t, f.name, "txt");
          att.summary = summarizeResumeText(t);
          att.summaryDl = blobUrlFromText(att.summary, f.name+"-summary", "md");
          renderAttachments(); toast(`Extracted text from ${f.name}`);
        } else {
          toast(`No extractable text in ${f.name}`, 'warn');
        }
      }catch{ toast(`Could not extract ${f.name}`, 'warn'); }
    } else if ((f.type||"").startsWith('image/')){
      try{
        const dataUrl = await new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(f); });
        const img = await new Promise((resolve)=>{ const im=new Image(); im.onload=()=>resolve(im); im.src=dataUrl; im.onerror=()=>resolve(null); });
        if(img){
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(64, img.naturalWidth);
          canvas.height = Math.max(64, img.naturalHeight);
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const params = await chooseOcrParamsForRaster(canvas, f.name);
          const txt = await runOcrOnCanvas(canvas, params, "eng");
          if(txt){
            att.text=txt; att.extracted=true; att.download = blobUrlFromText(txt, f.name, "txt");
            att.summary = summarizeResumeText(txt); att.summaryDl = blobUrlFromText(att.summary, f.name+"-summary", "md");
            renderAttachments();
          }
        }
      }catch{}
    }
  }
  const input = document.querySelector('#attachInput');
  if (input) input.value = "";
}
