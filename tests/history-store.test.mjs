import { describe, expect, jest, test } from '@jest/globals';

import { createHistoryStore } from '../src/history-store.mjs';

function makeDb(rows = [], { addImpl } = {}) {
  const add = jest.fn(addImpl ?? (async () => ({ id: 'write' })));
  const get = jest.fn(async () => ({ docs: rows.map((row) => ({ data: () => row })) }));
  const limit = jest.fn(() => ({ get }));
  const orderBy = jest.fn(() => ({ limit }));
  const collection = { orderBy, add };
  const nestedCollection = jest.fn(() => collection);
  const doc = jest.fn(() => ({ collection: nestedCollection }));
  const rootCollection = jest.fn(() => ({ doc }));

  return {
    db: { collection: rootCollection },
    spies: { rootCollection, doc, nestedCollection, orderBy, limit, get, add },
  };
}

describe('history store', () => {
  test('requires a Firestore-compatible database', () => {
    expect(() => createHistoryStore()).toThrow(TypeError);
  });

  test('loads descending Firestore rows as chronological model history', async () => {
    const { db, spies } = makeDb([
      { role: 'assistant', text: 'latest answer' },
      { role: 'user', text: 'earlier question' },
    ]);
    const store = createHistoryStore(db, { historyLimit: 7 });

    await expect(store.load('session-1')).resolves.toEqual([
      { role: 'user', parts: [{ text: 'earlier question' }] },
      { role: 'model', parts: [{ text: 'latest answer' }] },
    ]);
    expect(spies.rootCollection).toHaveBeenCalledWith('sessions');
    expect(spies.doc).toHaveBeenCalledWith('session-1');
    expect(spies.nestedCollection).toHaveBeenCalledWith('messages');
    expect(spies.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    expect(spies.limit).toHaveBeenCalledWith(7);
  });

  test('normalizes unknown roles to user and missing text to an empty string', async () => {
    const { db } = makeDb([{ role: 'tool', text: null }]);
    const store = createHistoryStore(db);

    await expect(store.load('session-2')).resolves.toEqual([
      { role: 'user', parts: [{ text: '' }] },
    ]);
  });

  test('appends every record with a timestamp', async () => {
    const { db, spies } = makeDb();
    const store = createHistoryStore(db);

    await store.append('session-3', [
      { role: 'user', text: 'question' },
      { role: 'assistant', text: 'answer' },
    ]);

    expect(spies.add).toHaveBeenCalledTimes(2);
    for (const [record] of spies.add.mock.calls) {
      expect(record.createdAt).toBeInstanceOf(Date);
    }
    expect(spies.add.mock.calls.map(([record]) => ({ role: record.role, text: record.text }))).toEqual([
      { role: 'user', text: 'question' },
      { role: 'assistant', text: 'answer' },
    ]);
  });

  test('propagates Firestore write failures instead of silently swallowing them', async () => {
    const failure = new Error('write failed');
    const { db } = makeDb([], { addImpl: async () => { throw failure; } });
    const store = createHistoryStore(db);

    await expect(store.append('session-4', [{ role: 'user', text: 'question' }])).rejects.toBe(failure);
  });
});
