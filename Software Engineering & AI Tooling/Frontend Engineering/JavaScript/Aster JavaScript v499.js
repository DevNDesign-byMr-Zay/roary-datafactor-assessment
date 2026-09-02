/* Aster JavaScript v499
Authenticated historical derivative: persist normalized export settings without allowing storage errors to break the UI.
*/
function persistExportSettings(storage, settings, key = "aster.exportSettings") {
  try {
    storage?.setItem?.(key, JSON.stringify(settings || {}));
    return true;
  } catch {
    return false;
  }
}
