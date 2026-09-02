/**
 * Aster JavaScript v634
 * Live composer attachment draft bridge.
 *
 * Provider-neutral primitive for collecting draft attachments, caching an
 * optional materialized representation, and producing a stable submission
 * snapshot. A submission may be valid with attachment data even when its text
 * is empty. Transport, model, endpoint, and UI rendering are intentionally
 * outside this module.
 */

function defaultIdFactory() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return `attachment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeFiles(input) {
  if (input == null) return [];
  if (Array.isArray(input)) return input;
  if (typeof input[Symbol.iterator] === 'function') return Array.from(input);
  return [input];
}

function copyPublic(record) {
  return {
    id: record.id,
    name: record.name,
    mimeType: record.mimeType,
    size: record.size,
    data: record.data,
  };
}

export function createAttachmentDraftBridge(options = {}) {
  const {
    idFactory = defaultIdFactory,
    accept = () => true,
    materialize = async () => null,
    onChange = () => {},
  } = options;

  if (typeof idFactory !== 'function') throw new TypeError('idFactory must be a function');
  if (typeof accept !== 'function') throw new TypeError('accept must be a function');
  if (typeof materialize !== 'function') throw new TypeError('materialize must be a function');
  if (typeof onChange !== 'function') throw new TypeError('onChange must be a function');

  let records = [];

  const emit = () => onChange(records.map(copyPublic));

  const snapshot = () => records.map(copyPublic);

  async function add(input) {
    const files = normalizeFiles(input);
    const added = [];

    for (const file of files) {
      if (!file || !accept(file)) continue;

      const id = String(idFactory(file));
      if (!id) throw new Error('idFactory returned an empty id');
      if (records.some((record) => record.id === id)) {
        throw new Error(`duplicate attachment id: ${id}`);
      }

      const record = {
        id,
        name: typeof file.name === 'string' && file.name ? file.name : 'attachment',
        mimeType: typeof file.type === 'string' ? file.type : '',
        size: Number.isFinite(file.size) && file.size >= 0 ? file.size : 0,
        data: null,
      };

      records.push(record);

      try {
        const value = await materialize(file, copyPublic(record));
        if (value != null) record.data = value;
      } catch (_) {
        // Keep the draft record even when optional materialization fails.
      }

      added.push(copyPublic(record));
    }

    if (added.length) emit();
    return added;
  }

  function remove(id) {
    const key = String(id);
    const before = records.length;
    records = records.filter((record) => record.id !== key);
    const changed = records.length !== before;
    if (changed) emit();
    return changed;
  }

  function clear() {
    if (!records.length) return false;
    records = [];
    emit();
    return true;
  }

  function buildSubmission(config = {}) {
    const {
      text = '',
      emptyText = '',
      requireMaterialized = true,
      mapAttachment = copyPublic,
    } = config;

    if (typeof mapAttachment !== 'function') {
      throw new TypeError('mapAttachment must be a function');
    }

    const normalizedText = String(text ?? '').trim();
    const eligible = records.filter((record) => !requireMaterialized || record.data != null);
    const attachments = eligible.map((record) => mapAttachment(copyPublic(record)));

    return Object.freeze({
      canSubmit: normalizedText.length > 0 || attachments.length > 0,
      text: normalizedText || (attachments.length ? String(emptyText ?? '') : ''),
      attachments: Object.freeze(attachments.slice()),
      attachmentIds: Object.freeze(eligible.map((record) => record.id)),
    });
  }

  return Object.freeze({
    add,
    remove,
    clear,
    snapshot,
    buildSubmission,
    get size() {
      return records.length;
    },
  });
}

export async function fileToDataUrl(file, options = {}) {
  const {
    FileReaderCtor = globalThis.FileReader,
  } = options;

  if (!file) throw new TypeError('file is required');
  if (typeof FileReaderCtor !== 'function') {
    throw new Error('FileReader is unavailable');
  }

  return await new Promise((resolve, reject) => {
    const reader = new FileReaderCtor();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}
