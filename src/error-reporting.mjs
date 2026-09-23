function reporterFailureMetadata(error, scope) {
  const metadata = { event: 'error.reporter_failed', scope };
  if (typeof error?.name === 'string' && error.name) metadata.errorName = error.name;
  if (typeof error?.code === 'string' && error.code) metadata.errorCode = error.code;
  return metadata;
}

/**
 * @param {{
 *   onUnhandledError?: ((error: unknown, context: Readonly<Record<string, unknown>>) => unknown) | null,
 *   logger?: { warn?: (metadata: Record<string, unknown>, message: string) => unknown }
 * }} [options]
 */
export function createUnhandledErrorReporter({ onUnhandledError = null, logger } = {}) {
  if (onUnhandledError !== null && typeof onUnhandledError !== 'function') {
    throw new TypeError('onUnhandledError must be a function when provided.');
  }
  if (!logger?.warn) throw new TypeError('A structured logger is required.');

  /**
   * @param {unknown} error
   * @param {Record<string, unknown>} [context]
   */
  function reportUnhandledError(error, context = {}) {
    if (!onUnhandledError) return;

    const safeContext = Object.freeze({ ...context });
    const scope = typeof safeContext.scope === 'string' ? safeContext.scope : undefined;
    let result;

    try {
      result = onUnhandledError(error, safeContext);
    } catch (reporterError) {
      logger.warn(reporterFailureMetadata(reporterError, scope), 'Unhandled error reporter failed');
      return;
    }

    Promise.resolve(result).catch((reporterError) => {
      logger.warn(reporterFailureMetadata(reporterError, scope), 'Unhandled error reporter failed');
    });
  }

  return reportUnhandledError;
}
