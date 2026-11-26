import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = require.resolve("maplibre-gl/package.json");
const sourceDirectory = join(dirname(packagePath), "dist");
const targetDirectory = join(projectRoot, "public", "maplibre");
const workerFiles = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

mkdirSync(targetDirectory, { recursive: true });

for (const file of workerFiles) {
  copyFileSync(join(sourceDirectory, file), join(targetDirectory, file));
}
