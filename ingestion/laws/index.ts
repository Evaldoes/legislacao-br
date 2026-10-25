import { constituicao1988 } from "./constituicao-1988.js";
import type { LawConfig } from "./types.js";

/** Supported laws, keyed by their folder name in the data repository. */
export const LAWS: Record<string, LawConfig> = {
  [constituicao1988.description.law]: constituicao1988,
};
