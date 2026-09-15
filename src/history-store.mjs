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

  function assertWriteActive(signal) {
    if (signal?.aborted) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }
  }

  return {
    async load(sessionId, { signal } = {}) {
      assertWriteActive(signal);
      const snapshot = await messages(sessionId)
        .orderBy('createdAt', 'desc')
        .limit(historyLimit)
        .get();
      assertWriteActive(signal);

      return snapshot.docs
        .map((doc) => doc.data())
        .reverse()
        .map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(message.text ?? '') }],
        }));
    },

    async append(sessionId, records, { signal } = {}) {
      assertWriteActive(signal);
      const collection = messages(sessionId);

      if (typeof db.batch === 'function' && typeof collection.doc === 'function') {
        const batch = db.batch();
        for (const record of records) {
          assertWriteActive(signal);
          batch.set(collection.doc(), durableRecord(record));
        }
        assertWriteActive(signal);
        await batch.commit();
        return;
      }

      assertWriteActive(signal);
      await Promise.all(records.map((record) => {
        assertWriteActive(signal);
        return collection.add(durableRecord(record));
      }));
    },
  };
}
