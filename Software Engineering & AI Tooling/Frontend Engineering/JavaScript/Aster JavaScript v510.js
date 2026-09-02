/* Aster JavaScript v510
Authenticated historical derivative: capture delegated file-input changes so dynamically replaced composer inputs still reach one attachment pipeline.
*/
function bindDelegatedFileChanges({ root = document, matches = input => input?.type === "file", onFiles } = {}) {
  const handler = event => {
    const input = event.target;
    if (!input || input.tagName !== "INPUT") return;
    if (String(input.type || "").toLowerCase() !== "file") return;
    if (!matches(input)) return;
    const files = Array.from(input.files || []);
    if (files.length) onFiles?.(files, input, event);
  };
  root.addEventListener("change", handler, true);
  return () => root.removeEventListener("change", handler, true);
}
