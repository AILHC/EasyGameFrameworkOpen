import * as path from "path";
import * as fs from "fs-extra";
import { getCacheData, getFileMd5, writeCacheData, writeOrDeleteOutPutFiles } from "./file-utils";
import { Logger } from "./loger";
import { DefaultConvertHook } from "./default-convert-hook";
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
export async function convert(converConfig: ITableConvertConfig, customConvertHook?: IConvertHook) {
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
    let convertHook = new DefaultConvertHook();
    const context: IConvertContext = {
        convertConfig: converConfig,
        utils: {
            fs: require("fs-extra"),
            xlsx: require("xlsx")
        }
    };
    //开始
    await new Promise<void>((res) => {
        customConvertHook && customConvertHook.onStart
            ? customConvertHook.onStart(context, res)
            : convertHook.onStart(context, res);
    });
    const predoT1 = new Date().getTime();
    getFileInfos(context);
    const { parseResultMapCacheFilePath, changedFileInfos } = context;
    const predoT2 = new Date().getTime();
    Logger.systemLog(`[预处理数据时间:${predoT2 - predoT1}ms,${(predoT2 - predoT1) / 1000}]`);
    await new Promise<void>((res) => {
        customConvertHook && customConvertHook.onParseBefore
            ? customConvertHook.onParseBefore(context, res)
            : convertHook.onParseBefore(context, res);
    });
    Logger.systemLog(`[开始解析]:数量[${changedFileInfos.length}]`);

    Logger.systemLog(`[单线程解析]`);
    if (changedFileInfos.length > 0) {
        const t1 = new Date().getTime();
        await new Promise<void>((res) => {
            customConvertHook && customConvertHook.onParse
                ? customConvertHook.onParse(context, res)
                : convertHook.onParse(context, res);
        });
        const t2 = new Date().getTime();
        Logger.systemLog(`[单线程解析时间]:${t2 - t1}`);
    }
    onParseEnd(context, parseResultMapCacheFilePath, customConvertHook, convertHook);
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
    customConvertHook: IConvertHook,
    convertHook: IConvertHook,
    logStr?: string
) {
    const convertConfig = context.convertConfig;
    const parseResultMap = context.parseResultMap;
    //写入解析缓存
    if (convertConfig.useCache) {
        writeCacheData(parseResultMapCacheFilePath, parseResultMap);
    }

    //解析结束，做导出处理
    Logger.systemLog(`开始进行转换解析结果`);
    const parseAfterT1 = new Date().getTime();
    await new Promise<void>((res) => {
        customConvertHook && customConvertHook.onParseAfter
            ? customConvertHook.onParseAfter(context, res)
            : convertHook.onParseAfter(context, res);
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
    convertHook.onConvertEnd(context);
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
    const getFileInfo = (filePath: string, isDelete?: boolean) => {
        const filePathParse = path.parse(filePath);

        let fileData = !isDelete ? fs.readFileSync(filePath) : undefined;

        const fileInfo: IFileInfo = {
            filePath: filePath,
            fileName: filePathParse.name,
            fileExtName: filePathParse.ext,
            isDelete: isDelete,
            fileData: fileData
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
    let fileInfo: IFileInfo;
    if (!converConfig.useCache) {
        for (let i = 0; i < filePaths.length; i++) {
            fileInfo = getFileInfo(filePaths[i]);
            changedFileInfos.push(fileInfo);
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
            fileInfo = getFileInfo(filePath);
            const fileData = fileInfo.fileData;
            parseResult = parseResultMap[filePath];
            var md5str = getFileMd5(fileData);
            if (!parseResult || (parseResult && (parseResult.hasError || parseResult.md5hash !== md5str))) {
                parseResult = {
                    filePath: filePath
                };
                parseResultMap[filePath] = parseResult;
                parseResult.md5hash = md5str;
                changedFileInfos.push(fileInfo);
            }
            //判断文件是否还存在
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
            let deleteFileInfo = getFileInfo(oldFilePaths[i], true);
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
