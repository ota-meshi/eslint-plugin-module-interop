import { createRule } from "../utils/index.js";
import { defineEffectivelyRequireVisitor } from "../utils/node/require-visitor.js";
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
    return defineEffectivelyRequireVisitor(context, {}, check);

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
