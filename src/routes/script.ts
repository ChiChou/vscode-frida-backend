import * as frida from 'frida';
import * as Router from 'koa-router';
import * as path from 'path';

import { promises as fs } from 'fs';
import { Context } from 'koa';
import { getDeviceById } from '../middlewares/get_device';


const router = new Router();
const cache = {
  source: '',
}

router.get('/:device/run/:pid/:rpc', getDeviceById, async (ctx: Context) => {
  const pid = parseInt(ctx.params.pid);
  const target = isNaN(pid) ? ctx.params.pid : pid;

  if (!cache.source) {
    const filename = path.join(__dirname, '..', '..', 'agent', 'build', 'agent.js');
    // tslint:disable-next-line: non-literal-fs-path
    cache.source = (await fs.readFile(filename)).toString();
  }

  const session = await (ctx.device as frida.Device).attach(target);
  const script = await session.createScript(cache.source);
  await script.load();
  ctx.body = await script.exports[ctx.params.rpc]();
  await session.detach();
});

export default router;