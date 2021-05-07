const path = require("path")
const excel2all = require("@ailhc/excel2all")
// import * as mm from "micromatch";
// console.log(mm.any("foo.js",["*.js","!foo.js"]));
// console.log(mm.)
const tableFileDir = path.join(process.cwd(), "__test__/test-excel-files");
/**
 * @type {ITableConvertConfig}
 */
const convertConfig = {
    projRoot: "./__test__",
    tableFileDir: tableFileDir,
    useCache: false,
    useMultiThread: false,
    threadParseFileMaxNum: 2, //多线程比单线程快一点
    // cacheFileDirPath: "./__test__/test-export/.cache",
    // customParseHandlerPath: path.join(process.cwd(), "./__test__/testCustomParseHandler.js")
    customOutPutTransformerPath: path.join(process.cwd(), "./__test__/testCustomTransformer.js")
};
/**
 * @type {IOutputConfig}
 */
const outputConfig = {
    /**单个配置表json输出目录路径 */
    clientSingleTableJsonDir: path.join(process.cwd(), "__test__/test-export/jsons"),
    /**合并配置表json文件路径(包含文件名,比如 ./out/bundle.json) */
    clientBundleJsonOutPath: path.join(process.cwd(), "__test__/test-export/tbundle.json"),
    /**是否生成声明文件，默认不输出 */
    isGenDts: true,
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
//特殊测试案例

//1. 使用缓存
//2. 不使用缓存
//3. 使用多线程
//4. 不使用多线程
//5. 自定义解析
//6. 自定义转换
//7. 指定缓存目录
//8. 指定日志目录
//9. 输出与不输出声明文件
//10. 自定义bundle声明文件名
