import { join } from "node:path";
import { readFileSync } from "node:fs";
import { z } from "zod";

const PackageSchema = z.object({
  name: z.string(),
  version: z.string(),
});

export function getPackageInfo() {
  const pathname = join(process.cwd(), "package.json");
  const packageJson = JSON.parse(readFileSync(pathname, "utf8"));

  return PackageSchema.parse(packageJson);
}
