/* Aster JavaScript v471
Authenticated historical derivative: normalize a MiniChat image source, preferring stable non-blob references across reloads and blob swaps.
Product-specific dataset keys removed.
*/
function normalizeMiniChatSource(initialSrc, { modal, image } = {}) {
  try {
    const stable = image?.dataset?.stableSrc || image?.dataset?.origSrc || image?.dataset?.sourceSrc || image?.dataset?.currentSrc || "";
    let src = initialSrc || modal?.dataset?.lastNonBlobSrc || modal?.dataset?.currentSrc || stable || image?.src || "";
    src = String(src || "");
    if (src.startsWith("blob:")) {
      const fallback = modal?.dataset?.lastNonBlobSrc || modal?.dataset?.currentSrc || stable || "";
      if (fallback && !String(fallback).startsWith("blob:")) src = String(fallback);
    }
    return src;
  } catch {
    return String(initialSrc || image?.src || "");
  }
}
