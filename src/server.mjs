import { createApp } from './app.mjs';
import { createCloudDependencies } from './cloud.mjs';
import { createLogger } from './logger.mjs';

export function startServer({ env = process.env } = {}) {
  const logger = createLogger();
  const cloud = createCloudDependencies(env);
  const port = Number(env.PORT || 8080);
  const app = createApp({ ...cloud, logger });

  const server = app.listen(port, () => {
    logger.info(
      { event: 'server.started', port, project: cloud.project, location: cloud.location },
      'Conversational AI service started',
    );
  });

  return { app, server };
}
