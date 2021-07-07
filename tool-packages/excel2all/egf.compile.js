/**
 * @type {import("@ailhc/egf-cli").IEgfCompileOption}
 */
const config = {
    dtsGenExclude: [
        "__test__/**/*"
    ],
    externalTag: [
        "fast-glob",
        "fs-extra",
        "zlib",
        "crypto",
        "xlsx"]
}
module.exports = config;