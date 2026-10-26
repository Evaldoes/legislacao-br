/**
 * Captures every configured law from the Planalto into normas/.
 *
 *   npm run ingest:all
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { LAWS } from "./laws/index.js";

const cli = join(import.meta.dirname, "cli.ts");
const out = join(import.meta.dirname, "..", "normas");

for (const law of Object.keys(LAWS)) {
  console.log(`\n== ${law}`);
  const run = spawnSync("npx", ["tsx", cli, law, "--out", out], { stdio: "inherit" });
  if (run.status !== 0) {
    console.error(`Capture of ${law} failed.`);
    process.exit(run.status ?? 1);
  }
}
