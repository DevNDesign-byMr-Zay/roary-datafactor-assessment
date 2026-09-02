/* Aster JavaScript v470
Authenticated historical derivative: idempotently bind MiniChat send controls, with Enter-to-send and Shift+Enter newline behavior.
*/
function bindMiniChatEvents(state, send) {
  if (!state?.sendButton || !state?.composer || typeof send !== "function") return false;
  if (!state.sendButton.__miniChatBound) {
    state.sendButton.addEventListener("click", send);
    state.sendButton.__miniChatBound = true;
  }
  if (!state.composer.__miniChatBound) {
    state.composer.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    });
    state.composer.__miniChatBound = true;
  }
  return true;
}
