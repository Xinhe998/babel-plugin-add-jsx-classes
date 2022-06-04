module.exports =  {
  plugins: ["@typescript-eslint"],
  parser:  "@typescript-eslint/parser",
  extends:  [
      "plugin:@typescript-eslint/recommended",
  ],
  parserOptions:  {
      ecmaVersion:  2019,
      sourceType:  'module',
  },
  rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/no-parameter-properties": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-explicit-any": "off",
  },
};
