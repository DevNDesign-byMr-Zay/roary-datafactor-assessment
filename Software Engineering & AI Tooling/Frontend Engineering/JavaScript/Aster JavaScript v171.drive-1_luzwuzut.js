/* Aster JavaScript v171
Authenticated historical derivative: buffered SSE/OpenAI-compatible text stream decoder.
Handles fragmented chunks, multi-line buffering, [DONE], delta content, and non-stream full-message content.
*/
(function(global){
  "use strict";
  if(global.AsterSSETextDecoder) return;

  async function consume(response,onDelta,options={}){
    if(!response?.body?.getReader) throw new Error("Readable stream unavailable");
    const reader=response.body.getReader();
    const decoder=new TextDecoder(options.encoding||"utf-8");
    let buffer="";

    while(true){
      const {value,done}=await reader.read();
      if(done) break;

      buffer+=decoder.decode(value,{stream:true});
      let newline;

      while((newline=buffer.indexOf("\n"))>=0){
        const raw=buffer.slice(0,newline).trimEnd();
        buffer=buffer.slice(newline+1);

        if(!raw.startsWith("data:")) continue;
        const data=raw.slice(5).trim();
        if(!data) continue;
        if(data==="[DONE]") return;

        try{
          const payload=JSON.parse(data);
          const delta=payload?.choices?.[0]?.delta?.content;
          if(typeof delta==="string" && delta.length){
            onDelta?.(delta,{kind:"delta",payload});
          }

          const full=payload?.choices?.[0]?.message?.content;
          if(typeof full==="string" && full.length){
            onDelta?.(full,{kind:"full",payload});
          }
        }catch(_){}
      }
    }

    const tail=buffer.trim();
    if(tail.startsWith("data:")){
      const data=tail.slice(5).trim();
      if(data && data!=="[DONE]"){
        try{
          const payload=JSON.parse(data);
          const delta=payload?.choices?.[0]?.delta?.content;
          const full=payload?.choices?.[0]?.message?.content;
          if(typeof delta==="string" && delta.length) onDelta?.(delta,{kind:"delta",payload});
          if(typeof full==="string" && full.length) onDelta?.(full,{kind:"full",payload});
        }catch(_){}
      }
    }
  }

  global.AsterSSETextDecoder={consume};
})(window);
