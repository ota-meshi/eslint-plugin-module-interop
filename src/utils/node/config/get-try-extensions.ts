/**
 * This file was taken from eslint-plugin-n.
 */
import type { Rule } from "eslint";
import { isTypescript } from "../is-typescript.js";
import { getTSConfigForContext } from "../get-tsconfig.js";

/** @type {string[]} */
const DEFAULT_JS_VALUE = [".js", ".json", ".node", ".mjs", ".cjs"];
/** @type {string[]} */
const DEFAULT_TS_VALUE = [
  ".js",
  ".ts",
  ".mjs",
  ".mts",
  ".cjs",
  ".cts",
  ".json",
  ".node",
];

/**
 * Gets `tryExtensions` property from a given option object.
 *
 * @param option - An option object to get.
 * @returns The `tryExtensions` value, or `null`.
 */
function get(option: unknown): string[] | undefined {
  if (
    option != null &&
    typeof option === "object" &&
    "tryExtensions" in option &&
    Array.isArray(option?.tryExtensions)
  ) {
    return option.tryExtensions.map(String);
  }
  return undefined;
}

/**
 * Gets "tryExtensions" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.n` | `settings.node` property, then returns it if exists.
 * 3. This returns `[".js", ".json", ".node", ".mjs", ".cjs"]`.
 *
 * @param context - The rule context.
 * @returns A list of extensions.
 */
export function getTryExtensions(
  context: Rule.RuleContext,
  optionIndex = 0,
): string[] {
  const configured =
    get(context.options?.[optionIndex]) ??
    get(context.settings?.n) ??
    get(context.settings?.node);

  if (configured != null) {
    return configured;
  }

  if (isTypescript(context) === false) {
    return DEFAULT_JS_VALUE;
  }

  const allowImportingTsExtensions =
    getTSConfigForContext(context)?.config?.compilerOptions
      ?.allowImportingTsExtensions;

  if (allowImportingTsExtensions === true) {
    return DEFAULT_TS_VALUE;
  }

  return DEFAULT_JS_VALUE;
}

export const schema = {
  type: "array" as const,
  items: {
    type: "string" as const,
    pattern: "^\\.",
  },
  uniqueItems: true,
};
