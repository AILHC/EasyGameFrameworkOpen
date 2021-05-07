const path = require("path")
const excel2all = require("@ailhc/excel2all")
// import * as mm from "micromatch";
// console.log(mm.any("foo.js",["*.js","!foo.js"]));
// console.log(mm.)
const tableFileDir = path.join(process.cwd(), "test-excel-files");
/**
 * @type {ITableConvertConfig}
 */
const convertConfig = {
    tableFileDir: tableFileDir,
    useCache: false,
    useMultiThread: false,
    threadParseFileMaxNum: 2, //多线程比单线程快一点
    cacheFileDirPath: "./test-export/.cache",
    // customParseHandlerPath: path.join(process.cwd(), "./__test__/testCustomParseHandler.js")
    customOutPutTransformerPath: path.join(process.cwd(), "./__test__/testCustomTransformer.js")
};
/**
 * @type {IOutputConfig}
 */
const outputConfig = {
    clientBundleJsonOutPath: path.join(process.cwd(), "test-export/tbundle.json"),
    clientDtsOutDir: path.join(process.cwd(), "test-export/dts"),
    clientSingleTableJsonDir: path.join(process.cwd(), "test-export/jsons"),
    isBundleDts: true,
    isCompress: false,
    bundleJsonIsEncode2Base64: false,
    preBase64UglyString: "jsjf323fasdffasd00fsdajfkdfaiower+dfjas+=fsakfadfafadfasdfsdafd=fj",
    sufBase64UglyString: "jfdjaf12jfd34jdfa8383+/*fdsaf12389*&^$#$#)(__+_)dfasfjlsdfalfafdfadf"
    // isZip: true
};
convertConfig.outputConfig = outputConfig;

excel2all.convert(convertConfig);
