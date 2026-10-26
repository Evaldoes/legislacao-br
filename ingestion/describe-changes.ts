/**
 * Describes what the last capture changed in normas/ (title and body of the
 * update pull request). In GitHub Actions it writes the step outputs
 * `changed`, `title` and `body`; locally it prints them.
 *
 *   npm run describe-changes
 */
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { describeChanges } from "./changes.js";

const diff = execFileSync("git", ["diff", "--", "normas"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard", "--", "normas"], { encoding: "utf8" }).trim();
const date = new Date().toLocaleDateString("sv-SE");

// New files (a new law or article) appear as untracked: describe them as added.
const addedDiff = untracked
  ? untracked
      .split("\n")
      .map((path) => `diff --git a/${path} b/${path}`)
      .join("\n")
  : "";
const all = [diff, addedDiff].filter(Boolean).join("\n");
const changed = all.length > 0;
const { title, body } = changed ? describeChanges(all, date) : { title: "", body: "" };

const output = process.env.GITHUB_OUTPUT;
if (output) {
  appendFileSync(output, `changed=${changed}\ntitle=${title}\nbody<<END_OF_BODY\n${body}\nEND_OF_BODY\n`);
} else {
  console.log(changed ? `${title}\n\n${body}` : "No changes in normas/.");
}
