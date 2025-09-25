/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    // tsconfig 기반 규칙이 필요하면 아래 주석 해제
    // project: ['./tsconfig.json'],
  },
  settings: {
    react: { version: 'detect' },
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    /* React + TS에서 불필요/시대 지난 규칙 끄기 */
    'react/react-in-jsx-scope': 'off',          // React 17+ 새 JSX 트랜스폼
    'react/prop-types': 'off',                   // TypeScript 사용 시 불필요
    'react/jsx-uses-react': 'off',               // 새 JSX 트랜스폼

    /* hooks */
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    /* 사용 안 하는 변수: _로 시작하면 허용 */
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    }],

    /* any 엄격도 완화 (지금은 개발 편의 우선) */
    '@typescript-eslint/no-explicit-any': 'warn',

    /* 필요 시 추가 완화 */
    // '@typescript-eslint/ban-ts-comment': 'off',
  },
  overrides: [
    {
      files: ['*.js', '*.cjs'],
      rules: {
        // JS 파일에서는 TS용 규칙 약화
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
