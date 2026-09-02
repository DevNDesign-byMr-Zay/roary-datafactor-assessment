/* Aster JavaScript v530
Buyer-safe historical derivative: reject known placeholder and interface-noise media before recovery or persistence.
*/
function isNoiseMediaSource(source, { blockedFragments = ["favicon", "sprite"], placeholderPrefixes = [] } = {}) {
  if (!source) return true;
  const value = String(source).toLowerCase();
  if (placeholderPrefixes.some(prefix => value.startsWith(String(prefix).toLowerCase()))) return true;
  return blockedFragments.some(fragment => value.includes(String(fragment).toLowerCase()));
}
