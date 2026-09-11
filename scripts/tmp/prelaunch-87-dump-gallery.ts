import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PRODUCT_GALLERY_MEDIA } from "@/content/product-gallery-media";
const out = join(process.cwd(), "docs/prelaunch/data/rc-87");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "existing-gallery.json"), JSON.stringify(PRODUCT_GALLERY_MEDIA, null, 2));
console.log("existing products", Object.keys(PRODUCT_GALLERY_MEDIA).length);
console.log("total extras", Object.values(PRODUCT_GALLERY_MEDIA).reduce((n, a) => n + a.length, 0));
