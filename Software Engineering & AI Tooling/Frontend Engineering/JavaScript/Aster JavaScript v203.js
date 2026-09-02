/* Aster JavaScript v203 — authenticated buyer-safe derivative: thread/media state reload with empty-thread repair. Host state/dependencies are intentionally external. */
async function loadAll(){
    state.threads = await dbAll("threads","updatedAt",null,"prev");
    state.media   = await dbAll("media","ts",null,"prev");
    if(!state.threads.length){
      const t = makeThread();
      await saveThread(t);
      state.threads = [t];
    }
    if(!state.currentThreadId){
      state.currentThreadId = state.threads[0].id;
    }
    render();
  }
