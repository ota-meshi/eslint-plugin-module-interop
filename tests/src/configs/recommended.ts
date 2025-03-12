import assert from "assert";
import * as plugin from "../../../src/index.js";
import { ESLint } from "eslint";

const code = `import * as foo from "./foo.js";`;
describe("`recommended` config", () => {
  it("should work. ", async () => {
    const linter = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [plugin.configs.recommended],
    });
    const result = await linter.lintText(code, { filePath: "test.js" });
    const messages = result[0].messages;

    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [],
    );
  });
});
