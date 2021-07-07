import * as path from "path";
import * as fs from "fs-extra";
import * as mmatch from "micromatch";
import {
    forEachFile,
    getCacheData,
    getFileMd5,
    getFileMd5Sync,
    writeCacheData,
    writeOrDeleteOutPutFiles
} from "./file-utils";
import { doParse } from "./do-parse";
import { DefaultParseHandler } from "./default-parse-handler";
import { Logger } from "./loger";
import { DefaultConvertHook } from "./default-convert-hook";
import { DefaultOutPutTransformer } from "./default-output-transformer";
import { isCSV } from "./table-utils";
import fg from "fast-glob";

const defaultDir = ".excel2all";
const cacheFileName = ".e2aprmc";
const logFileName = "excel2all.log";
let startTime = 0;
const defaultPattern = ["./**/*.xlsx", "./**/*.csv", "!**/~$*.*", "!**/~.*.*", "!.git/**/*", "!.svn/**/*"];
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

    if (!converConfig.pattern) {
        converConfig.pattern = defaultPattern;
    }
    if (converConfig.useMultiThread && isNaN(converConfig.threadParseFileMaxNum)) {
        converConfig.threadParseFileMaxNum = 5;
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
    const context: IConvertContext = {
        convertConfig: converConfig,
        outputTransformer: outputTransformer
    } as any;
    //开始
    await new Promise<void>((res) => {
        convertHook.onStart(context, res);
    });

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
    const predoT1 = new Date().getTime();
    getFileInfos(context);
    const { parseResultMap, parseResultMapCacheFilePath, changedFileInfos } = context;
    const predoT2 = new Date().getTime();
    Logger.systemLog(`[预处理数据时间:${predoT2 - predoT1}ms,${(predoT2 - predoT1) / 1000}]`);
    await new Promise<void>((res) => {
        convertHook.onParseBefore(context, res);
    });
    Logger.systemLog(`[开始解析]:数量[${changedFileInfos.length}]`);
    /**
     * @type {import("worker_threads").Worker};
     */
    let WorkerClass;
    try {
        WorkerClass = require("worker_threads");
    } catch (error) {
        converConfig.useMultiThread && Logger.systemLog(`node版本不支持Worker多线程，切换为单线程模式`);
        converConfig.useMultiThread = false;
    }
    if (changedFileInfos.length > converConfig.threadParseFileMaxNum && converConfig.useMultiThread) {
        Logger.systemLog(`[多线程解析]`);
        let logStr: string = "";
        const count = Math.floor(changedFileInfos.length / converConfig.threadParseFileMaxNum) + 1;
        /**
         * @type {import("worker_threads").Worker}
         */
        let worker;
        let subFileInfos: IFileInfo[];
        /**
         * @type {import("worker_threads").Worker}
         */
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
                Logger.log(`[多线程解析时间]:${t2 - t1}`);
                onParseEnd(context, parseResultMapCacheFilePath, convertHook, logStr);
            }
        };
        for (let i = 0; i < count; i++) {
            subFileInfos = changedFileInfos.splice(0, converConfig.threadParseFileMaxNum);
            Logger.log(`----------------线程开始:${i}-----------------`);

            worker = new WorkerClass(path.join(path.dirname(__filename), "../../../worker_scripts/worker.js"), {
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
        Logger.systemLog(`[单线程解析]`);
        if (changedFileInfos.length > 0) {
            const t1 = new Date().getTime();
            doParse(converConfig, changedFileInfos, parseResultMap, parseHandler);
            const t2 = new Date().getTime();
            Logger.systemLog(`[单线程解析时间]:${t2 - t1}`);
        }
        context.hasError = Logger.hasError;
        onParseEnd(context, parseResultMapCacheFilePath, convertHook);
    }
}
/**
 * 使用fast-glob作为文件遍历
 * 获取需要解析的文件信息
 * @param context
 */
function getFileInfos(context: IConvertContext) {
    const converConfig = context.convertConfig;
    let changedFileInfos: IFileInfo[] = [];
    let deleteFileInfos: IFileInfo[] = [];
    const tableFileDir = converConfig.tableFileDir;
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

    const filePaths: string[] = fg.sync(matchPattern, {
        absolute: true,
        onlyFiles: true,
        caseSensitiveMatch: false,
        cwd: tableFileDir
    });
    let parseResultMap: TableParseResultMap = {};
    //缓存处理
    let cacheFileDirPath: string = converConfig.cacheFileDirPath;
    let parseResultMapCacheFilePath: string;

    if (!converConfig.useCache) {
        for (let i = 0; i < filePaths.length; i++) {
            changedFileInfos.push(getFileInfo(filePaths[i]));
        }
    } else {
        let t1 = new Date().getTime();
        if (!cacheFileDirPath) cacheFileDirPath = defaultDir;
        if (!path.isAbsolute(cacheFileDirPath)) {
            cacheFileDirPath = path.join(converConfig.projRoot, cacheFileDirPath);
        }
        parseResultMapCacheFilePath = path.join(cacheFileDirPath, cacheFileName);
        Logger.systemLog(`读取缓存数据`);

        parseResultMap = getCacheData(parseResultMapCacheFilePath);
        if (!parseResultMap) {
            parseResultMap = {};
        }

        Logger.systemLog(`开始缓存处理...`);
        const oldFilePaths = Object.keys(parseResultMap);
        let oldFilePathIndex: number;
        let parseResult: ITableParseResult;
        let filePath: string;
        for (let i = 0; i < filePaths.length; i++) {
            filePath = filePaths[i];
            const fileInfo = getFileInfo(filePath);

            const fileData = fs.readFileSync(filePath);
            fileInfo.fileData = fileData;
            parseResult = parseResultMap[filePath];
            var md5str = getFileMd5(fileData);
            if (!parseResult || (parseResult && parseResult.md5hash !== md5str)) {
                parseResult = {
                    filePath: filePath
                };
                parseResultMap[filePath] = parseResult;
                parseResult.md5hash = md5str;
                changedFileInfos.push(fileInfo);
            }
            //删除不存在的旧文件
            oldFilePathIndex = oldFilePaths.indexOf(filePath);
            if (oldFilePathIndex > -1) {
                const endFilePath = oldFilePaths[oldFilePaths.length - 1];
                oldFilePaths[oldFilePathIndex] = endFilePath;
                oldFilePaths.pop();
            }
        }
        //删除旧文件
        for (let i = 0; i < oldFilePaths.length; i++) {
            delete parseResultMap[oldFilePaths[i]];
            let deleteFileInfo = getFileInfo(oldFilePaths[i]);
            deleteFileInfos.push(deleteFileInfo);
        }
        let t2 = new Date().getTime();
        Logger.systemLog(`缓存处理时间:${t2 - t1}ms,${(t2 - t1) / 1000}s`);
    }
    context.deleteFileInfos = deleteFileInfos;
    context.changedFileInfos = changedFileInfos;
    context.parseResultMap = parseResultMap;
    context.parseResultMapCacheFilePath = parseResultMapCacheFilePath;
}
/**
 * 获取文件信息以及预处理
 * @param context
 */
function getFileInfosAndPreDo(context: IConvertContext) {
    const converConfig = context.convertConfig;
    let changedFileInfos: IFileInfo[] = [];
    let deleteFileInfos: IFileInfo[] = [];
    const tableFileDir = converConfig.tableFileDir;
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
    const eachFileCallback = (filePath: string) => {
        const fileInfo = getFileInfo(filePath);
        let canRead: boolean;
        canRead = mmatch.all(fileInfo.filePath, matchPattern);
        return { fileInfo, canRead };
    };
    let parseResultMap: TableParseResultMap = {};

    //缓存处理
    let cacheFileDirPath: string = converConfig.cacheFileDirPath;
    let parseResultMapCacheFilePath: string;

    if (!converConfig.useCache) {
        forEachFile(tableFileDir, (filePath) => {
            const { fileInfo, canRead } = eachFileCallback(filePath);
            if (canRead) {
                changedFileInfos.push(fileInfo);
            }
        });
    } else {
        let t1 = new Date().getTime();
        if (!cacheFileDirPath) cacheFileDirPath = defaultDir;
        if (!path.isAbsolute(cacheFileDirPath)) {
            cacheFileDirPath = path.join(converConfig.projRoot, cacheFileDirPath);
        }
        parseResultMapCacheFilePath = path.join(cacheFileDirPath, cacheFileName);
        Logger.systemLog(`读取缓存数据`);

        parseResultMap = getCacheData(parseResultMapCacheFilePath);
        if (!parseResultMap) {
            parseResultMap = {};
        }

        Logger.systemLog(`开始缓存处理...`);
        const oldFilePaths = Object.keys(parseResultMap);
        let oldFilePathIndex: number;
        let parseResult: ITableParseResult;
        forEachFile(tableFileDir, (filePath) => {
            const { fileInfo, canRead } = eachFileCallback(filePath);

            const fileData = fs.readFileSync(filePath, isCSV(fileInfo.fileExtName) ? "utf-8" : undefined);
            if (canRead) {
                fileInfo.fileData = fileData;
                parseResult = parseResultMap[filePath];
                var md5str = getFileMd5(fileData);
                if (!parseResult || (parseResult && parseResult.md5hash !== md5str)) {
                    parseResult = {
                        filePath: filePath
                    };
                    parseResultMap[filePath] = parseResult;
                    parseResult.md5hash = md5str;
                    changedFileInfos.push(fileInfo);
                }
            }
            //删除不存在的旧文件
            oldFilePathIndex = oldFilePaths.indexOf(filePath);
            if (oldFilePathIndex > -1) {
                const endFilePath = oldFilePaths[oldFilePaths.length - 1];
                oldFilePaths[oldFilePathIndex] = endFilePath;
                oldFilePaths.pop();
            }
        });
        for (let i = 0; i < oldFilePaths.length; i++) {
            delete parseResultMap[oldFilePaths[i]];
            let deleteFileInfo = getFileInfo(oldFilePaths[i]);
            deleteFileInfos.push(deleteFileInfo);
        }
        let t2 = new Date().getTime();
        Logger.systemLog(`缓存处理时间:${t2 - t1}ms,${(t2 - t1) / 1000}s`);
    }
    context.deleteFileInfos = deleteFileInfos;
    context.changedFileInfos = changedFileInfos;
    context.parseResultMap = parseResultMap;
    context.parseResultMapCacheFilePath = parseResultMapCacheFilePath;
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
    Logger.systemLog(`开始进行转换解析结果`);
    const parseAfterT1 = new Date().getTime();
    await new Promise<void>((res) => {
        convertHook.onParseAfter(context, res);
    });
    const parseAfterT2 = new Date().getTime();
    Logger.systemLog(`转换解析结果结束:${parseAfterT2 - parseAfterT1}ms,${(parseAfterT2 - parseAfterT1) / 1000}s`);

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
 * @param convertConfig
 */
export function testFileMatch(convertConfig: ITableConvertConfig) {
    if (!convertConfig.projRoot) {
        convertConfig.projRoot = process.cwd();
    }
    const tableFileDir = convertConfig.tableFileDir;
    if (!tableFileDir) {
        Logger.log(`配置表目录：tableFileDir为空`, "error");
        return;
    }
    if (!fs.existsSync(tableFileDir)) {
        Logger.log(`配置表文件夹不存在：${tableFileDir}`, "error");
        return;
    }
    if (!convertConfig.pattern) {
        convertConfig.pattern = defaultPattern;
    }
    if (convertConfig.useMultiThread && isNaN(convertConfig.threadParseFileMaxNum)) {
        convertConfig.threadParseFileMaxNum = 5;
    }
    const context: IConvertContext = { convertConfig: convertConfig } as any;
    let t1 = new Date().getTime();
    getFileInfos(context);
    let t2 = new Date().getTime();
    console.log(`执行时间:${(t2 - t1) / 1000}s`);
    if (convertConfig.useCache) {
        console.log(`----【缓存模式】----`);
    }
    console.log(`------------------------------匹配到的文件---------------------`);
    console.log(context.changedFileInfos);
}
