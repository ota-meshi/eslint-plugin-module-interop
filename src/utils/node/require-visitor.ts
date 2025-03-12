/**
 * This file was taken from eslint-plugin-n.
 */
import type { TSESTree } from "@typescript-eslint/types";
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
    TSExternalModuleReference(node: TSESTree.TSExternalModuleReference) {
      const name = stripImportPathParams(node.expression.value);
      if (includeCore || !isBuiltin(name)) {
        targets.push(
          new ImportTarget(context, node.expression, name, options, "require"),
        );
      }
    },
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
