import path from "path";
import fs from "fs";
import { rules } from "./lib/load-rules.js";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const FLAT_RULESET_NAME = {
  recommended: "../src/configs/recommended.ts",
};

for (const rec of ["recommended"] as const) {
  const content = `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
import type { ESLint, Linter } from "eslint";
import plugin from "../index.js";
export const plugins = {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
  get "module-interop"(): ESLint.Plugin {
    return plugin;
  },
};
export const rules: Linter.RulesRecord = {
  // eslint-plugin-module-interop rules
  ${rules
    .filter(
      (rule) =>
        rule.meta.docs.categories &&
        !rule.meta.deprecated &&
        rule.meta.docs.categories.includes(rec),
    )
    .map((rule) => {
      const conf = rule.meta.docs.default || "error";
      return `"${rule.meta.docs.ruleId}": "${conf}"`;
    })
    .join(",\n")}
};
`;

  const filePath = path.resolve(dirname, FLAT_RULESET_NAME[rec]);

  // Update file.
  fs.writeFileSync(filePath, content);
}
