import * as path from "path";
import * as fs from "fs-extra";
import * as mmatch from "micromatch";
import { forEachFile, getCacheData, getFileMd5Sync, writeCacheData, writeOrDeleteOutPutFiles } from "./file-utils";
import { Worker } from "worker_threads";
import { doParse } from "./do-parse";
import { DefaultParseHandler } from "./default-parse-handler";
import { Logger } from "./loger";
import { DefaultConvertHook } from "./default-convert-hook";
import { DefaultOutPutTransformer } from "./default-output-transformer";
const defaultDir = ".excel2all";
const cacheFileName = ".e2aprmc";
const logFileName = "excel2all.log";
let startTime = 0;
/**
 * 转换
 * @param converConfig 解析配置
 */
export async function convert(converConfig: ITableConvertConfig) {
    //开始时间
    startTime = new Date().getTime();

    if (!converConfig.projRoot) {
        converConfig.projRoot = process.cwd();
    }
    let convertHook: IConvertHook;
    if (converConfig.customConvertHookPath) {
        convertHook = require(converConfig.customConvertHookPath);
    } else {
        convertHook = new DefaultConvertHook();
    }
    let outputTransformer: IOutPutTransformer;
    if (converConfig.customOutPutTransformerPath) {
        outputTransformer = require(converConfig.customOutPutTransformerPath);
    } else {
        outputTransformer = new DefaultOutPutTransformer();
    }
    Logger.init(converConfig);
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
    const context: IConvertContext = {
        convertConfig: converConfig,
        outputTransformer: outputTransformer
    } as any;
    //开始
    await new Promise<void>((res) => {
        convertHook.onStart(context, res);
    });

    let changedFileInfos: IFileInfo[] = [];
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
                changedFileInfos.push(fileInfo);
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
        Logger.systemLog(`开始缓存模式处理...`);
        if (!cacheFileDirPath) cacheFileDirPath = defaultDir;
        if (!path.isAbsolute(cacheFileDirPath)) {
            cacheFileDirPath = path.join(converConfig.projRoot, cacheFileDirPath);
        }
        parseResultMapCacheFilePath = path.join(cacheFileDirPath, cacheFileName);
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
            if (!parseResult || (parseResult && parseResult.md5hash !== md5str)) {
                parseResult = {
                    filePath: filePath
                };
                parseResultMap[filePath] = parseResult;
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
        Logger.systemLog(`缓存模式处理结束`);
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
    //解析开始之前
    context.parseResultMap = parseResultMap;
    context.deleteFileInfos = deleteFileInfos;
    context.changedFileInfos = changedFileInfos;
    await new Promise<void>((res) => {
        convertHook.onParseBefore(context, res);
    });

    if (changedFileInfos.length > converConfig.threadParseFileMaxNum && converConfig.useMultiThread) {
        Logger.systemLog(`开始多线程解析:数量[${changedFileInfos.length}]`);
        let logStr: string = "";
        const count = Math.floor(changedFileInfos.length / converConfig.threadParseFileMaxNum) + 1;
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
            if (!context.hasError) {
                context.hasError = Logger.hasError;
            }
            if (completeCount >= count) {
                const t2 = new Date().getTime();
                Logger.log(`[多线程导表时间]:${t2 - t1}`);
                onParseEnd(context, parseResultMapCacheFilePath, convertHook, logStr);
            }
        };
        for (let i = 0; i < count; i++) {
            subFileInfos = changedFileInfos.splice(0, converConfig.threadParseFileMaxNum);
            Logger.log(`----------------线程开始:${i}-----------------`);
            worker = new Worker(path.join(path.dirname(__filename), "../../../worker_scripts/worker.js"), {
                workerData: {
                    threadId: i,
                    fileInfos: subFileInfos,
                    parseResultMap: parseResultMap,
                    convertConfig: converConfig
                } as IWorkerShareData
            });
            workerMap[i] = worker;
            worker.on("message", onWorkerParseEnd);
        }
    } else {
        if (changedFileInfos.length > 0) {
            const t1 = new Date().getTime();
            Logger.systemLog(`开始单线程解析:数量[${changedFileInfos.length}]`);
            doParse(converConfig, changedFileInfos, parseResultMap, parseHandler);
            const t2 = new Date().getTime();
            Logger.systemLog(`[单线程导表时间]:${t2 - t1}`);
        }
        context.hasError = Logger.hasError;
        onParseEnd(context, parseResultMapCacheFilePath, convertHook);
    }
}
/**
 * 解析结束
 * @param parseConfig
 * @param parseResultMapCacheFilePath
 * @param convertHook
 * @param fileInfos
 * @param deleteFileInfos
 * @param parseResultMap
 * @param logStr
 */
async function onParseEnd(
    context: IConvertContext,
    parseResultMapCacheFilePath: string,
    convertHook: IConvertHook,
    logStr?: string
) {
    const convertConfig = context.convertConfig;
    const parseResultMap = context.parseResultMap;
    //如果没有错误,则写入解析缓存
    //有错误不能写入缓存，避免错误被下次解析给忽略掉
    if (convertConfig.useCache && !context.hasError) {
        writeCacheData(parseResultMapCacheFilePath, parseResultMap);
    }

    //解析结束，做导出处理
    await new Promise<void>((res) => {
        convertHook.onParseAfter(context, res);
    });

    if (context.outPutFileMap) {
        const outputFileMap = context.outPutFileMap;
        const outputFiles = Object.values(outputFileMap);
        //写入和删除文件处理
        Logger.systemLog(`开始写入文件:0/${outputFiles.length}`);

        await new Promise<void>((res) => {
            writeOrDeleteOutPutFiles(
                outputFiles,
                (filePath, total, now, isOk) => {
                    Logger.log(`[写入文件] 进度:(${now}/${total}) 路径:${filePath}`);
                },
                () => {
                    res();
                }
            );
        });
        Logger.systemLog(`写入结束~`);
    } else {
        Logger.systemLog(`没有可写入文件~`);
    }

    //写入日志文件

    if (!logStr) {
        logStr = Logger.logStr;
    }
    if (logStr.trim() !== "") {
        let logFileDirPath = context.convertConfig.outputLogDirPath as string;
        if (!logFileDirPath) logFileDirPath = defaultDir;
        if (!path.isAbsolute(logFileDirPath)) {
            logFileDirPath = path.join(context.convertConfig.projRoot, logFileDirPath);
        }

        const outputLogFileInfo: IOutPutFileInfo = {
            filePath: path.join(logFileDirPath, logFileName),
            data: logStr
        };
        writeOrDeleteOutPutFiles([outputLogFileInfo]);
    }
    //写入结束
    convertHook.onWriteFileEnd(context);
    //结束时间
    const endTime = new Date().getTime();
    const useTime = endTime - startTime;
    Logger.log(`导表总时间:[${useTime}ms],[${useTime / 1000}s]`);
}
/**
 * 测试文件匹配
 * @param converConfig
 */
export function testFileMatch(converConfig: ITableConvertConfig) {
    if (!converConfig.projRoot) {
        converConfig.projRoot = process.cwd();
    }
    let convertHook: IConvertHook;
    if (converConfig.customConvertHookPath) {
        convertHook = require(converConfig.customConvertHookPath);
    } else {
        convertHook = new DefaultConvertHook();
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
    const matchPattern = converConfig.pattern;
    const deleteFilePaths: string[] = [];
    const changedFilePaths: string[] = [];
    const eachFileCallback = (filePath: string, isDelete?: boolean) => {
        let canRead: boolean;
        if (isDelete) {
            deleteFilePaths.push(filePath);
        } else {
            canRead = mmatch.all(filePath, matchPattern);
            if (canRead) {
                changedFilePaths.push(filePath);
            }
        }
        return { canRead };
    };
    let cacheFileDirPath: string = converConfig.cacheFileDirPath;
    let parseResultMapCacheFilePath: string;
    let parseResultMap: TableParseResultMap;
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
                const { canRead } = eachFileCallback(filePath, false);
                if (canRead) {
                    parseResult.tableObj = undefined;
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
    if (converConfig.useCache) {
        console.log(`----【缓存模式】----`);
    }
    console.log(`------------------------------匹配到的文件---------------------`);
    console.log(changedFilePaths);
}
