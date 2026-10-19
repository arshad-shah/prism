import {readFileSync} from 'node:fs';
import {join} from 'node:path';
export function verifyIcons(directory:string):void {
 for(const size of [16,32,48,128]) {
  const path=join(directory,`icon-${size}.png`);let image:Buffer;
  try{image=readFileSync(path);}catch{throw new Error(`Missing required icon: ${path}. Run pnpm brand:assets before building.`);}
  if(image.length<24||image.readUInt32BE(16)!==size||image.readUInt32BE(20)!==size)throw new Error(`Invalid icon dimensions: ${path}`);
 }
}
