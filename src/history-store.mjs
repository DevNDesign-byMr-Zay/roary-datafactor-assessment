export function createHistoryStore(db, { historyLimit = 12 } = {}) {
  if (!db) throw new TypeError('A Firestore-compatible database is required.');

  function messages(sessionId) {
    return db.collection('sessions').doc(sessionId).collection('messages');
  }

  function durableRecord(record) {
    return {
      role: record.role,
      text: record.text,
      createdAt: new Date(),
    };
  }

  return {
    async load(sessionId) {
      const snapshot = await messages(sessionId)
        .orderBy('createdAt', 'desc')
        .limit(historyLimit)
        .get();

      return snapshot.docs
        .map((doc) => doc.data())
        .reverse()
        .map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(message.text ?? '') }],
        }));
    },

    async append(sessionId, records) {
      const collection = messages(sessionId);

      if (typeof db.batch === 'function' && typeof collection.doc === 'function') {
        const batch = db.batch();
        for (const record of records) {
          batch.set(collection.doc(), durableRecord(record));
        }
        await batch.commit();
        return;
      }

      await Promise.all(records.map((record) => collection.add(durableRecord(record))));
    },
  };
}
