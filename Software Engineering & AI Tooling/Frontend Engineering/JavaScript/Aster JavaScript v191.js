/* Aster JavaScript v191 — authenticated buyer-safe derivative: storage boot sequence with backup recovery and initial thread repair. Host state/dependencies are intentionally external. */
async function boot(){
    await openDB();
    state.threads = await dbAll("threads","updatedAt",null,"prev");
    state.media   = await dbAll("media","ts",null,"prev");

    await restoreFromBackupIfEmpty();
    state.threads = await dbAll("threads","updatedAt",null,"prev");

    if(!state.threads.length){
      const t = makeThread();
      await saveThread(t);
      state.threads = [t];
    }
    state.currentThreadId = state.threads[0].id;

    $("#imgBaseShow").textContent = state.cfg.imageBase;
    renderChatsList();
    renderMediaList();
    renderCfg();
    renderDiag();
    renderChat();
  }
