import { join } from "node:path";
import { cpSync, mkdirSync, existsSync } from "node:fs";

const srcDocs = join(process.cwd(), "src", "docs");
const outDocs = join(process.cwd(), "dist", "docs");

if (!existsSync(outDocs)) {
  mkdirSync(outDocs, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

cpSync(srcDocs, outDocs, { recursive: true }, (err) => {
  if (err) {
    console.error(err);
  }
});

console.log("↻ Copied /src/docs to /dist/docs.");
