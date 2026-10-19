import { mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { MARK, BRAND } from "../src/brand/mark";
import { PRODUCT } from "../src/brand/product";
import { ASSET_SIZES } from "../store/recipes";
await mkdir("store", { recursive: true });
const result = spawnSync("python3", ["tools/render-promos.py"], {
  input: JSON.stringify({
    mark: MARK,
    brand: BRAND,
    product: PRODUCT,
    sizes: ASSET_SIZES,
  }),
  encoding: "utf8",
});
if (result.status !== 0) throw new Error(result.stderr);
console.log(result.stdout.trim());
