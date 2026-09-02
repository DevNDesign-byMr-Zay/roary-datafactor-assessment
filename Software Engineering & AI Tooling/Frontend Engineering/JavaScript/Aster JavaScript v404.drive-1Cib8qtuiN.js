function formatBytes(b){
        if(b==null)return"";
        const u=["B","KB","MB","GB"];
        let i=0,x=b;
        while(x>=1024 && i<u.length-1){x/=1024;i++;}
        return x.toFixed(x<10&&i>0?1:0)+" "+u[i];
      }
