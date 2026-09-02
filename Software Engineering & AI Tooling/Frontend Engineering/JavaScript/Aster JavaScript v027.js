/* Aster JavaScript v027
Authenticated historical derivative: durable conversation migration persistence.
The historical delta persists migrated conversation state to IndexedDB before mirroring to localStorage.
Original product identity, avatars, prompts, credentials, personal paths, and protected reasoning architecture removed.
*/
(function(){
  window.asterPersistMigratedConversations = function(conversations, activeId){
    if (!Array.isArray(conversations)) return false;
    try {
      if (typeof window.__asterConvoIDBSave === "function") {
        window.__asterConvoIDBSave(conversations, String(activeId || ""));
      }
    } catch (_) {}
    try {
      localStorage.setItem("aster.conversations", JSON.stringify(conversations));
      return true;
    } catch (_) {
      return false;
    }
  };
})();
