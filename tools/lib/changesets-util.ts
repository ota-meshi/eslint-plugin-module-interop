import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Get new version string from changesets */
export async function getNewVersion(): Promise<string> {
  const { getReleasePlan } = await import("@changesets/get-release-plan");
  const releasePlan = await getReleasePlan(path.resolve(dirname, "../.."));

  const release = releasePlan.releases.find(
    ({ name }) => name === "eslint-plugin-module-interop",
  );
  if (!release || release.type === "none") {
    throw new Error("Could not find a versioned release.");
  }
  return release.newVersion;
}
