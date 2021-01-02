module.exports = {
    globals: {
        "ts-jest": {
            isolatedModules: true
        }
    },
    //用作Jest配置基础的预设。预设应指向根目录为jest-preset.json或jest-preset.js文件的npm模块。
    preset: 'ts-jest/presets/js-with-ts',
    //测试环境
    testEnvironment: 'jsdom',
    // testRegex: 'packages/core/__tests__/.*\\.(test|spec)?\\.(ts|tsx)$',
    testMatch: [
        // '/packages/core/__tests__/.*\\.(test|spec)?\\.(ts|tsx)$',
        // "**/__tests__/**/*.[jt]s?(x)",
        "**/packages/*/__tests__/**/?(*.)+(spec|test).[jt]s?(x)"
    ],
    //启动入口
    setupFiles: [
        // './tests/init.ts'
    ],
    //覆盖率报告输出文件夹
    coverageDirectory: './__tests__/report/',
    //设置全局变量
    // globals: {
    //   CC_DEV: true,
    //   CC_TEST: true,
    //   CC_PHYSICS_BUILTIN: true,
    //   'ts-jest': {
    //       diagnostics: false
    //   }
    // }

    testPathIgnorePatterns: [
        "/(node_modules|lib|coverage|types|jestTest)/"
    ]
};