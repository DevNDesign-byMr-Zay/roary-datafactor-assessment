/* Aster JavaScript v205 — authenticated buyer-safe derivative: new-thread record constructor. Host state/dependencies are intentionally external. */
function makeThread(){
    const id = uuid("t"); const now = Date.now();
    return { id, title:"New Chat", createdAt:now, updatedAt:now, messages:[] };
  }
