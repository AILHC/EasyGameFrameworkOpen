const typescript = require('rollup-plugin-typescript2');
/**
 * @type {any}
 */
const rollupCjs = require("rollup-plugin-commonjs");
/**
 * @type {any}
 */
const nodeResolve = require("rollup-plugin-node-resolve");
/**
 * @type {any}
 */
const jsonPlugin = require("@rollup/plugin-json");
const terser = require("rollup-plugin-terser");
/**
 * @type {import("rollup-plugin-terser").Options}
 */
const terserOption = {
    output: {
        ascii_only: true // 仅输出ascii字符,

    },
    compress: {
        // pure_funcs: ['console.log'] // 去掉console.log函数
    }
}
/**
 * @type {import("@ailhc/egf-cli").IEgfCompileOption}
 */
const config = {
    "dtsGenExclude": [
        "__tests__/**/*"
    ],
    "externalTag": ["@ailhc"],

    owInput: {
        input: ["./__tests__/owinput-output/src/index.ts"],

        // plugins: [
        //     // myMultiInput(),
        //     jsonPlugin(),
        //     typescript({
        //         tsconfig: "./__tests__/owinput-output/tsconfig.json"
        //     }),
        //     rollupCjs(),
        //     nodeResolve({
        //         customResolveOptions: {
        //             moduleDirectory: "node_modules"
        //         }
        //     })
        //     // rdts()
        // ]
    },
    owOutput: {
        plugins: [terser.terser(terserOption)],
        footer: "fjdsjfas"
    }
}
module.exports = config;