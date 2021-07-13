const path = require("path")
const excel2all = require("@ailhc/excel2all")
const tableFileDir = path.join(process.cwd(), "test-excel-files");
/**
 * @type { ITableParseConfig}
 */
const convertConfig = {
    tableFileDir: tableFileDir,
    useCache: true,
    cacheFileDirPath: "./test-export/.cache",
    // customParseHandlerPath: path.join(process.cwd(), "./__test__/testCustomParseHandler.js")
};
/**
 * @type {IOutputConfig}
 */
const outputConfig = {
    clientBundleJsonOutPath: path.join(process.cwd(), "test-export/tbundle.json"),
    clientDtsOutDir: path.join(process.cwd(), "test-export/dts"),
    clientSingleTableJsonDir: path.join(process.cwd(), "test-export/export-jsons"),
    isBundleDts: true,
    isCompress: false,
    // isZip: true
};
convertConfig.outputConfig = outputConfig;

excel2all.testFileMatch(convertConfig);
