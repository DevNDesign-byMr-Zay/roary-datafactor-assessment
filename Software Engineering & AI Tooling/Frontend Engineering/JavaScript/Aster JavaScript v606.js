export async function uploadThenAsk({
  file,
  prompt,
  uploadFile,
  askWithFiles,
} = {}) {
  if (!file) throw new TypeError('A file is required.');
  if (typeof uploadFile !== 'function') throw new TypeError('uploadFile must be a function.');
  if (typeof askWithFiles !== 'function') throw new TypeError('askWithFiles must be a function.');

  const uploaded = await uploadFile(file);
  const reference = {
    objectName: uploaded?.objectName || '',
    url: uploaded?.url || '',
    mimeType: uploaded?.mimeType || file?.type || '',
  };

  if (!reference.objectName && !reference.url) {
    throw new Error('Upload completed without a durable file reference.');
  }

  const response = await askWithFiles(String(prompt || ''), [reference]);
  return { uploaded: reference, response };
}
