import path from "node:path";
import { getPackageJson } from "./get-package-json.js";
import type { JsonObject, JsonValue } from "type-fest";

export type ModuleType = "esm" | "cjs" | "dual" | "json";

/**
 * Detects the module type of a file.
 */
export function detectModuleType(filePath: string): ModuleType | null {
  const ext = path.extname(filePath);
  const extType = detectModuleTypeForExt(ext);
  if (extType) return extType;
  if (ext === ".js") {
    const pkg = getPackageJson(filePath);
    if (pkg) {
      return detectModuleTypeForPackageType(pkg.type);
    }
    return null;
  }
  if (ext === ".ts") {
    const pkg = getPackageJson(filePath);
    if (pkg) {
      return detectModuleTypeForPackageJson(pkg);
    }
  }

  return null;
}

/**
 * Detects the module type from package.json.
 */
function detectModuleTypeForPackageJson(
  packageJson: JsonObject,
): ModuleType | null {
  const type = packageJson.type;
  return (
    detectModuleTypeForExports(packageJson.exports) ??
    detectModuleTypeForPackageType(type)
  );

  /**
   * Detects the module type from the exports field in package.json.
   */
  function detectModuleTypeForExports(
    exports: JsonValue | undefined,
  ): ModuleType | null {
    if (typeof exports === "string") {
      const ext = path.extname(exports);
      const extType = detectModuleTypeForExt(ext);
      if (extType) {
        return extType;
      } else if (ext === ".js") {
        const typeModuleType = detectModuleTypeForPackageType(type);
        if (typeModuleType) {
          return typeModuleType;
        }
      }
      return null;
    }
    if (typeof exports !== "object" || !exports) return null;
    let esm = false;
    let cjs = false;
    for (const [key, value] of Object.entries(exports)) {
      let entryType: "esm" | "cjs" | null = null;
      if (key === "import" || key === "module-sync") {
        entryType = "esm";
      } else if (key === "require") {
        entryType = "cjs";
      } else {
        const nestType = detectModuleTypeForExports(value);
        if (nestType === "cjs" || nestType === "esm") {
          entryType = nestType;
        } else if (nestType === "dual") {
          return "dual";
        }
      }
      if (entryType === "esm") {
        if (cjs) return "dual";
        esm = true;
      } else if (entryType === "cjs") {
        if (esm) return "dual";
        cjs = true;
      }
    }
    return esm && cjs ? "dual" : esm ? "esm" : cjs ? "cjs" : null;
  }
}

/**
 * Detects the module type of a file extension.
 */
function detectModuleTypeForExt(ext: string): "json" | "cjs" | "esm" | null {
  if (ext === ".json") {
    return "json";
  }
  if (ext === ".cjs" || ext === ".cts") return "cjs";
  if (ext === ".mjs" || ext === ".mts") return "esm";
  return null;
}

/**
 * Detects the module type from the type field in package.json.
 */
function detectModuleTypeForPackageType(
  type: JsonValue | undefined,
): "cjs" | "esm" | null {
  if (type === "module") {
    return "esm";
  } else if (type === "commonjs" || !type) {
    return "cjs";
  }
  return null;
}
