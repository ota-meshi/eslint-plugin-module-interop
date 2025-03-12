import js from "@eslint/js";
import moduleInterop from "eslint-plugin-module-interop";
export default [
  js.configs.recommended,
  moduleInterop.configs.recommended,
  {
    rules: {
      "module-interop/no-import-cjs": "error",
      "module-interop/no-require-esm": "error",
    },
    languageOptions: { globals: { require: "readonly" } },
  },
];
