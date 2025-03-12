import type { DefaultTheme, UserConfig } from "vitepress";
import { defineConfig } from "vitepress";
import path from "path";
import { fileURLToPath } from "url";
import eslint4b from "vite-plugin-eslint4b";
import type { RuleModule } from "../../src/types.js";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { createTwoslasher as createTwoslasherESLint } from "twoslash-eslint";

const dirname = path.dirname(fileURLToPath(import.meta.url));

function ruleToSidebarItem({
  meta: {
    docs: { ruleId, ruleName },
  },
}: RuleModule): DefaultTheme.SidebarItem {
  return {
    text: ruleId,
    link: `/rules/${ruleName}`,
  };
}

export default async (): Promise<UserConfig<DefaultTheme.Config>> => {
  const { rules } = (await import("../../src/utils/rules.js")) as {
    rules: RuleModule[];
  };
  const plugin = await import("../../src/index.js").then((m) => m.default || m);
  return defineConfig({
    base: "/eslint-plugin-module-interop/",
    title: "eslint-plugin-module-interop",
    outDir: path.join(dirname, "./dist/eslint-plugin-module-interop"),
    description: "ESLint plugin with rules for module interoperability.",
    head: [],

    vite: {
      plugins: [eslint4b()],
      define: {
        "process.env.NODE_DEBUG": "false",
      },
    },
    markdown: {
      codeTransformers: [
        transformerTwoslash({
          explicitTrigger: false, // Required for v-menu to work.
          langs: ["js"],
          filter(lang, code) {
            if (!lang.startsWith("json") && lang.startsWith("js")) {
              return code.includes("eslint");
            }
            return false;
          },
          errorRendering: "hover",
          twoslasher: createTwoslasherESLint({
            eslintConfig: [
              {
                files: ["*", "**/*"],
                plugins: {
                  "module-interop": plugin,
                },
                languageOptions: {
                  globals: {
                    require: "readonly",
                  },
                },
              },
            ],
          }),
        }),
      ],
    },

    lastUpdated: true,
    themeConfig: {
      logo: "/logo.svg",
      search: {
        provider: "local",
        options: {
          detailedView: true,
        },
      },
      editLink: {
        pattern:
          "https://github.com/ota-meshi/eslint-plugin-module-interop/edit/main/docs/:path",
      },
      nav: [
        { text: "Introduction", link: "/" },
        { text: "User Guide", link: "/user-guide/" },
        { text: "Rules", link: "/rules/" },
        {
          text: "Playground",
          link: "https://eslint-online-playground.netlify.app/#eslint-plugin-module-interop",
        },
      ],
      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/ota-meshi/eslint-plugin-module-interop",
        },
      ],
      sidebar: {
        "/rules/": [
          {
            text: "Rules",
            items: [{ text: "Available Rules", link: "/rules/" }],
          },
          {
            text: "Module Interoperability Rules",
            collapsed: false,
            items: rules
              .filter((rule) => !rule.meta.deprecated)
              .map(ruleToSidebarItem),
          },

          // Rules in no category.
          ...(rules.some((rule) => rule.meta.deprecated)
            ? [
                {
                  text: "Deprecated",
                  collapsed: false,
                  items: rules
                    .filter((rule) => rule.meta.deprecated)
                    .map(ruleToSidebarItem),
                },
              ]
            : []),
        ],
        "/": [
          {
            text: "Guide",
            items: [
              { text: "Introduction", link: "/" },
              { text: "User Guide", link: "/user-guide/" },
              { text: "Rules", link: "/rules/" },
            ],
          },
        ],
      },
    },
  });
};
