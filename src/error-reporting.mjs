function reporterFailureMetadata(error, scope) {
  const metadata = { event: 'error.reporter_failed', scope };
  if (typeof error?.name === 'string' && error.name) metadata.errorName = error.name;
  if (typeof error?.code === 'string' && error.code) metadata.errorCode = error.code;
  return metadata;
}

export function createUnhandledErrorReporter({ onUnhandledError = null, logger } = {}) {
  if (onUnhandledError !== null && typeof onUnhandledError !== 'function') {
    throw new TypeError('onUnhandledError must be a function when provided.');
  }
  if (!logger?.warn) throw new TypeError('A structured logger is required.');

  return function reportUnhandledError(error, context = {}) {
    if (!onUnhandledError) return;

    const safeContext = Object.freeze({ ...context });
    let result;

    try {
      result = onUnhandledError(error, safeContext);
    } catch (reporterError) {
      logger.warn(
        reporterFailureMetadata(reporterError, safeContext.scope),
        'Unhandled error reporter failed',
      );
      return;
    }

    Promise.resolve(result).catch((reporterError) => {
      logger.warn(
        reporterFailureMetadata(reporterError, safeContext.scope),
        'Unhandled error reporter failed',
      );
    });
  };
}
