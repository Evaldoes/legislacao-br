import type { StructureOptions } from "../parsers/structure.js";
import type { LawDescription } from "../writing/law.js";

export type LawConfig = {
  url: string;
  /** Everything in the description except what is only known at capture time. */
  description: Omit<LawDescription, "source" | "capturedAt">;
  structure: StructureOptions;
};
