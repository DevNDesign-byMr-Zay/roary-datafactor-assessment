/* Aster JavaScript v486
Authenticated historical derivative: compact signature for realtime depth-preview parameters.
*/
function depthPreviewParameterSignature(strength = 0.30, bokeh = 35) {
  return `${Number(strength).toFixed(3)}|${Math.round(Number(bokeh))}`;
}
