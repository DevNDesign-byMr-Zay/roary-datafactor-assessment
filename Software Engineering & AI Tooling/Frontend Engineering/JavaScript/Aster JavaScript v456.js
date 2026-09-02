function destroy(){
    try{ canvas?.remove(); maskCanvas?.remove(); }catch(e){}
    canvas=null; maskCanvas=null; ctx=null; maskCtx=null;
    brushing=false; last=null;
  }
