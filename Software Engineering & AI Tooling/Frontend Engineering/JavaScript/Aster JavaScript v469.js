/* Aster JavaScript v469
Authenticated historical derivative: lazily resolve MiniChat DOM controls after dynamic modal construction.
*/
function ensureMiniChatElements(state, root = document) {
  state.inner ||= root.getElementById("imageChatInner");
  state.composer ||= root.getElementById("imageChatComposer");
  state.sendButton ||= root.getElementById("imageChatSendBtn");
  state.attachButton ||= root.getElementById("imageChatAttachBtn");
  state.highlightButton ||= root.getElementById("imageChatHighlightBtn");
  return state;
}
