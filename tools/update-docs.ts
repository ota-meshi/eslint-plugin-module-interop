import path from "path";
import fs from "fs";
import { rules } from "./lib/load-rules.js";
import type { RuleModule } from "../src/types.js";
import { getNewVersion } from "./lib/changesets-util.js";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

//eslint-disable-next-line jsdoc/require-jsdoc -- tools
function formatItems(items: string[]) {
  if (items.length <= 2) {
    return items.join(" and ");
  }
  return `all of ${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

//eslint-disable-next-line jsdoc/require-jsdoc -- tools
function yamlValue(val: unknown) {
  if (typeof val === "string") {
    return `"${val.replace(/\\/gu, "\\\\").replace(/"/gu, '\\"')}"`;
  }
  return val;
}

const ROOT = path.resolve(dirname, "../docs/rules");

//eslint-disable-next-line jsdoc/require-jsdoc -- tools
function pickSince(content: string): string | null | Promise<string> {
  const fileIntro = /^---\n((?:.*\n)+)---\n*/.exec(content);
  if (fileIntro) {
    const since = /since: "?(v\d+\.\d+\.\d+)"?/.exec(fileIntro[1]);
    if (since) {
      return since[1];
    }
  }
  // eslint-disable-next-line no-process-env -- ignore
  if (process.env.IN_VERSION_SCRIPT) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports -- ignore
    return `v${require("../package.json").version}`;
  }
  // eslint-disable-next-line no-process-env -- ignore
  if (process.env.IN_VERSION_CI_SCRIPT) {
    return getNewVersion().then((v) => `v${v}`);
  }
  return null;
}

class DocFile {
  private readonly rule: RuleModule;

  private readonly filePath: string;

  private content: string;

  private readonly since: string | null | Promise<string>;

  public constructor(rule: RuleModule) {
    this.rule = rule;
    this.filePath = path.join(ROOT, `${rule.meta.docs.ruleName}.md`);
    this.content = fs.readFileSync(this.filePath, "utf8");
    this.since = pickSince(this.content);
  }

  public static read(rule: RuleModule) {
    return new DocFile(rule);
  }

  public updateHeader() {
    const {
      meta: {
        fixable,
        hasSuggestions,
        deprecated,
        replacedBy,
        docs: { ruleId, description, categories },
      },
    } = this.rule;
    const title = `# ${ruleId}\n\n> ${description}`;
    const notes = [];

    if (deprecated) {
      if (replacedBy) {
        const replacedRules = replacedBy.map(
          (name) => `[module-interop/${name}](${name}.md) rule`,
        );
        notes.push(
          `- ⚠️ This rule was **deprecated** and replaced by ${formatItems(
            replacedRules,
          )}.`,
        );
      } else {
        notes.push("- ⚠️ This rule was **deprecated**.");
      }
    } else if (categories && categories.length) {
      const presets = [];
      for (const cat of categories.sort()) {
        presets.push(`\`plugin.configs.${cat}\``);
      }
      notes.push(`- ⚙️ This rule is included in ${formatItems(presets)}.`);
    }
    if (fixable) {
      notes.push(
        "- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.",
      );
    }
    if (hasSuggestions) {
      notes.push(
        "- 💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).",
      );
    }
    if (!this.since) {
      notes.unshift(
        `- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>`,
      );
    }

    // Add an empty line after notes.
    if (notes.length >= 1) {
      notes.push("", "");
    }

    const headerPattern = /(?:^|\n)#.+\n+[^\n]*\n+(?:- .+\n+)*\n*/u;

    const header = `\n${title}\n\n${notes.join("\n")}`;
    if (headerPattern.test(this.content)) {
      this.content = this.content.replace(
        headerPattern,
        header.replace(/\$/g, "$$$$"),
      );
    } else {
      this.content = `${header}${this.content.trim()}\n`;
    }

    return this;
  }

  public async updateFooter() {
    const { ruleName } = this.rule.meta.docs;
    const footerPattern = /## (?:(?:🔍)? ?Implementation|🚀 Version).+$/s;
    const footer = `${
      this.since
        ? `## 🚀 Version

This rule was introduced in eslint-plugin-module-interop ${await this.since}

`
        : ""
    }## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/src/rules/${ruleName}.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-module-interop/blob/main/tests/src/rules/${ruleName}.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-module-interop/tree/main/tests/fixtures/rules/${ruleName})
`;
    if (footerPattern.test(this.content)) {
      this.content = this.content.replace(
        footerPattern,
        footer.replace(/\$/g, "$$$$"),
      );
    } else {
      this.content = `${this.content.trim()}\n\n${footer}`;
    }

    return this;
  }

  public updateCodeBlocks() {
    const { meta } = this.rule;

    this.content = this.content.replace(
      /<eslint-code-block(.*?)>/gu,
      (_t, str) => {
        const ps = str
          .split(/\s+/u)
          .map((s: string) => s.trim())
          .filter((s: string) => s && s !== "fix");
        if (meta.fixable) {
          ps.unshift("fix");
        }
        ps.unshift("<eslint-code-block");
        return `${ps.join(" ")}>`;
      },
    );
    return this;
  }

  public adjustCodeBlocks() {
    // Adjust the necessary blank lines before and after the code block so that GitHub can recognize `.md`.
    this.content = this.content.replace(
      /(<eslint-code-block[\s\S]*?>)\n+```/gu,
      "$1\n\n```",
    );
    this.content = this.content.replace(
      /```\n+<\/eslint-code-block>/gu,
      "```\n\n</eslint-code-block>",
    );
    return this;
  }

  public async updateFileIntro() {
    const { ruleId, description } = this.rule.meta.docs;

    const fileIntro = {
      pageClass: "rule-details",
      sidebarDepth: 0,
      title: ruleId,
      description,
      ...(this.since ? { since: await this.since } : {}),
    };
    const computed = `---\n${Object.keys(fileIntro)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tool
      .map((key) => `${key}: ${yamlValue((fileIntro as any)[key])}`)
      .join("\n")}\n---\n\n`;

    const fileIntroPattern = /^---\n(?:.*\n)+?---\n*/gu;

    if (fileIntroPattern.test(this.content)) {
      this.content = this.content.replace(
        fileIntroPattern,
        computed.replace(/\$/g, "$$$$"),
      );
    } else {
      this.content = `${computed}${this.content.trim()}\n`;
    }

    return this;
  }

  public write() {
    this.content = this.content.replace(/\r?\n/gu, "\n");

    fs.writeFileSync(this.filePath, this.content);
  }
}

void main();

/** main */
async function main() {
  for (const rule of rules) {
    const doc = DocFile.read(rule);
    doc.updateHeader();
    await doc.updateFooter();
    doc.updateCodeBlocks();
    await doc.updateFileIntro();
    doc.adjustCodeBlocks();
    doc.write();
  }
}
