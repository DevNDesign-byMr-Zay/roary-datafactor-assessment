function wireFileAttach(){
  const attachBtn = document.querySelector('#attachBtn');
  const attachInput = document.querySelector('#attachInput');
  if(attachBtn && attachInput){
    attachBtn.addEventListener('click', ()=> attachInput.click());
    attachInput.addEventListener('change', (e)=> handleIncomingFiles(Array.from(e.target.files||[])));
  }
  ['dragenter','dragover','dragleave','drop'].forEach(evt=>{
    document.addEventListener(evt, e=>{
      e.preventDefault(); e.stopPropagation();
      if(evt==='drop'){
        const files = Array.from(e.dataTransfer?.files||[]);
        if(files.length) handleIncomingFiles(files);
      }
    });
  });
}
