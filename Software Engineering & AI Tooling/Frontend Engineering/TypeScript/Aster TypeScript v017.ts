export interface RegistryModel {
  id: string;
  label?: string;
  transportId?: string;
  source?: 'configured' | 'discovered';
}

function canonical(value: string): string {
  return value.trim().toLowerCase();
}

export function mergeModelRegistries(
  configured: RegistryModel[],
  discovered: RegistryModel[],
): RegistryModel[] {
  const merged: RegistryModel[] = [];
  const byKey = new Map<string, number>();

  const add = (model: RegistryModel, source: 'configured' | 'discovered') => {
    const identity = canonical(model.id || model.transportId || '');
    if (!identity) return;

    const existingIndex = byKey.get(identity);
    if (existingIndex === undefined) {
      byKey.set(identity, merged.length);
      merged.push({ ...model, source });
      return;
    }

    const existing = merged[existingIndex];
    merged[existingIndex] = {
      ...existing,
      ...model,
      label: model.label || existing.label,
      transportId: model.transportId || existing.transportId,
      source: existing.source === 'configured' ? 'configured' : source,
    };
  };

  configured.forEach((model) => add(model, 'configured'));
  discovered.forEach((model) => add(model, 'discovered'));
  return merged;
}
