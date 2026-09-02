/**
 * Browser audio capture controller built around getUserMedia + MediaRecorder.
 * It collects emitted chunks and materializes one Blob when recording stops.
 */
export function createAudioCaptureController({
  mediaDevices,
  MediaRecorderCtor,
  BlobCtor = Blob,
  mimeType = 'audio/webm',
} = {}) {
  if (!mediaDevices || typeof mediaDevices.getUserMedia !== 'function') {
    throw new TypeError('mediaDevices.getUserMedia is required.');
  }
  if (typeof MediaRecorderCtor !== 'function') {
    throw new TypeError('MediaRecorderCtor must be a constructor.');
  }
  if (typeof BlobCtor !== 'function') {
    throw new TypeError('BlobCtor must be a constructor.');
  }

  let recorder = null;
  let chunks = [];
  let latestBlob = null;

  async function start() {
    const stream = await mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorderCtor(stream);
    chunks = [];
    latestBlob = null;

    recorder.ondataavailable = event => {
      if (event?.data != null) chunks.push(event.data);
    };
    recorder.onstop = () => {
      latestBlob = new BlobCtor(chunks, { type: mimeType });
    };
    recorder.start();
    return recorder;
  }

  function stop() {
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  }

  function getBlob() {
    return latestBlob;
  }

  function getState() {
    return recorder?.state || 'inactive';
  }

  return { start, stop, getBlob, getState };
}
