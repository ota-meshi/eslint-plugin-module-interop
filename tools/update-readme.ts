import path from "path";
import fs from "fs";
import os from "os";
import renderRulesTableContent from "./render-rules.js";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const isWin = os.platform().startsWith("win");

let insertText = `\n${renderRulesTableContent(
  2,
  (name) =>
    `https://ota-meshi.github.io/eslint-plugin-module-interop/rules/${name}.html`,
)}\n`;
if (isWin) {
  insertText = insertText
    .replace(/\r?\n/gu, "\n")
    .replace(/\r/gu, "\n")
    .replace(/\n/gu, "\r\n");
}

const readmeFilePath = path.resolve(dirname, "../README.md");
const newReadme = fs
  .readFileSync(readmeFilePath, "utf8")
  .replace(
    /<!--RULES_TABLE_START-->[\s\S]*<!--RULES_TABLE_END-->/u,
    `<!--RULES_TABLE_START-->${insertText}<!--RULES_TABLE_END-->`,
  );
fs.writeFileSync(readmeFilePath, newReadme, "utf8");

const docsReadmeFilePath = path.resolve(dirname, "../docs/index.md");

fs.writeFileSync(
  docsReadmeFilePath,
  newReadme
    .replace("# eslint-plugin-module-interop\n", "# Introduction\n")
    .replace(
      /<!--RULES_SECTION_START-->[\s\S]*<!--RULES_SECTION_END-->/u,
      "See [Available Rules](./rules/index.md).",
    )
    .replace(
      /<!--USAGE_SECTION_START-->[\s\S]*<!--USAGE_SECTION_END-->/u,
      "See [User Guide](./user-guide/index.md).",
    )
    .replace(
      /\[LICENSE\]\(LICENSE\)/gu,
      "[LICENSE](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/LICENSE)",
    )
    .replace(/<!--DOCS_IGNORE_START-->[\s\S]*?<!--DOCS_IGNORE_END-->/gu, "")
    .replace(
      /\(https:\/\/ota-meshi.github.io\/eslint-plugin-module-interop/gu,
      "(.",
    )
    .replace(/\n{3,}/gu, "\n\n"),
  "utf8",
);

const docsUserGuideFilePath = path.resolve(
  dirname,
  "../docs/user-guide/index.md",
);
const docsUserGuide = fs.readFileSync(docsUserGuideFilePath, "utf8");

fs.writeFileSync(
  docsUserGuideFilePath,
  docsUserGuide
    .replace(
      /<!--USAGE_GUIDE_START-->[\s\S]*<!--USAGE_GUIDE_END-->/u,
      /<!--USAGE_GUIDE_START-->[\s\S]*<!--USAGE_GUIDE_END-->/u.exec(
        newReadme,
      )![0],
    )
    .replace(
      /\(https:\/\/ota-meshi.github.io\/eslint-plugin-module-interop(.*?)\)/gu,
      (_s, c: string) => `(..${c.endsWith("/") ? `${c}index.md` : c})`,
    ),
  "utf8",
);
