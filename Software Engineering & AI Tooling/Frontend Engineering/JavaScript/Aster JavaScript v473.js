/* Aster JavaScript v473
Authenticated historical derivative: persist a local image-tool base with session-storage fallback when local storage is unavailable or full.
Product-specific keys and logging removed.
*/
function persistImageToolBase(value, key = "aster.imageToolBase") {
  try {
    if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    return "localStorage";
  } catch {
    try {
      sessionStorage.setItem(key, value);
      return "sessionStorage";
    } catch {
      return "memory-only";
    }
  }
}
