---
pageClass: "rule-details"
sidebarDepth: 0
title: "module-interop/no-require-esm"
description: "disallow `require(esm)`"
since: "v0.1.0"
---

# module-interop/no-require-esm

> disallow `require(esm)`

## 📖 Rule Details

This rule reports `require()` calls of ES module files.

`require(esm)` is now supported without the feature flag in Node.js v22.13.0, but is not available in earlier versions.\
You can use this rule to check backward compatibility with Node.js by disallowing `require(esm)`.

<!-- eslint-skip -->

```js
/* eslint module-interop/no-require-esm: 'error' */

/* ✓ GOOD */
require('./my-module.cjs');

/* ✗ BAD */
require('./my-module.mjs');
```

## 🔧 Options

Nothing.

## 📚 Further reading

- [Node.js documentation - Loading ECMAScript modules using `require()`]

[Node.js documentation - Loading ECMAScript modules using `require()`]: https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require

## 👫 Related rules

- [module-interop/no-import-cjs]

[module-interop/no-import-cjs]: ./no-import-cjs.md

## 🚀 Version

This rule was introduced in eslint-plugin-module-interop v0.1.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/src/rules/no-require-esm.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/tests/src/rules/no-require-esm.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-module-interop/tree/main/tests/fixtures/rules/no-require-esm)
