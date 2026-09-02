/* Aster JavaScript v503
Authenticated historical derivative: render removable attachment chips whose controls isolate removal clicks from parent composer handlers.
*/
function renderAttachmentChips(strip, attachments, onRemove, iconFor = () => "📎") {
  if (!strip) return;
  strip.replaceChildren();
  for (const item of Array.isArray(attachments) ? attachments : []) {
    const chip = document.createElement("div");
    chip.className = "attachment-chip";
    const icon = document.createElement("span");
    icon.className = "attachment-chip-icon";
    icon.textContent = iconFor(item);
    const name = document.createElement("span");
    name.className = "attachment-chip-name";
    name.textContent = item?.name || "attachment";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "attachment-chip-remove";
    remove.setAttribute("aria-label", `Remove ${name.textContent}`);
    remove.textContent = "✕";
    remove.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      onRemove?.(item?.id, item);
    });
    chip.append(icon, name, remove);
    strip.appendChild(chip);
  }
}
