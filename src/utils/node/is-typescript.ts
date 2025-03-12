/**
 * This file was taken from eslint-plugin-n.
 */

import type { Rule } from "eslint";
import path from "node:path";

const typescriptExtensions = [".ts", ".tsx", ".cts", ".mts"];

/**
 * Determine if the context source file is typescript.
 *
 * @param {import('eslint').Rule.RuleContext} context - A context
 * @returns {boolean}
 */
export function isTypescript(context: Rule.RuleContext): boolean {
  const sourceFileExt = path.extname(context.physicalFilename);
  return typescriptExtensions.includes(sourceFileExt);
}
