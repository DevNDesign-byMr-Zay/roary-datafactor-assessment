import type { StudioState } from './Aster TypeScript v012';

export function autosaveStudioState(storage: Storage, state: StudioState): void {
  storage.setItem('aster:chat', JSON.stringify(state.messages));
  storage.setItem('aster:sys', state.systemPrompt);
  storage.setItem('aster:model', state.model);
  storage.setItem('aster:temp', String(state.temperature));
  storage.setItem('aster:max', String(state.maxTokens));
}
