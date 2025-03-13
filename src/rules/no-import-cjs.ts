import type { TSESTree } from "@typescript-eslint/types";
import { createRule } from "../utils/index.js";
import { defineEffectivelyImportVisitor } from "../utils/node/import-visitor.js";
import type { ImportTarget } from "../utils/node/import-target.js";

export default createRule("no-import-cjs", {
  meta: {
    docs: {
      description: "disallow importing CommonJS modules",
      categories: [],
    },
    schema: [],
    messages: {
      unexpectedCJSImport:
        "Importing CommonJS modules using `import` is forbidden.",
    },
    type: "suggestion",
  },
  create(context) {
    return defineEffectivelyImportVisitor(
      context,
      { ignoreTypeImport: true },
      check,
    );

    /**
     * Checks for the import targets.
     */
    function check(
      targets: ImportTarget<
        | TSESTree.ExportAllDeclaration
        | TSESTree.ExportNamedDeclaration
        | TSESTree.ImportDeclaration
        | TSESTree.ImportExpression
      >[],
    ) {
      for (const target of targets) {
        const type = target.getModuleType();
        if (type === "cjs") {
          context.report({
            node: target.source,
            messageId: "unexpectedCJSImport",
          });
        }
      }
    }
  },
});
