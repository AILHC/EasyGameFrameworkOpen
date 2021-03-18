import * as path from "path";
import * as fs from "fs-extra";
import * as mmatch from "micromatch";
import { forEachFile, getCacheData, getFileMd5Sync, writeCacheData, writeOrDeleteOutPutFiles } from "./file-utils";
import { Worker } from "worker_threads";
import { doParse } from "./do-parse";
import { DefaultParseHandler } from "./default-parse-handler";
import { Logger } from "./loger";
import { Trans2JsonAndDtsHandler } from "./default-trans2file-handler";
/**
 * 转换
 * @param converConfig 解析配置
 */
export async function convert(converConfig: ITableConvertConfig) {
    if (!converConfig.projRoot) {
        converConfig.projRoot = process.cwd();
    }
    let trans2FileHandler: ITransResult2AnyFileHandler;
    if (converConfig.customTrans2FileHandlerPath) {
        trans2FileHandler = require(converConfig.customTrans2FileHandlerPath);
        if (!trans2FileHandler || typeof trans2FileHandler.trans2Files !== "function") {
            console.error(`自定义转换实现错误:${converConfig.customTrans2FileHandlerPath}`);
            return;
        }
    } else {
        trans2FileHandler = new Trans2JsonAndDtsHandler();
    }
    const tableFileDir = converConfig.tableFileDir;
    if (!tableFileDir) {
        Logger.log(`配置表目录：tableFileDir为空`, "error");
        return;
    }
    if (!fs.existsSync(tableFileDir)) {
        Logger.log(`配置表文件夹不存在：${tableFileDir}`, "error");
        return;
    }
    const defaultPattern = ["**/*.{xlsx,csv}", "!**/~$*.*", "!**/~.*.*"];
    if (!converConfig.pattern) {
        converConfig.pattern = defaultPattern;
    }
    if (converConfig.useMultiThread && isNaN(converConfig.threadParseFileMaxNum)) {
        converConfig.threadParseFileMaxNum = 5;
    }
    Logger.init(converConfig);
    let fileInfos: IFileInfo[] = [];
    let deleteFileInfos: IFileInfo[] = [];
    const getFileInfo = (filePath: string) => {
        const filePathParse = path.parse(filePath);
        const fileInfo: IFileInfo = {
            filePath: filePath,
            fileName: filePathParse.name,
            fileExtName: filePathParse.ext,
            isDelete: false
        };
        return fileInfo;
    };
    const matchPattern = converConfig.pattern;
    const eachFileCallback = (filePath: string, isDelete?: boolean) => {
        const fileInfo = getFileInfo(filePath);
        let canRead: boolean;
        if (isDelete) {
            deleteFileInfos.push(fileInfo);
        } else {
            canRead = mmatch.all(fileInfo.filePath, matchPattern);
            if (canRead) {
                fileInfos.push(fileInfo);
            }
        }
        return { fileInfo, canRead };
    };
    let parseResultMap: TableParseResultMap = {};

    //缓存处理
    let cacheFileDirPath: string = converConfig.cacheFileDirPath;
    let parseResultMapCacheFilePath: string;

    if (!converConfig.useCache) {
        forEachFile(tableFileDir, eachFileCallback);
    } else {
        if (!cacheFileDirPath) cacheFileDirPath = ".cache";
        if (!path.isAbsolute(cacheFileDirPath)) {
            cacheFileDirPath = path.join(converConfig.projRoot, cacheFileDirPath);
        }
        parseResultMapCacheFilePath = path.join(cacheFileDirPath, ".egfprmc");
        parseResultMap = getCacheData(parseResultMapCacheFilePath);
        if (!parseResultMap) {
            parseResultMap = {};
        }
        const oldFilePaths = Object.keys(parseResultMap);
        let oldFilePathIndex: number;
        let parseResult: ITableParseResult;
        forEachFile(tableFileDir, (filePath) => {
            var md5str = getFileMd5Sync(filePath);
            parseResult = parseResultMap[filePath];
            if (!parseResult) {
                parseResult = {
                    filePath: filePath
                };
                parseResultMap[filePath] = parseResult;
            }
            if (parseResult && parseResult.md5hash !== md5str) {
                const { fileInfo, canRead } = eachFileCallback(filePath, false);
                if (canRead) {
                    parseResult.md5hash = md5str;
                }
            }
            oldFilePathIndex = oldFilePaths.indexOf(filePath);
            if (oldFilePathIndex > -1) {
                const endFilePath = oldFilePaths[oldFilePaths.length - 1];
                oldFilePaths[oldFilePathIndex] = endFilePath;
                oldFilePaths.pop();
            }
        });
        for (let i = 0; i < oldFilePaths.length; i++) {
            delete parseResultMap[oldFilePaths[i]];
            eachFileCallback(oldFilePaths[i], true);
        }
    }
    let parseHandler: ITableParseHandler;
    if (converConfig.customParseHandlerPath) {
        parseHandler = require(converConfig.customParseHandlerPath);
        if (!parseHandler || typeof parseHandler.parseTableFile !== "function") {
            console.error(`自定义解析实现错误:${converConfig.customParseHandlerPath}`);
            return;
        }
    } else {
        parseHandler = new DefaultParseHandler();
    }
    if (fileInfos.length > converConfig.threadParseFileMaxNum && converConfig.useMultiThread) {
        let logStr: string = "";
        const count = Math.floor(fileInfos.length / converConfig.threadParseFileMaxNum) + 1;
        let worker: Worker;
        let subFileInfos: IFileInfo[];
        let workerMap: { [key: number]: Worker } = {};
        let completeCount: number = 0;
        const t1 = new Date().getTime();
        const onWorkerParseEnd = (data: IWorkDoResult) => {
            Logger.log(`----------------线程结束:${data.threadId}-----------------`);
            const parsedMap = data.parseResultMap;
            for (let key in parsedMap) {
                if (!parseResultMap[key].tableDefine) {
                    parseResultMap[key] = parsedMap[key];
                }
            }
            completeCount++;
            logStr += data.logStr + Logger.logStr;
            if (completeCount >= count) {
                const t2 = new Date().getTime();
                Logger.log(`[多线程导表时间]:${t2 - t1}`);
                onParseEnd(
                    converConfig,
                    parseResultMapCacheFilePath,
                    trans2FileHandler,
                    fileInfos,
                    deleteFileInfos,
                    parseResultMap,
                    logStr
                );
            }
        };
        for (let i = 0; i < count; i++) {
            subFileInfos = fileInfos.splice(0, converConfig.threadParseFileMaxNum);
            Logger.log(`----------------线程开始:${i}-----------------`);
            worker = new Worker(path.join(path.dirname(__filename), "../../../worker_scripts/worker.js"), {
                workerData: {
                    threadId: i,
                    fileInfos: subFileInfos,
                    parseResultMap: parseResultMap,
                    parseConfig: converConfig
                } as IWorkerShareData
            });
            workerMap[i] = worker;
            worker.on("message", onWorkerParseEnd);
        }
    } else {
        const t1 = new Date().getTime();

        doParse(converConfig, fileInfos, parseResultMap, parseHandler);
        const t2 = new Date().getTime();
        Logger.log(`[单线程导表时间]:${t2 - t1}`);
        onParseEnd(
            converConfig,
            parseResultMapCacheFilePath,
            trans2FileHandler,
            fileInfos,
            deleteFileInfos,
            parseResultMap,
            Logger.logStr
        );
    }
}
/**
 * 解析结束
 * @param parseConfig
 * @param parseResultMapCacheFilePath
 * @param trans2FileHandler
 * @param fileInfos
 * @param deleteFileInfos
 * @param parseResultMap
 * @param logStr
 */
function onParseEnd(
    parseConfig: ITableConvertConfig,
    parseResultMapCacheFilePath: string,
    trans2FileHandler: ITransResult2AnyFileHandler,
    fileInfos: IFileInfo[],
    deleteFileInfos: IFileInfo[],
    parseResultMap: TableParseResultMap,
    logStr?: string
) {
    //写入解析缓存
    if (parseConfig.useCache) {
        writeCacheData(parseResultMapCacheFilePath, parseResultMap);
    }

    //解析结束，做导出处理
    let outputFileMap: OutPutFileMap = trans2FileHandler.trans2Files(
        parseConfig,
        fileInfos,
        deleteFileInfos,
        parseResultMap
    );
    const outputFiles = Object.values(outputFileMap);

    //写入和删除文件处理
    Logger.log(`开始写入文件:0/${outputFiles.length}`);

    writeOrDeleteOutPutFiles(
        outputFiles,
        (filePath, total, now, isOk) => {
            Logger.log(`[写入文件] 进度:(${now}/${total}) 路径:${filePath}`);
        },
        () => {
            Logger.log(`写入结束~`);
            //日志文件
            if (!logStr) {
                logStr = Logger.logStr;
            }
            const outputLogFileInfo: IOutPutFileInfo = {
                filePath: path.join(process.cwd(), "excel2all.log"),
                data: logStr
            };
            writeOrDeleteOutPutFiles([outputLogFileInfo]);
        }
    );
}
