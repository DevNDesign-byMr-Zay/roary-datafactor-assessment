export interface ModelIdentity {
  transportId: string;
  displayId: string;
  aliases?: string[];
}

function key(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveModelTransportId(
  models: ModelIdentity[],
  requested: string,
): string | null {
  const wanted = key(requested);
  if (!wanted) return null;

  for (const model of models) {
    const candidates = [model.transportId, model.displayId, ...(model.aliases ?? [])];
    if (candidates.some((candidate) => key(candidate) === wanted)) {
      return model.transportId;
    }
  }
  return null;
}
