(() => {
  const CONVERSATIONS_KEY = "aster.conversations";
  const ACTIVE_ID_KEY = "aster.activeId";

  function normalizeConversationStore() {
    try {
      const raw = localStorage.getItem(CONVERSATIONS_KEY);
      if (!raw) return [];
      const value = JSON.parse(raw);
      if (!Array.isArray(value)) {
        localStorage.setItem(CONVERSATIONS_KEY, "[]");
        return [];
      }
      return value;
    } catch (_) {
      try { localStorage.setItem(CONVERSATIONS_KEY, "[]"); } catch (_) {}
      return [];
    }
  }

  function persistConversationStore(conversations) {
    const activeId = localStorage.getItem(ACTIVE_ID_KEY) || "";
    try {
      if (typeof window.__asterConvoIDBSave === "function") {
        window.__asterConvoIDBSave(conversations, activeId);
      }
    } catch (_) {}
    try {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (_) {}
  }

  function migrateAssistantAvatar(avatarUrl) {
    if (!avatarUrl) return false;
    const conversations = normalizeConversationStore();
    let changed = false;

    for (const thread of conversations) {
      const messages = thread && thread.messages;
      if (!Array.isArray(messages)) continue;

      for (const message of messages) {
        if (!message || message.role !== "assistant") continue;
        if ("avatar" in message)     { message.avatar = avatarUrl; changed = true; }
        if ("avatarSrc" in message)  { message.avatarSrc = avatarUrl; changed = true; }
        if ("avatar_url" in message) { message.avatar_url = avatarUrl; changed = true; }
        if ("avatarUrl" in message)  { message.avatarUrl = avatarUrl; changed = true; }
      }
    }

    if (changed) persistConversationStore(conversations);
    return changed;
  }

  normalizeConversationStore();

  window.asterConversationMemory = {
    normalizeConversationStore,
    persistConversationStore,
    migrateAssistantAvatar
  };
})();
