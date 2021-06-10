/**
 * @type {import("@ailhc/egf-cli").IEgfCompileOption}
 */
const config = {
    entry: "src/index.ts",
    "dtsGenExclude": [
        "__tests__/**/*"
    ],
    "externalTag": ["@ailhc"],

}
module.exports = config;