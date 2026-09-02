/* Aster JavaScript v190 — authenticated buyer-safe derivative: thread message append with first-user title derivation and persistence refresh. Host state/dependencies are intentionally external. */
async function addMessage(role, content, mediaIds=[]){
    const t = await dbGet("threads", state.currentThreadId);
    if(!t) return;
    const msg = { id:uuid("m"), role, content:String(content||""), mediaIds:Array.isArray(mediaIds)?mediaIds:[], ts:Date.now() };
    t.messages.push(msg);
    if(role==="user" && t.title==="New Chat" && content){ t.title = String(content).trim().slice(0,48) || "Chat"; }
    await saveThread(t);
    state.threads = await dbAll("threads","updatedAt",null,"prev");
    saveBackupThreads(state.threads);
    renderChatsList(); renderChat();
  }
