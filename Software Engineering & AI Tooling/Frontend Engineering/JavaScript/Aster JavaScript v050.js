/* Aster JavaScript v050
Authenticated historical derivative: self-contained chat code enhancer with lightweight highlighting, copy/download/share actions, and conservative code detection.
Original product identity, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
*/
(function(){
  "use strict";
  if(window.__asterChatCodeEnhancerV1) return;
  window.__asterChatCodeEnhancerV1 = true;

  const escapeHtml = value => String(value || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");

  function detectLanguage(raw, code){
    let lang = String(raw || "").toLowerCase().replace(/^language-/,"").trim();
    const text = String(code || "");
    if(!lang){
      if(/^\s*</.test(text) && /<\/[a-z]/i.test(text)) lang="html";
      else if(/\b(def|class|import|from)\b/.test(text)) lang="python";
      else if(/\b(Invoke-RestMethod|Get-ChildItem|Set-ItemProperty|\$env:)\b/i.test(text)) lang="powershell";
      else if(/\b(const|let|var|function|=>|export)\b/.test(text)) lang="javascript";
      else if(/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|FROM|WHERE|JOIN)\b/i.test(text)) lang="sql";
      else if(/[.#][\w-]+\s*\{/.test(text) || /@media\b/.test(text)) lang="css";
      else lang="code";
    }
    return ({js:"javascript",ts:"typescript",py:"python",ps1:"powershell"})[lang] || lang;
  }

  function highlight(code, language){
    let html = escapeHtml(code);
    const lang = String(language || "").toLowerCase();

    if(["python","powershell","bash"].includes(lang)){
      html = html.replace(/(^|\n)\s*#.*(?=\n|$)/g, m=>`<span class="tok-cmt">${m}</span>`);
    }else if(lang === "sql"){
      html = html.replace(/--.*(?=\n|$)/g, m=>`<span class="tok-cmt">${m}</span>`);
    }else{
      html = html.replace(/\/\/.*(?=\n|$)/g, m=>`<span class="tok-cmt">${m}</span>`);
      html = html.replace(/\/\*[\s\S]*?\*\//g, m=>`<span class="tok-cmt">${m}</span>`);
    }

    html = html.replace(/(&quot;[\s\S]*?&quot;|&#39;[\s\S]*?&#39;|`[\s\S]*?`)/g,
      m=>`<span class="tok-str">${m}</span>`);
    html = html.replace(/\b(\d+(?:\.\d+)?)\b/g,'<span class="tok-num">$1</span>');

    const keywordPattern = lang === "python"
      ? /\b(def|class|return|import|from|as|if|elif|else|for|while|try|except|finally|with|lambda|yield|True|False|None)\b/g
      : lang === "sql"
        ? /\b(SELECT|FROM|WHERE|JOIN|ON|GROUP|BY|ORDER|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|ALTER|DROP)\b/gi
        : /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|try|catch|finally|throw|new|class|extends|import|export|async|await)\b/g;

    html = html.replace(keywordPattern,'<span class="tok-kw">$1</span>');
    html = html.replace(/\b([A-Za-z_$][\w$]*)(?=\s*\()/g,'<span class="tok-fn">$1</span>');
    return html;
  }

  function extensionFor(language){
    return ({
      python:"py",javascript:"js",typescript:"ts",html:"html",css:"css",
      powershell:"ps1",sql:"sql",bash:"sh",json:"json"
    })[language] || "txt";
  }

  function actionButton(label){
    const button = document.createElement("button");
    button.className = "aster-code-btn";
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-label",label);
    return button;
  }

  function buildFrame(languageRaw, source){
    const code = String(source || "").replace(/\s+$/,"");
    const language = detectLanguage(languageRaw, code);

    const frame = document.createElement("div");
    frame.className = "aster-codeframe";

    const bar = document.createElement("div");
    bar.className = "aster-codebar";

    const label = document.createElement("span");
    label.className = "aster-code-lang";
    label.textContent = String(language || "code").toUpperCase();

    const actions = document.createElement("div");
    actions.className = "aster-code-actions";

    const copy = actionButton("Copy");
    copy.addEventListener("click", async event=>{
      event.preventDefault(); event.stopPropagation();
      try{ await navigator.clipboard.writeText(code); }catch(_){}
    });

    const download = actionButton("Download");
    download.addEventListener("click", event=>{
      event.preventDefault(); event.stopPropagation();
      try{
        const blob = new Blob([code],{type:"text/plain;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `aster-snippet.${extensionFor(language)}`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(()=>URL.revokeObjectURL(url),1500);
      }catch(_){}
    });

    const share = actionButton("Share");
    share.addEventListener("click", async event=>{
      event.preventDefault(); event.stopPropagation();
      try{
        if(navigator.share) await navigator.share({text:code});
        else await navigator.clipboard.writeText(code);
      }catch(_){}
    });

    actions.append(copy,download,share);
    bar.append(label,actions);

    const pre = document.createElement("pre");
    pre.className = "aster-codepre";
    const codeElement = document.createElement("code");
    codeElement.className = "aster-code";
    codeElement.dataset.lang = language;
    codeElement.innerHTML = highlight(code,language);
    pre.appendChild(codeElement);

    frame.append(bar,pre);
    return frame;
  }

  function enhancePre(pre){
    if(!pre || !(pre instanceof Element)) return false;
    if(pre.dataset.asterEnhanced === "1" || pre.closest(".aster-codeframe")) return false;

    const codeElement = pre.querySelector("code") || pre;
    const raw = codeElement.textContent || "";
    if(!raw.trim()) return false;

    const rawLanguage =
      codeElement.getAttribute?.("data-lang") ||
      String(codeElement.className || "").match(/language-([\w+#-]+)/i)?.[1] ||
      pre.getAttribute?.("data-lang") || "";

    const frame = buildFrame(rawLanguage,raw);
    pre.dataset.asterEnhanced = "1";
    pre.replaceWith(frame);
    return true;
  }

  function scan(root){
    if(!root?.querySelectorAll) return;
    if(root.matches?.("pre")) enhancePre(root);
    root.querySelectorAll("pre").forEach(enhancePre);
  }

  scan(document);

  const observer = new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes || []){
        if(node?.nodeType === 1) scan(node);
      }
    }
  });

  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.asterEnhanceCodePre = enhancePre;
})();
