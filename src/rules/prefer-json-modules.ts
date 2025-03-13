import type { TSESTree } from "@typescript-eslint/types";
import { compositingVisitors, createRule } from "../utils/index.js";
import type { ImportTarget } from "../utils/node/import-target.js";
import {
  defineDynamicImportVisitor,
  defineImportStatementVisitor,
} from "../utils/node/import-visitor.js";
import { getStaticValue } from "@eslint-community/eslint-utils";

export default createRule("prefer-json-modules", {
  meta: {
    docs: {
      description:
        'enforce json imports to have the `{type: "json"}` attribute.',
      categories: ["recommended"],
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      expectedOptionForImportExpression:
        '`{with: {type: "json"}}` option is required for `*.json` import.',
      expectedWithPropertyForImportExpression:
        '`{with: {type: "json"}}` is required for `*.json` import.',
      expectedOptionForImportDeclaration:
        '`with {type: "json"}` is required for `*.json` import.',
      expectedTypeJsonAttribute:
        '`{type: "json"}` is required for `*.json` import.',
    },
    type: "suggestion",
  },
  create(context) {
    return compositingVisitors(
      defineImportStatementVisitor(context, {}, check),
      defineDynamicImportVisitor(context, {}, check),
    );

    /**
     * Checks for the import targets.
     */
    function check(
      targets: (
        | ImportTarget<
            | TSESTree.ExportAllDeclaration
            | TSESTree.ExportNamedDeclaration
            | TSESTree.ImportDeclaration
          >
        | ImportTarget<TSESTree.ImportExpression>
      )[],
    ) {
      for (const target of targets) {
        const type = target.getModuleType();
        if (type !== "json") continue;
        if (isImportExpressionTarget(target)) {
          verifyJsonModuleForImportExpression(target);
        } else {
          verifyJsonModuleForImportDeclaration(target);
        }
      }
    }

    /**
     * Checks whether the target is an import expression target ro not.
     */
    function isImportExpressionTarget(
      target: ImportTarget<
        | TSESTree.ExportAllDeclaration
        | TSESTree.ExportNamedDeclaration
        | TSESTree.ImportDeclaration
        | TSESTree.ImportExpression
      >,
    ): target is ImportTarget<TSESTree.ImportExpression> {
      return target.node.type === "ImportExpression";
    }

    /**
     * Verifies the JSON module for the import declaration.
     */
    function verifyJsonModuleForImportDeclaration(
      target: ImportTarget<
        | TSESTree.ExportAllDeclaration
        | TSESTree.ExportNamedDeclaration
        | TSESTree.ImportDeclaration
      >,
    ) {
      const node = target.node;
      if (!node.attributes || node.attributes.length === 0) {
        context.report({
          node: target.source,
          messageId: "expectedOptionForImportDeclaration",
        });
        return;
      }

      const typeAttribute = node.attributes.find(
        (attribute) =>
          attribute.type === "ImportAttribute" &&
          ((attribute.key.type === "Identifier" &&
            attribute.key.name === "type") ||
            (attribute.key.type === "Literal" &&
              attribute.key.value === "type")),
      );

      if (typeAttribute && typeAttribute.value.value === "json") return;

      context.report({
        node: target.source,
        messageId: "expectedTypeJsonAttribute",
      });
    }

    /**
     * Verifies the JSON module for the import expression.
     */
    function verifyJsonModuleForImportExpression(
      target: ImportTarget<TSESTree.ImportExpression>,
    ) {
      const node = target.node;
      if (!node.options) {
        context.report({
          node: target.source,
          messageId: "expectedOptionForImportExpression",
        });
        return;
      }
      if (
        node.options.type !== "ObjectExpression" ||
        !node.options.properties.every(
          (property) => property.type === "Property",
        )
      )
        return;

      const withProperty = node.options.properties.find(
        (property): property is TSESTree.Property =>
          property.type === "Property" &&
          property.key.type === "Identifier" &&
          property.key.name === "with",
      );
      if (!withProperty) {
        context.report({
          node: node.options,
          messageId: "expectedWithPropertyForImportExpression",
        });
        return;
      }
      if (
        withProperty.value.type !== "ObjectExpression" ||
        !withProperty.value.properties.every(
          (property) => property.type === "Property",
        )
      )
        return;

      const typeProperty = withProperty.value.properties.find(
        (property): property is TSESTree.Property =>
          property.type === "Property" &&
          property.key.type === "Identifier" &&
          property.key.name === "type",
      );
      if (!typeProperty) {
        context.report({
          node: withProperty.value,
          messageId: "expectedTypeJsonAttribute",
        });
        return;
      }
      const typeValue = getStaticValue(
        typeProperty.value,
        context.sourceCode.getScope(typeProperty.value),
      );
      if (!typeValue || typeValue.value === "json") return;

      context.report({
        node: typeProperty.value,
        messageId: "expectedTypeJsonAttribute",
      });
    }
  },
});
