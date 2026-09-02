export interface ModelOption {
  id: string;
  label?: string;
}

export function resolveModelSelection(
  models: ModelOption[],
  requested: string | null | undefined,
): string {
  if (!models.length) throw new Error('no models available');
  if (requested && models.some((model) => model.id === requested)) return requested;
  return models[0].id;
}

export function persistModelSelection(modelId: string): void {
  localStorage.setItem('aster:model', modelId);
}
