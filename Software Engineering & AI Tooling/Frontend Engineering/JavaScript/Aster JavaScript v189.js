/* Aster JavaScript v189 — authenticated buyer-safe derivative: normalized media-record insertion into IndexedDB. Host state/dependencies are intentionally external. */
async function addMediaToDB(blob, mime, threadId, title="", prompt=""){
    const id = uuid("media");
    const item = { id, ts:Date.now(), threadId:threadId||state.currentThreadId||"", mime:mime||blob?.type||"image/png", title:title||"Image", prompt:prompt||"", blob:blob||null };
    await dbPut("media", item);
    state.media = await dbAll("media","ts",null,"prev");
    return id;
  }
