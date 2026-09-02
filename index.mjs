import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { startServer } from './src/server.mjs';

export { createApp } from './src/app.mjs';
export { createCloudDependencies } from './src/cloud.mjs';

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (entry === import.meta.url) {
  startServer();
}
