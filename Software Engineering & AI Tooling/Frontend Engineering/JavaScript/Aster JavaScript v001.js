export const api = {

base: import.meta.env.VITE_API_BASE,

token: import.meta.env.VITE_ASTER_TOKEN || '',

async chat({ sessionId, text }) {

const r = await fetch(`${this.base}/chat`, {

method: 'POST',

headers: {

'Content-Type': 'application/json',

...(this.token ? { 'x-aster-token': this.token } : {})

},

body: JSON.stringify({ sessionId, text })

});

if (!r.ok) throw new Error(await r.text());

return r.json();

},

async history({ sessionId, limit = 20 }) {

const u = new URL(`${this.base}/history`);

u.searchParams.set('sessionId', sessionId);

u.searchParams.set('limit', String(limit));

const r = await fetch(u, {

headers: { ...(this.token ? { 'x-aster-token': this.token } : {}) }

});

if (!r.ok) throw new Error(await r.text());

return r.json();

},

async upload({ sessionId, file }) {

const fd = new FormData();

fd.append('file', file);

const r = await fetch(`${this.base}/upload?sessionId=${encodeURIComponent(sessionId)}`, {

method: 'POST',

headers: { ...(this.token ? { 'x-aster-token': this.token } : {}) },

body: fd

});

if (!r.ok) throw new Error(await r.text());

return r.json();

},

async health() {

const r = await fetch(`${this.base}/health`);

if (!r.ok) throw new Error(await r.text());

return r.json();

}

};
