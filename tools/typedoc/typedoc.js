
module.exports = {
  name: "EasyGameFramework",
  mode: "modules",
  target: "ES6",
  out: `docs/api`,
  ignoreCompilerErrors: true,
  preserveConstEnums: true,
  // theme: "default",
  theme: "./tools/typedoc/typedoc-theme/bin/default",
  stripInternal: true,
  readme: "./README.md",
  tsconfig: "../tsconfig.test.json",
  excludeProtected: true,
  "external-modulemap": "packages/([\\w\\-_]+)/",
  exclude: [
    "**/__tests__/*",
    "**/others/**/*",
    "**/examples/**/*",
    "**/dist/**/*",
    // "**/+(dev-packages|examples|typings)/**/*",
    // "**/*test.ts",
    // "packages/adapter-miniprogram/**/*",
    // "packages/component-miniprogram/**/*",
    // "packages/**/src/global.d.ts",
    // "packages/**/shaderLib/global.d.ts",
    // "scripts/**/*"
  ],
  plugin: ["@strictsoftware/typedoc-plugin-monorepo", 'typedoc-plugin-remove-references']
};