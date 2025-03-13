---
pageClass: "rule-details"
sidebarDepth: 0
title: "module-interop/prefer-json-modules"
description: "enforce json imports to have the `{type: \"json\"}` attribute."
---

# module-interop/prefer-json-modules

> enforce json imports to have the `{type: "json"}` attribute.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.recommended`.
- 💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## 📖 Rule Details

This rule reports JSON imports that do not have the `{type: "json"}` attribute.

Although the bundler and some runtimes (or loaders) allow you to import JSON without the `{type: "json"}` import attribute for interoperability, but this is not safe.\
When importing JSON, it is best to use the `{type: "json"}` import attribute.

<!-- eslint-skip -->

```js
/* eslint module-interop/prefer-json-modules: 'error' */

/* ✓ GOOD */
import x from './data.json' with {type: "json"};

/* ✗ BAD */
import y from './data.json';
```

## 🔧 Options

Nothing.

## 📚 Further reading

- [TC39 Proposal - JSON modules]

[TC39 Proposal - JSON modules]: https://github.com/tc39/proposal-json-modules

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/src/rules/prefer-json-modules.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/tests/src/rules/prefer-json-modules.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-module-interop/tree/main/tests/fixtures/rules/prefer-json-modules)
