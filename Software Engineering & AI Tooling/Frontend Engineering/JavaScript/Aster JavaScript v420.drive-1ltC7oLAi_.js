async function recognizeCanvas(canvas, label="Page"){
  const auto = asterGetSetting('ocrAuto', true);
  const lang = asterGetSetting('ocrLang', 'eng');

  // If auto, analyze and choose PSM/OEM; otherwise respect UI (with sane defaults)
  let psm, oem;
  if(auto){
    const { guessPSM, guessOEM } = analyzeCanvasForLayout(canvas);
    psm = guessPSM; oem = guessOEM;
  }else{
    psm = Number(asterGetSetting('ocrPSM', PSM.AUTO));
    oem = Number(asterGetSetting('ocrOEM', OEM.DEFAULT));
  }

  const whitelist = asterGetSetting('ocrWhitelist','').trim();
  const worker = await asterEnsureWorker(lang);

  const params = { tessedit_pageseg_mode: String(psm) };
  if(whitelist) params['tessedit_char_whitelist'] = whitelist;
  // 'oem' may be ignored by some builds of tesseract.js, but safe to set:
  params['oem'] = String(oem);

  await worker.setParameters(params);
  const result = await worker.recognize(canvas);
  const conf = (result && result.data && typeof result.data.confidence === 'number')
               ? result.data.confidence : (result?.data?.confidence ?? null);

  return {
    label, text: (result?.data?.text || '').trim(),
    confidence: conf,
    words: (result?.data?.words || [])
  };
}
