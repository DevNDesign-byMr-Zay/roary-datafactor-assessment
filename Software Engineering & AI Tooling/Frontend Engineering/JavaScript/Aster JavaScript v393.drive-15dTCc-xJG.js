function isMeaningfulPdfText(txt){
    if(!txt) return false;
    const stripped = String(txt).replace(/\s+/g,"");
    if(stripped.length < 40) return false;
    const lower = stripped.toLowerCase();
    if(lower.includes("noextractabletext") || lower.includes("imagebaseddocument")) return false;
    return true;
  }
