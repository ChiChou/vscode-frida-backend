import * as frida from 'frida';
import * as Router from 'koa-router';

import * as serializer from '../serializer';

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

type HandlerRoutine = (ctx: any, device: frida.Device) => any;

const getDeviceByIdMiddleware = (handler: HandlerRoutine) => async (ctx) => {
  const { id } = ctx.params;
  const device = await (id === 'usb' ? frida.getUsbDevice() : frida.getDevice(id));
  ctx.body = await handler(ctx, device);
};

router.get('/:id/apps', getDeviceByIdMiddleware(async (_ctx, device) => {
  const apps = await device.enumerateApplications();
  return apps.map(serializer.app);
}));

router.get('/:id/ps', getDeviceByIdMiddleware(async (_ctx, device) => {
  const ps = await device.enumerateProcesses();
  return ps.map(serializer.process);
}));

export default router;
