import { createRule } from "../utils/index.js";
import { defineRequireVisitor } from "../utils/node/require-visitor.js";

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
    return defineRequireVisitor(context, {}, (targets) => {
      for (const target of targets) {
        if (target.isESM()) {
          context.report({
            node: target.source,
            messageId: "unexpectedRequireEsm",
          });
        }
      }
    });
  },
});
