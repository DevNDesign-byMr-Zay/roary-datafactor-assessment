/* Aster JavaScript v479
Authenticated historical derivative: synchronize processing state between the active image and its busy overlay.
*/
function setImageBusy(image, overlay, enabled, label = "") {
  if (label) {
    const labelEl = overlay?.querySelector?.(".aster-image-busy-label");
    if (labelEl) labelEl.textContent = String(label);
  }
  overlay?.classList?.toggle("on", !!enabled);
  image?.classList?.toggle("is-processing", !!enabled);
}
