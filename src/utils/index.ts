/* eslint @typescript-eslint/no-explicit-any: off -- util */
import type { Rule } from "eslint";
import type { PartialRuleModule, RuleModule } from "../types.js";

/**
 * Define the rule.
 * @param ruleName ruleName
 * @param rule rule module
 */
export function createRule(
  ruleName: string,
  rule: PartialRuleModule,
): RuleModule {
  return {
    meta: {
      ...rule.meta,
      docs: {
        ...rule.meta.docs,
        url: `https://ota-meshi.github.io/eslint-plugin-module-interop/rules/${ruleName}.html`,
        ruleId: `module-interop/${ruleName}`,
        ruleName,
      },
    },
    create(context: Rule.RuleContext): any {
      return rule.create(context as any);
    },
  };
}

/**
 * Compositing visitors
 */
export function compositingVisitors(
  ...visitors: [Rule.RuleListener, ...Rule.RuleListener[]]
): Rule.RuleListener {
  const result: Rule.RuleListener = {};
  for (const v of visitors) {
    for (const key in v) {
      if (result[key]) {
        const o = result[key];
        result[key] = (...args: any[]) => {
          // @ts-expect-error -- ignore
          o(...args);
          // @ts-expect-error -- ignore
          v[key](...args);
        };
      } else {
        result[key] = v[key];
      }
    }
  }
  return result;
}
