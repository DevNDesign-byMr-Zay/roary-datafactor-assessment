import { resolveAsterImageToolBase } from './Aster JavaScript v092.js';
export async function requestAsterImageEdit(payload, {signal} = {}) {
  const base = resolveAsterImageToolBase();
  const res = await fetch(`${base}/tool/image_edit`, {
    method: 'POST', mode: 'cors', credentials: 'omit',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload), signal
  });
  if (!res.ok) throw new Error(`Image edit failed (${res.status})`);
  return res.json();
}
