
function classesForImage(path: string): string[] {
  const objc_copyClassNamesForImage = new NativeFunction(Module.findExportByName(
    null, 'objc_copyClassNamesForImage')!, 'pointer', ['pointer', 'pointer']);
  const free = new NativeFunction(Module.findExportByName(null, 'free')!, 'void', ['pointer']);
  const p = Memory.alloc(Process.pointerSize);
  p.writeUInt(0);

  const pPath = Memory.allocUtf8String(path);
  const pClasses = objc_copyClassNamesForImage(pPath, p) as NativePointer;
  const count = p.readUInt();
  
  // tslint:disable-next-line: prefer-array-literal
  const classes = new Array(count);
  for (let i = 0; i < count; i++) {
    const pClassName = pClasses.add(i * Process.pointerSize).readPointer();
    classes[i] = pClassName.readUtf8String();
  }
  free(pClasses);
  return classes;
}

function normalize(path: string) : string {
  return ObjC.classes.NSString.stringWithString_(path).stringByStandardizingPath().toString();
}

type Node = { [key: string]: Node };

export function hierarchy() {
  const root = normalize(ObjC.classes.NSBundle.mainBundle().bundlePath()).toString();
  const modules = Process.enumerateModules()
    .filter((mod: Module) => normalize(mod.path).startsWith(root))
  
  const tree: Node = {};
  for (let mod of modules) {
    for (let name of classesForImage(mod.path)) {
      let clazz = ObjC.classes[name];
      const chain = [name];
      while (clazz = clazz.$superClass)
        chain.unshift(clazz.$className);

      let node = tree;
      for (let clazz of chain) {
        node[clazz] = node[clazz] || {};
        node = node[clazz];
      }
    }
  }

  return tree;
}