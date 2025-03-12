/**
 * This file was taken from eslint-plugin-n.
 */
import type { Rule } from "eslint";
import { ImportTarget, resolveOptions } from "./import-target.js";
import { stripImportPathParams } from "./strip-import-path-params.js";
import { isBuiltin } from "node:module";
import {
  ReferenceTracker,
  getStringIfConstant,
} from "@eslint-community/eslint-utils";

export type Option = {
  includeCore?: boolean;
};
/**
 * Define the `require()` visitor.
 */
export function defineRequireVisitor(
  context: Rule.RuleContext,
  { includeCore = false }: Option,
  callback: (targets: ImportTarget[]) => void,
): Rule.RuleListener {
  const targets: ImportTarget[] = [];
  const options = resolveOptions(context);

  return {
    "Program:exit"() {
      const tracker = new ReferenceTracker(
        context.sourceCode.getScope(context.sourceCode.ast as never),
      );
      const references = tracker.iterateGlobalReferences({
        require: {
          [ReferenceTracker.CALL]: true,
          resolve: { [ReferenceTracker.CALL]: true },
        },
      });

      for (const { node } of references) {
        if (node.type !== "CallExpression") {
          continue;
        }

        const targetNode = node.arguments[0];
        if (targetNode == null || targetNode.type === "SpreadElement") {
          continue;
        }

        const rawName = getStringIfConstant(targetNode);
        if (typeof rawName !== "string") {
          continue;
        }

        const name = stripImportPathParams(rawName);
        if (includeCore || !isBuiltin(name)) {
          targets.push(
            new ImportTarget(context, targetNode, name, options, "require"),
          );
        }
      }

      callback(targets);
    },
  };
}
