/* Aster JavaScript v185
Authenticated historical derivative: conversation message commit and disclosure-mount orchestration.
Persists normalized message extras, derives a bounded first-user title, renders, scrolls, and mounts optional disclosures.
*/
(function(global){
  "use strict";
  if(global.AsterMessageCommitter) return;

  function normalizeMedia(extras={}){
    if(extras.media){
      return {
        images:Array.isArray(extras.media.images)?extras.media.images:[],
        videos:Array.isArray(extras.media.videos)?extras.media.videos:[]
      };
    }
    const images=Array.isArray(extras.images)?extras.images:[];
    const videos=Array.isArray(extras.videos)?extras.videos:[];
    return images.length||videos.length ? {images,videos} : null;
  }

  function titleFromFirstUserMessage(text,maxLength=40){
    return String(text||"")
      .replace(/\s+/g," ")
      .trim()
      .slice(0,Math.max(1,Number(maxLength)||40)) || "New Chat";
  }

  function buildMessage(role,text,extras={}){
    const message={role:String(role||"assistant"),content:String(text||"")};
    if(Array.isArray(extras.attachments) && extras.attachments.length){
      message.attachments=extras.attachments;
    }
    if(Array.isArray(extras.sources) && extras.sources.length){
      message.sources=extras.sources;
      message.engine=extras.engine||null;
    }
    const media=normalizeMedia(extras);
    if(media) message.media=media;
    return message;
  }

  function commit(role,text,extras={},options={}){
    const message=buildMessage(role,text,extras);
    const thread=options.getActive?.() || null;
    let element=null;

    if(options.container){
      element=document.createElement("div");
      element.className="message "+(message.role==="user"?"user":"assistant");
      if(typeof options.renderHTML==="function"){
        element.innerHTML=String(options.renderHTML(message.role,message.content)||"");
      }else{
        element.textContent=message.content;
      }
      options.container.appendChild(element);
      const scroller=options.scroller || options.container.parentElement;
      if(scroller) scroller.scrollTop=scroller.scrollHeight;
    }

    if(thread){
      if(!Array.isArray(thread.messages)) thread.messages=[];
      thread.messages.push(message);
      if(message.role==="user" && String(thread.title||"").toLowerCase()==="new chat"){
        thread.title=titleFromFirstUserMessage(message.content,options.titleMaxLength||40);
      }
      options.persist?.();
      options.renderConversationList?.();
    }

    if(element && message.role==="user" && message.attachments){
      options.mountAttachments?.(options.container,element,message.attachments);
    }
    if(element && message.role==="assistant" && message.sources){
      options.mountSources?.(options.container,element,message.sources,message.engine||"web");
    }
    if(element && message.role==="assistant" && message.media){
      options.mountMedia?.(options.container,element,message.media);
    }

    return {element,message,thread};
  }

  global.AsterMessageCommitter={normalizeMedia,titleFromFirstUserMessage,buildMessage,commit};
})(window);
