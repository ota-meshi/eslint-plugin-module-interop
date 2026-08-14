import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: true,
  outDir: "lib",
  entry: ["src/index.ts"],
  fixedExtension: false,
  format: ["esm"],
  target: "es2022",
  treeshake: true,
});
