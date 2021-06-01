/**
 * @type {import("@ailhc/egf-cli").IEgfCompileOption}
 */
const config = {
    "dtsGenExclude": [
        "__tests__/**/*",
        "libs/**/*"
    ],
    "externalTag": ["cc"]
}
module.exports = config;