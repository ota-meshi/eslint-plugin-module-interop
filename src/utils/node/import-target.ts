import type { Rule } from "eslint";
import type { TSESTree } from "@typescript-eslint/types";
import type {
  ResolveOptions,
  ResolveOptionsOptionalFS,
} from "enhanced-resolve";
import { getTSConfigForContext } from "./get-tsconfig.js";
import { isBuiltin } from "node:module";
import { isTypescript } from "./is-typescript.js";
import path from "node:path";
import type { TypescriptExtensionMap } from "./config/get-typescript-extension-map.js";
import { getTypescriptExtensionMap } from "./config/get-typescript-extension-map.js";
import resolver from "enhanced-resolve";
import { getResolvePaths } from "./config/get-resolve-paths.js";
import { getResolverConfig } from "./config/get-resolver-config.js";
import { getTryExtensions } from "./config/get-try-extensions.js";
import type { ModuleType } from "./detect-module-type.js";
import { detectModuleType } from "./detect-module-type.js";

/**
 * Remove trailing wildcard characters from a string
 */
function removeTrailWildcard(input: string): string;
function removeTrailWildcard(input: string[]): string[];
/**
 * Remove trailing wildcard characters from a string
 */
function removeTrailWildcard(input: string | string[]): string | string[] {
  if (typeof input === "string") {
    return input.replace(/[*/\\]+$/, "");
  }

  return input.map((s) => removeTrailWildcard(s));
}

/**
 * Initialize this instance.
 * @param context - The context for the import origin.
 */
function getTSConfigAliases(
  context: Rule.RuleContext,
): ResolveOptions["alias"] {
  const tsConfig = getTSConfigForContext(context);

  const paths = tsConfig?.config?.compilerOptions?.paths;

  if (tsConfig?.path == null || paths == null) {
    return {};
  }

  return Object.entries(paths).map(([name, alias]) => ({
    name: removeTrailWildcard(name),
    alias: removeTrailWildcard(alias).map((relative) =>
      path.resolve(tsConfig.path, "..", relative),
    ),
  }));
}

export type Options = {
  extensions: string[];
  paths: string[];
  resolverConfig: Partial<ResolveOptions>;
  typescriptExtensionMap: TypescriptExtensionMap;
};

/**
 * Get the options for the ImportTarget.
 */
export function resolveOptions(
  context: Rule.RuleContext,
  optionIndex = 0,
): Options {
  let paths: string[] | undefined,
    extensions: string[] | undefined,
    resolverConfig: Partial<ResolveOptions> | undefined,
    typescriptExtensionMap: TypescriptExtensionMap | undefined;
  return {
    get paths() {
      return (paths ??= getResolvePaths(context, optionIndex));
    },
    get extensions() {
      return (extensions ??= getTryExtensions(context, optionIndex));
    },
    get resolverConfig() {
      return (resolverConfig ??= getResolverConfig(context, optionIndex));
    },
    get typescriptExtensionMap() {
      return (typescriptExtensionMap ??= getTypescriptExtensionMap(
        context,
        optionIndex,
      ));
    },
  };
}

type TargetSourceType =
  | "unknown"
  | "relative"
  | "absolute"
  | "node"
  | "npm"
  | "http";
type TargetModuleStyle = "import" | "require" | "type";

/**
 * @param string The string to manipulate
 * @param matcher The character to use as a segmenter
 * @param count How many segments to keep
 */
function trimAfter(string: string, matcher: string, count = 1) {
  return string.split(matcher).slice(0, count).join(matcher);
}

/**
 * Information of an import target.
 */
export class ImportTarget {
  /**
   * The context for the import origin
   */
  protected readonly context: Rule.RuleContext;

  /**
   * The node of a `require()` or a module declaration source.
   */
  public readonly source: TSESTree.Expression;

  /**
   * The name of this import target.
   */
  protected readonly name: string;

  /**
   * The import target options.
   */
  protected readonly options: Options;

  /**
   * What type of module are we looking for?
   */
  protected readonly sourceType: TargetSourceType;

  /**
   * What import style are we using
   */
  protected readonly moduleStyle: TargetModuleStyle;

  /**
   * The module name of this import target.
   * If the target is a relative path then this is `null`.
   */
  protected readonly moduleName: string | null;

  /**
   * This is the full resolution failure reasons
   */
  protected readonly resolveError: string | null;

  /**
   * The full path of this import target.
   * If the target is a module and it does not exist then this is `null`.
   */
  protected readonly filePath: string | null;

  protected readonly resolverConfig: ResolveOptionsOptionalFS;

  private moduleType: { value: ModuleType | null } | null = null;

  /**
   * Initialize this instance.
   * @param context - The context for the import origin.
   * @param source - The node of a `require()` or a module declaration source.
   * @param name - The name of an import target.
   * @param options - The options of ImportTarget.
   * @param fallbackModuleStyle - whether the target was require-ed or imported
   */
  public constructor(
    context: Rule.RuleContext,
    source: TSESTree.Expression,
    name: string,
    options: Options,
    fallbackModuleStyle: TargetModuleStyle,
  ) {
    this.context = context;
    this.source = source;
    this.name = name;
    this.options = options;
    const sourceType = (this.sourceType = getTargetSourceType({ name }));
    const moduleStyle = (this.moduleStyle = getModuleStyle({
      source,
      fallback: fallbackModuleStyle,
    }));
    this.moduleName = getModuleName({ sourceType, name });

    const filePathInfo = resolveFilePath({
      name,
      sourceType,
      moduleStyle,
      options,
      context,
    });

    this.filePath = filePathInfo.filePath;
    this.resolverConfig = filePathInfo.resolverConfig;
    this.resolveError = filePathInfo.resolveError ?? null;
  }

  /**
   * Get the module type of this import target.
   */
  public getModuleType(): ModuleType | null {
    if (this.filePath === null) {
      return null;
    }
    if (this.moduleType === null) {
      this.moduleType = { value: detectModuleType(this.filePath) };
    }
    return this.moduleType.value;
  }
}

/**
 * What type of source is this
 */
function getTargetSourceType({ name }: { name: string }): TargetSourceType {
  if (/^\.{1,2}(?:[/\\]|$)/.test(name)) {
    return "relative";
  }

  if (/^[/\\]/.test(name)) {
    return "absolute";
  }

  if (isBuiltin(name)) {
    return "node";
  }

  if (/^(?:@[\w\-~][\w\-.~]*\/)?[\w\-~][\w\-.~]*/.test(name)) {
    return "npm";
  }

  if (/^https?:\/\//.test(name)) {
    return "http";
  }

  return "unknown";
}

/**
 * What module import style is used
 */
function getModuleStyle({
  source,
  fallback,
}: {
  source: TSESTree.Expression;
  fallback: TargetModuleStyle;
}): TargetModuleStyle {
  let node: TSESTree.Node = source;

  do {
    if (node.parent == null) {
      break;
    }

    // `const {} = require('')`
    if (
      node.parent.type === "CallExpression" &&
      node.parent.callee.type === "Identifier" &&
      node.parent.callee.name === "require"
    ) {
      return "require";
    }

    // `import {} from '';`
    if (node.parent.type === "ImportDeclaration") {
      // `import type {} from '';`
      return "importKind" in node.parent && node.parent.importKind === "type"
        ? "type"
        : "import";
    }

    node = node.parent;
  } while (node.parent);

  return fallback;
}

/**
 * Get the node or npm module name
 */
function getModuleName({
  sourceType,
  name,
}: {
  sourceType: TargetSourceType;
  name: string;
}): string | null {
  if (sourceType === "relative") return null;

  if (sourceType === "npm") {
    if (name.startsWith("@")) {
      return trimAfter(name, "/", 2);
    }

    return trimAfter(name, "/");
  }

  if (sourceType === "node") {
    if (name.startsWith("node:")) {
      return trimAfter(name.slice(5), "/");
    }

    return trimAfter(name, "/");
  }

  return null;
}

/**
 * Resolve the given id to file paths.
 * @returns The resolved path.
 */
function resolveFilePath({
  name,
  sourceType,
  moduleStyle,
  options,
  context,
}: {
  name: string;
  sourceType: TargetSourceType;
  moduleStyle: TargetModuleStyle;
  options: Options;
  context: Rule.RuleContext;
}): {
  filePath: string | null;
  resolverConfig: ResolveOptionsOptionalFS;
  resolveError?: string | null;
} {
  const basedir = path.dirname(path.resolve(context.physicalFilename));

  const conditionNamesPrimary: string[] = ["node"];

  const mainFields: string[] = [];
  const mainFiles: string[] = [];

  switch (moduleStyle) {
    case "import": {
      conditionNamesPrimary.push("import");
      break;
    }
    case "type": {
      conditionNamesPrimary.push("types", "import", "require");
      break;
    }
    case "require": {
      conditionNamesPrimary.push("require");
      break;
    }
  }

  if (
    moduleStyle === "require" ||
    sourceType === "npm" ||
    sourceType === "node"
  ) {
    mainFields.push("main");
    mainFiles.push("index");
  }

  const baseResolverConfig: ResolveOptionsOptionalFS = {
    mainFields,
    mainFiles,
    fallback: isBuiltin(name) ? [{ name, alias: false }] : [],
  };

  if (options.extensions) {
    baseResolverConfig.extensions = options.extensions;
  }

  if (isTypescript(context)) {
    baseResolverConfig.alias = getTSConfigAliases(context);
    baseResolverConfig.extensionAlias = options.typescriptExtensionMap.backward;
  }

  Object.assign(baseResolverConfig, options.resolverConfig);
  const resolverConfigPrimary = {
    ...baseResolverConfig,
    conditionNames: conditionNamesPrimary,
  };
  const resolverConfigSecondary = {
    ...baseResolverConfig,
    conditionNames: options.resolverConfig?.conditionNames ?? [
      "node",
      "import",
      "require",
      "types",
    ],
  };

  const importResolverPrimary = resolver.create.sync(resolverConfigPrimary);
  const importResolverSecondary = resolver.create.sync(resolverConfigSecondary);

  const cwd =
    typeof context.settings?.cwd === "string"
      ? context.settings?.cwd
      : context.cwd;

  let resolveError: string | null = null;
  for (const directory of iteratePaths()) {
    const baseDir = path.resolve(cwd, directory);

    for (const [importResolver, resolverConfig] of [
      [importResolverPrimary, resolverConfigPrimary],
      [importResolverSecondary, resolverConfigSecondary],
    ] as const) {
      try {
        const resolved = importResolver(baseDir, name);
        if (typeof resolved === "string") {
          return {
            filePath: resolved,
            resolverConfig,
          };
        }
      } catch (error) {
        if (error instanceof Error === false) {
          throw error;
        }

        resolveError = error.message;
      }
    }
  }

  if (sourceType === "absolute" || sourceType === "relative") {
    return {
      filePath: path.resolve(basedir, name),
      resolverConfig: resolverConfigSecondary,
      resolveError,
    };
  }

  return {
    filePath: null,
    resolveError,
    resolverConfig: resolverConfigSecondary,
  };

  /**
   * Get the paths to resolve modules.
   */
  function* iteratePaths() {
    if (Array.isArray(options.paths)) {
      yield* options.paths;
    }

    yield basedir;
  }
}
