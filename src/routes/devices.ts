import * as frida from 'frida';
import * as Router from 'koa-router';
import { Context } from 'koa';

import * as serializer from '../serializer';
import { getDeviceById } from '../middlewares/get_device';

const router = new Router();

router.get('/list', async (ctx) => {
  const list = await frida.enumerateDevices();
  ctx.body = list.map(serializer.device);
});

router.put('/:host', async (ctx) => {
  const manager = await frida.getDeviceManager();
  const { host } = ctx.params;
  const device = await manager.addRemoteDevice(host);
  ctx.body = serializer.device(device);
});

router.delete('/:host', async (ctx) => {
  const manager = await frida.getDeviceManager();
  const { host } = ctx.params;
  try {
    await manager.removeRemoteDevice(host);
  } catch (e) {
    ctx.throw(404, e.message, { expose: true });
  }
  ctx.body = 'OK';
});

router.get('/:device/apps', getDeviceById, async (ctx: Context) => {
  const apps = await ctx.device.enumerateApplications();
  ctx.body = apps.map(serializer.app);
});

router.get('/:device/ps', getDeviceById, async (ctx: Context) => {
  const ps = await ctx.device.enumerateProcesses();
  ctx.body = ps.map(serializer.process);
});

export default router;
