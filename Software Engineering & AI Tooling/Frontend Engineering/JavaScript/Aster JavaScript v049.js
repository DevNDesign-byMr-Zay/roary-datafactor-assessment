/* Aster JavaScript v049
Authenticated historical derivative: shared code-palette controller and conservative plain-code normalization.
Original product identity, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
*/
(function(){
  "use strict";
  if(window.__asterCodePaletteV1) return;
  window.__asterCodePaletteV1 = true;

  const PALETTES = {
    astercode: {
      bg:"#000000", border:"rgba(255,255,255,0)",
      fg:"rgba(236,236,244,.94)", cmt:"rgba(180,190,210,.55)",
      kw:"#C792EA", str:"#C3E88D", num:"#F78C6C", fn:"#FFCB6B",
      typ:"#89DDFF", tag:"#82AAFF", attr:"#FF5370",
      op:"rgba(235,225,255,.86)", pun:"rgba(235,225,255,.68)"
    },
    vscode: {
      bg:"#1e1e1e", border:"rgba(255,255,255,.12)",
      fg:"#d4d4d4", cmt:"#6A9955", kw:"#C586C0", str:"#CE9178",
      num:"#B5CEA8", fn:"#DCDCAA", typ:"#4EC9B0", tag:"#569CD6",
      attr:"#9CDCFE", op:"#d4d4d4", pun:"#d4d4d4"
    },
    onedark: {
      bg:"#282C34", border:"rgba(255,255,255,.10)",
      fg:"#ABB2BF", cmt:"#5C6370", kw:"#C678DD", str:"#98C379",
      num:"#D19A66", fn:"#61AFEF", typ:"#56B6C2", tag:"#E06C75",
      attr:"#D19A66", op:"#ABB2BF", pun:"#ABB2BF"
    },
    dracula: {
      bg:"#282a36", border:"rgba(255,255,255,.10)",
      fg:"#f8f8f2", cmt:"#6272a4", kw:"#ff79c6", str:"#f1fa8c",
      num:"#bd93f9", fn:"#50fa7b", typ:"#8be9fd", tag:"#ff5555",
      attr:"#50fa7b", op:"#f8f8f2", pun:"#f8f8f2"
    },
    githubdark: {
      bg:"#0d1117", border:"rgba(240,246,252,.10)",
      fg:"#c9d1d9", cmt:"#8b949e", kw:"#ff7b72", str:"#a5d6ff",
      num:"#79c0ff", fn:"#d2a8ff", typ:"#7ee787", tag:"#7ee787",
      attr:"#ffa657", op:"#c9d1d9", pun:"#c9d1d9"
    },
    solarizeddark: {
      bg:"#002b36", border:"rgba(147,161,161,.16)",
      fg:"#93a1a1", cmt:"#586e75", kw:"#b58900", str:"#2aa198",
      num:"#d33682", fn:"#268bd2", typ:"#859900", tag:"#268bd2",
      attr:"#b58900", op:"#93a1a1", pun:"#93a1a1"
    }
  };

  const VAR_MAP = {
    bg:"--ac-code-bg", border:"--ac-code-border", fg:"--ac-code-fg",
    cmt:"--ac-code-cmt", kw:"--ac-code-kw", str:"--ac-code-str",
    num:"--ac-code-num", fn:"--ac-code-fn", typ:"--ac-code-type",
    tag:"--ac-code-tag", attr:"--ac-code-attr",
    op:"--ac-code-op", pun:"--ac-code-punc"
  };

  function normalizeName(value){
    return String(value || "astercode").toLowerCase().replace(/[^a-z0-9]/g,"");
  }

  function applyPalette(name){
    const key = normalizeName(name);
    const palette = PALETTES[key] || PALETTES.astercode;
    const root = document.documentElement;
    for(const [prop, cssVar] of Object.entries(VAR_MAP)){
      root.style.setProperty(cssVar, palette[prop]);
    }
    try{ localStorage.setItem("aster.codePalette", key); }catch(_){}
    document.dispatchEvent(new CustomEvent("aster:code-palette-change", {
      detail:{name:key, palette}
    }));
    return key;
  }

  function isCodeishLine(line){
    const text = String(line || "").trim();
    if(!text) return false;
    if(/^[-•]\s+/.test(text) || /^\d+\.\s+/.test(text)) return false;
    if(/^<\/?[a-z][\w:-]*/i.test(text)) return true;
    if(/^(import|from|def|class|return|const|let|var|function|interface|type|export)\b/i.test(text)) return true;
    if(/^(select|insert|update|delete|create|drop|alter)\b/i.test(text)) return true;
    if(/^(Set-|Get-|New-|Invoke-)\w+/i.test(text)) return true;
    if(/[;{}=<>()[\]]/.test(text) || /=>/.test(text)) return true;
    if(/^\s*(\/\/|\/\*|\*\/|#)/.test(text)) return true;
    return false;
  }

  function guessLanguage(line){
    const text = String(line || "").trim();
    if(/^<\/?[a-z]/i.test(text)) return "html";
    if(/^(def|class|from|import)\b/.test(text)) return "python";
    if(/^(const|let|var|function|export|import)\b/.test(text)) return "javascript";
    if(/^(SELECT|INSERT|UPDATE|DELETE|CREATE)\b/i.test(text)) return "sql";
    if(/^(Set-|Get-|New-|Invoke-)\w+/i.test(text)) return "powershell";
    return "code";
  }

  function normalizePlainCode(source){
    const lines = String(source || "").replace(/\r\n?/g,"\n").split("\n");
    const output = [];
    let i = 0;

    while(i < lines.length){
      if(!isCodeishLine(lines[i])){
        output.push(lines[i++]);
        continue;
      }

      const start = i;
      let codeish = 0;
      while(i < lines.length && (isCodeishLine(lines[i]) || !lines[i].trim())){
        if(isCodeishLine(lines[i])) codeish++;
        i++;
      }

      const block = lines.slice(start, i);
      if(codeish >= 3){
        output.push("```" + guessLanguage(block.find(isCodeishLine) || "") + "\n" + block.join("\n") + "\n```");
      }else{
        output.push(...block);
      }
    }
    return output.join("\n");
  }

  window.asterCodePalette = {palettes:PALETTES, apply:applyPalette};
  window.asterNormalizePlainCode = normalizePlainCode;

  let saved = "astercode";
  try{ saved = localStorage.getItem("aster.codePalette") || saved; }catch(_){}
  applyPalette(saved);
})();
