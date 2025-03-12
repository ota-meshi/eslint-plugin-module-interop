/**
 * This file was taken from eslint-plugin-n.
 */
import type { ResolveOptions } from "enhanced-resolve";
import type { Rule } from "eslint";

type ResolverConfig = Partial<ResolveOptions>;
const DEFAULT_VALUE: ResolverConfig = {};

/**
 * Gets `resolverConfig` property from a given option object.
 *
 * @param option - An option object to get.
 * @returns The `resolverConfig` value, or `null`.
 */
function get(option: unknown): ResolverConfig | undefined {
  if (
    typeof option === "object" &&
    option !== null &&
    "resolverConfig" in option &&
    typeof option.resolverConfig === "object" &&
    option?.resolverConfig
  ) {
    return option.resolverConfig;
  }
  return undefined;
}

/**
 * Gets "resolverConfig" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.n` | `settings.node` property, then returns it if exists.
 * 3. This returns `[]`.
 *
 * @param context - The rule context.
 * @returns A resolver config object.
 */
export function getResolverConfig(
  context: Rule.RuleContext,
  optionIndex = 0,
): ResolverConfig {
  return (
    get(context.options?.[optionIndex]) ??
    get(context.settings?.n) ??
    get(context.settings?.node) ??
    DEFAULT_VALUE
  );
}

export const schema = {
  type: "object" as const,
  properties: {},
  additionalProperties: true,
};
