/* Aster JavaScript v546
Buyer-safe historical derivative: wrap a late-bound mask provider so every emitted mask matches the active image's natural pixel dimensions.
*/
function wrapMaskProviderToNaturalSize(maskProvider, { getImage, scale = scaleImageDataUrlToSize } = {}) {
  if (!maskProvider || typeof maskProvider.getMaskDataURL !== "function" || maskProvider.__naturalSizeWrapped) return false;
  const original = maskProvider.getMaskDataURL.bind(maskProvider);
  maskProvider.getMaskDataURL = async function getNaturalSizeMask(...args) {
    const raw = await original(...args);
    const image = getImage?.();
    if (!raw || !(image?.naturalWidth > 0) || !(image?.naturalHeight > 0)) return raw;
    return await scale(raw, image.naturalWidth, image.naturalHeight);
  };
  maskProvider.__naturalSizeWrapped = true;
  return true;
}
