import { createRule } from "../utils/index.js";
import { defineImportVisitor } from "../utils/node/import-visitor.js";

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
    return defineImportVisitor(
      context,
      { ignoreTypeImport: true },
      (targets) => {
        for (const target of targets) {
          if (target.isCJS()) {
            context.report({
              node: target.source,
              messageId: "unexpectedCJSImport",
            });
          }
        }
      },
    );
  },
});
