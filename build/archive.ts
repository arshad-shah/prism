import {crc32,deflateRawSync} from 'node:zlib';
/** Fixed DOS date, UTF-8 paths, order and permissions make archives deterministic. */
export function deterministicZip(files:{path:string;data:Buffer}[]):Buffer {
 const bodies:Buffer[]=[],directory:Buffer[]=[];let offset=0;const names=new Set<string>();
 for(const file of [...files].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0)) {
  if(file.path.startsWith('/')||file.path.split('/').includes('..')||file.path.includes('\\')||names.has(file.path))throw new Error(`Unsafe or duplicate ZIP path: ${file.path}`);names.add(file.path);
  const name=Buffer.from(file.path);const compressed=deflateRawSync(file.data,{level:9});const crc=crc32(file.data);
  const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(8,8);local.writeUInt16LE(0x21,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(file.data.length,22);local.writeUInt16LE(name.length,26);
  bodies.push(local,name,compressed);
  const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50);central.writeUInt16LE(0x314,4);central.writeUInt16LE(20,6);central.writeUInt16LE(0x800,8);central.writeUInt16LE(8,10);central.writeUInt16LE(0x21,14);central.writeUInt32LE(crc,16);central.writeUInt32LE(compressed.length,20);central.writeUInt32LE(file.data.length,24);central.writeUInt16LE(name.length,28);central.writeUInt32LE(0x81a40000,38);central.writeUInt32LE(offset,42);directory.push(central,name);offset+=local.length+name.length+compressed.length;
 }
 const end=Buffer.alloc(22);const central=Buffer.concat(directory);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...bodies,central,end]);
}
