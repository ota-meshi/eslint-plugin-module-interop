import path from "node:path";
import { compositingVisitors, createRule } from "../utils/index.js";
import { detectModuleType } from "../utils/node/detect-module-type.js";
import { defineRequireVisitor } from "../utils/node/require-visitor.js";
import { isTypescript } from "../utils/node/is-typescript.js";
import { defineImportVisitor } from "../utils/node/import-visitor.js";
import type { ImportTarget } from "../utils/node/import-target.js";

export default createRule("no-require-esm", {
  meta: {
    docs: {
      description: "disallow `require(esm)`",
      categories: [],
    },
    schema: [],
    messages: {
      unexpectedRequireEsm: "Loading ESM using `require()` is forbidden.",
    },
    type: "suggestion",
  },
  create(context) {
    const requireVisitor = defineRequireVisitor(context, {}, check);
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
      defineImportVisitor(context, {}, check),
    );

    /**
     * Checks for the import targets.
     */
    function check(targets: ImportTarget[]) {
      for (const target of targets) {
        const type = target.getModuleType();
        if (type === "esm") {
          context.report({
            node: target.source,
            messageId: "unexpectedRequireEsm",
          });
        }
      }
    }
  },
});
