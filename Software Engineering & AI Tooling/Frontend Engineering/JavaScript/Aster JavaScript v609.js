/**
 * Preserve one immutable preview base so repeated previews never chain from
 * previously generated previews. Reset only when a real result is committed.
 */
export function createPreviewBaseController() {
  let baseSource = '';

  return {
    begin(currentSource) {
      if (!baseSource) baseSource = String(currentSource || '').trim();
      return baseSource;
    },

    sourceForPreview(currentSource) {
      return baseSource || String(currentSource || '').trim();
    },

    async replacePreview(nextSource, { preload, apply } = {}) {
      const next = String(nextSource || '').trim();
      if (!next) return '';
      if (typeof preload === 'function') await preload(next);
      if (typeof apply === 'function') await apply(next);
      return next;
    },

    commit(finalSource = '') {
      baseSource = '';
      return String(finalSource || '').trim();
    },

    cancel() {
      baseSource = '';
    },

    get baseSource() {
      return baseSource;
    },
  };
}
