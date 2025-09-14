// eslint.config.mjs  (ESLint v9 Flat Config)
// "최소 스트레스" 설정: 에러 폭탄 줄이고, 유용한 규칙만 유지
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // 무시할 경로(빌드 산출물/의존성)
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "*.config.*", // 빌드 설정 파일은 보통 제외
    ],
  },

  // 기본 추천 + TS + React
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"], // React 17+: React import 없이 JSX 가능

  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: "detect" } },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      // 🔕 폭탄 줄이기(스타일/과한 제약 완화)
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // 필요 시 꺼두면 편한 것들 (원하면 풀어도 됨)
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-unused-expressions": "warn",
    },
  },
];
