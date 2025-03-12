# User Guide

## 💿 Installation

```bash
npm install --save-dev eslint eslint-plugin-module-interop
```

## 📖 Usage

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

See [the rule list](../rules/index.md) to get the `rules` that this plugin provides.

#### Legacy Config (`.eslintrc`)

Is not supported.

<!--USAGE_GUIDE_END-->

## ❓ FAQ

- TODO
