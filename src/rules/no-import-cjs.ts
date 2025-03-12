import path from "node:path";
import { createRule } from "../utils/index.js";
import { defineImportVisitor } from "../utils/node/import-visitor.js";
import { isTypescript } from "../utils/node/is-typescript.js";
import { detectModuleType } from "../utils/node/detect-module-type.js";

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
    let ignoreImportStatement = false;
    if (isTypescript(context)) {
      const filename = path.resolve(context.filename);
      if (path.extname(filename) === ".ts") {
        const moduleType = detectModuleType(filename);
        if (moduleType === "cjs") {
          // If it's a ts file and after transpilation becomes cjs
          // it won't check any import statements because they will be turned into requires.
          ignoreImportStatement = true;
        }
      }
    }
    return defineImportVisitor(
      context,
      { ignoreTypeImport: true, ignoreImportStatement },
      (targets) => {
        for (const target of targets) {
          const type = target.getModuleType();
          if (type === "cjs") {
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
