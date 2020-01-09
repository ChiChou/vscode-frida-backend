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
  } catch(e) {
    ctx.throw(404);
  }
  ctx.body = 'OK';
});

router.get('/:id/apps', async (ctx) => {
  const { id } = ctx.params;
  const device = await (id === 'usb' ? frida.getUsbDevice() : frida.getDevice(id));
  const apps = await device.enumerateApplications();
  ctx.body = apps.map(serializer.app);
});

export default router;
