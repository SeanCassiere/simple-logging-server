import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

type OpenApiDocTransformer = (dirVersion: string, doc: string) => string;

/**
 * Modify the OpenAPI doc with the provided transformers and write the file to the static directory.
 */
export function transformOpenapiYmlDoc(dir_version: string, transformers: OpenApiDocTransformer[] = []): void {
  const openapiFilename = `openapi.${dir_version}.yml`;

  const openapiYmlSourcePath = join(__dirname, "..", "docs", openapiFilename);
  const openapiYmlOutPath = join(__dirname, "..", "..", "public", "static", openapiFilename);

  const openapiYmlInputDoc = readFileSync(openapiYmlSourcePath, "utf-8").toString();

  let newOpenapiYmlDoc = openapiYmlInputDoc;

  for (const transformer of transformers) {
    newOpenapiYmlDoc = transformer(dir_version, newOpenapiYmlDoc);
  }

  writeFileSync(openapiYmlOutPath, newOpenapiYmlDoc);

  console.log(`📖 Updated /static/${openapiFilename}`);
  return;
}

const ymlVersionRegex = new RegExp(/^version: (0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);

/**
 * Transformer to update the version in the OpenAPI doc.
 * @param version
 * @returns
 */
export function openapiYmlVersioner(version: string): OpenApiDocTransformer {
  return (_, doc) => {
    return doc.replace(ymlVersionRegex, `version: ${version}`);
  };
}
