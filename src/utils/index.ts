/* eslint @typescript-eslint/no-explicit-any: off -- util */
import type { Rule } from "eslint";
import type { PartialRuleModule, RuleModule } from "../types.js";

type RuleVisitor = Record<string, ((...args: any[]) => void) | undefined>;

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
      return rule.create(context);
    },
  };
}

/**
 * Compositing visitors
 */
export function compositingVisitors(
  ...visitors: [Rule.RuleListener, ...Rule.RuleListener[]]
): Rule.RuleListener {
  const result: RuleVisitor = {};
  for (const v of visitors as RuleVisitor[]) {
    for (const key in v) {
      const visitor = v[key];
      if (!visitor) {
        continue;
      }
      const previous = result[key];
      if (previous) {
        result[key] = (...args: any[]) => {
          previous(...args);
          visitor(...args);
        };
      } else {
        result[key] = visitor;
      }
    }
  }
  return result;
}
