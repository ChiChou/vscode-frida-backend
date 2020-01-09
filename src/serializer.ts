import { Icon, Application, Device } from 'frida';
import * as BMP from 'bmp-js';

function toIcon(icon?: Icon): any {
  if (!icon) return icon;

  const { pixels, height, width, rowstride } = icon;
  return { width, height, rowstride, pixels: pixels.toString('base64') };
}

function toAGBR(buffer: Buffer) {
  // freaking slow
  const result = Buffer.allocUnsafe(buffer.length);
  for (let i = 0; i < buffer.length; i += 4) {
    result[i + 0] = buffer[i + 3];
    result[i + 1] = buffer[i + 2];
    result[i + 2] = buffer[i + 1];
    result[i + 3] = buffer[i + 0];
  }
  return result;
}

export function toDataURI(icon: Icon) {
  const { pixels, height, width } = icon;
  const img = {
    data: toAGBR(pixels),
    width,
    height
  };

  return 'data:image/bmp;base64,' + BMP.encode(img).data.toString('base64');
}

function toApp(app: Application) {
  const { name, pid, smallIcon, largeIcon, identifier } = app;
  return {
    name,
    pid,
    identifier,
    smallIcon: toDataURI(smallIcon),
    largeIcon: toDataURI(largeIcon),
  };
}

function toDevice(dev: Device) {
  const { name, id, icon } = dev;
  return { name, id, icon: toDataURI(icon) };
}

export { toIcon as icon, toApp as app, toDevice as device };