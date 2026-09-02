/* Aster JavaScript v535
Buyer-safe historical derivative: export a multi-store application-memory snapshot as a downloadable JSON file.
*/
async function exportMemorySnapshot({ readLocalState, readThreads, readMedia, filename = "memory-export.json" } = {}) {
  const snapshot = {
    version: 1,
    timestamp: Date.now(),
    localState: await Promise.resolve(readLocalState?.()).catch(() => null),
    threads: await Promise.resolve(readThreads?.()).catch(() => null),
    media: await Promise.resolve(readMedia?.()).catch(() => null)
  };
  const blob = new Blob([JSON.stringify(snapshot)], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => { URL.revokeObjectURL(href); anchor.remove(); }, 500);
  return snapshot;
}
