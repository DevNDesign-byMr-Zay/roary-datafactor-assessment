import { createApp } from './app.mjs';
import { createCloudDependencies } from './cloud.mjs';
import { createUnhandledErrorReporter } from './error-reporting.mjs';
import { createLogger } from './logger.mjs';

export function startServer({ env = process.env, onUnhandledError = null } = {}) {
  const logger = createLogger();
  const cloud = createCloudDependencies(env);
  const port = Number(env.PORT || 8080);
  const reportUnhandledError = createUnhandledErrorReporter({ onUnhandledError, logger });
  const app = createApp({ ...cloud, logger });

  app.use((error, req, _res, next) => {
    reportUnhandledError(error, {
      scope: 'http',
      requestId: req.requestId ?? null,
    });
    return next(error);
  });

  const server = app.listen(port, () => {
    logger.info(
      { event: 'server.started', port, project: cloud.project, location: cloud.location },
      'Conversational AI service started',
    );
  });

  return { app, server };
}
