/**
 * This file was taken from eslint-plugin-n.
 */
import type { Rule } from "eslint";

const DEFAULT_VALUE: string[] = [];

/**
 * Gets `resolvePaths` property from a given option object.
 *
 * @param option - An option object to get.
 * @returns The `resolvePaths` value, or `null`.
 */
function get(option: unknown): string[] | undefined {
  if (
    option != null &&
    typeof option === "object" &&
    "resolvePaths" in option &&
    Array.isArray(option?.resolvePaths)
  ) {
    return option.resolvePaths.map(String);
  }
  return undefined;
}

/**
 * Gets "resolvePaths" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.n` | `settings.node` property, then returns it if exists.
 * 3. This returns `[]`.
 *
 * @param context - The rule context.
 * @returns {string[]} A list of extensions.
 */
export function getResolvePaths(
  context: Rule.RuleContext,
  optionIndex = 0,
): string[] {
  return (
    get(context.options?.[optionIndex]) ??
    get(context.settings?.n) ??
    get(context.settings?.node) ??
    DEFAULT_VALUE
  );
}

export const schema = {
  type: "array" as const,
  items: { type: "string" as const },
  uniqueItems: true,
};
