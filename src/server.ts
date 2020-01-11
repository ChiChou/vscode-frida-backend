import debug from 'debug';

import * as Koa from 'koa';
import * as Router from 'koa-router';

import devices from './routes/devices';
import script from './routes/script';

export const app = new Koa();

const logger = debug('server');

export function start(path?: string | number, callback?: () => void) {
  const router = new Router();
  router.use('/device', devices.routes(), devices.allowedMethods());
  router.use('/script', script.routes(), devices.allowedMethods());
  app.use(router.routes()).use(router.allowedMethods());
  logger(`LISTENING on ${path}`);

  return app.listen(path, callback);
}
