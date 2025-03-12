/**
 * This file was taken from eslint-plugin-n.
 */
import type { Rule } from "eslint";
import { ImportTarget, resolveOptions } from "./import-target.js";
import type { TSESTree } from "@typescript-eslint/types";
import { stripImportPathParams } from "./strip-import-path-params.js";
import { isBuiltin } from "node:module";

export type Option = {
  includeCore?: boolean;
  ignoreTypeImport?: boolean;
};

/**
 * Define the import visitor.
 */
export function defineImportVisitor(
  context: Rule.RuleContext,
  { includeCore = false, ignoreTypeImport = false }: Option,
  callback: (targets: ImportTarget[]) => void,
): Rule.RuleListener {
  const targets: ImportTarget[] = [];
  const options = resolveOptions(context);

  /**
   * Add an import target.
   * @param node - The node of a module declaration.
   */
  function addTarget(
    node:
      | TSESTree.ExportAllDeclaration
      | TSESTree.ExportNamedDeclaration
      | TSESTree.ImportDeclaration
      | TSESTree.ImportExpression,
  ) {
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
      targets.push(new ImportTarget(context, source, name, options, "import"));
    }
  }

  return {
    ExportAllDeclaration(node) {
      addTarget(node);
    },
    ExportNamedDeclaration(node) {
      addTarget(node);
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

      addTarget(node);
    },
    ImportExpression(node) {
      addTarget(node);
    },

    "Program:exit"() {
      callback(targets);
    },
  };
}
