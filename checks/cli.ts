/**
 * Validates the format of every law folder in normas/.
 *
 *   npm run check
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { readLawFolder } from "./read.js";
import { validateLaw } from "./validate.js";

const root = join(import.meta.dirname, "..", "normas");
const folders = existsSync(root) ? readdirSync(root).filter((name) => statSync(join(root, name)).isDirectory()) : [];

let problems = 0;
for (const name of folders.sort()) {
  const folder = readLawFolder(join(root, name));
  const issues = validateLaw(folder);
  problems += issues.length;
  console.log(`${issues.length ? "✗" : "✓"} ${name}: ${folder.articleFiles.length} articles, ${issues.length} problem(s)`);
  for (const { file, message } of issues) console.log(`  ${name}/${file}: ${message}`);
}

if (!folders.length) console.log("No law folders found in normas/.");
process.exitCode = problems ? 1 : 0;
