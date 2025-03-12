/**
 * This file was taken from eslint-plugin-n.
 */
import fs from "node:fs";
import path from "node:path";
import type { JsonObject } from "type-fest";

export type PackageJson = JsonObject & { filePath: string };

type CacheEntry<T> = { value: T | null; expire: number };

class Cache<T> {
  private readonly map: Map<string, CacheEntry<T>> = new Map();

  /**
   * Get the cached entry of the given key.
   * @param key The key to get.
   * @returns The cached entry or null.
   */
  public getEntry(key: string): CacheEntry<T> | null {
    const entry = this.map.get(key);
    const now = Date.now();

    if (entry) {
      if (entry.expire > now) {
        entry.expire = now + 5000;
        return entry;
      }
      this.map.delete(key);
    }
    return null;
  }

  /**
   * Set the value of the given key.
   * @param key The key to set.
   * @param value The value to set.
   */
  public set(key: string, value: T | null) {
    this.map.set(key, { value, expire: Date.now() + 5000 });
  }
}
const cache = new Cache<PackageJson>();

/**
 * Reads the `package.json` data in a given path.
 *
 * Don't cache the data.
 *
 * @param dir - The path to a directory to read.
 * @returns The read `package.json` data, or null.
 */
function readPackageJson(dir: string): PackageJson | null {
  const filePath = path.join(dir, "package.json");
  try {
    const text = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(text);

    if (
      data != null &&
      typeof data === "object" &&
      Array.isArray(data) === false
    ) {
      data.filePath = filePath;
      return data;
    }
  } catch {
    // do nothing.
  }

  return null;
}

/**
 * Gets a `package.json` data.
 * The data is cached if found, then it's used after.
 *
 * @param startPath - A file path to lookup.
 * @returns A found `package.json` data or `null`.
 *      This object have additional property `filePath`.
 */
export function getPackageJson(startPath = "a.js"): PackageJson | null {
  const startDir = path.dirname(path.resolve(startPath));
  return find(startDir);

  /**
   * Finds the `package.json` from a given directory path.
   */
  function find(dir: string): PackageJson | null {
    const data = cache.getEntry(dir);
    if (data) {
      if (dir !== startDir) {
        cache.set(startDir, data.value);
      }
      return data.value;
    }

    const pkg = readPackageJson(dir);
    if (pkg) {
      cache.set(dir, pkg);
      cache.set(startDir, pkg);
      return pkg;
    }

    const parentDir = path.resolve(dir, "..");
    if (parentDir !== dir) {
      return find(parentDir);
    }
    cache.set(startDir, null);

    return null;
  }
}
