/**
 * This file was taken from eslint-plugin-n.
 */
import type { Rule } from "eslint";
import type { TsConfigJsonResolved, TsConfigResult } from "get-tsconfig";
import { getTsconfig, parseTsconfig } from "get-tsconfig";

const fsCache = new Map();

/**
 * Attempts to get the ExtensionMap from the tsconfig given the path to the tsconfig file.
 *
 * @param filename - The path to the tsconfig.json file
 */
export function getTSConfig(filename: string): TsConfigJsonResolved {
  return parseTsconfig(filename, fsCache);
}

/**
 * Attempts to get the ExtensionMap from the tsconfig of a given file.
 *
 * @param filename - The path to the file we need to find the tsconfig.json of
 */
export function getTSConfigForFile(filename: string): TsConfigResult | null {
  return getTsconfig(filename, "tsconfig.json", fsCache);
}

/**
 * Attempts to get the ExtensionMap from the tsconfig of a given file.
 *
 * @param context - The current eslint context
 */
export function getTSConfigForContext(
  context: Rule.RuleContext,
): TsConfigResult | null {
  const filename = context.physicalFilename;

  return getTSConfigForFile(filename);
}

export const schema = { type: "string" };
