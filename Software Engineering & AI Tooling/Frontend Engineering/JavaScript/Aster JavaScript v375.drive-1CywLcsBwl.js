function extractPalette(canvas,k=5){
        const ctx=canvas.getContext("2d",{willReadFrequently:true});
        const {data}=ctx.getImageData(0,0,canvas.width,canvas.height);
        const bins=new Map();
        for(let i=0;i<data.length;i+=16){
          const a=data[i+3];if(a<24)continue;
          const r=data[i]>>4,g=data[i+1]>>4,b=data[i+2]>>4;
          const key=(r<<8)|(g<<4)|b;
          let e=bins.get(key);
          if(!e)e={count:0,sum:[0,0,0]};
          e.count++;
          e.sum[0]+=data[i];e.sum[1]+=data[i+1];e.sum[2]+=data[i+2];
          bins.set(key,e);
        }
        const arr=[...bins.values()].map(e=>({rgb:e.sum.map(v=>Math.round(v/e.count)),count:e.count}));
        arr.sort((a,b)=>b.count-a.count);
        const total=arr.reduce((s,x)=>s+x.count,0)||1;
        return arr.slice(0,k).map(x=>({rgb:x.rgb,hex:rgb2hex(...x.rgb),percent:Math.round(100*x.count/total)}));
      }
