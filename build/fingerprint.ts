import { createHash } from "node:crypto";
import { readdir,readFile } from "node:fs/promises";
export async function buildFingerprint(){const hash=createHash("sha256");async function walk(path:string){for(const entry of (await readdir(path,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const file=`${path}/${entry.name}`;if(entry.isDirectory())await walk(file);else{hash.update(file);hash.update(await readFile(file));}}}await walk("dist");return hash.digest("hex");}
