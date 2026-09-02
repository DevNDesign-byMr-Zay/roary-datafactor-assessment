export async function loadRecentTurns(turnStore, sessionId, limit = 8) {
  const boundedLimit = Math.max(1, Math.min(Number(limit) || 8, 100));
  const rows = await turnStore.list({
    sessionId: String(sessionId),
    orderBy: 'timestamp',
    direction: 'desc',
    limit: boundedLimit,
  });

  return [...rows].reverse();
}
