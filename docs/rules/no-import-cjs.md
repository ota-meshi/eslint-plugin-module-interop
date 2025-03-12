---
pageClass: "rule-details"
sidebarDepth: 0
title: "module-interop/no-import-cjs"
description: "disallow importing CommonJS modules"
since: "v0.1.0"
---

# module-interop/no-import-cjs

> disallow importing CommonJS modules

## 📖 Rule Details

This rule reports ES module imports of CommonJS modules.

Although it is possible to ESM import CommonJS modules due to module interoperability across bundlers and runtimes, their behavior may not be consistent.\
To avoid issues due to these differences, it is safe to ESM import only ESMs.

<!-- eslint-skip -->

```js
/* eslint module-interop/no-import-cjs: 'error' */

/* ✓ GOOD */
import x from './my-module.mjs';

/* ✗ BAD */
import y from './my-module.cjs';
```

## 🔧 Options

Nothing.

## 👫 Related rules

- [module-interop/no-require-esm]

[module-interop/no-require-esm]: ./no-require-esm.md

## 🚀 Version

This rule was introduced in eslint-plugin-module-interop v0.1.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/src/rules/no-import-cjs.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/tests/src/rules/no-import-cjs.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-module-interop/tree/main/tests/fixtures/rules/no-import-cjs)
