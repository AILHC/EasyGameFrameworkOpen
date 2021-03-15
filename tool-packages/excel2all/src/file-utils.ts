import * as fs from "fs-extra";
import * as path from "path";
import * as crypto from "crypto";
import { Logger } from "./loger";

declare global {
    interface IOutPutFileInfo {
        filePath: string;
        /**写入编码，字符串默认utf8 */
        encoding?: BufferEncoding;
        /**是否删除 */
        isDelete?: boolean;
        data?: any;
    }
}
/**
 * 遍历文件
 * @param dirPath 文件夹路径
 * @param eachCallback 遍历回调 (filePath: string) => void
 */
export function forEachFile(fileOrDirPath: string, eachCallback?: (filePath: string) => void) {
    if (fs.statSync(fileOrDirPath).isDirectory()) {
        const fileNames = fs.readdirSync(fileOrDirPath);
        let childFilePath: string;
        for (var i = 0; i < fileNames.length; i++) {
            childFilePath = path.join(fileOrDirPath, fileNames[i]);
            forEachFile(childFilePath, eachCallback);
        }
    } else {
        eachCallback(fileOrDirPath);
    }
}
/**
 * 批量写入和删除文件
 * @param outputFileInfos 需要写入的文件信息数组
 * @param onProgress 进度变化回调
 * @param complete 完成回调
 */
export function writeOrDeleteOutPutFiles(
    outputFileInfos: IOutPutFileInfo[],
    onProgress?: (filePath: string, total: number, now: number, isOk: boolean) => void,
    complete?: (total: number) => void
) {
    let fileInfo: IOutPutFileInfo;
    const total = outputFileInfos.length;
    if (outputFileInfos && total) {
        let now = 0;
        const onWriteEnd = (err) => {
            if (err) {
                Logger.log(err, "error");
            }
            now++;
            onProgress && onProgress(outputFileInfos[now - 1].filePath, total, now, !err);
            if (now >= total) {
                complete && complete(total);
            }
        };
        for (let i = outputFileInfos.length - 1; i >= 0; i--) {
            fileInfo = outputFileInfos[i];
            if (fileInfo.isDelete && fs.existsSync(fileInfo.filePath)) {
                fs.unlinkSync(fileInfo.filePath);
            } else {
                if (!fileInfo.encoding && typeof fileInfo.data === "string") {
                    fileInfo.encoding = "utf8";
                }

                fs.ensureFileSync(fileInfo.filePath);
                fs.writeFile(
                    fileInfo.filePath,
                    fileInfo.data,
                    fileInfo.encoding ? { encoding: fileInfo.encoding } : undefined,
                    onWriteEnd
                );
            }
        }
    }
}
/**
 * 获取变化过的文件数组
 * @param dir 目标目录
 * @param cacheFilePath 缓存文件绝对路径
 * @param eachCallback 遍历回调
 * @returns 返回缓存文件路径
 */
export function forEachChangedFile(
    dir: string,
    cacheFilePath?: string,
    eachCallback?: (filePath: string, isDelete?: boolean) => void
) {
    const gcfCache = getCacheData(cacheFilePath);
    const oldFilePaths = Object.keys(gcfCache);
    let oldFilePathIndex: number;
    forEachFile(dir, (filePath) => {
        var md5str = getFileMd5Sync(filePath);
        if (!gcfCache[filePath] || (gcfCache[filePath] && gcfCache[filePath] !== md5str)) {
            gcfCache[filePath] = md5str;
            eachCallback(filePath, false);
        }
        oldFilePathIndex = oldFilePaths.indexOf(filePath);
        if (oldFilePathIndex > -1) {
            const endFilePath = oldFilePaths[oldFilePaths.length - 1];
            oldFilePaths[oldFilePathIndex] = endFilePath;
            oldFilePaths.pop();
        }
    });
    for (let i = 0; i < oldFilePaths.length; i++) {
        delete gcfCache[oldFilePaths[i]];
        eachCallback(oldFilePaths[i], true);
    }
    fs.writeFileSync(cacheFilePath, JSON.stringify(gcfCache), { encoding: "utf-8" });
}
/**
 * 写入缓存数据
 * @param cacheFilePath
 * @param cacheData
 */
export function writeCacheData(cacheFilePath: string, cacheData: any) {
    if (!cacheFilePath) {
        Logger.log(`cacheFilePath is null`, "error");
        return;
    }
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData), { encoding: "utf-8" });
}
/**
 * 读取缓存数据
 * @param cacheFilePath
 */
export function getCacheData(cacheFilePath: string): any {
    if (!cacheFilePath) {
        Logger.log(`cacheFilePath is null`, "error");
        return;
    }
    if (!fs.existsSync(cacheFilePath)) {
        fs.ensureFileSync(cacheFilePath);
        fs.writeFileSync(cacheFilePath, "{}", { encoding: "utf-8" });
    }
    const gcfCacheFile = fs.readFileSync(cacheFilePath, "utf-8");
    const gcfCache = JSON.parse(gcfCacheFile);
    return gcfCache;
}
/**
 * 获取文件md5 (同步)
 * @param filePath
 */
export function getFileMd5Sync(filePath: string): string {
    const file = fs.readFileSync(filePath, "utf-8");
    var md5um = crypto.createHash("md5");
    md5um.update(file);
    return md5um.digest("hex");
}
/**
 * 获取文件 md5
 * @param filePath
 */
export async function getFileMd5(filePath: string) {
    return getFileMd5Sync(filePath);
}
