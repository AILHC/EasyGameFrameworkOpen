import { generate } from "../src";
import * as path from "path";
import { Trans2JsonAndDtsHandler } from "../src/default-trans2file-handler";
// import * as mm from "micromatch";
// console.log(mm.any("foo.js",["*.js","!foo.js"]));
// console.log(mm.)
const tableFileDir = path.join(process.cwd(), "test-excel-files");
const parseConfig: ITableParseConfig = {
    tableFileDir: tableFileDir,
    useCache: false,
    useMultiThread: true,
    threadParseFileMaxNum: 10, //多线程比单线程快一点
    cacheFileDirPath: "../test-export/.cache"
};
const outputConfig: IOutputConfig = {
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
const trans2fileHandler = new Trans2JsonAndDtsHandler();
trans2fileHandler.init(outputConfig);
generate(parseConfig, trans2fileHandler);
