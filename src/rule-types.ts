// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"

/* eslint-disable */
/* prettier-ignore */
import type { Linter } from 'eslint'

declare module 'eslint' {
  namespace Linter {
    interface RulesRecord extends RuleOptions {}
  }
}

export interface RuleOptions {
  /**
   * disallow importing CommonJS modules
   * @see https://ota-meshi.github.io/eslint-plugin-module-interop/rules/no-import-cjs.html
   */
  'module-interop/no-import-cjs'?: Linter.RuleEntry<[]>
  /**
   * disallow `require(esm)`
   * @see https://ota-meshi.github.io/eslint-plugin-module-interop/rules/no-require-esm.html
   */
  'module-interop/no-require-esm'?: Linter.RuleEntry<[]>
  /**
   * enforce json imports to have the `{type: "json"}` attribute.
   * @see https://ota-meshi.github.io/eslint-plugin-module-interop/rules/prefer-json-modules.html
   */
  'module-interop/prefer-json-modules'?: Linter.RuleEntry<[]>
}

/* ======= Declarations ======= */
