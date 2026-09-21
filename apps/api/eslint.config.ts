import checkFile from "eslint-plugin-check-file";
import nodePlugin from "eslint-plugin-n";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

import js from "@eslint/js";
import stylisticPlugin from "@stylistic/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        projectService: true,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    plugins: {
      "simple-import-sort": simpleImportSort,
      "check-file": checkFile,
      "@stylistic": stylisticPlugin,
      node: nodePlugin,
    },
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "sort-imports": "off",
      "import/order": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^react", "^@?\\w", "^\\p{L}*\\/.*"], // External libraries (react first, then other external)
            ["^@.*", "^@.*/.*"], // Internal shared libs (@libs/...)
            ["^\\$.*$"], // Absolute imports ($src/...)
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"], // Parent relative imports
            ["^\\.\\../\\.\\./.+", "^\\.\\./.+", "^\\.\\/.+"], // Sibling relative imports
            ["^./styles$"], // Style imports
          ],
        },
      ],
      "simple-import-sort/exports": "error", // Also sort exports
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx}": "KEBAB_CASE",
          "*.{ts,tsx}": "KEBAB_CASE",
        },
        {
          // ignore the middle extensions of the filename to support filename like auth.controller.ts
          ignoreMiddleExtensions: true,
        },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/**/!(__tests__)": "KEBAB_CASE",
        },
      ],
    },
  },
  {
    ignores: ["**/dist/*"],
  },
  {
    rules: {
      /** Prefer Array<T> format */
      "@typescript-eslint/array-type": [
        "error",
        { default: "generic", readonly: "generic" },
      ],

      /** Prevent @ts-ignore, allow @ts-expect-error */
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": false,
          "ts-ignore": "allow-with-description",
        },
      ],

      /** Enforce import type { T } */
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],

      /** Shorthand method style is less strict */
      "@typescript-eslint/method-signature-style": ["error", "property"],

      /** Enforces generic type convention */
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "typeParameter",
          format: ["PascalCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
          custom: {
            regex: "^(T|T[A-Z][A-Za-z]+)$",
            match: true,
          },
        },
      ],

      /** Duplicate values can lead to bugs that are hard to track down */
      "@typescript-eslint/no-duplicate-enum-values": "error",

      /** Using the operator any more than once does nothing */
      "@typescript-eslint/no-extra-non-null-assertion": "error",

      /** There are several potential bugs with this compared to other loops */
      "@typescript-eslint/no-for-in-array": "error",

      /** Don't over-define types for simple things like strings */
      "@typescript-eslint/no-inferrable-types": [
        "error",
        { ignoreParameters: true },
      ],

      /** Enforce valid definition of new and constructor */
      "@typescript-eslint/no-misused-new": "error",

      /** Disallow TypeScript namespaces */
      "@typescript-eslint/no-namespace": "error",

      /** Disallow non-null assertions after an optional chain expression */
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error",

      /** Detects conditionals which will always evaluate truthy or falsy */
      "@typescript-eslint/no-unnecessary-condition": "error",

      /** Checks if the the explicit type is identical to the inferred type */
      "@typescript-eslint/no-unnecessary-type-assertion": "error",

      /** Disallow using the unsafe built-in Function type */
      "@typescript-eslint/no-unsafe-function-type": "error",

      /** Disallow using confusing built-in primitive class wrappers */
      "@typescript-eslint/no-wrapper-object-types": "error",

      /** Enforce the use of as const over literal type */
      "@typescript-eslint/prefer-as-const": "error",

      /** Prefer for-of loop over the standard for loop */
      "@typescript-eslint/prefer-for-of": "warn",

      /** Warn about async functions which have no await expression */
      "require-await": "off",
      "@typescript-eslint/require-await": "warn",

      /** Prefer of ES6-style import declarations */
      "@typescript-eslint/triple-slash-reference": "error",

      /** Enforce consistency of spacing after the start of a comment */
      "@stylistic/spaced-comment": "error",

      /** Enforce usage of the `node:` prefix for builtin imports */
      "node/prefer-node-protocol": "error",
    },
  },
]);
