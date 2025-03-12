---
pageClass: "rule-details"
sidebarDepth: 0
title: "module-interop/no-import-cjs"
description: "disallow importing CommonJS modules"
---

# module-interop/no-import-cjs

> disallow importing CommonJS modules

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## 📖 Rule Details

This rule reports ES module imports of CommonJS modules.

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

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/src/rules/no-import-cjs.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/tests/src/rules/no-import-cjs.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-module-interop/tree/main/tests/fixtures/rules/no-import-cjs)
