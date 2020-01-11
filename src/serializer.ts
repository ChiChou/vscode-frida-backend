import * as png from 'fast-png';

import { Icon, Application, Device } from 'frida';
import { Process } from 'frida/dist/process';

function toIcon(icon?: Icon): any {
  if (!icon) return icon;

  const { pixels, height, width, rowstride } = icon;
  return { width, height, rowstride, pixels: pixels.toString('base64') };
}

// TODO: move this to worker

export function toDataURI(icon?: Icon) {
  if (!icon)
    return null;

  const { pixels, height, width } = icon;
  const img = png.encode({
    width,
    height,
    data: pixels
  });
  
  return 'data:image/png;base64,' + Buffer.from(img).toString('base64');
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
  const { name, id, /*icon, */ type } = dev;
  return { name, id, /* icon: toDataURI(icon),*/ type };
}

function toProcess(proc: Process) {
  const { pid, name, smallIcon, largeIcon } = proc;
  return {
    pid, name,
    smallIcon: toDataURI(smallIcon),
    largeIcon: toDataURI(largeIcon),
  }
}

export { toIcon as icon, toApp as app, toDevice as device, toProcess as process };