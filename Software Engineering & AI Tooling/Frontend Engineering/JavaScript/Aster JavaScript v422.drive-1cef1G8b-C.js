function analyzeCanvasForLayout(canvas){
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const { width:w, height:h } = canvas;
  const data = ctx.getImageData(0,0,w,h).data;

  // Compute simple metrics: grayscale variance + percent of "ink" pixels (dark)
  let sum=0, sum2=0, n=w*h, dark=0;
  for(let i=0;i<n;i++){
    const o = i*4;
    const r=data[o], g=data[o+1], b=data[o+2];
    const y = 0.2126*r + 0.7152*g + 0.0722*b;
    sum += y; sum2 += y*y;
    if(y < 140) dark++;
  }
  const mean = sum/n;
  const variance = Math.max(0, (sum2/n) - (mean*mean));
  const darkRatio = dark/n;

  // Very sparse ink -> SPARSE_TEXT; Very dense and uniform -> SINGLE_BLOCK
  // Tall aspect w/ columns -> SINGLE_COLUMN
  const aspect = h / Math.max(1, w);

  let guessPSM = PSM.AUTO;
  if(darkRatio < 0.02) guessPSM = PSM.SPARSE_TEXT;
  else if(darkRatio > 0.55 && variance < 2200) guessPSM = PSM.SINGLE_BLOCK;
  else if(aspect > 1.2 && variance < 3400) guessPSM = PSM.SINGLE_COLUMN;
  else guessPSM = PSM.AUTO;

  // Prefer DEFAULT/LSTM; legacy rarely helps in Tesseract.js
  let guessOEM = OEM.DEFAULT;

  return { guessPSM, guessOEM, metrics:{ mean, variance, darkRatio, aspect } };
}
