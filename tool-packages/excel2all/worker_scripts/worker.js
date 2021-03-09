const DefaultParseHandler = require("@ailhc/excel2all").DefaultParseHandler;
const path = require("path");
const Logger = require('@ailhc/excel2all').Logger;

const wt = require("worker_threads");

(async function () {

    /**
     * @type {IWorkerShareData}
     */
    const workerData = wt.workerData;
    const fileInfos = workerData.fileInfos;
    const parseResultMap = workerData.parseResultMap;
    const parseConfig = workerData.parseConfig;
    Logger.init(parseConfig);
    /**
     * @type {ITableParseHandler}
     */
    let parseHandler;
    if (parseConfig.customParseHandlerPath) {
        if (!path.isAbsolute(parseConfig.customParseHandlerPath)) {
            parseConfig.customParseHandlerPath = path.resolve(__dirname, parseConfig.customParseHandlerPath);
        }
        parseHandler = require(parseConfig.customParseHandlerPath);
    }
    if (!parseHandler) {
        parseHandler = new DefaultParseHandler();
    }
    //解析 start
    let parseResult;
    for (let i = fileInfos.length - 1; i >= 0; i--) {
        parseResult = parseResultMap[fileInfos[i].filePath];
        if (!parseResult) {
            parseResult = { filePath: fileInfos[i].filePath };
        }
        if (!parseResult.tableObj) {
            parseResult = parseHandler.parseTableFile(fileInfos[i], parseResult);
        }
        if (parseResult) {
            parseResultMap[fileInfos[i].filePath] = parseResult;
        }
    }
    // 解析 end
    /**
     * @type {IWorkDoResult}
     */
    const workerDoResult = { threadId: workerData.threadId, parseResultMap: parseResultMap, logStr: Logger.logStr }
    wt.parentPort.postMessage(workerDoResult);
})();
