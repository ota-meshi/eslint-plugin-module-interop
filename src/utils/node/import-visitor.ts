import type { Rule } from "eslint";
import { ImportTarget, resolveOptions } from "./import-target.js";
import type { TSESTree } from "@typescript-eslint/types";
import { stripImportPathParams } from "./strip-import-path-params.js";
import { isBuiltin } from "node:module";
import { detectModuleType } from "./detect-module-type.js";
import path from "node:path";
import { isTypescript } from "./is-typescript.js";
import { compositingVisitors } from "../index.js";

/**
 * Defines the effectively `import` visitor.
 * `import` in `*.ts` files may actually act as `require()`.
 * Define a visitor that will only visit actual `import`, excluding `require()`.
 */
export function defineEffectivelyImportVisitor(
  context: Rule.RuleContext,
  {
    includeCore = false,
    ignoreTypeImport = false,
  }: {
    includeCore?: boolean;
    ignoreTypeImport?: boolean;
  },
  callback: (
    targets: ImportTarget<
      | TSESTree.ExportAllDeclaration
      | TSESTree.ExportNamedDeclaration
      | TSESTree.ImportDeclaration
      | TSESTree.ImportExpression
    >[],
  ) => void,
): Rule.RuleListener {
  if (isTypescript(context)) {
    const filename = path.resolve(context.filename);
    if (path.extname(filename) === ".ts") {
      const moduleType = detectModuleType(filename);
      if (moduleType === "cjs") {
        // If it's a ts file and after transpilation becomes cjs
        // it won't check any import statements because they will be turned into requires.
        return defineDynamicImportVisitor(context, { includeCore }, callback);
      }
    }
  }
  return compositingVisitors(
    defineImportStatementVisitor(
      context,
      { includeCore, ignoreTypeImport },
      callback,
    ),
    defineDynamicImportVisitor(context, { includeCore }, callback),
  );
}
/**
 * Define the import statement visitor.
 */
export function defineImportStatementVisitor(
  context: Rule.RuleContext,
  {
    includeCore = false,
    ignoreTypeImport = false,
  }: {
    includeCore?: boolean;
    ignoreTypeImport?: boolean;
  },
  callback: (
    targets: ImportTarget<
      | TSESTree.ExportAllDeclaration
      | TSESTree.ExportNamedDeclaration
      | TSESTree.ImportDeclaration
    >[],
  ) => void,
): Rule.RuleListener {
  return defineImportVisitor(
    context,
    {
      includeCore,
      ignoreTypeImport,
      kind: "statement",
    },
    callback,
  );
}

/**
 * Define the dynamic import visitor.
 */
export function defineDynamicImportVisitor(
  context: Rule.RuleContext,
  { includeCore = false }: { includeCore?: boolean },
  callback: (targets: ImportTarget<TSESTree.ImportExpression>[]) => void,
): Rule.RuleListener {
  return defineImportVisitor(
    context,
    {
      includeCore,
      kind: "expression",
    },
    callback,
  );
}

/**
 * Define the import visitor.
 */
function defineImportVisitor<
  K extends "statement" | "expression",
  N extends
    | TSESTree.ExportAllDeclaration
    | TSESTree.ExportNamedDeclaration
    | TSESTree.ImportDeclaration
    | TSESTree.ImportExpression = K extends "statement"
    ?
        | TSESTree.ExportAllDeclaration
        | TSESTree.ExportNamedDeclaration
        | TSESTree.ImportDeclaration
    : TSESTree.ImportExpression,
>(
  context: Rule.RuleContext,
  {
    includeCore = false,
    ignoreTypeImport = false,
    kind,
  }: {
    includeCore?: boolean;
    ignoreTypeImport?: boolean;
    kind: K;
  },
  callback: (targets: ImportTarget<N>[]) => void,
): Rule.RuleListener {
  const targets: ImportTarget<N>[] = [];
  const options = resolveOptions(context);

  /**
   * Add an import target.
   * @param node - The node of a module declaration.
   */
  function addTarget(node: N) {
    const source = node.source;
    if (
      source == null ||
      source.type !== "Literal" ||
      typeof source.value !== "string"
    ) {
      return;
    }

    const name = stripImportPathParams(source.value);
    if (includeCore || !isBuiltin(name)) {
      targets.push(new ImportTarget(context, node, name, options, "import"));
    }
  }

  return kind === "statement"
    ? {
        ExportAllDeclaration(node) {
          addTarget(node as N);
        },
        ExportNamedDeclaration(node) {
          addTarget(node as N);
        },
        ImportDeclaration(node) {
          if (
            ignoreTypeImport &&
            (node.importKind === "type" ||
              (node.specifiers.length > 0 &&
                node.specifiers.every(
                  (specifier) =>
                    specifier.type === "ImportSpecifier" &&
                    specifier.importKind === "type",
                )))
          ) {
            // Ignore type imports.
            return;
          }

          addTarget(node as N);
        },
        "Program:exit"() {
          callback(targets);
        },
      }
    : {
        ImportExpression(node) {
          addTarget(node as N);
        },
        "Program:exit"() {
          callback(targets);
        },
      };
}
