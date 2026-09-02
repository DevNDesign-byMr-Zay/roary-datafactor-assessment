import { resolveAsterImageToolBase } from './Aster JavaScript v092.js';
import { buildAsterRelightControls } from './Aster JavaScript v094.js';
export async function executeAsterRelightGrade({imageUrl, state, signal}) {
  const base = resolveAsterImageToolBase();
  const controls = buildAsterRelightControls(state);
  const res = await fetch(`${base}/tool/relight_grade`, {
    method:'POST', mode:'cors', credentials:'omit',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({image_url:imageUrl, ...controls, output_format:'png'}), signal
  });
  if (!res.ok) throw new Error(`Relight failed (${res.status})`);
  return res.json();
}
