import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const publicDirectory = fileURLToPath(new URL("../public", import.meta.url));
const supportedExtensions = new Set([".png", ".webp"]);

async function collectAssetPaths(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);
      return entry.isDirectory() ? collectAssetPaths(fullPath) : [fullPath];
    }),
  );

  return paths.flat();
}

function hasPngSignature(buffer) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return signature.every((byte, index) => buffer[index] === byte);
}

function hasWebpSignature(buffer) {
  return (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

const validators = {
  ".png": hasPngSignature,
  ".webp": hasWebpSignature,
};

const assetPaths = (await collectAssetPaths(publicDirectory)).filter((path) =>
  supportedExtensions.has(extname(path).toLowerCase()),
);
const invalidAssets = [];

for (const assetPath of assetPaths) {
  const extension = extname(assetPath).toLowerCase();
  const buffer = await readFile(assetPath);

  if (!validators[extension](buffer)) {
    invalidAssets.push(relative(publicDirectory, assetPath));
  }
}

if (invalidAssets.length > 0) {
  console.error(
    `Invalid binary image data detected:\n${invalidAssets
      .map((path) => `- public/${path}`)
      .join("\n")}`,
  );
  process.exit(1);
}

console.log(`Validated ${assetPaths.length} PNG/WebP assets.`);
