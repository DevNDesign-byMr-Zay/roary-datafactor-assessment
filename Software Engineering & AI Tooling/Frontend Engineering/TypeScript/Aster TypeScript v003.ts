const STORAGE_KEYS = {
  chat: 'aster:chat',
  system: 'aster:sys',
  model: 'aster:model',
  temperature: 'aster:temp',
  maxTokens: 'aster:max',
} as const;

export type StoredSetting = keyof typeof STORAGE_KEYS;

export function readStoredSetting(name: StoredSetting): string | null {
  return localStorage.getItem(STORAGE_KEYS[name]);
}

export function writeStoredSetting(name: StoredSetting, value: string): void {
  localStorage.setItem(STORAGE_KEYS[name], value);
}

export function removeStoredSetting(name: StoredSetting): void {
  localStorage.removeItem(STORAGE_KEYS[name]);
}
