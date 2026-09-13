import { describe, expect, jest, test } from '@jest/globals';

import { createHistoryStore } from '../src/history-store.mjs';

function makeDb(rows = [], { addImpl, batchCommitImpl, useBatch = true } = {}) {
  const add = jest.fn(addImpl ?? (async () => ({ id: 'write' })));
  const get = jest.fn(async () => ({ docs: rows.map((row) => ({ data: () => row })) }));
  const limit = jest.fn(() => ({ get }));
  const orderBy = jest.fn(() => ({ limit }));
  const messageDoc = jest.fn(() => ({ path: `messages/generated-${messageDoc.mock.calls.length + 1}` }));
  const collection = { orderBy, add, doc: messageDoc };
  const nestedCollection = jest.fn(() => collection);
  const sessionDoc = jest.fn(() => ({ collection: nestedCollection }));
  const rootCollection = jest.fn(() => ({ doc: sessionDoc }));
  const batch = {};
  const batchSet = jest.fn(() => batch);
  const batchCommit = jest.fn(batchCommitImpl ?? (async () => []));
  batch.set = batchSet;
  batch.commit = batchCommit;
  const batchFactory = jest.fn(() => batch);
  const db = { collection: rootCollection };
  if (useBatch) db.batch = batchFactory;

  return {
    db,
    spies: {
      rootCollection,
      sessionDoc,
      nestedCollection,
      orderBy,
      limit,
      get,
      add,
      messageDoc,
      batchFactory,
      batchSet,
      batchCommit,
    },
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
    expect(spies.sessionDoc).toHaveBeenCalledWith('session-1');
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

  test('uses one Firestore batch for the complete chat turn', async () => {
    const { db, spies } = makeDb();
    const store = createHistoryStore(db);

    await store.append('session-3', [
      { role: 'user', text: 'question' },
      { role: 'assistant', text: 'answer' },
    ]);

    expect(spies.batchFactory).toHaveBeenCalledTimes(1);
    expect(spies.messageDoc).toHaveBeenCalledTimes(2);
    expect(spies.batchSet).toHaveBeenCalledTimes(2);
    expect(spies.batchCommit).toHaveBeenCalledTimes(1);
    expect(spies.add).not.toHaveBeenCalled();

    for (const [, record] of spies.batchSet.mock.calls) {
      expect(record.createdAt).toBeInstanceOf(Date);
    }
    expect(spies.batchSet.mock.calls.map(([, record]) => ({ role: record.role, text: record.text }))).toEqual([
      { role: 'user', text: 'question' },
      { role: 'assistant', text: 'answer' },
    ]);
  });

  test('propagates batch commit failures without falling back to per-message writes', async () => {
    const failure = new Error('batch commit failed');
    const { db, spies } = makeDb([], {
      batchCommitImpl: async () => {
        throw failure;
      },
    });
    const store = createHistoryStore(db);

    await expect(
      store.append('session-4', [
        { role: 'user', text: 'question' },
        { role: 'assistant', text: 'answer' },
      ]),
    ).rejects.toBe(failure);
    expect(spies.batchCommit).toHaveBeenCalledTimes(1);
    expect(spies.add).not.toHaveBeenCalled();
  });

  test('keeps a compatibility path for adapters without write batches', async () => {
    const { db, spies } = makeDb([], { useBatch: false });
    const store = createHistoryStore(db);

    await store.append('session-5', [
      { role: 'user', text: 'question' },
      { role: 'assistant', text: 'answer' },
    ]);

    expect(spies.add).toHaveBeenCalledTimes(2);
    expect(spies.batchFactory).not.toHaveBeenCalled();
  });
});
