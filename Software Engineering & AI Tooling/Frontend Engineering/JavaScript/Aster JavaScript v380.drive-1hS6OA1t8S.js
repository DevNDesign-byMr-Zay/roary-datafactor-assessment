async function isLogoLike(canvas){
        const ctx=canvas.getContext("2d");
        const {width:w,height:h}=canvas;
        const img=ctx.getImageData(0,0,w,h).data;
        let edges=0,samples=0;
        for(let y=1;y<h;y+=4){
          for(let x=1;x<w;x+=4){
            const i=(y*w+x)*4,il=(y*w+x-1)*4,iu=((y-1)*w+x)*4;
            const lum=0.299*img[i]+0.587*img[i+1]+0.114*img[i+2];
            const lumL=0.299*img[il]+0.587*img[il+1]+0.114*img[il+2];
            const lumU=0.299*img[iu]+0.587*img[iu+1]+0.114*img[iu+2];
            const g=Math.abs(lum-lumL)+Math.abs(lum-lU);
            if(g>50)edges++;
            samples++;
          }
        }
        const edgeDensity=edges/Math.max(1,samples);
        const ar=w/h;
        return (edgeDensity<0.18)&&(ar>0.7 && ar<1.3);
      }
