function guessFontFromText(txt){
  const t=(txt||"").trim();
  if(!t) return {style:"unknown", notes:"No legible text"};
  const caps = (t.replace(/[^A-Z]/g,'').length)/(t.replace(/[^A-Za-z]/g,'').length||1);
  const hasDots = /\b[A-Z]\.[A-Z]\./.test(t) || /\./.test(t);
  const allCaps = caps>0.8;
  const condensed = /\b[A-Z]{8,}\b/.test(t) && !/\s{2,}/.test(t);
  let style = allCaps ? "all-caps sans-serif" : "mixed-case sans-serif";
  if (condensed) style += " (condensed)";
  if (hasDots) style += " • technical/monogram feel";
  return {style, notes: allCaps ? "Geometric/tech tone likely" : "Humanist tone likely"};
}
