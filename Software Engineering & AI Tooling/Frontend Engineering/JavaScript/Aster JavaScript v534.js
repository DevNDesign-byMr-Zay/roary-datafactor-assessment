/* Aster JavaScript v534
Buyer-safe historical derivative: render compact media-family previews with a variation-count badge while keeping DOM creation isolated.
*/
function renderMediaGroupPreviews(container, groups, { limit = 18, onOpen } = {}) {
  if (!(container instanceof Element)) return 0;
  container.replaceChildren();
  let rendered = 0;
  for (const group of (Array.isArray(groups) ? groups : []).slice(0, limit)) {
    const representative = group.original || group.items?.[0];
    const source = representative?.source || representative?.src;
    if (!source) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "media-preview";
    const image = document.createElement("img");
    image.src = source;
    image.loading = "lazy";
    image.decoding = "async";
    button.appendChild(image);
    const variationCount = Math.max(0, (group.items?.length || 0) - 1);
    if (variationCount) {
      const badge = document.createElement("span");
      badge.className = "variation-count";
      badge.textContent = String(variationCount);
      button.appendChild(badge);
    }
    button.addEventListener("click", event => { event.preventDefault(); onOpen?.(representative, group); });
    container.appendChild(button);
    rendered += 1;
  }
  return rendered;
}
