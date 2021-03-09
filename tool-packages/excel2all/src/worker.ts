import { DefaultParseHandler } from "./default-parse-handler";
import * as path from "path";
import * as wt from "worker_threads";

(async function () {
    const workerData: IWorkerShareData = wt.workerData;
    const fileInfos = workerData.fileInfos;
    const parseResultMap = workerData.parseResultMap;
    const parseConfig = workerData.parseConfig;
    let parseHandler: ITableParseHandler;
    if (parseConfig.customParseHandlerPath) {
        if (!path.isAbsolute(parseConfig.customParseHandlerPath)) {
            parseConfig.customParseHandlerPath = path.resolve(__dirname, parseConfig.customParseHandlerPath);
        }
        parseHandler = await import(parseConfig.customParseHandlerPath);
    }
    if (parseHandler) {
        parseHandler = new DefaultParseHandler();
    }
    const doParse = (await import("./do-parse")).doParse;
    doParse(fileInfos, parseResultMap, parseHandler);
    wt.parentPort.postMessage({ threadId: workerData.threadId, parseResultMap: parseResultMap });
})();
