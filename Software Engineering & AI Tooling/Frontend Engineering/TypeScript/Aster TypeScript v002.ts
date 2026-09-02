export interface RuntimeConfig {
  apiBase: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export function readRuntimeConfig(env: Record<string, string | undefined>): RuntimeConfig {
  return {
    apiBase: env.VITE_COMPAT_API_BASE_URL || 'http://localhost:8080/v1',
    apiKey: env.VITE_COMPAT_API_KEY || '',
    model: env.VITE_DEFAULT_MODEL || 'local-model',
    temperature: Number(env.VITE_TEMPERATURE || 0.7),
    maxTokens: Number(env.VITE_MAX_TOKENS || 512),
  };
}
