import plugin, { type RuleOptions } from "../../src/index.js";
import type { ESLint, Linter } from "eslint";

plugin satisfies ESLint.Plugin;

const config: Linter.Config<RuleOptions> = {
  rules: {
    "module-interop/no-import-cjs": "error",
  },
};

config satisfies Linter.Config;

const invalidConfig: Linter.Config<RuleOptions> = {
  rules: {
    // @ts-expect-error -- The rule does not accept options.
    "module-interop/no-import-cjs": ["error", {}],
  },
};

invalidConfig satisfies Linter.Config;
