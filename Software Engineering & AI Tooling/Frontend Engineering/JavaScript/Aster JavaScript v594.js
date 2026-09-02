export async function collectUserEnvironmentContext({
  now = () => new Date(),
  resolveTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  geolocation = globalThis.navigator?.geolocation,
  geolocationOptions = {
    enableHighAccuracy: false,
    maximumAge: 300000,
    timeout: 10000,
  },
} = {}) {
  const current = now();
  const context = {
    timeISO: current.toISOString(),
    timePretty: current.toLocaleString(),
    timezone: 'local',
    latitude: null,
    longitude: null,
    accuracy: null,
  };

  try {
    context.timezone = resolveTimezone() || 'local';
  } catch {}

  if (!geolocation?.getCurrentPosition) return context;

  await new Promise((resolve) => {
    geolocation.getCurrentPosition(
      (position) => {
        context.latitude = position?.coords?.latitude ?? null;
        context.longitude = position?.coords?.longitude ?? null;
        context.accuracy = position?.coords?.accuracy ?? null;
        resolve();
      },
      () => resolve(),
      geolocationOptions,
    );
  });

  return context;
}
