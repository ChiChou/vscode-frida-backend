import * as Koa from 'koa';
import * as Router from 'koa-router';

import devices from './routes/devices';

export const app = new Koa();

export function start(path?: string | number) {
  const router = new Router();
  router.use('/device', devices.routes(), devices.allowedMethods());
  app.use(router.routes()).use(router.allowedMethods());
  return app.listen(path);
}

if (require.main === module) {
  start(process.env.SOCKET_PATH);
}
