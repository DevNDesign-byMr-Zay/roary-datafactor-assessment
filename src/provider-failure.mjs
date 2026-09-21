const RATE_LIMIT_CODES = new Set(['RESOURCE_EXHAUSTED', 'RATE_LIMITED', 'TOO_MANY_REQUESTS']);
const REJECTED_CODES = new Set(['INVALID_ARGUMENT', 'FAILED_PRECONDITION']);
const UNAVAILABLE_CODES = new Set(['UNAVAILABLE', 'SERVICE_UNAVAILABLE']);

function ownDataValue(value, key) {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!descriptor || !('value' in descriptor)) return undefined;
  return descriptor.value;
}

function numericStatus(error) {
  for (const key of ['status', 'statusCode']) {
    const value = ownDataValue(error, key);
    if (Number.isInteger(value)) return value;
  }
  return undefined;
}

function stringCode(error) {
  const value = ownDataValue(error, 'code');
  return typeof value === 'string' ? value.trim().toUpperCase() : undefined;
}

export function classifyProviderFailure(error) {
  const status = numericStatus(error);
  const code = stringCode(error);

  if (status === 429 || RATE_LIMIT_CODES.has(code)) {
    return Object.freeze({
      status: 429,
      code: 'UPSTREAM_RATE_LIMITED',
      message: 'The model provider is temporarily rate limited.',
      event: 'chat.provider_rate_limited',
    });
  }

  if (status === 400 || status === 422 || REJECTED_CODES.has(code)) {
    return Object.freeze({
      status: 422,
      code: 'UPSTREAM_REQUEST_REJECTED',
      message: 'The model provider rejected the generated request.',
      event: 'chat.provider_request_rejected',
    });
  }

  if (status === 503 || UNAVAILABLE_CODES.has(code)) {
    return Object.freeze({
      status: 503,
      code: 'UPSTREAM_UNAVAILABLE',
      message: 'The model provider is temporarily unavailable.',
      event: 'chat.provider_unavailable',
    });
  }

  return null;
}
