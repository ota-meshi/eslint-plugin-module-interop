import type { RuleOptions as GeneratedRuleOptions } from "./rule-types.js";
import { rules as ruleList } from "./utils/rules.js";
import * as recommended from "./configs/recommended.js";
import * as meta from "./meta.js";
import type { ESLint, Linter } from "eslint";

export type RuleOptions = Linter.RulesRecord & GeneratedRuleOptions;

const configs = {
  recommended: recommended satisfies Linter.Config,
};

const rules: NonNullable<ESLint.Plugin["rules"]> = ruleList.reduce(
  (obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
  },
  {} as NonNullable<ESLint.Plugin["rules"]>,
);

export { meta, configs, rules };
const plugin: ESLint.Plugin & {
  meta: typeof meta;
  configs: typeof configs;
  rules: typeof rules;
} = { meta, configs, rules };
export default plugin;
