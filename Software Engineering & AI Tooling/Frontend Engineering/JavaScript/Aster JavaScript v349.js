async function addMessage(role, content, mediaIds=[]){
    const t = await dbGet("threads", state.currentThreadId);
    if(!t) return;
    const msg = {
      id: uuid(),
      role,
      content: String(content||""),
      mediaIds: Array.isArray(mediaIds)? mediaIds: [],
      ts: Date.now()
    };
    t.messages.push(msg);
    if(role==="user" && t.title==="New Chat" && content){
      t.title = String(content).trim().slice(0,42) || "Chat";
    }
    await saveThread(t);
    state.threads = await dbAll("threads","updatedAt",null,"prev");
    renderChat();
    renderChatsList();
  }
