module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-unused-vars": ["warn"],
    "no-console": ["warn", { allow: ["info", "warn", "error"] }],
    "no-unexpected-multiline": "error",
    "no-useless-escape": "warn",
    "object-curly-spacing": ["error", "always"],
    "comma-dangle": [
      "fix",
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "always-multiline",
      },
    ],
  },
  overrides: [
    {
      files: ["tests/**/*.js", "**/*.test.js"],
      env: {
        jest: true,
      },
      rules: {
        "no-undef": "off",
      },
    },
  ],
};
