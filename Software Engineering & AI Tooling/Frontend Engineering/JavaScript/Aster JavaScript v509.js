/* Aster JavaScript v509
Authenticated historical derivative: keep a native file input enabled for programmatic selection while removing it from pointer and keyboard interaction.
*/
function hardenProgrammaticFileInput(input) {
  if (!input) return null;
  input.disabled = false;
  input.tabIndex = -1;
  Object.assign(input.style, {
    display: "block",
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "1px",
    height: "1px",
    opacity: "0",
    pointerEvents: "none"
  });
  input.setAttribute("aria-hidden", "true");
  return input;
}
