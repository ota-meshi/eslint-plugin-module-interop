# Introduction

[eslint-plugin-module-interop](https://www.npmjs.com/package/eslint-plugin-module-interop) is ESLint plugin with rules for module interoperability.

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-module-interop.svg)](https://www.npmjs.com/package/eslint-plugin-module-interop)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-module-interop.svg)](https://www.npmjs.com/package/eslint-plugin-module-interop)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-module-interop&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-module-interop)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-module-interop.svg)](http://www.npmtrends.com/eslint-plugin-module-interop)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-module-interop.svg)](http://www.npmtrends.com/eslint-plugin-module-interop)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-module-interop.svg)](http://www.npmtrends.com/eslint-plugin-module-interop)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-module-interop.svg)](http://www.npmtrends.com/eslint-plugin-module-interop)
[![Build Status](https://github.com/ota-meshi/eslint-plugin-module-interop/actions/workflows/NodeCI.yml/badge.svg?branch=main)](https://github.com/ota-meshi/eslint-plugin-module-interop/actions/workflows/NodeCI.yml)

## 📛 Features

ESLint plugin with rules for module interoperability.

You can check on the [Online DEMO](https://eslint-online-playground.netlify.app/#eslint-plugin-module-interop).

<!--DOCS_IGNORE_START-->

## 📖 Documentation

See [documents](https://ota-meshi.github.io/eslint-plugin-module-interop/).

## 💿 Installation

```bash
npm install --save-dev eslint eslint-plugin-module-interop
```

<!--DOCS_IGNORE_END-->

## 📖 Usage

<!--USAGE_SECTION_START-->
<!--USAGE_GUIDE_START-->

### Configuration

#### New Config (`eslint.config.js`)

Use `eslint.config.js` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/configuration-files-new>.

Example **eslint.config.js**:

```js
import moduleInterop from 'eslint-plugin-module-interop';
export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  moduleInterop.configs.recommended,
  {
    rules: {
      // override/add rules settings here, such as:
      // 'module-interop/no-import-cjs': 'error'
    }
  }
];
```

This plugin provides configs:

- `*.configs.recommended` ... Recommended config provided by the plugin.

See [the rule list](https://ota-meshi.github.io/eslint-plugin-module-interop/rules/) to get the `rules` that this plugin provides.

#### Legacy Config (`.eslintrc`)

Is not supported.

<!--USAGE_GUIDE_END-->
<!--USAGE_SECTION_END-->

## ✅ Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench 🔧 below.  
The rules with the following star ⭐ are included in the configs.

<!--RULES_TABLE_START-->

### Module Interop Rules

| Rule ID | Description | Fixable | RECOMMENDED |
|:--------|:------------|:-------:|:-----------:|
| [module-interop/no-import-cjs](https://ota-meshi.github.io/eslint-plugin-module-interop/rules/no-import-cjs.html) | disallow importing CommonJS modules |  |  |
| [module-interop/no-require-esm](https://ota-meshi.github.io/eslint-plugin-module-interop/rules/no-require-esm.html) | disallow `require(esm)` |  |  |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->
<!--DOCS_IGNORE_START-->

## 🍻 Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.  
- `npm run update` runs in order to update readme and recommended configuration.  

## 🔒 License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
