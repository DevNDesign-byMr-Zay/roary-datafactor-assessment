/* Aster JavaScript v300 — authenticated buyer-safe derivative: image-source eligibility detection. Host state/dependencies are intentionally external. */
function asterLooksLikeImg(s){
    if(!s) return false;
    s = String(s);
    if(s.indexOf('data:image')>=0) return true;
    if(/^blob:/i.test(s)) return true;
    if(/^https?:/i.test(s) && (/(\.(png|jpe?g|webp|gif))(\?|#|$)/i.test(s) || /\/(media|images?|img|output)\b/i.test(s))) return true;
    if(/^(png|jpe?g|webp|gif)[\.;:](?:base64),/i.test(s)) return true;
    if(/!\[[^\]]*\]\(([^)]+)\)/.test(s)) return true;
    if(/<img[^>]+src=/i.test(s)) return true;
    return false;
  }
