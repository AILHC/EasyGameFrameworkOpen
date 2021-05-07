/**
 * @type {IEgfCompileOption}
 */
const config = {
    dtsGenExclude: [
        "__test__/**/*"
    ],
    externalTag: [
        "fs-extra",
        "micromatch",
        "zlib",
        "crypto",
        "xlsx"]
}
module.exports = config;