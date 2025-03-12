---
pageClass: "rule-details"
sidebarDepth: 0
title: "module-interop/no-require-esm"
description: "disallow `require(esm)`"
---

# module-interop/no-require-esm

> disallow `require(esm)`

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## 📖 Rule Details

This rule reports `require` calls of ES module files.

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

## 👫 Related rules

- [module-interop/no-import-cjs]

[module-interop/no-import-cjs]: ./no-import-cjs.md

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/src/rules/no-require-esm.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/tests/src/rules/no-require-esm.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-module-interop/tree/main/tests/fixtures/rules/no-require-esm)
