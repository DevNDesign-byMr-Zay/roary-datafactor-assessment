import { describe, expect, jest, test } from '@jest/globals';

import { createHistoryStore } from '../src/history-store.mjs';

function makeDb() {
  const add = jest.fn(async () => ({ id: 'write' }));
  const get = jest.fn(async () => ({ docs: [] }));
  const limit = jest.fn(() => ({ get }));
  const orderBy = jest.fn(() => ({ limit }));
  const messageDoc = jest.fn(() => ({ path: 'messages/generated' }));
  const collection = { orderBy, add, doc: messageDoc };
  const nestedCollection = jest.fn(() => collection);
  const sessionDoc = jest.fn(() => ({ collection: nestedCollection }));
  const rootCollection = jest.fn(() => ({ doc: sessionDoc }));
  const batch = {};
  const batchSet = jest.fn(() => batch);
  const batchCommit = jest.fn(async () => []);
  batch.set = batchSet;
  batch.commit = batchCommit;
  const batchFactory = jest.fn(() => batch);

  return {
    db: { collection: rootCollection, batch: batchFactory },
    spies: { rootCollection, batchFactory, batchCommit, add },
  };
}

describe('history-store abort boundary', () => {
  test('rejects an aborted load before touching Firestore', async () => {
    const { db, spies } = makeDb();
    const store = createHistoryStore(db);
    const controller = new globalThis.AbortController();
    controller.abort();

    await expect(store.load('session-aborted', { signal: controller.signal })).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(spies.rootCollection).not.toHaveBeenCalled();
  });

  test('does not construct or commit a write after abort', async () => {
    const { db, spies } = makeDb();
    const store = createHistoryStore(db);
    const controller = new globalThis.AbortController();
    controller.abort();

    await expect(
      store.append(
        'session-aborted',
        [
          { role: 'user', text: 'question' },
          { role: 'assistant', text: 'answer' },
        ],
        { signal: controller.signal },
      ),
    ).rejects.toMatchObject({ name: 'AbortError' });

    expect(spies.rootCollection).not.toHaveBeenCalled();
    expect(spies.batchFactory).not.toHaveBeenCalled();
    expect(spies.batchCommit).not.toHaveBeenCalled();
    expect(spies.add).not.toHaveBeenCalled();
  });
});
