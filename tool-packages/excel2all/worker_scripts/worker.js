const DefaultParseHandler = require("@ailhc/excel2all").DefaultParseHandler;
const path = require("path");
const Logger = require('@ailhc/excel2all').Logger;

const wt = require("worker_threads");

/**
    * @type {IWorkerShareData}
    */
const workerData = wt.workerData;
const fileInfos = workerData.fileInfos;
const parseResultMap = workerData.parseResultMap;
const convertConfig = workerData.convertConfig;
Logger.init(convertConfig);
/**
 * @type {ITableParseHandler}
 */
let parseHandler;
if (convertConfig.customParseHandlerPath) {
    parseHandler = require(convertConfig.customParseHandlerPath);
} else {
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
        parseResult = parseHandler.parseTableFile(convertConfig, fileInfos[i], parseResult);
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
