/**
 * This file was taken from eslint-plugin-n.
 */

import type { TsConfigJsonResolved } from "get-tsconfig";
import { getTSConfig, getTSConfigForContext } from "../get-tsconfig.js";
import type { Rule } from "eslint";

const DEFAULT_MAPPING = normalize([
  ["", ".js"],
  [".ts", ".js"],
  [".cts", ".cjs"],
  [".mts", ".mjs"],
  [".tsx", ".js"],
]);

const PRESERVE_MAPPING = normalize([
  ["", ".js"],
  [".ts", ".js"],
  [".cts", ".cjs"],
  [".mts", ".mjs"],
  [".tsx", ".jsx"],
]);

const tsConfigMapping = {
  react: DEFAULT_MAPPING, // Emit .js files with JSX changed to the equivalent React.createElement calls
  "react-jsx": DEFAULT_MAPPING, // Emit .js files with the JSX changed to _jsx calls
  "react-jsxdev": DEFAULT_MAPPING, // Emit .js files with the JSX changed to _jsx calls
  "react-native": DEFAULT_MAPPING, // Emit .js files with the JSX unchanged
  preserve: PRESERVE_MAPPING, // Emit .jsx files with the JSX unchanged
};

export type TypescriptExtensionMap = {
  /**  Convert from typescript to javascript */
  forward: Record<string, string>;
  /** Convert from javascript to typescript */
  backward: Record<string, string[]>;
};

/**
 * @param typescriptExtensionMap A forward extension mapping
 */
function normalize(
  typescriptExtensionMap: [string, string][],
): TypescriptExtensionMap {
  const forward: Record<string, string> = {};

  const backward: Record<string, string[]> = {};

  for (const [typescript, javascript] of typescriptExtensionMap) {
    forward[typescript] = javascript;
    if (!typescript) {
      continue;
    }
    backward[javascript] ??= [];
    backward[javascript].push(typescript);
  }

  return { forward, backward };
}

/**
 * Attempts to get the ExtensionMap from the resolved tsconfig.
 *
 * @param tsconfig - The resolved tsconfig
 * @returns The `typescriptExtensionMap` value, or `null`.
 */
function getMappingFromTSConfig(
  tsconfig?: TsConfigJsonResolved,
): TypescriptExtensionMap | null {
  const jsx = tsconfig?.compilerOptions?.jsx;

  if (jsx != null && {}.hasOwnProperty.call(tsConfigMapping, jsx)) {
    return tsConfigMapping[jsx];
  }

  return null;
}

/**
 * Gets `typescriptExtensionMap` property from a given option object.
 *
 * @param option - An option object to get.
 * @returns The `typescriptExtensionMap` value, or `null`.
 */
function get(option: unknown): TypescriptExtensionMap | null {
  if (typeof option !== "object" || option === null) {
    return null;
  }
  if ("typescriptExtensionMap" in option) {
    if (
      typeof option?.typescriptExtensionMap === "string" &&
      {}.hasOwnProperty.call(tsConfigMapping, option?.typescriptExtensionMap)
    ) {
      return tsConfigMapping[
        option.typescriptExtensionMap as keyof typeof tsConfigMapping
      ];
    }

    if (Array.isArray(option?.typescriptExtensionMap)) {
      return normalize(option.typescriptExtensionMap);
    }
  }

  if ("tsconfigPath" in option) {
    if (typeof option.tsconfigPath === "string") {
      return getMappingFromTSConfig(getTSConfig(option.tsconfigPath));
    }
  }

  return null;
}

/**
 * Attempts to get the ExtensionMap from the tsconfig of a given file.
 *
 * @param context - The current file context
 * @returns The `typescriptExtensionMap` value, or `null`.
 */
function getFromTSConfigFromFile(
  context: Rule.RuleContext,
): TypescriptExtensionMap | null {
  return getMappingFromTSConfig(getTSConfigForContext(context)?.config);
}

/**
 * Gets "typescriptExtensionMap" setting.
 *
 * 1. This checks `options.typescriptExtensionMap`, if its an array then it gets returned.
 * 2. This checks `options.typescriptExtensionMap`, if its a string, convert to the correct mapping.
 * 3. This checks `settings.n.typescriptExtensionMap`, if its an array then it gets returned.
 * 4. This checks `settings.n.typescriptExtensionMap`, if its a string, convert to the correct mapping.
 * 5. This checks `settings.node.typescriptExtensionMap`, if its an array then it gets returned.
 * 6. This checks `settings.node.typescriptExtensionMap`, if its a string, convert to the correct mapping.
 * 7. This checks for a `tsconfig.json` `config.compilerOptions.jsx` property, if its a string, convert to the correct mapping.
 * 8. This returns `PRESERVE_MAPPING`.
 *
 * @param context - The rule context.
 * @returns A list of extensions.
 */
export function getTypescriptExtensionMap(
  context: Rule.RuleContext,
  optionIndex = 0,
): TypescriptExtensionMap {
  return (
    get(context.options?.[optionIndex]) ||
    get(context.settings?.n) ||
    get(context.settings?.node) ||
    getFromTSConfigFromFile(context) ||
    PRESERVE_MAPPING
  );
}

export const schema = {
  oneOf: [
    {
      type: "array" as const,
      items: {
        type: "array" as const,
        prefixItems: [
          { type: "string" as const, pattern: "^(?:|\\.\\w+)$" },
          { type: "string" as const, pattern: "^\\.\\w+$" },
        ],
        additionalItems: false,
      },
      uniqueItems: true,
    },
    {
      type: "string" as const,
      enum: Object.keys(tsConfigMapping),
    },
  ],
};
