async function addMediaToDB(blob, mime, threadId, title="", prompt=""){
    const id = "m_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,10);
    const item = {
      id,
      ts: Date.now(),
      threadId: threadId || state.currentThreadId || "",
      mime: mime || (blob && blob.type) || "image/png",
      title: title || "Image",
      prompt: prompt || "",
      blob: blob || null
    };
    await dbPut("media", item);
    state.media = await dbAll("media","ts",null,"prev");
    return id;
  }
