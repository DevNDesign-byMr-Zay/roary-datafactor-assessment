/* Aster JavaScript v472
Authenticated historical derivative: publish the active MiniChat thread through generic integration globals.
*/
function setMiniChatGlobals(thread, activeThreadId, target = window) {
  try {
    target.__miniChatCurrentThreadId = thread ? thread.id : (activeThreadId || undefined);
    target.__miniChatCurrentThread = thread || undefined;
  } catch {}
}
