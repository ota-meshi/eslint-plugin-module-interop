/**
 * This file was taken from eslint-plugin-n.
 */
/**
 * Strips the import path parameters from a path.
 */
export function stripImportPathParams(path: string): string {
  const pathString = String(path);
  const index = pathString.indexOf("!");

  if (index === -1) {
    return pathString;
  }

  return pathString.slice(0, index);
}
