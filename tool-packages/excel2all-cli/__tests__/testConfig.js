const path = require("path")
/**
 * @type {import("@ailhc/excel2all").Interfaces}
 */
/**
 * @type {IOutputConfig}
 */
const outConfig = {
    /**单个配置表json输出目录路径 */
    clientSingleTableJsonDir: "test-export/export-jsons",
    /**合并配置表json文件路径(包含文件名,比如 ./out/bundle.json) */
    clientBundleJsonOutPath: "test-export/tbundle.json",

    /**声明文件输出目录(每个配置表一个声明)，默认不输出 */
    clientDtsOutDir: "test-export/dts",
    
    /**是否格式化合并后的json，默认不 */
    // isFormatBundleJson: false,
    /**是否合并所有声明为一个文件,默认true */
    isBundleDts: true,
    // bundleDtsFileName:"myTableDTS",
    /**是否将json格式压缩,默认否,减少json字段名字符,效果较小 */
    isCompress: false,
    /**是否Zip压缩,使用zlib */
    // isZip: false
}
/**
 * @type {ITableConvertConfig}
 */
const config = {
    useCache: false,
    projRoot: "./__tests__",
    outputConfig: outConfig,
    tableFileDir:"../../excel2all/__test__/test-excel-files"
}
module.exports = config;