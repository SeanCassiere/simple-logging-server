import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

type OpenApiDocTransformer = (filename: string, source_path: string, dirVersion: string, doc: string) => string;

/**
 * Modify the OpenAPI doc with the provided transformers and write the file to the static directory.
 */
export function transformOpenapiYmlDoc(dir_version: string, transformers: OpenApiDocTransformer[] = []): void {
  const openapiFilename = `openapi.${dir_version}.yaml`;

  const openapiYmlSourcePath = join(__dirname, "..", "docs", openapiFilename);
  const openapiYmlOutPath = join(__dirname, "..", "..", "public", "static", openapiFilename);

  const openapiYmlInputDoc = readFileSync(openapiYmlSourcePath, "utf-8").toString();

  let newOpenapiYmlDoc = openapiYmlInputDoc;

  console.log(`📖 Starting to update /static/${openapiFilename}`);

  for (const transformer of transformers) {
    newOpenapiYmlDoc = transformer(openapiFilename, openapiYmlSourcePath, dir_version, newOpenapiYmlDoc);
  }

  writeFileSync(openapiYmlOutPath, newOpenapiYmlDoc);

  console.log(`📖 Finishing updating /static/${openapiFilename}`);
  return;
}

/**
 * Transformer to update the version in the OpenAPI doc.
 * @param version
 * @returns
 */
export function openapiYmlVersioner(version: string): OpenApiDocTransformer {
  return (filename, _, __, doc) => {
    console.log(`📦 Updating the version in OpenAPI document "${filename}" to "${version}"`);
    return doc.replace(/version:\s*0\.0\.0/g, `version: ${version}`);
  };
}
