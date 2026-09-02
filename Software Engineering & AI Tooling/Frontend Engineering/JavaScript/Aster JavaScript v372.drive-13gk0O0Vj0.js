function renderActiveConversation(){
        const c=getActive();
        if(!chatInner)return;
        chatInner.innerHTML="";
        if(!c){createConversation();return;}
        (c.messages||[]).forEach(m=>{
          const div=document.createElement("div");
          div.className="msg "+(m.role==="user"?"user":"assistant");
          div.innerHTML=renderMsgHTML(m.role,m.content);
          chatInner.appendChild(div);
          if(m.role==="user"){
            const meta=Array.isArray(m.attachments)?m.attachments:parseAttachmentMetaFromContent(m.content);
            if(meta && meta.length) mountAttachmentsBar(chatInner,div,meta);
          }
          if(m.role==="assistant" && Array.isArray(m.sources) && m.sources.length){
            mountSourcesBar(chatInner,div,m.sources,m.engine||"web");
          }
          if(m.role==="assistant"){
            if(m.media && (Array.isArray(m.media.images) || Array.isArray(m.media.videos))){
              const imgs = Array.isArray(m.media.images) ? m.media.images : [];
              const vids = Array.isArray(m.media.videos) ? m.media.videos : [];
              if(imgs.length || vids.length){
                mountMediaGallery(chatInner, div, { images: imgs, videos: vids }, null);
              }
            }else if(Array.isArray(m.images) && m.images.length){
              // legacy: only images stored
              mountMediaGallery(chatInner, div, { images: m.images, videos: [] }, null);
            }
          }
        });
        const sc=chatInner.parentElement;
        if(sc)sc.scrollTop=sc.scrollHeight;
      }
