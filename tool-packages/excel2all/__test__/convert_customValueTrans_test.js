const path = require("path")
/**
 * @type {typeof import("../src")}
 */
const excel2all = require("../dist/cjs/lib/index.js")
const tableFileDir = path.join(process.cwd(), "__test__/test-excel-files");
/**
 * @type {ITableConvertConfig}
 */
const convertConfig = {
    customValueTransFuncMap: {
        'nums': function (field, cellValue) {
            /**
             * @type {ITransValueResult}
             */
            const transResult = {};
            if (cellValue && typeof cellValue === "string") {
                cellValue = (cellValue + "").replace(/，/g, ","); //为了防止策划误填，先进行转换
                /**
                 * @type {string[]}
                 */
                const numStrs = cellValue.split(",");
                const nums = numStrs.map((value) => { return Number(value) })
                transResult.value = nums;
            } else {
                transResult.error = `类型:nums,所配配置的值无法解析:${cellValue}`;
                transResult.value = cellValue;
            }
            return transResult;
        }
    },
    projRoot: "./__test__",
    tableFileDir: tableFileDir,
    useCache: false
};
/**
 * @type {IOutputConfig}
 */
const outputConfig = {
    /**自定义 配置字段类型和ts声明类型字符串映射字典 */
    customTypeStrMap: { "nums": "number[]" },
    /**单个配置表json输出目录路径 */
    clientSingleTableJsonDir: path.join(process.cwd(), "__test__/test-export/export-jsons"),
    /**合并配置表json文件路径(包含文件名,比如 ./out/bundle.json) */
    clientBundleJsonOutPath: path.join(process.cwd(), "__test__/test-export/tbundle.json"),

    /**声明文件输出目录(每个配置表一个声明)，默认不输出 */
    clientDtsOutDir: path.join(process.cwd(), "__test__/test-export/dts"),

    /**是否格式化合并后的json，默认不 */
    // isFormatBundleJson: false,
    /**是否合并所有声明为一个文件,默认true */
    isBundleDts: true,
    // bundleDtsFileName:"myTableDTS",
    /**是否将json格式压缩,默认否,减少json字段名字符,效果较小 */
    isCompress: false,
    /**是否Zip压缩,使用zlib */
    // isZip: false
};
convertConfig.outputConfig = outputConfig;

excel2all.convert(convertConfig);
