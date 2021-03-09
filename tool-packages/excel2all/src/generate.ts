import * as path from "path";
import * as fs from "fs-extra";
import * as mmatch from "micromatch";
import { forEachFile, getCacheData, getFileMd5Sync, writeCacheData, writeOrDeleteOutPutFiles } from "./file-utils";
import { Worker } from "worker_threads";
import { doParse } from "./do-parse";
import { DefaultParseHandler } from "./default-parse-handler";
/**
 * 解析配置表生成指定文件
 * @param parseConfig 解析配置
 * @param trans2FileHandler 转换解析结果为输出文件
 */
export async function generate(parseConfig: ITableParseConfig, trans2FileHandler: ITransResult2AnyFileHandler) {
    const tableFileDir = parseConfig.tableFileDir;
    if (!tableFileDir) {
        console.error(`配置表目录：tableFileDir为空`);
        return;
    }
    if (!fs.existsSync(tableFileDir)) {
        console.error(`配置表文件夹不存在：${tableFileDir}`);
        return;
    }
    const defaultPattern = ["**/*.{xlsx,csv}", "!**/~$*.*", "!**/~.*.*"];
    if (!parseConfig.pattern) {
        parseConfig.pattern = defaultPattern;
    } else if (parseConfig.pattern && typeof parseConfig.pattern === "object") {
        for (let i = 0; i < defaultPattern.length; i++) {
            if (!parseConfig.pattern.includes(defaultPattern[i])) {
                parseConfig.pattern.push(defaultPattern[i]);
            }
        }
    }
    if (parseConfig.useMultiThread && isNaN(parseConfig.threadParseFileMaxNum)) {
        parseConfig.threadParseFileMaxNum = 5;
    }

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
    const matchPattern = parseConfig.pattern;
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
    let cacheFileDirPath: string = parseConfig.cacheFileDirPath;
    let parseResultMapCacheFilePath: string;

    if (!parseConfig.useCache) {
        forEachFile(tableFileDir, eachFileCallback);
    } else {
        if (!cacheFileDirPath) cacheFileDirPath = ".cache";
        if (!path.isAbsolute(cacheFileDirPath)) {
            cacheFileDirPath = path.join(tableFileDir, cacheFileDirPath);
            parseResultMapCacheFilePath = path.join(cacheFileDirPath, ".egfprmc");
        }
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
    if (fileInfos.length > parseConfig.threadParseFileMaxNum && parseConfig.useMultiThread) {
        const count = Math.floor(fileInfos.length / parseConfig.threadParseFileMaxNum) + 1;
        let worker: Worker;
        let subFileInfos: IFileInfo[];
        let workerMap: { [key: number]: Worker } = {};
        let completeCount: number = 0;
        const t1 = new Date().getTime();
        const onWorkerParseEnd = (data: { threadId: number; parseResultMap: TableParseResultMap }) => {
            console.log(`线程结束:${data.threadId}`);
            parseResultMap = Object.assign(parseResultMap, data.parseResultMap);
            completeCount++;
            if (completeCount >= count) {
                writeFiles(
                    parseConfig,
                    parseResultMapCacheFilePath,
                    trans2FileHandler,
                    fileInfos,
                    deleteFileInfos,
                    parseResultMap
                );
                const t2 = new Date().getTime();
                console.log(`[多线程导表时间]:${t2 - t1}`);
            }
        };
        for (let i = 0; i < count; i++) {
            subFileInfos = fileInfos.splice(0, parseConfig.threadParseFileMaxNum);
            worker = new Worker(path.join(path.dirname(__filename), "./worker.js"), {
                workerData: { threadId: i, fileInfos: subFileInfos, parseResultMap: parseResultMap } as IWorkerShareData
            });
            workerMap[i] = worker;
            worker.on("message", onWorkerParseEnd);
        }
    } else {
        const t1 = new Date().getTime();
        let parseHandler: ITableParseHandler;
        if (parseConfig.customParseHandlerPath) {
            if (!path.isAbsolute(parseConfig.customParseHandlerPath)) {
                parseConfig.customParseHandlerPath = path.resolve(__dirname, parseConfig.customParseHandlerPath);
            }
            parseHandler = await import(parseConfig.customParseHandlerPath);
        }
        if (!parseHandler) {
            parseHandler = new DefaultParseHandler();
        }
        doParse(fileInfos, parseResultMap, parseHandler);
        writeFiles(
            parseConfig,
            parseResultMapCacheFilePath,
            trans2FileHandler,
            fileInfos,
            deleteFileInfos,
            parseResultMap
        );
        const t2 = new Date().getTime();
        console.log(`[单线程导表时间]:${t2 - t1}`);
    }
}
function writeFiles(
    parseConfig: ITableParseConfig,
    parseResultMapCacheFilePath: string,
    trans2FileHandler: ITransResult2AnyFileHandler,
    fileInfos: IFileInfo[],
    deleteFileInfos: IFileInfo[],
    parseResultMap: TableParseResultMap
) {
    //写入解析缓存
    if (parseConfig.useCache) {
        writeCacheData(parseResultMapCacheFilePath, parseResultMap);
    }

    //解析结束，做导出处理
    let outputFileMap: OutPutFileMap = trans2FileHandler.trans2Files(fileInfos, deleteFileInfos, parseResultMap);
    const outputFiles = Object.values(outputFileMap);
    //写入和删除文件处理
    console.log(`开始写入文件:0/${outputFiles.length}`);

    writeOrDeleteOutPutFiles(
        outputFiles,
        (filePath, total, now, isOk) => {
            console.log(`[写入文件] 进度:(${now}/${total}) 路径:${filePath}`);
        },
        () => {
            console.log(`写入结束~`);
        }
    );
}
