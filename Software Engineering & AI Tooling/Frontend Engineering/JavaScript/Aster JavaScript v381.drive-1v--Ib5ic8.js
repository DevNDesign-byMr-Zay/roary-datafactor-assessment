async function visualDescribeImage(file){
        const dataUrl=await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(file);});
        return await new Promise(resolve=>{
          const img=new Image();
          img.onload=async()=>{
            const c=document.createElement("canvas");
            c.width=img.naturalWidth;c.height=img.naturalHeight;
            const ctx=c.getContext("2d",{willReadFrequently:true});
            ctx.drawImage(img,0,0);
            const palette=extractPalette(c,5);
            const text=await extractImageText(file);
            resolve({palette,text});
          };
          img.onerror=()=>resolve({palette:[],text:""});
          img.src=dataUrl;
        });
      }
