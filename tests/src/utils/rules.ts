import type { RuleModule } from "../../../src/types.js";
import assert from "assert";
import path from "path";
import fs from "fs";

import { rules as allRules } from "../../../src/utils/rules.js";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @returns {Array} Get the list of rules placed in the directory.
 */
async function getDirRules() {
  const rules: { [key: string]: RuleModule } = {};

  const rulesRoot = path.resolve(dirname, "../../../src/rules");
  for (const filename of fs
    .readdirSync(rulesRoot)
    .filter((n) => n.endsWith(".ts"))) {
    const ruleName = filename.replace(/\.ts$/u, "");
    const ruleId = `module-interop/${ruleName}`;

    const rule = await import(path.join(rulesRoot, filename)).then(
      (m) => m.default || m,
    );
    rules[ruleId] = rule;
  }
  return rules;
}

const dirRules = await getDirRules();

describe("Check that all the rules have the correct names.", () => {
  for (const ruleId of Object.keys(dirRules)) {
    it(ruleId, () => {
      const rule = dirRules[ruleId];
      assert.strictEqual(rule.meta.docs.ruleId, ruleId);
    });
  }
});

describe("Check if the strict of all rules is correct", () => {
  it("rule count equals", () => {
    assert.ok(
      allRules.length === Object.keys(dirRules).length,
      `Did not equal the number of rules. expect:${
        Object.keys(dirRules).length
      } actual:${allRules.length}`,
    );
  });

  for (const rule of allRules) {
    it(rule.meta.docs.ruleId, () => {
      assert.ok(Boolean(rule.meta.docs.ruleId), "Did not set `ruleId`");
      assert.ok(Boolean(rule.meta.docs.ruleName), "Did not set `ruleName`");
      assert.ok(Boolean(dirRules[rule.meta.docs.ruleId]), "Did not exist rule");
    });

    describe("Check if the messages are correct", () => {
      describe(rule.meta.docs.ruleId, () => {
        if (!rule.meta.messages) {
          return;
        }
        for (const messageId of Object.keys(rule.meta.messages)) {
          it(messageId, () => {
            const message = rule.meta.messages[messageId];
            assert.ok(
              message.endsWith(".") || message.endsWith("}}"),
              "Doesn't end with a dot.",
            );
          });
        }
      });
    });
  }
});
