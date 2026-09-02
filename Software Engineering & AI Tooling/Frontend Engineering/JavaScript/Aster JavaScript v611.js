export function analyzeDepthMap(depth, width, height, {
  focusPercentile = 0.35,
  sampleCount = 6000,
  random = Math.random,
} = {}) {
  if (!(depth instanceof Float32Array) && !Array.isArray(depth)) {
    throw new TypeError('depth must be an array-like depth buffer.');
  }
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 2 || height < 2) {
    throw new RangeError('width and height must be integers >= 2.');
  }
  if (depth.length < width * height) throw new RangeError('depth buffer is too small.');

  const mean = (x0, y0, x1, y1) => {
    let total = 0;
    let count = 0;
    const sx0 = Math.max(0, Math.floor(x0));
    const sy0 = Math.max(0, Math.floor(y0));
    const sx1 = Math.min(width, Math.floor(x1));
    const sy1 = Math.min(height, Math.floor(y1));
    for (let y = sy0; y < sy1; y += 2) {
      const row = y * width;
      for (let x = sx0; x < sx1; x += 2) {
        total += Number(depth[row + x]) || 0;
        count += 1;
      }
    }
    return count ? total / count : 0.5;
  };

  const centerMean = mean(width * 0.35, height * 0.35, width * 0.65, height * 0.65);
  const edgeMean = (
    mean(0, 0, width, height * 0.12) +
    mean(0, height * 0.88, width, height) +
    mean(0, height * 0.12, width * 0.12, height * 0.88) +
    mean(width * 0.88, height * 0.12, width, height * 0.88)
  ) / 4;

  const invert = centerMean > edgeMean;
  const n = Math.max(32, Math.min(Math.floor(sampleCount), width * height * 4));
  const samples = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const x = Math.min(width - 1, Math.floor(random() * width));
    const y = Math.min(height - 1, Math.floor(random() * height));
    const raw = Math.max(0, Math.min(1, Number(depth[y * width + x]) || 0));
    samples[i] = invert ? 1 - raw : raw;
  }
  samples.sort((a, b) => a - b);
  const p = Math.max(0, Math.min(1, Number(focusPercentile)));
  const focusIndex = Math.min(samples.length - 1, Math.floor((samples.length - 1) * p));

  return { invert, focus: samples[focusIndex] ?? 0.35, centerMean, edgeMean };
}
