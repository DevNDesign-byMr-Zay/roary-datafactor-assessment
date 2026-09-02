/* Aster JavaScript v518
Authenticated historical derivative: bridge a native file input into an attachment-ingestion pipeline without coupling the picker UI to attachment storage internals.
*/
function createPickedFileBridge(addFiles, renderAll) {
  if (typeof addFiles !== 'function' || typeof renderAll !== 'function') {
    throw new TypeError('addFiles and renderAll must be functions');
  }
  return function handlePicked(input) {
    const files = input && input.files ? Array.from(input.files) : [];
    if (files.length) addFiles(files);
    renderAll();
    return files.length;
  };
}
