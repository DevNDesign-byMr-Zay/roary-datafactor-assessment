function fileIcon(name,type){
        const ext=(name.split(".").pop()||"").toLowerCase();
        const t=(type||"").toLowerCase();
        if(t.includes("pdf") || ext==="pdf")return"📕";
        if(t.startsWith("image/") || ["png","jpg","jpeg","gif","webp","svg","ico","bmp","tif","tiff"].includes(ext))return"🖼️";
        if(["csv","tsv"].includes(ext))return"📊";
        if(["xlsx","xls"].includes(ext))return"📈";
        if(["json","yaml","yml","txt","md","svg","xml","html","htm","css","scss","less","js","mjs","cjs","jsx","ts","tsx","py","rb","php","go","rs","java","kt","c","cpp","h","hpp","cs","sql","ps1","bat","sh"].includes(ext))return"📄";
        if(t.startsWith("audio/") || ["mp3","wav"].includes(ext))return"🎵";
        if(t.startsWith("video/") || ["mp4","mov","avi"].includes(ext))return"🎞️";
        return"📎";
      }
