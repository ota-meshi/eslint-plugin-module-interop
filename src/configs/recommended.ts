// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
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
  "module-interop/prefer-json-modules": "error",
};
