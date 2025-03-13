import type { TSESTree } from "@typescript-eslint/types";
import type { Rule } from "eslint";
import { ImportTarget, resolveOptions } from "./import-target.js";
import { stripImportPathParams } from "./strip-import-path-params.js";
import { isBuiltin } from "node:module";
import {
  ReferenceTracker,
  getStringIfConstant,
} from "@eslint-community/eslint-utils";
import { isTypescript } from "./is-typescript.js";
import path from "node:path";
import { detectModuleType } from "./detect-module-type.js";
import { compositingVisitors } from "../index.js";
import { defineImportStatementVisitor } from "./import-visitor.js";

export type Option = {
  includeCore?: boolean;
};

/**
 * Defines the effectively `require()` visitor.
 * `import` in `*.ts` files may actually act as `require()`.
 * If it detects any `imports` that `require()`, it will define a visitor to visit them too.
 */
export function defineEffectivelyRequireVisitor(
  context: Rule.RuleContext,
  { includeCore = false }: Option,
  callback: (targets: ImportTarget[]) => void,
): Rule.RuleListener {
  const requireVisitor = compositingVisitors(
    defineCjsRequireVisitor(context, { includeCore }, callback),
    defineTsRequireVisitor(context, { includeCore }, callback),
  );
  if (!isTypescript(context)) {
    return requireVisitor;
  }
  const filename = path.resolve(context.filename);
  if (path.extname(filename) !== ".ts") {
    return requireVisitor;
  }
  const moduleType = detectModuleType(filename);
  if (moduleType !== "cjs") {
    return requireVisitor;
  }

  // For `.ts` files, ESM imports may become CJS through transpilation.
  // We detect whether they will be transpiled and, if so,
  // check for ESM imports as well.
  return compositingVisitors(
    requireVisitor,
    defineImportStatementVisitor(
      context,
      { includeCore, ignoreTypeImport: true },
      callback,
    ),
  );
}

/**
 * Define the `require()` visitor.
 */
export function defineCjsRequireVisitor(
  context: Rule.RuleContext,
  { includeCore = false }: Option,
  callback: (targets: ImportTarget[]) => void,
): Rule.RuleListener {
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

      const targets: ImportTarget[] = [];
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

/**
 * Define the `import x = require()` visitor.
 */
export function defineTsRequireVisitor(
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
      callback(targets);
    },
  };
}
