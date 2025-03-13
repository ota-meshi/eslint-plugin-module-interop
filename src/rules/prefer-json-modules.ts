import type { TSESTree } from "@typescript-eslint/types";
import { compositingVisitors, createRule } from "../utils/index.js";
import type { ImportTarget } from "../utils/node/import-target.js";
import {
  defineDynamicImportVisitor,
  defineImportStatementVisitor,
} from "../utils/node/import-visitor.js";
import { getStaticValue } from "@eslint-community/eslint-utils";
import type { Rule } from "eslint";

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
      addTypeJsonAttribute: 'Add `{type: "json"}` attribute to import.',
    },
    type: "suggestion",
  },
  create(context) {
    const sourceCode = context.sourceCode;
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
          suggest: [
            {
              messageId: "addTypeJsonAttribute",
              fix: (fixer) => {
                const afterSource = sourceCode.getTokenAfter(target.source);
                if (
                  !afterSource ||
                  afterSource.value === ";" ||
                  node.range[1] <= afterSource.range[0]
                ) {
                  return fixer.insertTextAfter(
                    target.source,
                    ' with {type: "json"}',
                  );
                }
                if (afterSource.value !== "with") return null; // unknown syntax
                const afterWith = sourceCode.getTokenAfter(afterSource);
                if (!afterWith || afterWith.value !== "{") return null; // unknown syntax
                return fixer.insertTextAfter(afterWith, 'type: "json"');
              },
            },
          ],
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
        suggest: !typeAttribute
          ? [
              {
                messageId: "addTypeJsonAttribute",
                fix: (fixer: Rule.RuleFixer) =>
                  fixer.insertTextAfter(
                    node.attributes[node.attributes.length - 1],
                    ', type: "json"',
                  ),
              },
            ]
          : [],
      });
    }

    /**
     * Verifies the JSON module for the import expression.
     */
    function verifyJsonModuleForImportExpression(
      target: ImportTarget<TSESTree.ImportExpression>,
    ) {
      const node = target.node;
      const options = node.options;
      if (!options) {
        context.report({
          node: target.source,
          messageId: "expectedOptionForImportExpression",
          suggest: [
            {
              messageId: "addTypeJsonAttribute",
              fix: (fixer) =>
                fixer.insertTextAfter(
                  target.source,
                  ', {with: {type: "json"}}',
                ),
            },
          ],
        });
        return;
      }
      if (
        options.type !== "ObjectExpression" ||
        !options.properties.every((property) => property.type === "Property")
      )
        return;

      const withProperty = options.properties.find(
        (property): property is TSESTree.Property =>
          property.type === "Property" &&
          property.key.type === "Identifier" &&
          property.key.name === "with",
      );
      if (!withProperty) {
        context.report({
          node: options,
          messageId: "expectedWithPropertyForImportExpression",
          suggest: [
            {
              messageId: "addTypeJsonAttribute",
              fix: (fixer) =>
                options.properties.length
                  ? fixer.insertTextAfter(
                      options.properties[options.properties.length - 1],
                      ', with: {type: "json"}',
                    )
                  : fixer.insertTextAfter(
                      sourceCode.getFirstToken(options)!,
                      'with: {type: "json"}',
                    ),
            },
          ],
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

      const withObject = withProperty.value;
      const typeProperty = withObject.properties.find(
        (property): property is TSESTree.Property =>
          property.type === "Property" &&
          property.key.type === "Identifier" &&
          property.key.name === "type",
      );
      if (!typeProperty) {
        context.report({
          node: withObject,
          messageId: "expectedTypeJsonAttribute",
          suggest: [
            {
              messageId: "addTypeJsonAttribute",
              fix: (fixer) =>
                withObject.properties.length
                  ? fixer.insertTextAfter(
                      withObject.properties[withObject.properties.length - 1],
                      ', type: "json"',
                    )
                  : fixer.insertTextAfter(
                      sourceCode.getFirstToken(withObject)!,
                      'type: "json"',
                    ),
            },
          ],
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
