export function filterAndSortSessions(sessions, query = '') {
  const needle = String(query || '').trim().toLowerCase();

  return (Array.isArray(sessions) ? sessions : [])
    .filter((session) => {
      if (!needle) return true;
      return String(session?.id || '').toLowerCase().includes(needle);
    })
    .sort((left, right) => (right?.lastTs || 0) - (left?.lastTs || 0));
}
