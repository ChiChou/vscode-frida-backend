import * as frida from 'frida';

export async function getDeviceById(ctx, next) {
  const { device } = ctx.params;
  ctx.device = await (device === 'usb' ? frida.getUsbDevice() : frida.getDevice(device));
  await next();
}
