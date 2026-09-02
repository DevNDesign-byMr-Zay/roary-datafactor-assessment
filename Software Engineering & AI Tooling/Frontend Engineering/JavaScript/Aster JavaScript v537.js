/* Aster JavaScript v537
Buyer-safe historical derivative: invoke a JSON-memory importer through a temporary native file picker with deterministic cleanup.
*/
async function importJsonFromFilePicker(importer, { accept = "application/json", root = document.body } = {}) {
  if (typeof importer !== "function") return false;
  return await new Promise(resolve => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.hidden = true;
    root.appendChild(input);
    const cleanup = () => { try { input.remove(); } catch {} };
    input.onchange = async () => {
      try {
        const file = input.files?.[0];
        if (!file) return resolve(false);
        const text = await file.text();
        resolve(Boolean(await importer(text)));
      } catch { resolve(false); }
      finally { cleanup(); }
    };
    input.addEventListener("cancel", () => { cleanup(); resolve(false); }, { once: true });
    input.click();
  });
}
