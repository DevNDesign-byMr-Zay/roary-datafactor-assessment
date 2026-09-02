function humanize(meta){
  const cols = (meta.palette||[]).map(c=>`${c.name} (${c.hex}, ~${c.percent}%)`).join(", ");
  const shapes = meta.shapes?.circular_badge_likely ? "a round, coin-like badge" : "a flat rectangular layout";
  const material = meta.shapes?.metallic_likely ? "brushed-metal/ chrome lighting" : "matte lighting";
  const txt = (meta.text||"").replace(/\s+/g," ").trim();
  const hasText = txt ? `Text present: “${txt.slice(0,160)}${txt.length>160?"…":""}”.` : "No legible text.";
  const font = meta.font?.style || "unknown";
  return [
    `Overall, it reads as ${shapes} with ${material}.`,
    `Palette: ${cols || "mostly neutral tones"}.`,
    `${hasText} Probable font vibe: ${font}${meta.font?.notes?` (${meta.font.notes})`:""}.`
  ].join(" ");
}
