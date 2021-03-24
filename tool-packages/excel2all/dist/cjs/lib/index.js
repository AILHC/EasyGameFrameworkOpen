'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var zlib = require('zlib');
var os = require('os');
var fs = require('fs-extra');
var crypto = require('crypto');
var mmatch = require('micromatch');
var worker_threads = require('worker_threads');
var xlsx = require('xlsx');

const platform = os.platform();
/**当前系统行尾  platform === "win32" ? "\n" : "\r\n";*/
const osEol = platform === "win32" ? "\n" : "\r\n";

var LogLevelEnum;
(function (LogLevelEnum) {
    LogLevelEnum[LogLevelEnum["info"] = 0] = "info";
    LogLevelEnum[LogLevelEnum["warn"] = 1] = "warn";
    LogLevelEnum[LogLevelEnum["error"] = 2] = "error";
    LogLevelEnum[LogLevelEnum["no"] = 3] = "no";
})(LogLevelEnum || (LogLevelEnum = {}));
class Logger {
    static init(parseConfig) {
        const level = parseConfig.logLevel ? parseConfig.logLevel : "info";
        this._logLevel = LogLevelEnum[level];
        this._enableOutPutLogFile = parseConfig.outputLogFile === undefined ? true : parseConfig.outputLogFile;
    }
    /**
     * 输出日志,日志等级只是限制了控制台输出，但不限制日志记录
     * @param message
     * @param level
     */
    static log(message, level = "info") {
        if (level !== "no") {
            if (this._logLevel <= LogLevelEnum[level]) {
                switch (level) {
                    case "error":
                        console.error(message);
                        break;
                    case "info":
                        console.log(message);
                        break;
                    case "warn":
                        console.warn(message);
                        break;
                }
            }
        }
        if (!this._enableOutPutLogFile)
            return;
        this._logStr += message + osEol;
    }
    /**
     * 系统日志输出
     * @param args
     */
    static systemLog(message) {
        console.log(message);
        if (!this._enableOutPutLogFile)
            return;
        this._logStr += message + osEol;
    }
    /**
     * 返回日志数据并清空
     */
    static get logStr() {
        if (!this._enableOutPutLogFile)
            return null;
        const logStr = this._logStr;
        this._logStr = ""; //清空
        return logStr;
    }
}
Logger._logStr = "";

/**类型字符串映射字典 */
const typeStrMap = { int: "number", json: "any", "[int]": "number[]", "[string]": "string[]" };
class DefaultConvertHook {
    onStart(context) {
        Logger.systemLog(`convert-hook onStart`);
    }
    onParseBefore(context) {
        Logger.systemLog(`convert-hook onParseBefore`);
    }
    onParseAfter(context) {
        const convertConfig = context.convertConfig;
        const parseResultMap = context.parseResultMap;
        let outputConfig = convertConfig.outputConfig;
        if (!outputConfig) {
            console.error(`parseConfig.outputConfig is undefind`);
            return;
        }
        let tableObjMap = {};
        let outputFileMap = {};
        let tableTypeMapDtsStr = "";
        let tableTypeDtsStrs = "";
        let parseResult;
        let tableName;
        let tableObj;
        let objTypeTableMap = {};
        for (let filePath in parseResultMap) {
            parseResult = parseResultMap[filePath];
            if (!parseResult.tableDefine)
                continue;
            tableName = parseResult.tableDefine.tableName;
            //合并多个同名表
            tableObj = tableObjMap[tableName];
            if (tableObj) {
                tableObj = Object.assign(tableObj, parseResult.tableObj);
            }
            else {
                tableObj = parseResult.tableObj;
            }
            tableObjMap[tableName] = tableObj;
            if (outputConfig.isGenDts && objTypeTableMap[tableName] === undefined) {
                objTypeTableMap[tableName] = parseResult.tableDefine.tableType === exports.TableType.horizontal;
                if (parseResult.tableDefine.tableType === exports.TableType.horizontal) {
                    tableTypeMapDtsStr += "\treadonly " + tableName + "?: " + `IT_${tableName};` + osEol;
                }
                else {
                    tableTypeMapDtsStr += this._getOneTableTypeStr(tableName);
                }
                //输出单个文件
                if (outputConfig.isBundleDts === undefined)
                    outputConfig.isBundleDts = true;
                if (!outputConfig.isBundleDts) {
                    this._addSingleTableDtsOutputFile(outputConfig, parseResult, outputFileMap);
                }
                else {
                    tableTypeDtsStrs += this._getSingleTableDts(parseResult);
                }
            }
            //生成单个表json
            if (outputConfig.clientSingleTableJsonDir) {
                this._addSingleTableJsonOutputFile(outputConfig, parseResult, outputFileMap);
            }
        }
        if (outputConfig.isGenDts) {
            //输出声明文件
            let itBaseStr = "interface ITBase<T> { [key:string]:T}" + osEol;
            tableTypeMapDtsStr = itBaseStr + "interface IT_TableMap {" + osEol + tableTypeMapDtsStr + "}" + osEol;
            if (outputConfig.isBundleDts) {
                //合成一个文件
                const dtsFileName = outputConfig.bundleDtsFileName ? outputConfig.bundleDtsFileName : "tableMap";
                const bundleDtsFilePath = path.join(outputConfig.clientDtsOutDir, `${dtsFileName}.d.ts`);
                outputFileMap[bundleDtsFilePath] = {
                    filePath: bundleDtsFilePath,
                    data: tableTypeMapDtsStr + tableTypeDtsStrs
                };
            }
            else {
                //拆分文件输出
                const tableTypeMapDtsFilePath = path.join(outputConfig.clientDtsOutDir, "tableMap.d.ts");
                outputFileMap[tableTypeMapDtsFilePath] = {
                    filePath: tableTypeMapDtsFilePath,
                    data: tableTypeMapDtsStr
                };
            }
        }
        //jsonBundleFile
        if (outputConfig.clientBundleJsonOutPath) {
            let jsonBundleFilePath = outputConfig.clientBundleJsonOutPath;
            let outputData;
            if (outputConfig.isCompress) {
                //进行格式压缩
                const newTableObjMap = {};
                let tableObj;
                let newTableObj;
                for (let tableName in tableObjMap) {
                    if (objTypeTableMap[tableName]) {
                        newTableObjMap[tableName] = tableObjMap[tableName];
                        continue;
                    }
                    tableObj = tableObjMap[tableName];
                    newTableObj = { fieldValuesMap: {} };
                    for (let mainKey in tableObj) {
                        if (!newTableObj.fieldNames) {
                            newTableObj.fieldNames = Object.keys(tableObj[mainKey]);
                        }
                        newTableObj.fieldValuesMap[mainKey] = Object.values(tableObj[mainKey]);
                    }
                    newTableObjMap[tableName] = newTableObj;
                }
                outputData = JSON.stringify(newTableObjMap);
            }
            else {
                outputData = JSON.stringify(tableObjMap);
            }
            //进行base64处理
            // if (outputConfig.bundleJsonIsEncode2Base64) {
            //     outputData = Base64.encode(outputData);
            //     if (outputConfig.preBase64UglyString) {
            //         outputData = outputConfig.preBase64UglyString + outputData;
            //     }
            //     if (outputConfig.sufBase64UglyString) {
            //         outputData += outputConfig.sufBase64UglyString;
            //     }
            // }
            if (outputConfig.isZip) {
                //使用zilb压缩
                outputData = zlib.deflateSync(outputData);
            }
            outputFileMap[jsonBundleFilePath] = {
                filePath: jsonBundleFilePath,
                encoding: typeof outputData !== "string" ? "binary" : "utf-8",
                data: outputData
            };
        }
        if (context.outPutFileMap) {
            for (let key in outputFileMap) {
                context.outPutFileMap[key] = outputFileMap[key];
            }
        }
        else {
            context.outPutFileMap = outputFileMap;
        }
    }
    onWriteFileEnd(context) {
        Logger.systemLog(`convert-hook onWriteFileEnd 写入结束`);
    }
    _addSingleTableDtsOutputFile(config, parseResult, outputFileMap) {
        //如果值没有就不输出类型信息了
        if (!parseResult.tableObj)
            return;
        let dtsFilePath = path.join(config.clientDtsOutDir, `${parseResult.tableDefine.tableName}.d.ts`);
        if (!outputFileMap[dtsFilePath]) {
            //
            const dtsStr = this._getSingleTableDts(parseResult);
            if (dtsStr) {
                outputFileMap[dtsFilePath] = { filePath: dtsFilePath, data: dtsStr };
            }
        }
    }
    /**
     * 解析出单个配置表类型数据
     * @param parseResult
     */
    _getSingleTableDts(parseResult) {
        const tableName = parseResult.tableDefine.tableName;
        const colKeyTableFieldMap = parseResult.filedMap;
        let itemInterface = "interface IT_" + tableName + " {" + osEol;
        let tableField;
        let objTypeStrMap = {};
        for (let colKey in colKeyTableFieldMap) {
            tableField = colKeyTableFieldMap[colKey];
            if (!tableField)
                continue;
            if (!tableField.isMutiColObj) {
                //注释行
                itemInterface += "\t/** " + tableField.text + " */" + osEol;
                //字段类型声明行
                itemInterface +=
                    "\treadonly " +
                        tableField.fieldName +
                        "?: " +
                        (typeStrMap[tableField.type] ? typeStrMap[tableField.type] : tableField.type) +
                        ";" +
                        osEol;
            }
            else {
                const objFieldKey = tableField.fieldName;
                if (!objTypeStrMap[objFieldKey]) {
                    objTypeStrMap[objFieldKey] = "";
                }
                //注释行
                objTypeStrMap[objFieldKey] += "\t\t/** " + tableField.text + " */" + osEol;
                //字段类型声明行
                objTypeStrMap[objFieldKey] +=
                    "\t\treadonly " +
                        tableField.subFieldName +
                        "?: " +
                        (typeStrMap[tableField.subType] ? typeStrMap[tableField.subType] : tableField.subType) +
                        ";" +
                        osEol;
            }
        }
        //第二层对象
        for (let objFieldKey in objTypeStrMap) {
            //字段类型声明行
            itemInterface += "\treadonly " + objFieldKey + "?: {" + osEol + objTypeStrMap[objFieldKey];
            itemInterface += "\t}" + osEol;
        }
        itemInterface += "}" + osEol;
        return itemInterface;
    }
    /**
     * 添加单独导出配置表json文件
     * @param config
     * @param parseResult
     * @param outputFileMap
     */
    _addSingleTableJsonOutputFile(config, parseResult, outputFileMap) {
        const tableObj = parseResult.tableObj;
        if (!tableObj)
            return;
        const tableName = parseResult.tableDefine.tableName;
        let singleJsonFilePath = path.join(config.clientSingleTableJsonDir, `${tableName}.json`);
        let singleJsonData = JSON.stringify(tableObj, null, "\t");
        let singleOutputFileInfo = outputFileMap[singleJsonFilePath];
        if (singleOutputFileInfo) {
            singleOutputFileInfo.data = singleJsonData;
        }
        else {
            singleOutputFileInfo = {
                filePath: singleJsonFilePath,
                data: singleJsonData
            };
            outputFileMap[singleJsonFilePath] = singleOutputFileInfo;
        }
    }
    _getOneTableTypeStr(tableName) {
        return "\treadonly " + tableName + "?: " + "ITBase<" + "IT_" + tableName + ">;" + osEol;
    }
}

const valueTransFuncMap = {};
valueTransFuncMap["int"] = strToInt;
valueTransFuncMap["string"] = anyToStr;
valueTransFuncMap["[int]"] = strToIntArr;
valueTransFuncMap["[string]"] = strToStrArr;
valueTransFuncMap["json"] = strToJsonObj;
function strToIntArr(fieldItem, cellValue) {
    cellValue = (cellValue + "").replace(/，/g, ","); //为了防止策划误填，先进行转换
    cellValue = cellValue.trim();
    let intArr;
    const result = {};
    if (cellValue !== "") {
        try {
            intArr = JSON.parse(cellValue);
            result.value = intArr;
        }
        catch (error) {
            result.error = error;
        }
    }
    return result;
}
function strToStrArr(fieldItem, cellValue) {
    cellValue = (cellValue + "").replace(/，/g, ","); //为了防止策划误填，先进行转换
    cellValue = cellValue.trim();
    let result = {};
    let arr;
    if (cellValue !== "") {
        try {
            arr = JSON.parse(cellValue);
            result.value = arr;
        }
        catch (error) {
            result.error = error;
        }
    }
    return result;
}
function strToInt(fieldItem, cellValue) {
    let result = {};
    if (typeof cellValue === "string" && cellValue.trim() !== "") {
        result.value = cellValue.includes(".") ? parseFloat(cellValue) : parseInt(cellValue);
    }
    else if (typeof cellValue === "number") {
        result.value = cellValue;
    }
    return result;
}
function strToJsonObj(fieldItem, cellValue) {
    cellValue = (cellValue + "").replace(/，/g, ","); //为了防止策划误填，先进行转换
    cellValue = cellValue.trim();
    let obj;
    let error;
    if (cellValue !== "") {
        try {
            obj = JSON.parse(cellValue);
        }
        catch (err) {
            error = err;
            obj = cellValue;
        }
    }
    return { error: error, value: obj };
}
function anyToStr(fieldItem, cellValue) {
    let result = {};
    if (typeof cellValue === "string") {
        cellValue = cellValue.trim();
        if (cellValue !== "") {
            result.value = cellValue;
        }
    }
    else {
        result.value = cellValue + "";
    }
    return result;
}

function doParse(parseConfig, fileInfos, parseResultMap, parseHandler) {
    let parseResult;
    for (let i = fileInfos.length - 1; i >= 0; i--) {
        parseResult = parseResultMap[fileInfos[i].filePath];
        if (!parseResult) {
            parseResult = { filePath: fileInfos[i].filePath };
        }
        if (!parseResult.tableObj) {
            parseResult = parseHandler.parseTableFile(parseConfig, fileInfos[i], parseResult);
        }
        if (parseResult) {
            parseResultMap[fileInfos[i].filePath] = parseResult;
        }
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * 遍历文件
 * @param dirPath 文件夹路径
 * @param eachCallback 遍历回调 (filePath: string) => void
 */
function forEachFile(fileOrDirPath, eachCallback) {
    if (fs.statSync(fileOrDirPath).isDirectory()) {
        const fileNames = fs.readdirSync(fileOrDirPath);
        let childFilePath;
        for (var i = 0; i < fileNames.length; i++) {
            childFilePath = path.join(fileOrDirPath, fileNames[i]);
            forEachFile(childFilePath, eachCallback);
        }
    }
    else {
        eachCallback(fileOrDirPath);
    }
}
/**
 * 批量写入和删除文件
 * @param outputFileInfos 需要写入的文件信息数组
 * @param onProgress 进度变化回调
 * @param complete 完成回调
 */
function writeOrDeleteOutPutFiles(outputFileInfos, onProgress, complete) {
    let fileInfo;
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
            }
            else {
                if (fs.existsSync(fileInfo.filePath) && fs.statSync(fileInfo.filePath).isDirectory()) {
                    Logger.log(`路径为文件夹:${fileInfo.filePath}`, "error");
                    continue;
                }
                if (!fileInfo.encoding && typeof fileInfo.data === "string") {
                    fileInfo.encoding = "utf8";
                }
                fs.ensureFileSync(fileInfo.filePath);
                fs.writeFile(fileInfo.filePath, fileInfo.data, fileInfo.encoding ? { encoding: fileInfo.encoding } : undefined, onWriteEnd);
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
function forEachChangedFile(dir, cacheFilePath, eachCallback) {
    const gcfCache = getCacheData(cacheFilePath);
    const oldFilePaths = Object.keys(gcfCache);
    let oldFilePathIndex;
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
function writeCacheData(cacheFilePath, cacheData) {
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
function getCacheData(cacheFilePath) {
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
function getFileMd5Sync(filePath) {
    const file = fs.readFileSync(filePath, "utf-8");
    var md5um = crypto.createHash("md5");
    md5um.update(file);
    return md5um.digest("hex");
}
/**
 * 获取文件 md5
 * @param filePath
 */
function getFileMd5(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return getFileMd5Sync(filePath);
    });
}

/**
 * 转换
 * @param converConfig 解析配置
 */
function convert(converConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!converConfig.projRoot) {
            converConfig.projRoot = process.cwd();
        }
        let convertHook;
        if (converConfig.customConvertHookPath) {
            convertHook = require(converConfig.customConvertHookPath);
        }
        else {
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
        Logger.init(converConfig);
        const context = {
            convertConfig: converConfig,
        };
        //开始
        convertHook.onStart(context);
        let changedFileInfos = [];
        let deleteFileInfos = [];
        const getFileInfo = (filePath) => {
            const filePathParse = path.parse(filePath);
            const fileInfo = {
                filePath: filePath,
                fileName: filePathParse.name,
                fileExtName: filePathParse.ext,
                isDelete: false
            };
            return fileInfo;
        };
        const matchPattern = converConfig.pattern;
        const eachFileCallback = (filePath, isDelete) => {
            const fileInfo = getFileInfo(filePath);
            let canRead;
            if (isDelete) {
                deleteFileInfos.push(fileInfo);
            }
            else {
                canRead = mmatch.all(fileInfo.filePath, matchPattern);
                if (canRead) {
                    changedFileInfos.push(fileInfo);
                }
            }
            return { fileInfo, canRead };
        };
        let parseResultMap = {};
        //缓存处理
        let cacheFileDirPath = converConfig.cacheFileDirPath;
        let parseResultMapCacheFilePath;
        if (!converConfig.useCache) {
            forEachFile(tableFileDir, eachFileCallback);
        }
        else {
            if (!cacheFileDirPath)
                cacheFileDirPath = ".cache";
            if (!path.isAbsolute(cacheFileDirPath)) {
                cacheFileDirPath = path.join(converConfig.projRoot, cacheFileDirPath);
            }
            parseResultMapCacheFilePath = path.join(cacheFileDirPath, ".egfprmc");
            parseResultMap = getCacheData(parseResultMapCacheFilePath);
            if (!parseResultMap) {
                parseResultMap = {};
            }
            const oldFilePaths = Object.keys(parseResultMap);
            let oldFilePathIndex;
            let parseResult;
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
        let parseHandler;
        if (converConfig.customParseHandlerPath) {
            parseHandler = require(converConfig.customParseHandlerPath);
            if (!parseHandler || typeof parseHandler.parseTableFile !== "function") {
                console.error(`自定义解析实现错误:${converConfig.customParseHandlerPath}`);
                return;
            }
        }
        else {
            parseHandler = new DefaultParseHandler();
        }
        //解析开始之前
        context.parseResultMap = parseResultMap;
        context.deleteFileInfos = deleteFileInfos;
        context.changedFileInfos = changedFileInfos;
        convertHook.onParseBefore(context);
        if (changedFileInfos.length > converConfig.threadParseFileMaxNum && converConfig.useMultiThread) {
            let logStr = "";
            const count = Math.floor(changedFileInfos.length / converConfig.threadParseFileMaxNum) + 1;
            let worker;
            let subFileInfos;
            let completeCount = 0;
            const t1 = new Date().getTime();
            const onWorkerParseEnd = (data) => {
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
                    onParseEnd(context, parseResultMapCacheFilePath, convertHook, logStr);
                }
            };
            for (let i = 0; i < count; i++) {
                subFileInfos = changedFileInfos.splice(0, converConfig.threadParseFileMaxNum);
                Logger.log(`----------------线程开始:${i}-----------------`);
                worker = new worker_threads.Worker(path.join(path.dirname(__filename), "../../../worker_scripts/worker.js"), {
                    workerData: {
                        threadId: i,
                        fileInfos: subFileInfos,
                        parseResultMap: parseResultMap,
                        parseConfig: converConfig
                    }
                });
                worker.on("message", onWorkerParseEnd);
            }
        }
        else {
            const t1 = new Date().getTime();
            doParse(converConfig, changedFileInfos, parseResultMap, parseHandler);
            const t2 = new Date().getTime();
            Logger.systemLog(`[单线程导表时间]:${t2 - t1}`);
            onParseEnd(context, parseResultMapCacheFilePath, convertHook);
        }
    });
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
function onParseEnd(context, parseResultMapCacheFilePath, convertHook, logStr) {
    return __awaiter(this, void 0, void 0, function* () {
        const convertConfig = context.convertConfig;
        const parseResultMap = context.parseResultMap;
        //写入解析缓存
        if (convertConfig.useCache) {
            writeCacheData(parseResultMapCacheFilePath, parseResultMap);
        }
        //解析结束，做导出处理
        convertHook.onParseAfter(context);
        if (context.outPutFileMap) {
            const outputFileMap = context.outPutFileMap;
            const outputFiles = Object.values(outputFileMap);
            //写入和删除文件处理
            Logger.systemLog(`开始写入文件:0/${outputFiles.length}`);
            yield new Promise((res) => {
                writeOrDeleteOutPutFiles(outputFiles, (filePath, total, now, isOk) => {
                    Logger.log(`[写入文件] 进度:(${now}/${total}) 路径:${filePath}`);
                }, () => {
                    res();
                });
            });
            Logger.systemLog(`写入结束~`);
        }
        else {
            Logger.systemLog(`没有可写入文件~`);
        }
        //日志文件
        if (!logStr) {
            logStr = Logger.logStr;
        }
        const outputLogFileInfo = {
            filePath: path.join(process.cwd(), "excel2all.log"),
            data: logStr
        };
        writeOrDeleteOutPutFiles([outputLogFileInfo]);
        //写入结束
        convertHook.onWriteFileEnd(context);
    });
}
/**
 * 测试文件匹配
 * @param converConfig
 */
function testFileMatch(converConfig) {
    if (!converConfig.projRoot) {
        converConfig.projRoot = process.cwd();
    }
    if (converConfig.customConvertHookPath) {
        require(converConfig.customConvertHookPath);
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
    const changedFilePaths = [];
    const eachFileCallback = (filePath, isDelete) => {
        let canRead;
        if (isDelete) ;
        else {
            canRead = mmatch.all(filePath, matchPattern);
            if (canRead) {
                changedFilePaths.push(filePath);
            }
        }
        return { canRead };
    };
    let cacheFileDirPath = converConfig.cacheFileDirPath;
    let parseResultMapCacheFilePath;
    let parseResultMap;
    if (!converConfig.useCache) {
        forEachFile(tableFileDir, eachFileCallback);
    }
    else {
        if (!cacheFileDirPath)
            cacheFileDirPath = ".cache";
        if (!path.isAbsolute(cacheFileDirPath)) {
            cacheFileDirPath = path.join(converConfig.projRoot, cacheFileDirPath);
        }
        parseResultMapCacheFilePath = path.join(cacheFileDirPath, ".egfprmc");
        parseResultMap = getCacheData(parseResultMapCacheFilePath);
        if (!parseResultMap) {
            parseResultMap = {};
        }
        const oldFilePaths = Object.keys(parseResultMap);
        let oldFilePathIndex;
        let parseResult;
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

/**
 * 是否为空表格格子
 * @param cell
 */
function isEmptyCell(cell) {
    if (cell && cell.v !== undefined) {
        if (typeof cell.v === "string") {
            return cell.v === "";
        }
        else if (typeof cell.v === "number") {
            return isNaN(cell.v);
        }
        else {
            return false;
        }
    }
    else {
        return true;
    }
}
/**
 * 字母Z的编码
 */
const ZCharCode = 90;
/**
 * 字母A的编码
 *
 */
const ACharCode = 65;
/**
 * 根据当前列的charCodes获取下一列Key
 * @param charCodes
 */
function getNextColKey(charCodes) {
    let isAdd;
    for (let i = charCodes.length - 1; i >= 0; i--) {
        if (charCodes[i] < ZCharCode) {
            charCodes[i] += 1;
            isAdd = true;
            break;
        }
        else if (charCodes[i] === ZCharCode) {
            charCodes[i] = ACharCode;
        }
    }
    if (!isAdd) {
        charCodes.push(ACharCode);
    }
    return charCodesToString(charCodes);
}
/**
 * 列的字符编码数组转字符串
 * @param charCodes
 */
function charCodesToString(charCodes) {
    return String.fromCharCode(...charCodes);
}
/**
 * 字符串转编码数组
 * @param colKey
 */
function stringToCharCodes(colKey) {
    const charCodes = [];
    for (let i = 0; i < colKey.length; i++) {
        charCodes.push(colKey.charCodeAt(i));
    }
    return charCodes;
}
/**
 * 纵向遍历表格
 * @param sheet xlsx表格对象
 * @param startRow 开始行 从1开始
 * @param startCol 列字符 比如A B
 * @param callback 遍历回调 (sheet: xlsx.Sheet, colKey: string, rowIndex: number) => void
 * @param isSheetRowEnd 是否行结束判断方法
 * @param isSheetColEnd 是否列结束判断方法
 * @param isSkipSheetRow 是否跳过行
 * @param isSkipSheetCol 是否跳过列
 */
function verticalForEachSheet(sheet, startRow, startCol, callback, isSheetRowEnd, isSheetColEnd, isSkipSheetRow, isSkipSheetCol) {
    const sheetRef = sheet["!ref"];
    const maxRowNum = parseInt(sheetRef.match(/\d+$/)[0]);
    const maxColKey = sheetRef.split(":")[1].match(/^[A-Za-z]+/)[0];
    let maxColKeyCodeSum = getCharCodeSum(maxColKey);
    let colCharCodes;
    let colKey;
    let curColCodeSum = 0;
    const startCharcodes = stringToCharCodes(startCol);
    for (let i = startRow; i <= maxRowNum; i++) {
        if (isSheetRowEnd ? isSheetRowEnd(sheet, i) : false)
            break;
        if (isSkipSheetRow ? isSkipSheetRow(sheet, i) : false)
            continue;
        colCharCodes = startCharcodes.concat([]);
        colKey = startCol;
        let hasNextCol = isSheetColEnd ? !isSheetColEnd(sheet, colKey) : true;
        while (hasNextCol) {
            if (!(isSkipSheetCol ? isSkipSheetCol(sheet, colKey) : false)) {
                callback(sheet, colKey, i);
            }
            colKey = getNextColKey(colCharCodes);
            curColCodeSum = getCharCodeSum(colKey);
            if (maxColKeyCodeSum >= curColCodeSum) {
                hasNextCol = isSheetColEnd ? !isSheetColEnd(sheet, colKey) : true;
            }
            else {
                hasNextCol = false;
            }
        }
    }
}
/**
 * 横向遍历表格
 * @param sheet xlsx表格对象
 * @param startRow 开始行 从1开始
 * @param startCol 列字符 比如A B
 * @param callback 遍历回调 (sheet: xlsx.Sheet, colKey: string, rowIndex: number) => void
 * @param isSheetRowEnd 是否行结束判断方法
 * @param isSheetColEnd 是否列结束判断方法
 * @param isSkipSheetRow 是否跳过行
 * @param isSkipSheetCol 是否跳过列
 */
function horizontalForEachSheet(sheet, startRow, startCol, callback, isSheetRowEnd, isSheetColEnd, isSkipSheetRow, isSkipSheetCol) {
    const sheetRef = sheet["!ref"];
    const maxRowNum = parseInt(sheetRef.match(/\d+$/)[0]);
    const maxColKey = sheetRef.split(":")[1].match(/^[A-Za-z]+/)[0];
    const maxColKeyCodeSum = getCharCodeSum(maxColKey);
    let colCharCodes;
    let colKey;
    colCharCodes = stringToCharCodes(startCol);
    let curColCodeSum = 0;
    colKey = startCol;
    let hasNextCol = isSheetColEnd ? !isSheetColEnd(sheet, colKey) : true;
    while (hasNextCol) {
        if (!(isSkipSheetCol ? isSkipSheetCol(sheet, colKey) : false)) {
            for (let i = startRow; i <= maxRowNum; i++) {
                if (isSheetRowEnd ? isSheetRowEnd(sheet, i) : false)
                    break;
                if (isSkipSheetRow ? isSkipSheetRow(sheet, i) : false)
                    continue;
                callback(sheet, colKey, i);
            }
        }
        colKey = getNextColKey(colCharCodes);
        curColCodeSum = getCharCodeSum(colKey);
        if (maxColKeyCodeSum >= curColCodeSum) {
            hasNextCol = isSheetColEnd ? !isSheetColEnd(sheet, colKey) : true;
        }
        else {
            hasNextCol = false;
        }
    }
}
let colKeySumMap = {};
function getCharCodeSum(colKey) {
    let sum = colKeySumMap[colKey];
    if (!sum) {
        sum = 0;
        for (let i = 0; i < colKey.length; i++) {
            sum += colKey.charCodeAt(i);
        }
        colKeySumMap[colKey] = sum;
    }
    return sum;
}
/**
 * 读取配置表文件 同步的
 * @param fileInfo
 */
function readTableFile(fileInfo) {
    const workBook = xlsx.readFile(fileInfo.filePath, { type: isCSV(fileInfo.fileExtName) ? "string" : "file" });
    return workBook;
}
/**
 * 根据文件名后缀判断是否为csv文件
 * @param fileExtName
 */
function isCSV(fileExtName) {
    return fileExtName === "csv";
}

(function (TableType) {
    TableType["vertical"] = "vertical";
    TableType["horizontal"] = "horizontal";
})(exports.TableType || (exports.TableType = {}));
class DefaultParseHandler {
    constructor() {
        this._valueTransFuncMap = valueTransFuncMap;
    }
    getTableDefine(fileInfo, workBook) {
        //取表格文件名为表格名
        const tableName = fileInfo.fileName;
        const tableDefine = {
            tableName: tableName
        };
        let cellKey;
        let cellObj;
        //取第一个表
        const sheetNames = workBook.SheetNames;
        let sheet;
        let firstCellValue;
        let firstCellObj;
        for (let i = 0; i < sheetNames.length; i++) {
            sheet = workBook.Sheets[sheetNames[i]];
            firstCellObj = sheet["A" + 1];
            if (!isEmptyCell(firstCellObj)) {
                firstCellValue = this._getFirstCellValue(firstCellObj);
                if (firstCellValue && firstCellValue.tableNameInSheet === tableName) {
                    break;
                }
            }
        }
        if (!firstCellValue || firstCellValue.tableNameInSheet !== tableName) {
            Logger.log(`表格不规范,跳过解析,路径:${fileInfo.filePath}`, "error");
            return null;
        }
        tableDefine.tableType = firstCellValue.tableType;
        if (tableDefine.tableType === exports.TableType.vertical) {
            tableDefine.verticalFieldDefine = {};
            const verticalFieldDefine = tableDefine.verticalFieldDefine;
            verticalFieldDefine.textRow = 1;
            for (let i = 1; i < 100; i++) {
                cellKey = "A" + i;
                cellObj = sheet[cellKey];
                if (isEmptyCell(cellObj) || cellObj.v === "NO" || cellObj.v === "END" || cellObj.v === "START") {
                    tableDefine.startRow = i;
                }
                else if (cellObj.v === "CLIENT") {
                    verticalFieldDefine.fieldRow = i;
                }
                else if (cellObj.v === "TYPE") {
                    verticalFieldDefine.typeRow = i;
                }
                if (tableDefine.startRow && verticalFieldDefine.fieldRow && verticalFieldDefine.typeRow)
                    break;
            }
            tableDefine.startCol = "B";
        }
        else if (tableDefine.tableType === exports.TableType.horizontal) {
            tableDefine.horizontalFieldDefine = {};
            const horizontalFieldDefine = tableDefine.horizontalFieldDefine;
            horizontalFieldDefine.textCol = "A";
            horizontalFieldDefine.typeCol = "B";
            horizontalFieldDefine.fieldCol = "C";
            tableDefine.startCol = "E";
            tableDefine.startRow = 2;
        }
        return tableDefine;
    }
    _getFirstCellValue(firstCellObj) {
        if (!firstCellObj)
            return;
        const cellValues = firstCellObj.v.split(":");
        let tableNameInSheet;
        let tableType;
        if (cellValues.length > 1) {
            tableNameInSheet = cellValues[1];
            tableType = cellValues[0] === "H" ? exports.TableType.horizontal : exports.TableType.vertical;
        }
        else {
            tableNameInSheet = cellValues[0];
            tableType = exports.TableType.vertical;
        }
        return { tableNameInSheet: tableNameInSheet, tableType: tableType };
    }
    /**
     * 判断表格是否能解析
     * @param sheet
     */
    checkSheetCanParse(tableDefine, sheet, sheetName) {
        //如果这个表个第一格值不等于表名，则不解析
        const firstCellObj = sheet["A" + 1];
        const firstCellValue = this._getFirstCellValue(firstCellObj);
        if (firstCellObj && tableDefine) {
            if (firstCellValue.tableNameInSheet !== tableDefine.tableName) {
                return false;
            }
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * 表行结束判断
     * @param tableDefine
     * @param sheet
     * @param row
     */
    isSheetRowEnd(tableDefine, sheet, row) {
        // if (tableDefine.tableType === TableType.vertical) {
        // } else if (tableDefine.tableType === TableType.horizontal) {
        // }
        //判断上一行的标志是否为END
        if (row > 1) {
            row = row - 1;
            const cellObj = sheet["A" + row];
            return cellObj && cellObj.v === "END";
        }
        else {
            return false;
        }
    }
    /**
     * 表列结束判断
     * @param tableDefine
     * @param sheet
     * @param colKey
     */
    isSheetColEnd(tableDefine, sheet, colKey) {
        //判断这一列第一行是否为空
        const firstCellObj = sheet[colKey + 1];
        // const typeCellObj: xlsx.CellObject = sheet[colKey + tableFile.tableDefine.typeRow];
        return isEmptyCell(firstCellObj);
    }
    /**
     * 检查行是否需要解析
     * @param tableDefine
     * @param sheet
     * @param rowIndex
     */
    checkRowNeedParse(tableDefine, sheet, rowIndex) {
        const cellObj = sheet["A" + rowIndex];
        if (cellObj && cellObj.v === "NO") {
            return false;
        }
        return true;
    }
    /**
     * 解析单个格子
     * @param tableParseResult
     * @param sheet
     * @param colKey
     * @param rowIndex
     * @param isNewRowOrCol 是否为新的一行或者一列
     */
    parseVerticalCell(tableParseResult, sheet, colKey, rowIndex, isNewRowOrCol) {
        const fieldInfo = this.getVerticalTableField(tableParseResult, sheet, colKey, rowIndex);
        if (!fieldInfo)
            return;
        const cell = sheet[colKey + rowIndex];
        if (isEmptyCell(cell)) {
            return;
        }
        const transResult = this.transValue(tableParseResult, fieldInfo, cell.v);
        if (transResult.error) {
            Logger.log(`表格:${tableParseResult.filePath},分表:${tableParseResult.curSheetName},行:${rowIndex},列：${colKey}解析出错`, "error");
            Logger.log(transResult.error, "error");
        }
        const transedValue = transResult.value;
        let mainKeyFieldName = tableParseResult.mainKeyFieldName;
        if (!mainKeyFieldName) {
            //第一个字段就是主键
            mainKeyFieldName = fieldInfo.fieldName;
            tableParseResult.mainKeyFieldName = fieldInfo.fieldName;
            tableParseResult.tableObj = {};
        }
        let rowOrColObj = tableParseResult.curRowOrColObj;
        if (isNewRowOrCol) {
            //新的一行
            rowOrColObj = {};
            tableParseResult.curRowOrColObj = tableParseResult.tableObj[transedValue] = rowOrColObj;
        }
        if (fieldInfo.isMutiColObj) {
            let subObj = rowOrColObj[fieldInfo.fieldName];
            if (!subObj) {
                subObj = {};
                rowOrColObj[fieldInfo.fieldName] = subObj;
            }
            subObj[fieldInfo.subFieldName] = transedValue;
        }
        else {
            rowOrColObj[fieldInfo.fieldName] = transedValue;
        }
    }
    /**
     * 解析横向单个格子
     * @param tableParseResult
     * @param sheet
     * @param colKey
     * @param rowIndex
     * @param isNewRowOrCol 是否为新的一行或者一列
     */
    parseHorizontalCell(tableParseResult, sheet, colKey, rowIndex, isNewRowOrCol) {
        const fieldInfo = this.getHorizontalTableField(tableParseResult, sheet, colKey, rowIndex);
        if (!fieldInfo)
            return;
        const cell = sheet[colKey + rowIndex];
        if (isEmptyCell(cell)) {
            return;
        }
        const transResult = this.transValue(tableParseResult, fieldInfo, cell.v);
        if (transResult.error) {
            Logger.log(`表格:${tableParseResult.filePath},分表:${tableParseResult.curSheetName},行:${rowIndex},列：${colKey}解析出错`, "error");
            Logger.log(transResult.error, "error");
        }
        const transedValue = transResult.value;
        if (!tableParseResult.tableObj) {
            tableParseResult.tableObj = {};
        }
        if (fieldInfo.isMutiColObj) {
            let subObj = tableParseResult.tableObj[fieldInfo.fieldName];
            if (!subObj) {
                subObj = {};
                tableParseResult.tableObj[fieldInfo.fieldName] = subObj;
            }
            subObj[fieldInfo.subFieldName] = transedValue;
        }
        else {
            tableParseResult.tableObj[fieldInfo.fieldName] = transedValue;
        }
    }
    /**
     * 解析出字段对象
     * @param tableParseResult
     * @param sheet
     * @param colKey
     * @param rowIndex
     */
    getVerticalTableField(tableParseResult, sheet, colKey, rowIndex) {
        const tableDefine = tableParseResult.tableDefine;
        let tableFiledMap = tableParseResult.filedMap;
        if (!tableFiledMap) {
            tableFiledMap = {};
            tableParseResult.filedMap = tableFiledMap;
        }
        const verticalFieldDefine = tableDefine.verticalFieldDefine;
        const filedCell = sheet[colKey + verticalFieldDefine.fieldRow];
        let originFieldName;
        if (!isEmptyCell(filedCell)) {
            originFieldName = filedCell.v;
        }
        if (!originFieldName)
            return null;
        let field = {};
        //缓存
        if (tableFiledMap[originFieldName] !== undefined) {
            return tableFiledMap[originFieldName];
        }
        //注释
        const textCell = sheet[colKey + verticalFieldDefine.textRow];
        if (!isEmptyCell(textCell)) {
            field.text = textCell.v;
        }
        //类型
        let isObjType = false;
        const typeCell = sheet[colKey + verticalFieldDefine.typeRow];
        if (isEmptyCell(typeCell)) {
            return null;
        }
        else {
            field.originType = typeCell.v;
            if (field.originType.includes("mf:")) {
                const typeStrs = field.originType.split(":");
                if (typeStrs.length < 3) {
                    return null;
                }
                field.type = typeStrs[2];
                isObjType = true;
            }
            else {
                field.type = field.originType;
            }
        }
        field.isMutiColObj = isObjType;
        //字段名
        field.originFieldName = originFieldName;
        if (isObjType) {
            const fieldStrs = field.originFieldName.split(":");
            if (fieldStrs.length < 2) {
                return null;
            }
            field.fieldName = fieldStrs[0];
            field.subFieldName = fieldStrs[1];
        }
        else {
            field.fieldName = field.originFieldName;
        }
        tableFiledMap[colKey] = field;
        return field;
    }
    getHorizontalTableField(tableParseResult, sheet, colKey, rowIndex) {
        const tableDefine = tableParseResult.tableDefine;
        let tableFiledMap = tableParseResult.filedMap;
        if (!tableFiledMap) {
            tableFiledMap = {};
            tableParseResult.filedMap = tableFiledMap;
        }
        const hFieldDefine = tableDefine.horizontalFieldDefine;
        const fieldNameCell = sheet[hFieldDefine.fieldCol + rowIndex];
        let originFieldName;
        if (!isEmptyCell(fieldNameCell)) {
            originFieldName = fieldNameCell.v;
        }
        if (!originFieldName)
            return null;
        if (tableFiledMap[originFieldName] !== undefined) {
            return tableFiledMap[originFieldName];
        }
        let field = {};
        const textCell = sheet[hFieldDefine.textCol + rowIndex];
        //注释
        if (!isEmptyCell(textCell)) {
            field.text = textCell.v;
        }
        let isObjType = false;
        //类型
        const typeCell = sheet[hFieldDefine.typeCol + rowIndex];
        if (isEmptyCell(typeCell)) {
            return null;
        }
        else {
            //处理类型
            field.originType = typeCell.v;
            if (field.originType.includes("mf:")) {
                const typeStrs = field.originType.split(":");
                if (typeStrs.length < 3) {
                    return null;
                }
                field.type = typeStrs[2];
                isObjType = true;
            }
            else {
                field.type = field.originType;
            }
        }
        field.isMutiColObj = isObjType;
        field.originFieldName = originFieldName;
        if (isObjType) {
            const fieldStrs = field.originFieldName.split(":");
            if (fieldStrs.length < 2) {
                return null;
            }
            field.fieldName = fieldStrs[0];
            field.subFieldName = fieldStrs[1];
        }
        else {
            field.fieldName = field.originFieldName;
        }
        tableFiledMap[originFieldName] = field;
        return field;
    }
    /**
     * 检查列是否需要解析
     * @param tableDefine
     * @param sheet
     * @param colKey
     */
    checkColNeedParse(tableDefine, sheet, colKey) {
        // 如果类型或者则不需要解析
        if (tableDefine.tableType === exports.TableType.vertical) {
            const verticalFieldDefine = tableDefine.verticalFieldDefine;
            const typeCellObj = sheet[colKey + verticalFieldDefine.typeRow];
            const fieldCellObj = sheet[colKey + verticalFieldDefine.fieldRow];
            if (isEmptyCell(typeCellObj) || isEmptyCell(fieldCellObj)) {
                return false;
            }
            else {
                return true;
            }
        }
        else if (tableDefine.tableType === exports.TableType.horizontal) {
            const cellObj = sheet[colKey + 1];
            if (isEmptyCell(cellObj)) {
                return false;
            }
            else {
                return true;
            }
        }
    }
    /**
     * 转换表格的值
     * @param parseResult
     * @param filedItem
     * @param cellValue
     */
    transValue(parseResult, filedItem, cellValue) {
        let transResult;
        let transFunc = this._valueTransFuncMap[filedItem.type];
        if (!transFunc) {
            transFunc = this._valueTransFuncMap["json"];
        }
        transResult = transFunc(filedItem, cellValue);
        return transResult;
    }
    /**
     * 解析配置表文件
     * @param parseConfig 解析配置
     * @param fileInfo 文件信息
     * @param parseResult 解析结果
     */
    parseTableFile(parseConfig, fileInfo, parseResult) {
        const workbook = readTableFile(fileInfo);
        if (!workbook.SheetNames.length)
            return;
        const sheetNames = workbook.SheetNames;
        const tableDefine = this.getTableDefine(fileInfo, workbook);
        for (let i = 0; i < sheetNames.length; i++) { }
        if (!tableDefine)
            return null;
        let sheetName;
        let sheet;
        const isSheetRowEnd = this.isSheetRowEnd.bind(null, tableDefine);
        const isSheetColEnd = this.isSheetColEnd.bind(null, tableDefine);
        const isSkipSheetRow = (sheet, rowIndex) => {
            return !this.checkRowNeedParse(tableDefine, sheet, rowIndex);
        };
        const isSkipSheetCol = (sheet, colKey) => {
            return !this.checkColNeedParse(tableDefine, sheet, colKey);
        };
        let cellObj;
        parseResult.tableDefine = tableDefine;
        for (let i = 0; i < sheetNames.length; i++) {
            sheetName = sheetNames[i];
            sheet = workbook.Sheets[sheetName];
            if (!this.checkSheetCanParse(tableDefine, sheet, sheetName)) {
                continue;
            }
            parseResult.curSheetName = sheetName;
            Logger.log(`解析:${fileInfo.filePath}=> sheet:${sheetName} ....`);
            if (tableDefine.tableType === exports.TableType.vertical) {
                let lastRowIndex;
                verticalForEachSheet(sheet, tableDefine.startRow, tableDefine.startCol, (sheet, colKey, rowIndex) => {
                    let isNewRowOrCol = false;
                    if (lastRowIndex !== rowIndex) {
                        lastRowIndex = rowIndex;
                        isNewRowOrCol = true;
                    }
                    cellObj = sheet[colKey + rowIndex];
                    if (!isEmptyCell(cellObj)) {
                        this.parseVerticalCell(parseResult, sheet, colKey, rowIndex, isNewRowOrCol);
                    }
                }, isSheetRowEnd, isSheetColEnd, isSkipSheetRow, isSkipSheetCol);
            }
            else if (tableDefine.tableType === exports.TableType.horizontal) {
                let lastColKey;
                horizontalForEachSheet(sheet, tableDefine.startRow, tableDefine.startCol, (sheet, colKey, rowIndex) => {
                    let isNewRowOrCol = false;
                    if (lastColKey !== colKey) {
                        lastColKey = colKey;
                        isNewRowOrCol = true;
                    }
                    cellObj = sheet[colKey + rowIndex];
                    if (!isEmptyCell(cellObj)) {
                        this.parseHorizontalCell(parseResult, sheet, colKey, rowIndex, isNewRowOrCol);
                    }
                }, isSheetRowEnd, isSheetColEnd, isSkipSheetRow, isSkipSheetCol);
            }
        }
        return parseResult;
    }
}

exports.ACharCode = ACharCode;
exports.DefaultConvertHook = DefaultConvertHook;
exports.DefaultParseHandler = DefaultParseHandler;
exports.Logger = Logger;
exports.ZCharCode = ZCharCode;
exports.charCodesToString = charCodesToString;
exports.convert = convert;
exports.doParse = doParse;
exports.forEachChangedFile = forEachChangedFile;
exports.forEachFile = forEachFile;
exports.getCacheData = getCacheData;
exports.getFileMd5 = getFileMd5;
exports.getFileMd5Sync = getFileMd5Sync;
exports.getNextColKey = getNextColKey;
exports.horizontalForEachSheet = horizontalForEachSheet;
exports.isCSV = isCSV;
exports.isEmptyCell = isEmptyCell;
exports.readTableFile = readTableFile;
exports.stringToCharCodes = stringToCharCodes;
exports.testFileMatch = testFileMatch;
exports.valueTransFuncMap = valueTransFuncMap;
exports.verticalForEachSheet = verticalForEachSheet;
exports.writeCacheData = writeCacheData;
exports.writeOrDeleteOutPutFiles = writeOrDeleteOutPutFiles;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9nZXQtb3MtZW9sLnRzIiwiLi4vLi4vLi4vc3JjL2xvZ2VyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtY29udmVydC1ob29rLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdmFsdWUtZnVuYy1tYXAudHMiLCIuLi8uLi8uLi9zcmMvZG8tcGFyc2UudHMiLCIuLi8uLi8uLi9zcmMvZmlsZS11dGlscy50cyIsIi4uLy4uLy4uL3NyYy9jb252ZXJ0LnRzIiwiLi4vLi4vLi4vc3JjL3RhYmxlLXV0aWxzLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtcGFyc2UtaGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBvcyBmcm9tIFwib3NcIjtcbmNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbi8qKuW9k+WJjeezu+e7n+ihjOWwviAgcGxhdGZvcm0gPT09IFwid2luMzJcIiA/IFwiXFxuXCIgOiBcIlxcclxcblwiOyovXG5leHBvcnQgY29uc3Qgb3NFb2wgPSBwbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiID8gXCJcXG5cIiA6IFwiXFxyXFxuXCI7XG4iLCJpbXBvcnQgeyBvc0VvbCB9IGZyb20gXCIuL2dldC1vcy1lb2xcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmVudW0gTG9nTGV2ZWxFbnVtIHtcbiAgICBpbmZvLFxuICAgIHdhcm4sXG4gICAgZXJyb3IsXG4gICAgbm9cbn1cbmV4cG9ydCBjbGFzcyBMb2dnZXIge1xuICAgIHByaXZhdGUgc3RhdGljIF9lbmFibGVPdXRQdXRMb2dGaWxlOiBib29sZWFuO1xuICAgIHByaXZhdGUgc3RhdGljIF9sb2dMZXZlbDogTG9nTGV2ZWxFbnVtO1xuICAgIHByaXZhdGUgc3RhdGljIF9sb2dTdHI6IHN0cmluZyA9IFwiXCI7XG4gICAgcHVibGljIHN0YXRpYyBpbml0KHBhcnNlQ29uZmlnOiBJVGFibGVDb252ZXJ0Q29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGxldmVsOiBMb2dMZXZlbCA9IHBhcnNlQ29uZmlnLmxvZ0xldmVsID8gcGFyc2VDb25maWcubG9nTGV2ZWwgOiBcImluZm9cIjtcbiAgICAgICAgdGhpcy5fbG9nTGV2ZWwgPSBMb2dMZXZlbEVudW1bbGV2ZWxdO1xuICAgICAgICB0aGlzLl9lbmFibGVPdXRQdXRMb2dGaWxlID0gcGFyc2VDb25maWcub3V0cHV0TG9nRmlsZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHBhcnNlQ29uZmlnLm91dHB1dExvZ0ZpbGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOi+k+WHuuaXpeW/lyzml6Xlv5fnrYnnuqflj6rmmK/pmZDliLbkuobmjqfliLblj7DovpPlh7rvvIzkvYbkuI3pmZDliLbml6Xlv5forrDlvZVcbiAgICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgICAqIEBwYXJhbSBsZXZlbFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbG9nKG1lc3NhZ2U6IHN0cmluZywgbGV2ZWw6IExvZ0xldmVsID0gXCJpbmZvXCIpIHtcbiAgICAgICAgaWYgKGxldmVsICE9PSBcIm5vXCIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9sb2dMZXZlbCA8PSBMb2dMZXZlbEVudW1bbGV2ZWxdKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImluZm9cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3YXJuXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2VuYWJsZU91dFB1dExvZ0ZpbGUpIHJldHVybjtcbiAgICAgICAgdGhpcy5fbG9nU3RyICs9IG1lc3NhZ2UgKyBvc0VvbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog57O757uf5pel5b+X6L6T5Ye6XG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBzeXN0ZW1Mb2cobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICBpZiAoIXRoaXMuX2VuYWJsZU91dFB1dExvZ0ZpbGUpIHJldHVybjtcbiAgICAgICAgdGhpcy5fbG9nU3RyICs9IG1lc3NhZ2UgKyBvc0VvbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6L+U5Zue5pel5b+X5pWw5o2u5bm25riF56m6XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXQgbG9nU3RyKCk6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy5fZW5hYmxlT3V0UHV0TG9nRmlsZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IGxvZ1N0ciA9IHRoaXMuX2xvZ1N0cjtcbiAgICAgICAgdGhpcy5fbG9nU3RyID0gXCJcIjsgLy/muIXnqbpcbiAgICAgICAgcmV0dXJuIGxvZ1N0cjtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBUYWJsZVR5cGUgfSBmcm9tIFwiLi9kZWZhdWx0LXBhcnNlLWhhbmRsZXJcIjtcbmltcG9ydCB7IGRlZmxhdGVTeW5jIH0gZnJvbSBcInpsaWJcIjtcbmltcG9ydCB7IG9zRW9sIH0gZnJvbSBcIi4vZ2V0LW9zLWVvbFwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi9sb2dlcic7XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgLyoqXG4gICAgICog6L6T5Ye66YWN572uXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElPdXRwdXRDb25maWcge1xuICAgICAgICAvKirljZXkuKrphY3nva7ooahqc29u6L6T5Ye655uu5b2V6Lev5b6EICovXG4gICAgICAgIGNsaWVudFNpbmdsZVRhYmxlSnNvbkRpcj86IHN0cmluZztcbiAgICAgICAgLyoq5ZCI5bm26YWN572u6KGoanNvbuaWh+S7tui3r+W+hCjljIXlkKvmlofku7blkI0s5q+U5aaCIC4vb3V0L2J1bmRsZS5qc29uKSAqL1xuICAgICAgICBjbGllbnRCdW5kbGVKc29uT3V0UGF0aD86IHN0cmluZztcbiAgICAgICAgLyoq5piv5ZCm5qC85byP5YyW5ZCI5bm25ZCO55qEanNvbu+8jOm7mOiupOS4jSAqL1xuICAgICAgICBpc0Zvcm1hdEJ1bmRsZUpzb24/OiBib29sZWFuO1xuICAgICAgICAvKirmmK/lkKbnlJ/miJDlo7DmmI7mlofku7bvvIzpu5jorqTkuI3ovpPlh7ogKi9cbiAgICAgICAgaXNHZW5EdHM/OiBib29sZWFuO1xuICAgICAgICAvKirlo7DmmI7mlofku7bovpPlh7rnm67lvZUo5q+P5Liq6YWN572u6KGo5LiA5Liq5aOw5piOKe+8jOm7mOiupOS4jei+k+WHuiAqL1xuICAgICAgICBjbGllbnREdHNPdXREaXI/OiBzdHJpbmc7XG4gICAgICAgIC8qKuaYr+WQpuWQiOW5tuaJgOacieWjsOaYjuS4uuS4gOS4quaWh+S7tizpu5jorqR0cnVlICovXG4gICAgICAgIGlzQnVuZGxlRHRzPzogYm9vbGVhbjtcbiAgICAgICAgLyoq5ZCI5bm25ZCO55qE5aOw5piO5paH5Lu25ZCNLOWmguaenOayoeacieWImem7mOiupOS4unRhYmxlTWFwICovXG4gICAgICAgIGJ1bmRsZUR0c0ZpbGVOYW1lPzogc3RyaW5nO1xuICAgICAgICAvKirmmK/lkKblsIZqc29u5qC85byP5Y6L57ypLOm7mOiupOWQpizlh4/lsJFqc29u5a2X5q615ZCN5a2X56ymLOaViOaenOi+g+WwjyAqL1xuICAgICAgICBpc0NvbXByZXNzPzogYm9vbGVhbjtcbiAgICAgICAgLyoq5piv5ZCmWmlw5Y6L57ypLOS9v+eUqHpsaWIgKi9cbiAgICAgICAgaXNaaXA/OiBib29sZWFuO1xuICAgIH1cbn1cbi8qKuexu+Wei+Wtl+espuS4suaYoOWwhOWtl+WFuCAqL1xuY29uc3QgdHlwZVN0ck1hcCA9IHsgaW50OiBcIm51bWJlclwiLCBqc29uOiBcImFueVwiLCBcIltpbnRdXCI6IFwibnVtYmVyW11cIiwgXCJbc3RyaW5nXVwiOiBcInN0cmluZ1tdXCIgfTtcbmV4cG9ydCBjbGFzcyBEZWZhdWx0Q29udmVydEhvb2sgaW1wbGVtZW50cyBJQ29udmVydEhvb2sge1xuICAgIG9uU3RhcnQ/KGNvbnRleHQ6IElDb252ZXJ0Q29udGV4dCk6IHZvaWQge1xuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGBjb252ZXJ0LWhvb2sgb25TdGFydGApXG4gICAgfVxuICAgIG9uUGFyc2VCZWZvcmU/KGNvbnRleHQ6IElDb252ZXJ0Q29udGV4dCk6IHZvaWQge1xuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGBjb252ZXJ0LWhvb2sgb25QYXJzZUJlZm9yZWApO1xuICAgIH1cbiAgICBvblBhcnNlQWZ0ZXI/KGNvbnRleHQ6IElDb252ZXJ0Q29udGV4dCk6IHZvaWQge1xuICAgICAgICBjb25zdCBjb252ZXJ0Q29uZmlnID0gY29udGV4dC5jb252ZXJ0Q29uZmlnO1xuICAgICAgICBjb25zdCBwYXJzZVJlc3VsdE1hcCA9IGNvbnRleHQucGFyc2VSZXN1bHRNYXA7XG4gICAgICAgIGxldCBvdXRwdXRDb25maWc6IElPdXRwdXRDb25maWcgPSBjb252ZXJ0Q29uZmlnLm91dHB1dENvbmZpZztcbiAgICAgICAgaWYgKCFvdXRwdXRDb25maWcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHBhcnNlQ29uZmlnLm91dHB1dENvbmZpZyBpcyB1bmRlZmluZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRhYmxlT2JqTWFwOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gICAgICAgIGxldCBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwID0ge307XG4gICAgICAgIGxldCB0YWJsZVR5cGVNYXBEdHNTdHIgPSBcIlwiO1xuICAgICAgICBsZXQgdGFibGVUeXBlRHRzU3RycyA9IFwiXCI7XG4gICAgICAgIGxldCBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQ7XG4gICAgICAgIGxldCB0YWJsZU5hbWU6IHN0cmluZztcbiAgICAgICAgbGV0IHRhYmxlT2JqOiBhbnk7XG4gICAgICAgIGxldCBvYmpUeXBlVGFibGVNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgICAgIGZvciAobGV0IGZpbGVQYXRoIGluIHBhcnNlUmVzdWx0TWFwKSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXTtcbiAgICAgICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVEZWZpbmUpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICB0YWJsZU5hbWUgPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZU5hbWU7XG5cbiAgICAgICAgICAgIC8v5ZCI5bm25aSa5Liq5ZCM5ZCN6KGoXG4gICAgICAgICAgICB0YWJsZU9iaiA9IHRhYmxlT2JqTWFwW3RhYmxlTmFtZV07XG4gICAgICAgICAgICBpZiAodGFibGVPYmopIHtcbiAgICAgICAgICAgICAgICB0YWJsZU9iaiA9IE9iamVjdC5hc3NpZ24odGFibGVPYmosIHBhcnNlUmVzdWx0LnRhYmxlT2JqKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFibGVPYmogPSBwYXJzZVJlc3VsdC50YWJsZU9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSB0YWJsZU9iajtcblxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0dlbkR0cyAmJiBvYmpUeXBlVGFibGVNYXBbdGFibGVOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb2JqVHlwZVRhYmxlTWFwW3RhYmxlTmFtZV0gPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsO1xuICAgICAgICAgICAgICAgIGlmIChwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlVHlwZU1hcER0c1N0ciArPSBcIlxcdHJlYWRvbmx5IFwiICsgdGFibGVOYW1lICsgXCI/OiBcIiArIGBJVF8ke3RhYmxlTmFtZX07YCArIG9zRW9sO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlVHlwZU1hcER0c1N0ciArPSB0aGlzLl9nZXRPbmVUYWJsZVR5cGVTdHIodGFibGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy/ovpPlh7rljZXkuKrmlofku7ZcbiAgICAgICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzQnVuZGxlRHRzID09PSB1bmRlZmluZWQpIG91dHB1dENvbmZpZy5pc0J1bmRsZUR0cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKCFvdXRwdXRDb25maWcuaXNCdW5kbGVEdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkU2luZ2xlVGFibGVEdHNPdXRwdXRGaWxlKG91dHB1dENvbmZpZywgcGFyc2VSZXN1bHQsIG91dHB1dEZpbGVNYXApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlVHlwZUR0c1N0cnMgKz0gdGhpcy5fZ2V0U2luZ2xlVGFibGVEdHMocGFyc2VSZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/nlJ/miJDljZXkuKrooahqc29uXG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmNsaWVudFNpbmdsZVRhYmxlSnNvbkRpcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFNpbmdsZVRhYmxlSnNvbk91dHB1dEZpbGUob3V0cHV0Q29uZmlnLCBwYXJzZVJlc3VsdCwgb3V0cHV0RmlsZU1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0dlbkR0cykge1xuICAgICAgICAgICAgLy/ovpPlh7rlo7DmmI7mlofku7ZcbiAgICAgICAgICAgIGxldCBpdEJhc2VTdHIgPSBcImludGVyZmFjZSBJVEJhc2U8VD4geyBba2V5OnN0cmluZ106VH1cIiArIG9zRW9sO1xuXG4gICAgICAgICAgICB0YWJsZVR5cGVNYXBEdHNTdHIgPSBpdEJhc2VTdHIgKyBcImludGVyZmFjZSBJVF9UYWJsZU1hcCB7XCIgKyBvc0VvbCArIHRhYmxlVHlwZU1hcER0c1N0ciArIFwifVwiICsgb3NFb2w7XG5cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNCdW5kbGVEdHMpIHtcbiAgICAgICAgICAgICAgICAvL+WQiOaIkOS4gOS4quaWh+S7tlxuICAgICAgICAgICAgICAgIGNvbnN0IGR0c0ZpbGVOYW1lID0gb3V0cHV0Q29uZmlnLmJ1bmRsZUR0c0ZpbGVOYW1lID8gb3V0cHV0Q29uZmlnLmJ1bmRsZUR0c0ZpbGVOYW1lIDogXCJ0YWJsZU1hcFwiO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZUR0c0ZpbGVQYXRoID0gcGF0aC5qb2luKG91dHB1dENvbmZpZy5jbGllbnREdHNPdXREaXIsIGAke2R0c0ZpbGVOYW1lfS5kLnRzYCk7XG4gICAgICAgICAgICAgICAgb3V0cHV0RmlsZU1hcFtidW5kbGVEdHNGaWxlUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBidW5kbGVEdHNGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFibGVUeXBlTWFwRHRzU3RyICsgdGFibGVUeXBlRHRzU3Ryc1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8v5ouG5YiG5paH5Lu26L6T5Ye6XG4gICAgICAgICAgICAgICAgY29uc3QgdGFibGVUeXBlTWFwRHRzRmlsZVBhdGggPSBwYXRoLmpvaW4ob3V0cHV0Q29uZmlnLmNsaWVudER0c091dERpciwgXCJ0YWJsZU1hcC5kLnRzXCIpO1xuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbdGFibGVUeXBlTWFwRHRzRmlsZVBhdGhdID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogdGFibGVUeXBlTWFwRHRzRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhYmxlVHlwZU1hcER0c1N0clxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL2pzb25CdW5kbGVGaWxlXG4gICAgICAgIGlmIChvdXRwdXRDb25maWcuY2xpZW50QnVuZGxlSnNvbk91dFBhdGgpIHtcbiAgICAgICAgICAgIGxldCBqc29uQnVuZGxlRmlsZVBhdGggPSBvdXRwdXRDb25maWcuY2xpZW50QnVuZGxlSnNvbk91dFBhdGg7XG4gICAgICAgICAgICBsZXQgb3V0cHV0RGF0YTogYW55O1xuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0NvbXByZXNzKSB7XG4gICAgICAgICAgICAgICAgLy/ov5vooYzmoLzlvI/ljovnvKlcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdUYWJsZU9iak1hcCA9IHt9O1xuICAgICAgICAgICAgICAgIGxldCB0YWJsZU9iajogYW55O1xuICAgICAgICAgICAgICAgIGxldCBuZXdUYWJsZU9iajogYW55O1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHRhYmxlTmFtZSBpbiB0YWJsZU9iak1hcCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAob2JqVHlwZVRhYmxlTWFwW3RhYmxlTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSB0YWJsZU9iak1hcFt0YWJsZU5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGFibGVPYmogPSB0YWJsZU9iak1hcFt0YWJsZU5hbWVdO1xuICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iaiA9IHsgZmllbGRWYWx1ZXNNYXA6IHt9IH07XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1haW5LZXkgaW4gdGFibGVPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmV3VGFibGVPYmouZmllbGROYW1lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqLmZpZWxkTmFtZXMgPSBPYmplY3Qua2V5cyh0YWJsZU9ialttYWluS2V5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iai5maWVsZFZhbHVlc01hcFttYWluS2V5XSA9IE9iamVjdC52YWx1ZXModGFibGVPYmpbbWFpbktleV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSBuZXdUYWJsZU9iajtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IEpTT04uc3RyaW5naWZ5KG5ld1RhYmxlT2JqTWFwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IEpTT04uc3RyaW5naWZ5KHRhYmxlT2JqTWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v6L+b6KGMYmFzZTY05aSE55CGXG4gICAgICAgICAgICAvLyBpZiAob3V0cHV0Q29uZmlnLmJ1bmRsZUpzb25Jc0VuY29kZTJCYXNlNjQpIHtcbiAgICAgICAgICAgIC8vICAgICBvdXRwdXREYXRhID0gQmFzZTY0LmVuY29kZShvdXRwdXREYXRhKTtcbiAgICAgICAgICAgIC8vICAgICBpZiAob3V0cHV0Q29uZmlnLnByZUJhc2U2NFVnbHlTdHJpbmcpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgb3V0cHV0RGF0YSA9IG91dHB1dENvbmZpZy5wcmVCYXNlNjRVZ2x5U3RyaW5nICsgb3V0cHV0RGF0YTtcbiAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAvLyAgICAgaWYgKG91dHB1dENvbmZpZy5zdWZCYXNlNjRVZ2x5U3RyaW5nKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIG91dHB1dERhdGEgKz0gb3V0cHV0Q29uZmlnLnN1ZkJhc2U2NFVnbHlTdHJpbmc7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc1ppcCkge1xuICAgICAgICAgICAgICAgIC8v5L2/55SoemlsYuWOi+e8qVxuICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBkZWZsYXRlU3luYyhvdXRwdXREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbanNvbkJ1bmRsZUZpbGVQYXRoXSA9IHtcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDoganNvbkJ1bmRsZUZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIGVuY29kaW5nOiB0eXBlb2Ygb3V0cHV0RGF0YSAhPT0gXCJzdHJpbmdcIiA/IFwiYmluYXJ5XCIgOiBcInV0Zi04XCIsXG4gICAgICAgICAgICAgICAgZGF0YTogb3V0cHV0RGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udGV4dC5vdXRQdXRGaWxlTWFwKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gb3V0cHV0RmlsZU1hcCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQub3V0UHV0RmlsZU1hcFtrZXldID0gb3V0cHV0RmlsZU1hcFtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGV4dC5vdXRQdXRGaWxlTWFwID0gb3V0cHV0RmlsZU1hcDtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIG9uV3JpdGVGaWxlRW5kKGNvbnRleHQ6IElDb252ZXJ0Q29udGV4dCk6IHZvaWQge1xuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGBjb252ZXJ0LWhvb2sgb25Xcml0ZUZpbGVFbmQg5YaZ5YWl57uT5p2fYCk7XG4gICAgfVxuICAgIHByaXZhdGUgX2FkZFNpbmdsZVRhYmxlRHRzT3V0cHV0RmlsZShcbiAgICAgICAgY29uZmlnOiBJT3V0cHV0Q29uZmlnLFxuICAgICAgICBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsXG4gICAgICAgIG91dHB1dEZpbGVNYXA6IE91dFB1dEZpbGVNYXBcbiAgICApOiB2b2lkIHtcbiAgICAgICAgLy/lpoLmnpzlgLzmsqHmnInlsLHkuI3ovpPlh7rnsbvlnovkv6Hmga/kuoZcbiAgICAgICAgaWYgKCFwYXJzZVJlc3VsdC50YWJsZU9iaikgcmV0dXJuO1xuICAgICAgICBsZXQgZHRzRmlsZVBhdGg6IHN0cmluZyA9IHBhdGguam9pbihjb25maWcuY2xpZW50RHRzT3V0RGlyLCBgJHtwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZU5hbWV9LmQudHNgKTtcblxuICAgICAgICBpZiAoIW91dHB1dEZpbGVNYXBbZHRzRmlsZVBhdGhdKSB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgY29uc3QgZHRzU3RyID0gdGhpcy5fZ2V0U2luZ2xlVGFibGVEdHMocGFyc2VSZXN1bHQpO1xuICAgICAgICAgICAgaWYgKGR0c1N0cikge1xuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbZHRzRmlsZVBhdGhdID0geyBmaWxlUGF0aDogZHRzRmlsZVBhdGgsIGRhdGE6IGR0c1N0ciB9IGFzIGFueTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDlh7rljZXkuKrphY3nva7ooajnsbvlnovmlbDmja5cbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHRcbiAgICAgKi9cbiAgICBwcml2YXRlIF9nZXRTaW5nbGVUYWJsZUR0cyhwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCB0YWJsZU5hbWUgPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZU5hbWU7XG5cbiAgICAgICAgY29uc3QgY29sS2V5VGFibGVGaWVsZE1hcDogQ29sS2V5VGFibGVGaWVsZE1hcCA9IHBhcnNlUmVzdWx0LmZpbGVkTWFwO1xuICAgICAgICBsZXQgaXRlbUludGVyZmFjZSA9IFwiaW50ZXJmYWNlIElUX1wiICsgdGFibGVOYW1lICsgXCIge1wiICsgb3NFb2w7XG4gICAgICAgIGxldCB0YWJsZUZpZWxkOiBJVGFibGVGaWVsZDtcbiAgICAgICAgbGV0IHR5cGVTdHI6IHN0cmluZztcbiAgICAgICAgbGV0IG9ialR5cGVTdHJNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcblxuICAgICAgICBmb3IgKGxldCBjb2xLZXkgaW4gY29sS2V5VGFibGVGaWVsZE1hcCkge1xuICAgICAgICAgICAgdGFibGVGaWVsZCA9IGNvbEtleVRhYmxlRmllbGRNYXBbY29sS2V5XTtcbiAgICAgICAgICAgIGlmICghdGFibGVGaWVsZCkgY29udGludWU7XG4gICAgICAgICAgICBpZiAoIXRhYmxlRmllbGQuaXNNdXRpQ29sT2JqKSB7XG4gICAgICAgICAgICAgICAgLy/ms6jph4rooYxcbiAgICAgICAgICAgICAgICBpdGVtSW50ZXJmYWNlICs9IFwiXFx0LyoqIFwiICsgdGFibGVGaWVsZC50ZXh0ICsgXCIgKi9cIiArIG9zRW9sO1xuICAgICAgICAgICAgICAgIC8v5a2X5q6157G75Z6L5aOw5piO6KGMXG4gICAgICAgICAgICAgICAgaXRlbUludGVyZmFjZSArPVxuICAgICAgICAgICAgICAgICAgICBcIlxcdHJlYWRvbmx5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVGaWVsZC5maWVsZE5hbWUgK1xuICAgICAgICAgICAgICAgICAgICBcIj86IFwiICtcbiAgICAgICAgICAgICAgICAgICAgKHR5cGVTdHJNYXBbdGFibGVGaWVsZC50eXBlXSA/IHR5cGVTdHJNYXBbdGFibGVGaWVsZC50eXBlXSA6IHRhYmxlRmllbGQudHlwZSkgK1xuICAgICAgICAgICAgICAgICAgICBcIjtcIiArXG4gICAgICAgICAgICAgICAgICAgIG9zRW9sO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvYmpGaWVsZEtleSA9IHRhYmxlRmllbGQuZmllbGROYW1lO1xuICAgICAgICAgICAgICAgIGlmICghb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0gPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8v5rOo6YeK6KGMXG4gICAgICAgICAgICAgICAgb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0gKz0gXCJcXHRcXHQvKiogXCIgKyB0YWJsZUZpZWxkLnRleHQgKyBcIiAqL1wiICsgb3NFb2w7XG5cbiAgICAgICAgICAgICAgICAvL+Wtl+auteexu+Wei+WjsOaYjuihjFxuICAgICAgICAgICAgICAgIG9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldICs9XG4gICAgICAgICAgICAgICAgICAgIFwiXFx0XFx0cmVhZG9ubHkgXCIgK1xuICAgICAgICAgICAgICAgICAgICB0YWJsZUZpZWxkLnN1YkZpZWxkTmFtZSArXG4gICAgICAgICAgICAgICAgICAgIFwiPzogXCIgK1xuICAgICAgICAgICAgICAgICAgICAodHlwZVN0ck1hcFt0YWJsZUZpZWxkLnN1YlR5cGVdID8gdHlwZVN0ck1hcFt0YWJsZUZpZWxkLnN1YlR5cGVdIDogdGFibGVGaWVsZC5zdWJUeXBlKSArXG4gICAgICAgICAgICAgICAgICAgIFwiO1wiICtcbiAgICAgICAgICAgICAgICAgICAgb3NFb2w7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy/nrKzkuozlsYLlr7nosaFcbiAgICAgICAgZm9yIChsZXQgb2JqRmllbGRLZXkgaW4gb2JqVHlwZVN0ck1hcCkge1xuICAgICAgICAgICAgLy/lrZfmrrXnsbvlnovlo7DmmI7ooYxcbiAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJcXHRyZWFkb25seSBcIiArIG9iakZpZWxkS2V5ICsgXCI/OiB7XCIgKyBvc0VvbCArIG9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldO1xuICAgICAgICAgICAgaXRlbUludGVyZmFjZSArPSBcIlxcdH1cIiArIG9zRW9sO1xuICAgICAgICB9XG4gICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJ9XCIgKyBvc0VvbDtcblxuICAgICAgICByZXR1cm4gaXRlbUludGVyZmFjZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5re75Yqg5Y2V54us5a+85Ye66YWN572u6KGoanNvbuaWh+S7tlxuICAgICAqIEBwYXJhbSBjb25maWdcbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gb3V0cHV0RmlsZU1hcFxuICAgICAqL1xuICAgIHByaXZhdGUgX2FkZFNpbmdsZVRhYmxlSnNvbk91dHB1dEZpbGUoXG4gICAgICAgIGNvbmZpZzogSU91dHB1dENvbmZpZyxcbiAgICAgICAgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHRhYmxlT2JqID0gcGFyc2VSZXN1bHQudGFibGVPYmo7XG4gICAgICAgIGlmICghdGFibGVPYmopIHJldHVybjtcbiAgICAgICAgY29uc3QgdGFibGVOYW1lID0gcGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lO1xuICAgICAgICBsZXQgc2luZ2xlSnNvbkZpbGVQYXRoID0gcGF0aC5qb2luKGNvbmZpZy5jbGllbnRTaW5nbGVUYWJsZUpzb25EaXIsIGAke3RhYmxlTmFtZX0uanNvbmApO1xuICAgICAgICBsZXQgc2luZ2xlSnNvbkRhdGEgPSBKU09OLnN0cmluZ2lmeSh0YWJsZU9iaiwgbnVsbCwgXCJcXHRcIik7XG5cbiAgICAgICAgbGV0IHNpbmdsZU91dHB1dEZpbGVJbmZvID0gb3V0cHV0RmlsZU1hcFtzaW5nbGVKc29uRmlsZVBhdGhdO1xuICAgICAgICBpZiAoc2luZ2xlT3V0cHV0RmlsZUluZm8pIHtcbiAgICAgICAgICAgIHNpbmdsZU91dHB1dEZpbGVJbmZvLmRhdGEgPSBzaW5nbGVKc29uRGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpbmdsZU91dHB1dEZpbGVJbmZvID0ge1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBzaW5nbGVKc29uRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YTogc2luZ2xlSnNvbkRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBvdXRwdXRGaWxlTWFwW3NpbmdsZUpzb25GaWxlUGF0aF0gPSBzaW5nbGVPdXRwdXRGaWxlSW5mbztcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcml2YXRlIF9nZXRPbmVUYWJsZVR5cGVTdHIodGFibGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJcXHRyZWFkb25seSBcIiArIHRhYmxlTmFtZSArIFwiPzogXCIgKyBcIklUQmFzZTxcIiArIFwiSVRfXCIgKyB0YWJsZU5hbWUgKyBcIj47XCIgKyBvc0VvbDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dlclwiO1xuXG5leHBvcnQgY29uc3QgdmFsdWVUcmFuc0Z1bmNNYXA6IHtcbiAgICBba2V5OiBzdHJpbmddOiBWYWx1ZVRyYW5zRnVuYztcbn0gPSB7fTtcbnZhbHVlVHJhbnNGdW5jTWFwW1wiaW50XCJdID0gc3RyVG9JbnQ7XG52YWx1ZVRyYW5zRnVuY01hcFtcInN0cmluZ1wiXSA9IGFueVRvU3RyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJbaW50XVwiXSA9IHN0clRvSW50QXJyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJbc3RyaW5nXVwiXSA9IHN0clRvU3RyQXJyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJqc29uXCJdID0gc3RyVG9Kc29uT2JqO1xuZnVuY3Rpb24gc3RyVG9JbnRBcnIoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgaW50QXJyOiBudW1iZXJbXTtcbiAgICBjb25zdCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge307XG4gICAgaWYgKGNlbGxWYWx1ZSAhPT0gXCJcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaW50QXJyID0gSlNPTi5wYXJzZShjZWxsVmFsdWUpO1xuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gaW50QXJyO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gc3RyVG9TdHJBcnIoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9O1xuICAgIGxldCBhcnI6IHN0cmluZ1tdO1xuICAgIGlmIChjZWxsVmFsdWUgIT09IFwiXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGFyciA9IEpTT04ucGFyc2UoY2VsbFZhbHVlKTtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGFycjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvciA9IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBzdHJUb0ludChmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9IGFzIGFueTtcbiAgICBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiBjZWxsVmFsdWUudHJpbSgpICE9PSBcIlwiKSB7XG4gICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZS5pbmNsdWRlcyhcIi5cIikgPyBwYXJzZUZsb2F0KGNlbGxWYWx1ZSkgOiAocGFyc2VJbnQoY2VsbFZhbHVlKSBhcyBhbnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBzdHJUb0pzb25PYmooZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgb2JqO1xuICAgIGxldCBlcnJvcjtcbiAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBvYmogPSBKU09OLnBhcnNlKGNlbGxWYWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICBvYmogPSBjZWxsVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgZXJyb3I6IGVycm9yLCB2YWx1ZTogb2JqIH07XG59XG5mdW5jdGlvbiBhbnlUb1N0cihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IGFueSk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9IGFzIGFueTtcbiAgICBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xuICAgICAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWUgKyBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGRvUGFyc2UoXG4gICAgcGFyc2VDb25maWc6IElUYWJsZUNvbnZlcnRDb25maWcsXG4gICAgZmlsZUluZm9zOiBJRmlsZUluZm9bXSxcbiAgICBwYXJzZVJlc3VsdE1hcDogVGFibGVQYXJzZVJlc3VsdE1hcCxcbiAgICBwYXJzZUhhbmRsZXI6IElUYWJsZVBhcnNlSGFuZGxlclxuKSB7XG4gICAgbGV0IHBhcnNlUmVzdWx0O1xuICAgIGZvciAobGV0IGkgPSBmaWxlSW5mb3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgcGFyc2VSZXN1bHQgPSBwYXJzZVJlc3VsdE1hcFtmaWxlSW5mb3NbaV0uZmlsZVBhdGhdO1xuICAgICAgICBpZiAoIXBhcnNlUmVzdWx0KSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHsgZmlsZVBhdGg6IGZpbGVJbmZvc1tpXS5maWxlUGF0aCB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVPYmopIHtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VIYW5kbGVyLnBhcnNlVGFibGVGaWxlKHBhcnNlQ29uZmlnLCBmaWxlSW5mb3NbaV0sIHBhcnNlUmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyc2VSZXN1bHQpIHtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwW2ZpbGVJbmZvc1tpXS5maWxlUGF0aF0gPSBwYXJzZVJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2VyXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSU91dFB1dEZpbGVJbmZvIHtcbiAgICAgICAgZmlsZVBhdGg6IHN0cmluZztcbiAgICAgICAgLyoq5YaZ5YWl57yW56CB77yM5a2X56ym5Liy6buY6K6kdXRmOCAqL1xuICAgICAgICBlbmNvZGluZz86IEJ1ZmZlckVuY29kaW5nO1xuICAgICAgICAvKirmmK/lkKbliKDpmaQgKi9cbiAgICAgICAgaXNEZWxldGU/OiBib29sZWFuO1xuICAgICAgICBkYXRhPzogYW55O1xuICAgIH1cbn1cbi8qKlxuICog6YGN5Y6G5paH5Lu2XG4gKiBAcGFyYW0gZGlyUGF0aCDmlofku7blpLnot6/lvoRcbiAqIEBwYXJhbSBlYWNoQ2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChmaWxlUGF0aDogc3RyaW5nKSA9PiB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JFYWNoRmlsZShmaWxlT3JEaXJQYXRoOiBzdHJpbmcsIGVhY2hDYWxsYmFjaz86IChmaWxlUGF0aDogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgaWYgKGZzLnN0YXRTeW5jKGZpbGVPckRpclBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWVzID0gZnMucmVhZGRpclN5bmMoZmlsZU9yRGlyUGF0aCk7XG4gICAgICAgIGxldCBjaGlsZEZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjaGlsZEZpbGVQYXRoID0gcGF0aC5qb2luKGZpbGVPckRpclBhdGgsIGZpbGVOYW1lc1tpXSk7XG4gICAgICAgICAgICBmb3JFYWNoRmlsZShjaGlsZEZpbGVQYXRoLCBlYWNoQ2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZWFjaENhbGxiYWNrKGZpbGVPckRpclBhdGgpO1xuICAgIH1cbn1cbi8qKlxuICog5om56YeP5YaZ5YWl5ZKM5Yig6Zmk5paH5Lu2XG4gKiBAcGFyYW0gb3V0cHV0RmlsZUluZm9zIOmcgOimgeWGmeWFpeeahOaWh+S7tuS/oeaBr+aVsOe7hFxuICogQHBhcmFtIG9uUHJvZ3Jlc3Mg6L+b5bqm5Y+Y5YyW5Zue6LCDXG4gKiBAcGFyYW0gY29tcGxldGUg5a6M5oiQ5Zue6LCDXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMoXG4gICAgb3V0cHV0RmlsZUluZm9zOiBJT3V0UHV0RmlsZUluZm9bXSxcbiAgICBvblByb2dyZXNzPzogKGZpbGVQYXRoOiBzdHJpbmcsIHRvdGFsOiBudW1iZXIsIG5vdzogbnVtYmVyLCBpc09rOiBib29sZWFuKSA9PiB2b2lkLFxuICAgIGNvbXBsZXRlPzogKHRvdGFsOiBudW1iZXIpID0+IHZvaWRcbikge1xuICAgIGxldCBmaWxlSW5mbzogSU91dFB1dEZpbGVJbmZvO1xuICAgIGNvbnN0IHRvdGFsID0gb3V0cHV0RmlsZUluZm9zLmxlbmd0aDtcbiAgICBpZiAob3V0cHV0RmlsZUluZm9zICYmIHRvdGFsKSB7XG4gICAgICAgIGxldCBub3cgPSAwO1xuICAgICAgICBjb25zdCBvbldyaXRlRW5kID0gKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIExvZ2dlci5sb2coZXJyLCBcImVycm9yXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm93Kys7XG4gICAgICAgICAgICBvblByb2dyZXNzICYmIG9uUHJvZ3Jlc3Mob3V0cHV0RmlsZUluZm9zW25vdyAtIDFdLmZpbGVQYXRoLCB0b3RhbCwgbm93LCAhZXJyKTtcbiAgICAgICAgICAgIGlmIChub3cgPj0gdG90YWwpIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSAmJiBjb21wbGV0ZSh0b3RhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZvciAobGV0IGkgPSBvdXRwdXRGaWxlSW5mb3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGZpbGVJbmZvID0gb3V0cHV0RmlsZUluZm9zW2ldO1xuXG4gICAgICAgICAgICBpZiAoZmlsZUluZm8uaXNEZWxldGUgJiYgZnMuZXhpc3RzU3luYyhmaWxlSW5mby5maWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICBmcy51bmxpbmtTeW5jKGZpbGVJbmZvLmZpbGVQYXRoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZmlsZUluZm8uZmlsZVBhdGgpICYmIGZzLnN0YXRTeW5jKGZpbGVJbmZvLmZpbGVQYXRoKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5sb2coYOi3r+W+hOS4uuaWh+S7tuWkuToke2ZpbGVJbmZvLmZpbGVQYXRofWAsIFwiZXJyb3JcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghZmlsZUluZm8uZW5jb2RpbmcgJiYgdHlwZW9mIGZpbGVJbmZvLmRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZW5jb2RpbmcgPSBcInV0ZjhcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZnMuZW5zdXJlRmlsZVN5bmMoZmlsZUluZm8uZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZShcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmVuY29kaW5nID8geyBlbmNvZGluZzogZmlsZUluZm8uZW5jb2RpbmcgfSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgb25Xcml0ZUVuZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIOiOt+WPluWPmOWMlui/h+eahOaWh+S7tuaVsOe7hFxuICogQHBhcmFtIGRpciDnm67moIfnm67lvZVcbiAqIEBwYXJhbSBjYWNoZUZpbGVQYXRoIOe8k+WtmOaWh+S7tue7neWvuei3r+W+hFxuICogQHBhcmFtIGVhY2hDYWxsYmFjayDpgY3ljoblm57osINcbiAqIEByZXR1cm5zIOi/lOWbnue8k+WtmOaWh+S7tui3r+W+hFxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaENoYW5nZWRGaWxlKFxuICAgIGRpcjogc3RyaW5nLFxuICAgIGNhY2hlRmlsZVBhdGg/OiBzdHJpbmcsXG4gICAgZWFjaENhbGxiYWNrPzogKGZpbGVQYXRoOiBzdHJpbmcsIGlzRGVsZXRlPzogYm9vbGVhbikgPT4gdm9pZFxuKSB7XG4gICAgY29uc3QgZ2NmQ2FjaGUgPSBnZXRDYWNoZURhdGEoY2FjaGVGaWxlUGF0aCk7XG4gICAgY29uc3Qgb2xkRmlsZVBhdGhzID0gT2JqZWN0LmtleXMoZ2NmQ2FjaGUpO1xuICAgIGxldCBvbGRGaWxlUGF0aEluZGV4OiBudW1iZXI7XG4gICAgZm9yRWFjaEZpbGUoZGlyLCAoZmlsZVBhdGgpID0+IHtcbiAgICAgICAgdmFyIG1kNXN0ciA9IGdldEZpbGVNZDVTeW5jKGZpbGVQYXRoKTtcbiAgICAgICAgaWYgKCFnY2ZDYWNoZVtmaWxlUGF0aF0gfHwgKGdjZkNhY2hlW2ZpbGVQYXRoXSAmJiBnY2ZDYWNoZVtmaWxlUGF0aF0gIT09IG1kNXN0cikpIHtcbiAgICAgICAgICAgIGdjZkNhY2hlW2ZpbGVQYXRoXSA9IG1kNXN0cjtcbiAgICAgICAgICAgIGVhY2hDYWxsYmFjayhmaWxlUGF0aCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIG9sZEZpbGVQYXRoSW5kZXggPSBvbGRGaWxlUGF0aHMuaW5kZXhPZihmaWxlUGF0aCk7XG4gICAgICAgIGlmIChvbGRGaWxlUGF0aEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGVuZEZpbGVQYXRoID0gb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRocy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIG9sZEZpbGVQYXRoc1tvbGRGaWxlUGF0aEluZGV4XSA9IGVuZEZpbGVQYXRoO1xuICAgICAgICAgICAgb2xkRmlsZVBhdGhzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvbGRGaWxlUGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVsZXRlIGdjZkNhY2hlW29sZEZpbGVQYXRoc1tpXV07XG4gICAgICAgIGVhY2hDYWxsYmFjayhvbGRGaWxlUGF0aHNbaV0sIHRydWUpO1xuICAgIH1cbiAgICBmcy53cml0ZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGdjZkNhY2hlKSwgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0pO1xufVxuLyoqXG4gKiDlhpnlhaXnvJPlrZjmlbDmja5cbiAqIEBwYXJhbSBjYWNoZUZpbGVQYXRoXG4gKiBAcGFyYW0gY2FjaGVEYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZUNhY2hlRGF0YShjYWNoZUZpbGVQYXRoOiBzdHJpbmcsIGNhY2hlRGF0YTogYW55KSB7XG4gICAgaWYgKCFjYWNoZUZpbGVQYXRoKSB7XG4gICAgICAgIExvZ2dlci5sb2coYGNhY2hlRmlsZVBhdGggaXMgbnVsbGAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZnMud3JpdGVGaWxlU3luYyhjYWNoZUZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShjYWNoZURhdGEpLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSk7XG59XG4vKipcbiAqIOivu+WPlue8k+WtmOaVsOaNrlxuICogQHBhcmFtIGNhY2hlRmlsZVBhdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlRGF0YShjYWNoZUZpbGVQYXRoOiBzdHJpbmcpOiBhbnkge1xuICAgIGlmICghY2FjaGVGaWxlUGF0aCkge1xuICAgICAgICBMb2dnZXIubG9nKGBjYWNoZUZpbGVQYXRoIGlzIG51bGxgLCBcImVycm9yXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghZnMuZXhpc3RzU3luYyhjYWNoZUZpbGVQYXRoKSkge1xuICAgICAgICBmcy5lbnN1cmVGaWxlU3luYyhjYWNoZUZpbGVQYXRoKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhjYWNoZUZpbGVQYXRoLCBcInt9XCIsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KTtcbiAgICB9XG4gICAgY29uc3QgZ2NmQ2FjaGVGaWxlID0gZnMucmVhZEZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIFwidXRmLThcIik7XG4gICAgY29uc3QgZ2NmQ2FjaGUgPSBKU09OLnBhcnNlKGdjZkNhY2hlRmlsZSk7XG4gICAgcmV0dXJuIGdjZkNhY2hlO1xufVxuLyoqXG4gKiDojrflj5bmlofku7ZtZDUgKOWQjOatpSlcbiAqIEBwYXJhbSBmaWxlUGF0aFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgZmlsZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICB2YXIgbWQ1dW0gPSBjcnlwdG8uY3JlYXRlSGFzaChcIm1kNVwiKTtcbiAgICBtZDV1bS51cGRhdGUoZmlsZSk7XG4gICAgcmV0dXJuIG1kNXVtLmRpZ2VzdChcImhleFwiKTtcbn1cbi8qKlxuICog6I635Y+W5paH5Lu2IG1kNVxuICogQHBhcmFtIGZpbGVQYXRoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRGaWxlTWQ1KGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGgpO1xufVxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgKiBhcyBtbWF0Y2ggZnJvbSBcIm1pY3JvbWF0Y2hcIjtcbmltcG9ydCB7IGZvckVhY2hGaWxlLCBnZXRDYWNoZURhdGEsIGdldEZpbGVNZDVTeW5jLCB3cml0ZUNhY2hlRGF0YSwgd3JpdGVPckRlbGV0ZU91dFB1dEZpbGVzIH0gZnJvbSBcIi4vZmlsZS11dGlsc1wiO1xuaW1wb3J0IHsgV29ya2VyIH0gZnJvbSBcIndvcmtlcl90aHJlYWRzXCI7XG5pbXBvcnQgeyBkb1BhcnNlIH0gZnJvbSBcIi4vZG8tcGFyc2VcIjtcbmltcG9ydCB7IERlZmF1bHRQYXJzZUhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LXBhcnNlLWhhbmRsZXJcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2VyXCI7XG5pbXBvcnQgeyBEZWZhdWx0Q29udmVydEhvb2sgfSBmcm9tIFwiLi9kZWZhdWx0LWNvbnZlcnQtaG9va1wiO1xuLyoqXG4gKiDovazmjaJcbiAqIEBwYXJhbSBjb252ZXJDb25maWcg6Kej5p6Q6YWN572uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb252ZXJ0KGNvbnZlckNvbmZpZzogSVRhYmxlQ29udmVydENvbmZpZykge1xuICAgIGlmICghY29udmVyQ29uZmlnLnByb2pSb290KSB7XG4gICAgICAgIGNvbnZlckNvbmZpZy5wcm9qUm9vdCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgfVxuICAgIGxldCBjb252ZXJ0SG9vazogSUNvbnZlcnRIb29rO1xuICAgIGlmIChjb252ZXJDb25maWcuY3VzdG9tQ29udmVydEhvb2tQYXRoKSB7XG4gICAgICAgIGNvbnZlcnRIb29rID0gcmVxdWlyZShjb252ZXJDb25maWcuY3VzdG9tQ29udmVydEhvb2tQYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb252ZXJ0SG9vayA9IG5ldyBEZWZhdWx0Q29udmVydEhvb2soKTtcbiAgICB9XG4gICAgY29uc3QgdGFibGVGaWxlRGlyID0gY29udmVyQ29uZmlnLnRhYmxlRmlsZURpcjtcbiAgICBpZiAoIXRhYmxlRmlsZURpcikge1xuICAgICAgICBMb2dnZXIubG9nKGDphY3nva7ooajnm67lvZXvvJp0YWJsZUZpbGVEaXLkuLrnqbpgLCBcImVycm9yXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghZnMuZXhpc3RzU3luYyh0YWJsZUZpbGVEaXIpKSB7XG4gICAgICAgIExvZ2dlci5sb2coYOmFjee9ruihqOaWh+S7tuWkueS4jeWtmOWcqO+8miR7dGFibGVGaWxlRGlyfWAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGVmYXVsdFBhdHRlcm4gPSBbXCIqKi8qLnt4bHN4LGNzdn1cIiwgXCIhKiovfiQqLipcIiwgXCIhKiovfi4qLipcIl07XG4gICAgaWYgKCFjb252ZXJDb25maWcucGF0dGVybikge1xuICAgICAgICBjb252ZXJDb25maWcucGF0dGVybiA9IGRlZmF1bHRQYXR0ZXJuO1xuICAgIH1cbiAgICBpZiAoY29udmVyQ29uZmlnLnVzZU11bHRpVGhyZWFkICYmIGlzTmFOKGNvbnZlckNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0pKSB7XG4gICAgICAgIGNvbnZlckNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0gPSA1O1xuICAgIH1cbiAgICBMb2dnZXIuaW5pdChjb252ZXJDb25maWcpO1xuICAgIGNvbnN0IGNvbnRleHQ6IElDb252ZXJ0Q29udGV4dCA9IHtcbiAgICAgICAgY29udmVydENvbmZpZzogY29udmVyQ29uZmlnLFxuXG4gICAgfSBhcyBhbnk7XG4gICAgLy/lvIDlp4tcbiAgICBjb252ZXJ0SG9vay5vblN0YXJ0KGNvbnRleHQpO1xuXG4gICAgbGV0IGNoYW5nZWRGaWxlSW5mb3M6IElGaWxlSW5mb1tdID0gW107XG4gICAgbGV0IGRlbGV0ZUZpbGVJbmZvczogSUZpbGVJbmZvW10gPSBbXTtcbiAgICBjb25zdCBnZXRGaWxlSW5mbyA9IChmaWxlUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoUGFyc2UgPSBwYXRoLnBhcnNlKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgZmlsZUluZm86IElGaWxlSW5mbyA9IHtcbiAgICAgICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICAgIGZpbGVOYW1lOiBmaWxlUGF0aFBhcnNlLm5hbWUsXG4gICAgICAgICAgICBmaWxlRXh0TmFtZTogZmlsZVBhdGhQYXJzZS5leHQsXG4gICAgICAgICAgICBpc0RlbGV0ZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZpbGVJbmZvO1xuICAgIH07XG4gICAgY29uc3QgbWF0Y2hQYXR0ZXJuID0gY29udmVyQ29uZmlnLnBhdHRlcm47XG4gICAgY29uc3QgZWFjaEZpbGVDYWxsYmFjayA9IChmaWxlUGF0aDogc3RyaW5nLCBpc0RlbGV0ZT86IGJvb2xlYW4pID0+IHtcbiAgICAgICAgY29uc3QgZmlsZUluZm8gPSBnZXRGaWxlSW5mbyhmaWxlUGF0aCk7XG4gICAgICAgIGxldCBjYW5SZWFkOiBib29sZWFuO1xuICAgICAgICBpZiAoaXNEZWxldGUpIHtcbiAgICAgICAgICAgIGRlbGV0ZUZpbGVJbmZvcy5wdXNoKGZpbGVJbmZvKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhblJlYWQgPSBtbWF0Y2guYWxsKGZpbGVJbmZvLmZpbGVQYXRoLCBtYXRjaFBhdHRlcm4pO1xuICAgICAgICAgICAgaWYgKGNhblJlYWQpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkRmlsZUluZm9zLnB1c2goZmlsZUluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGZpbGVJbmZvLCBjYW5SZWFkIH07XG4gICAgfTtcbiAgICBsZXQgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXAgPSB7fTtcblxuICAgIC8v57yT5a2Y5aSE55CGXG4gICAgbGV0IGNhY2hlRmlsZURpclBhdGg6IHN0cmluZyA9IGNvbnZlckNvbmZpZy5jYWNoZUZpbGVEaXJQYXRoO1xuICAgIGxldCBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGg6IHN0cmluZztcblxuICAgIGlmICghY29udmVyQ29uZmlnLnVzZUNhY2hlKSB7XG4gICAgICAgIGZvckVhY2hGaWxlKHRhYmxlRmlsZURpciwgZWFjaEZpbGVDYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFjYWNoZUZpbGVEaXJQYXRoKSBjYWNoZUZpbGVEaXJQYXRoID0gXCIuY2FjaGVcIjtcbiAgICAgICAgaWYgKCFwYXRoLmlzQWJzb2x1dGUoY2FjaGVGaWxlRGlyUGF0aCkpIHtcbiAgICAgICAgICAgIGNhY2hlRmlsZURpclBhdGggPSBwYXRoLmpvaW4oY29udmVyQ29uZmlnLnByb2pSb290LCBjYWNoZUZpbGVEaXJQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGggPSBwYXRoLmpvaW4oY2FjaGVGaWxlRGlyUGF0aCwgXCIuZWdmcHJtY1wiKTtcbiAgICAgICAgcGFyc2VSZXN1bHRNYXAgPSBnZXRDYWNoZURhdGEocGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoKTtcbiAgICAgICAgaWYgKCFwYXJzZVJlc3VsdE1hcCkge1xuICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXAgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvbGRGaWxlUGF0aHMgPSBPYmplY3Qua2V5cyhwYXJzZVJlc3VsdE1hcCk7XG4gICAgICAgIGxldCBvbGRGaWxlUGF0aEluZGV4OiBudW1iZXI7XG4gICAgICAgIGxldCBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQ7XG4gICAgICAgIGZvckVhY2hGaWxlKHRhYmxlRmlsZURpciwgKGZpbGVQYXRoKSA9PiB7XG4gICAgICAgICAgICB2YXIgbWQ1c3RyID0gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGgpO1xuICAgICAgICAgICAgcGFyc2VSZXN1bHQgPSBwYXJzZVJlc3VsdE1hcFtmaWxlUGF0aF07XG4gICAgICAgICAgICBpZiAoIXBhcnNlUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgcGFyc2VSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXBbZmlsZVBhdGhdID0gcGFyc2VSZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFyc2VSZXN1bHQgJiYgcGFyc2VSZXN1bHQubWQ1aGFzaCAhPT0gbWQ1c3RyKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBmaWxlSW5mbywgY2FuUmVhZCB9ID0gZWFjaEZpbGVDYWxsYmFjayhmaWxlUGF0aCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmIChjYW5SZWFkKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0Lm1kNWhhc2ggPSBtZDVzdHI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2xkRmlsZVBhdGhJbmRleCA9IG9sZEZpbGVQYXRocy5pbmRleE9mKGZpbGVQYXRoKTtcbiAgICAgICAgICAgIGlmIChvbGRGaWxlUGF0aEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmRGaWxlUGF0aCA9IG9sZEZpbGVQYXRoc1tvbGRGaWxlUGF0aHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRoSW5kZXhdID0gZW5kRmlsZVBhdGg7XG4gICAgICAgICAgICAgICAgb2xkRmlsZVBhdGhzLnBvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvbGRGaWxlUGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJzZVJlc3VsdE1hcFtvbGRGaWxlUGF0aHNbaV1dO1xuICAgICAgICAgICAgZWFjaEZpbGVDYWxsYmFjayhvbGRGaWxlUGF0aHNbaV0sIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHBhcnNlSGFuZGxlcjogSVRhYmxlUGFyc2VIYW5kbGVyO1xuICAgIGlmIChjb252ZXJDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aCkge1xuICAgICAgICBwYXJzZUhhbmRsZXIgPSByZXF1aXJlKGNvbnZlckNvbmZpZy5jdXN0b21QYXJzZUhhbmRsZXJQYXRoKTtcbiAgICAgICAgaWYgKCFwYXJzZUhhbmRsZXIgfHwgdHlwZW9mIHBhcnNlSGFuZGxlci5wYXJzZVRhYmxlRmlsZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDoh6rlrprkuYnop6PmnpDlrp7njrDplJnor686JHtjb252ZXJDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aH1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlSGFuZGxlciA9IG5ldyBEZWZhdWx0UGFyc2VIYW5kbGVyKCk7XG4gICAgfVxuICAgIC8v6Kej5p6Q5byA5aeL5LmL5YmNXG4gICAgY29udGV4dC5wYXJzZVJlc3VsdE1hcCA9IHBhcnNlUmVzdWx0TWFwO1xuICAgIGNvbnRleHQuZGVsZXRlRmlsZUluZm9zID0gZGVsZXRlRmlsZUluZm9zO1xuICAgIGNvbnRleHQuY2hhbmdlZEZpbGVJbmZvcyA9IGNoYW5nZWRGaWxlSW5mb3M7XG4gICAgY29udmVydEhvb2sub25QYXJzZUJlZm9yZShjb250ZXh0KTtcblxuICAgIGlmIChjaGFuZ2VkRmlsZUluZm9zLmxlbmd0aCA+IGNvbnZlckNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0gJiYgY29udmVyQ29uZmlnLnVzZU11bHRpVGhyZWFkKSB7XG4gICAgICAgIGxldCBsb2dTdHI6IHN0cmluZyA9IFwiXCI7XG4gICAgICAgIGNvbnN0IGNvdW50ID0gTWF0aC5mbG9vcihjaGFuZ2VkRmlsZUluZm9zLmxlbmd0aCAvIGNvbnZlckNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0pICsgMTtcbiAgICAgICAgbGV0IHdvcmtlcjogV29ya2VyO1xuICAgICAgICBsZXQgc3ViRmlsZUluZm9zOiBJRmlsZUluZm9bXTtcbiAgICAgICAgbGV0IHdvcmtlck1hcDogeyBba2V5OiBudW1iZXJdOiBXb3JrZXIgfSA9IHt9O1xuICAgICAgICBsZXQgY29tcGxldGVDb3VudDogbnVtYmVyID0gMDtcbiAgICAgICAgY29uc3QgdDEgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgY29uc3Qgb25Xb3JrZXJQYXJzZUVuZCA9IChkYXRhOiBJV29ya0RvUmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGAtLS0tLS0tLS0tLS0tLS0t57q/56iL57uT5p2fOiR7ZGF0YS50aHJlYWRJZH0tLS0tLS0tLS0tLS0tLS0tLWApO1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkTWFwID0gZGF0YS5wYXJzZVJlc3VsdE1hcDtcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBwYXJzZWRNYXApIHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcnNlUmVzdWx0TWFwW2tleV0udGFibGVEZWZpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXBba2V5XSA9IHBhcnNlZE1hcFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBsZXRlQ291bnQrKztcbiAgICAgICAgICAgIGxvZ1N0ciArPSBkYXRhLmxvZ1N0ciArIExvZ2dlci5sb2dTdHI7XG4gICAgICAgICAgICBpZiAoY29tcGxldGVDb3VudCA+PSBjb3VudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHQyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmxvZyhgW+Wkmue6v+eoi+WvvOihqOaXtumXtF06JHt0MiAtIHQxfWApO1xuICAgICAgICAgICAgICAgIG9uUGFyc2VFbmQoY29udGV4dCwgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoLCBjb252ZXJ0SG9vaywgbG9nU3RyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBzdWJGaWxlSW5mb3MgPSBjaGFuZ2VkRmlsZUluZm9zLnNwbGljZSgwLCBjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtKTtcbiAgICAgICAgICAgIExvZ2dlci5sb2coYC0tLS0tLS0tLS0tLS0tLS3nur/nqIvlvIDlp4s6JHtpfS0tLS0tLS0tLS0tLS0tLS0tYCk7XG4gICAgICAgICAgICB3b3JrZXIgPSBuZXcgV29ya2VyKHBhdGguam9pbihwYXRoLmRpcm5hbWUoX19maWxlbmFtZSksIFwiLi4vLi4vLi4vd29ya2VyX3NjcmlwdHMvd29ya2VyLmpzXCIpLCB7XG4gICAgICAgICAgICAgICAgd29ya2VyRGF0YToge1xuICAgICAgICAgICAgICAgICAgICB0aHJlYWRJZDogaSxcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm9zOiBzdWJGaWxlSW5mb3MsXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwOiBwYXJzZVJlc3VsdE1hcCxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VDb25maWc6IGNvbnZlckNvbmZpZ1xuICAgICAgICAgICAgICAgIH0gYXMgSVdvcmtlclNoYXJlRGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3b3JrZXJNYXBbaV0gPSB3b3JrZXI7XG4gICAgICAgICAgICB3b3JrZXIub24oXCJtZXNzYWdlXCIsIG9uV29ya2VyUGFyc2VFbmQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdDEgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICBkb1BhcnNlKGNvbnZlckNvbmZpZywgY2hhbmdlZEZpbGVJbmZvcywgcGFyc2VSZXN1bHRNYXAsIHBhcnNlSGFuZGxlcik7XG4gICAgICAgIGNvbnN0IHQyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIExvZ2dlci5zeXN0ZW1Mb2coYFvljZXnur/nqIvlr7zooajml7bpl7RdOiR7dDIgLSB0MX1gKTtcbiAgICAgICAgb25QYXJzZUVuZChjb250ZXh0LCBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgsIGNvbnZlcnRIb29rKTtcbiAgICB9XG59XG4vKipcbiAqIOino+aekOe7k+adn1xuICogQHBhcmFtIHBhcnNlQ29uZmlnXG4gKiBAcGFyYW0gcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoXG4gKiBAcGFyYW0gY29udmVydEhvb2tcbiAqIEBwYXJhbSBmaWxlSW5mb3NcbiAqIEBwYXJhbSBkZWxldGVGaWxlSW5mb3NcbiAqIEBwYXJhbSBwYXJzZVJlc3VsdE1hcFxuICogQHBhcmFtIGxvZ1N0clxuICovXG5hc3luYyBmdW5jdGlvbiBvblBhcnNlRW5kKFxuICAgIGNvbnRleHQ6IElDb252ZXJ0Q29udGV4dCxcbiAgICBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGg6IHN0cmluZyxcbiAgICBjb252ZXJ0SG9vazogSUNvbnZlcnRIb29rLFxuICAgIGxvZ1N0cj86IHN0cmluZ1xuKSB7XG4gICAgY29uc3QgY29udmVydENvbmZpZyA9IGNvbnRleHQuY29udmVydENvbmZpZztcbiAgICBjb25zdCBwYXJzZVJlc3VsdE1hcCA9IGNvbnRleHQucGFyc2VSZXN1bHRNYXA7XG4gICAgLy/lhpnlhaXop6PmnpDnvJPlrZhcbiAgICBpZiAoY29udmVydENvbmZpZy51c2VDYWNoZSkge1xuICAgICAgICB3cml0ZUNhY2hlRGF0YShwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgsIHBhcnNlUmVzdWx0TWFwKTtcbiAgICB9XG5cbiAgICAvL+ino+aekOe7k+adn++8jOWBmuWvvOWHuuWkhOeQhlxuICAgIGNvbnZlcnRIb29rLm9uUGFyc2VBZnRlcihjb250ZXh0KTtcbiAgICBpZiAoY29udGV4dC5vdXRQdXRGaWxlTWFwKSB7XG5cbiAgICAgICAgY29uc3Qgb3V0cHV0RmlsZU1hcCA9IGNvbnRleHQub3V0UHV0RmlsZU1hcDtcbiAgICAgICAgY29uc3Qgb3V0cHV0RmlsZXMgPSBPYmplY3QudmFsdWVzKG91dHB1dEZpbGVNYXApO1xuICAgICAgICAvL+WGmeWFpeWSjOWIoOmZpOaWh+S7tuWkhOeQhlxuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGDlvIDlp4vlhpnlhaXmlofku7Y6MC8ke291dHB1dEZpbGVzLmxlbmd0aH1gKTtcblxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzKSA9PiB7XG4gICAgICAgICAgICB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMoXG4gICAgICAgICAgICAgICAgb3V0cHV0RmlsZXMsXG4gICAgICAgICAgICAgICAgKGZpbGVQYXRoLCB0b3RhbCwgbm93LCBpc09rKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5sb2coYFvlhpnlhaXmlofku7ZdIOi/m+W6pjooJHtub3d9LyR7dG90YWx9KSDot6/lvoQ6JHtmaWxlUGF0aH1gKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICB9KTtcbiAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhg5YaZ5YWl57uT5p2ffmApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIExvZ2dlci5zeXN0ZW1Mb2coYOayoeacieWPr+WGmeWFpeaWh+S7tn5gKTtcblxuICAgIH1cblxuXG4gICAgLy/ml6Xlv5fmlofku7ZcbiAgICBpZiAoIWxvZ1N0cikge1xuICAgICAgICBsb2dTdHIgPSBMb2dnZXIubG9nU3RyO1xuICAgIH1cbiAgICBjb25zdCBvdXRwdXRMb2dGaWxlSW5mbzogSU91dFB1dEZpbGVJbmZvID0ge1xuICAgICAgICBmaWxlUGF0aDogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIFwiZXhjZWwyYWxsLmxvZ1wiKSxcbiAgICAgICAgZGF0YTogbG9nU3RyXG4gICAgfTtcbiAgICB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMoW291dHB1dExvZ0ZpbGVJbmZvXSk7XG4gICAgLy/lhpnlhaXnu5PmnZ9cbiAgICBjb252ZXJ0SG9vay5vbldyaXRlRmlsZUVuZChjb250ZXh0KTtcbn1cbi8qKlxuICog5rWL6K+V5paH5Lu25Yy56YWNXG4gKiBAcGFyYW0gY29udmVyQ29uZmlnIFxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVzdEZpbGVNYXRjaChjb252ZXJDb25maWc6IElUYWJsZUNvbnZlcnRDb25maWcpIHtcbiAgICBpZiAoIWNvbnZlckNvbmZpZy5wcm9qUm9vdCkge1xuICAgICAgICBjb252ZXJDb25maWcucHJvalJvb3QgPSBwcm9jZXNzLmN3ZCgpO1xuICAgIH1cbiAgICBsZXQgY29udmVydEhvb2s6IElDb252ZXJ0SG9vaztcbiAgICBpZiAoY29udmVyQ29uZmlnLmN1c3RvbUNvbnZlcnRIb29rUGF0aCkge1xuICAgICAgICBjb252ZXJ0SG9vayA9IHJlcXVpcmUoY29udmVyQ29uZmlnLmN1c3RvbUNvbnZlcnRIb29rUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29udmVydEhvb2sgPSBuZXcgRGVmYXVsdENvbnZlcnRIb29rKCk7XG4gICAgfVxuICAgIGNvbnN0IHRhYmxlRmlsZURpciA9IGNvbnZlckNvbmZpZy50YWJsZUZpbGVEaXI7XG4gICAgaWYgKCF0YWJsZUZpbGVEaXIpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhg6YWN572u6KGo55uu5b2V77yadGFibGVGaWxlRGly5Li656m6YCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWZzLmV4aXN0c1N5bmModGFibGVGaWxlRGlyKSkge1xuICAgICAgICBMb2dnZXIubG9nKGDphY3nva7ooajmlofku7blpLnkuI3lrZjlnKjvvJoke3RhYmxlRmlsZURpcn1gLCBcImVycm9yXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGRlZmF1bHRQYXR0ZXJuID0gW1wiKiovKi57eGxzeCxjc3Z9XCIsIFwiISoqL34kKi4qXCIsIFwiISoqL34uKi4qXCJdO1xuICAgIGlmICghY29udmVyQ29uZmlnLnBhdHRlcm4pIHtcbiAgICAgICAgY29udmVyQ29uZmlnLnBhdHRlcm4gPSBkZWZhdWx0UGF0dGVybjtcbiAgICB9XG4gICAgaWYgKGNvbnZlckNvbmZpZy51c2VNdWx0aVRocmVhZCAmJiBpc05hTihjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtKSkge1xuICAgICAgICBjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtID0gNTtcbiAgICB9XG4gICAgY29uc3QgbWF0Y2hQYXR0ZXJuID0gY29udmVyQ29uZmlnLnBhdHRlcm47XG4gICAgY29uc3QgZGVsZXRlRmlsZVBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGNoYW5nZWRGaWxlUGF0aHM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgZWFjaEZpbGVDYWxsYmFjayA9IChmaWxlUGF0aDogc3RyaW5nLCBpc0RlbGV0ZT86IGJvb2xlYW4pID0+IHtcbiAgICAgICAgbGV0IGNhblJlYWQ6IGJvb2xlYW47XG4gICAgICAgIGlmIChpc0RlbGV0ZSkge1xuICAgICAgICAgICAgZGVsZXRlRmlsZVBhdGhzLnB1c2goZmlsZVBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FuUmVhZCA9IG1tYXRjaC5hbGwoZmlsZVBhdGgsIG1hdGNoUGF0dGVybik7XG4gICAgICAgICAgICBpZiAoY2FuUmVhZCkge1xuICAgICAgICAgICAgICAgIGNoYW5nZWRGaWxlUGF0aHMucHVzaChmaWxlUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgY2FuUmVhZCB9O1xuICAgIH07XG4gICAgbGV0IGNhY2hlRmlsZURpclBhdGg6IHN0cmluZyA9IGNvbnZlckNvbmZpZy5jYWNoZUZpbGVEaXJQYXRoO1xuICAgIGxldCBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGg6IHN0cmluZztcbiAgICBsZXQgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXA7XG4gICAgaWYgKCFjb252ZXJDb25maWcudXNlQ2FjaGUpIHtcbiAgICAgICAgZm9yRWFjaEZpbGUodGFibGVGaWxlRGlyLCBlYWNoRmlsZUNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIWNhY2hlRmlsZURpclBhdGgpIGNhY2hlRmlsZURpclBhdGggPSBcIi5jYWNoZVwiO1xuICAgICAgICBpZiAoIXBhdGguaXNBYnNvbHV0ZShjYWNoZUZpbGVEaXJQYXRoKSkge1xuICAgICAgICAgICAgY2FjaGVGaWxlRGlyUGF0aCA9IHBhdGguam9pbihjb252ZXJDb25maWcucHJvalJvb3QsIGNhY2hlRmlsZURpclBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCA9IHBhdGguam9pbihjYWNoZUZpbGVEaXJQYXRoLCBcIi5lZ2Zwcm1jXCIpO1xuICAgICAgICBwYXJzZVJlc3VsdE1hcCA9IGdldENhY2hlRGF0YShwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgpO1xuICAgICAgICBpZiAoIXBhcnNlUmVzdWx0TWFwKSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdE1hcCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9sZEZpbGVQYXRocyA9IE9iamVjdC5rZXlzKHBhcnNlUmVzdWx0TWFwKTtcbiAgICAgICAgbGV0IG9sZEZpbGVQYXRoSW5kZXg6IG51bWJlcjtcbiAgICAgICAgbGV0IHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdDtcbiAgICAgICAgZm9yRWFjaEZpbGUodGFibGVGaWxlRGlyLCAoZmlsZVBhdGgpID0+IHtcbiAgICAgICAgICAgIHZhciBtZDVzdHIgPSBnZXRGaWxlTWQ1U3luYyhmaWxlUGF0aCk7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXTtcbiAgICAgICAgICAgIGlmICghcGFyc2VSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcFtmaWxlUGF0aF0gPSBwYXJzZVJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJzZVJlc3VsdCAmJiBwYXJzZVJlc3VsdC5tZDVoYXNoICE9PSBtZDVzdHIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGNhblJlYWQgfSA9IGVhY2hGaWxlQ2FsbGJhY2soZmlsZVBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FuUmVhZCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdC5tZDVoYXNoID0gbWQ1c3RyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9sZEZpbGVQYXRoSW5kZXggPSBvbGRGaWxlUGF0aHMuaW5kZXhPZihmaWxlUGF0aCk7XG4gICAgICAgICAgICBpZiAob2xkRmlsZVBhdGhJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kRmlsZVBhdGggPSBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIG9sZEZpbGVQYXRoc1tvbGRGaWxlUGF0aEluZGV4XSA9IGVuZEZpbGVQYXRoO1xuICAgICAgICAgICAgICAgIG9sZEZpbGVQYXRocy5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2xkRmlsZVBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyc2VSZXN1bHRNYXBbb2xkRmlsZVBhdGhzW2ldXTtcbiAgICAgICAgICAgIGVhY2hGaWxlQ2FsbGJhY2sob2xkRmlsZVBhdGhzW2ldLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZihjb252ZXJDb25maWcudXNlQ2FjaGUpe1xuICAgICAgICBjb25zb2xlLmxvZyhgLS0tLeOAkOe8k+WtmOaooeW8j+OAkS0tLS1gKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coYC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLeWMuemFjeWIsOeahOaWh+S7ti0tLS0tLS0tLS0tLS0tLS0tLS0tLWApXG4gICAgY29uc29sZS5sb2coY2hhbmdlZEZpbGVQYXRocyk7XG4gICAgXG59XG4iLCJpbXBvcnQgKiBhcyB4bHN4IGZyb20gXCJ4bHN4XCI7XG4vKipcbiAqIOaYr+WQpuS4uuepuuihqOagvOagvOWtkFxuICogQHBhcmFtIGNlbGxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHlDZWxsKGNlbGw6IHhsc3guQ2VsbE9iamVjdCkge1xuICAgIGlmIChjZWxsICYmIGNlbGwudiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2VsbC52ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gY2VsbC52ID09PSBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZWxsLnYgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBpc05hTihjZWxsLnYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuLyoqXG4gKiDlrZfmr41a55qE57yW56CBXG4gKi9cbmV4cG9ydCBjb25zdCBaQ2hhckNvZGUgPSA5MDtcbi8qKlxuICog5a2X5q+NQeeahOe8lueggVxuICpcbiAqL1xuZXhwb3J0IGNvbnN0IEFDaGFyQ29kZSA9IDY1O1xuLyoqXG4gKiDmoLnmja7lvZPliY3liJfnmoRjaGFyQ29kZXPojrflj5bkuIvkuIDliJdLZXlcbiAqIEBwYXJhbSBjaGFyQ29kZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5leHRDb2xLZXkoY2hhckNvZGVzOiBudW1iZXJbXSk6IHN0cmluZyB7XG4gICAgbGV0IGlzQWRkOiBib29sZWFuO1xuICAgIGZvciAobGV0IGkgPSBjaGFyQ29kZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgaWYgKGNoYXJDb2Rlc1tpXSA8IFpDaGFyQ29kZSkge1xuICAgICAgICAgICAgY2hhckNvZGVzW2ldICs9IDE7XG4gICAgICAgICAgICBpc0FkZCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZXNbaV0gPT09IFpDaGFyQ29kZSkge1xuICAgICAgICAgICAgY2hhckNvZGVzW2ldID0gQUNoYXJDb2RlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghaXNBZGQpIHtcbiAgICAgICAgY2hhckNvZGVzLnB1c2goQUNoYXJDb2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hhckNvZGVzVG9TdHJpbmcoY2hhckNvZGVzKTtcbn1cblxuLyoqXG4gKiDliJfnmoTlrZfnrKbnvJbnoIHmlbDnu4TovazlrZfnrKbkuLJcbiAqIEBwYXJhbSBjaGFyQ29kZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoYXJDb2Rlc1RvU3RyaW5nKGNoYXJDb2RlczogbnVtYmVyW10pOiBzdHJpbmcge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmNoYXJDb2Rlcyk7XG59XG4vKipcbiAqIOWtl+espuS4sui9rOe8lueggeaVsOe7hFxuICogQHBhcmFtIGNvbEtleVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9DaGFyQ29kZXMoY29sS2V5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBjaGFyQ29kZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbEtleS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjaGFyQ29kZXMucHVzaChjb2xLZXkuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuICAgIHJldHVybiBjaGFyQ29kZXM7XG59XG4vKipcbiAqIOe6teWQkemBjeWOhuihqOagvFxuICogQHBhcmFtIHNoZWV0IHhsc3jooajmoLzlr7nosaFcbiAqIEBwYXJhbSBzdGFydFJvdyDlvIDlp4vooYwg5LuOMeW8gOWni1xuICogQHBhcmFtIHN0YXJ0Q29sIOWIl+Wtl+espiDmr5TlpoJBIEJcbiAqIEBwYXJhbSBjYWxsYmFjayDpgY3ljoblm57osIMgKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4gdm9pZFxuICogQHBhcmFtIGlzU2hlZXRSb3dFbmQg5piv5ZCm6KGM57uT5p2f5Yik5pat5pa55rOVXG4gKiBAcGFyYW0gaXNTaGVldENvbEVuZCDmmK/lkKbliJfnu5PmnZ/liKTmlq3mlrnms5VcbiAqIEBwYXJhbSBpc1NraXBTaGVldFJvdyDmmK/lkKbot7Pov4fooYxcbiAqIEBwYXJhbSBpc1NraXBTaGVldENvbCDmmK/lkKbot7Pov4fliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZlcnRpY2FsRm9yRWFjaFNoZWV0KFxuICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgIHN0YXJ0Um93OiBudW1iZXIsXG4gICAgc3RhcnRDb2w6IHN0cmluZyxcbiAgICBjYWxsYmFjazogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4gdm9pZCxcbiAgICBpc1NoZWV0Um93RW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxuICAgIGlzU2hlZXRDb2xFbmQ/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbGtleTogc3RyaW5nKSA9PiBib29sZWFuLFxuICAgIGlzU2tpcFNoZWV0Um93PzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxuICAgIGlzU2tpcFNoZWV0Q29sPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZykgPT4gYm9vbGVhblxuKSB7XG4gICAgY29uc3Qgc2hlZXRSZWY6IHN0cmluZyA9IHNoZWV0W1wiIXJlZlwiXTtcbiAgICBjb25zdCBtYXhSb3dOdW0gPSBwYXJzZUludChzaGVldFJlZi5tYXRjaCgvXFxkKyQvKVswXSk7XG5cbiAgICBjb25zdCBtYXhDb2xLZXkgPSBzaGVldFJlZi5zcGxpdChcIjpcIilbMV0ubWF0Y2goL15bQS1aYS16XSsvKVswXTtcbiAgICBsZXQgbWF4Q29sS2V5Q29kZVN1bSA9IGdldENoYXJDb2RlU3VtKG1heENvbEtleSk7XG5cbiAgICBsZXQgY29sQ2hhckNvZGVzOiBudW1iZXJbXTtcbiAgICBsZXQgY29sS2V5OiBzdHJpbmc7XG4gICAgbGV0IGN1ckNvbENvZGVTdW06IG51bWJlciA9IDA7XG4gICAgY29uc3Qgc3RhcnRDaGFyY29kZXMgPSBzdHJpbmdUb0NoYXJDb2RlcyhzdGFydENvbCk7XG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0Um93OyBpIDw9IG1heFJvd051bTsgaSsrKSB7XG4gICAgICAgIGlmIChpc1NoZWV0Um93RW5kID8gaXNTaGVldFJvd0VuZChzaGVldCwgaSkgOiBmYWxzZSkgYnJlYWs7XG4gICAgICAgIGlmIChpc1NraXBTaGVldFJvdyA/IGlzU2tpcFNoZWV0Um93KHNoZWV0LCBpKSA6IGZhbHNlKSBjb250aW51ZTtcbiAgICAgICAgY29sQ2hhckNvZGVzID0gc3RhcnRDaGFyY29kZXMuY29uY2F0KFtdKTtcblxuICAgICAgICBjb2xLZXkgPSBzdGFydENvbDtcblxuICAgICAgICBsZXQgaGFzTmV4dENvbCA9IGlzU2hlZXRDb2xFbmQgPyAhaXNTaGVldENvbEVuZChzaGVldCwgY29sS2V5KSA6IHRydWU7XG4gICAgICAgIHdoaWxlIChoYXNOZXh0Q29sKSB7XG4gICAgICAgICAgICBpZiAoIShpc1NraXBTaGVldENvbCA/IGlzU2tpcFNoZWV0Q29sKHNoZWV0LCBjb2xLZXkpIDogZmFsc2UpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soc2hlZXQsIGNvbEtleSwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb2xLZXkgPSBnZXROZXh0Q29sS2V5KGNvbENoYXJDb2Rlcyk7XG4gICAgICAgICAgICBjdXJDb2xDb2RlU3VtID0gZ2V0Q2hhckNvZGVTdW0oY29sS2V5KTtcbiAgICAgICAgICAgIGlmIChtYXhDb2xLZXlDb2RlU3VtID49IGN1ckNvbENvZGVTdW0pIHtcbiAgICAgICAgICAgICAgICBoYXNOZXh0Q29sID0gaXNTaGVldENvbEVuZCA/ICFpc1NoZWV0Q29sRW5kKHNoZWV0LCBjb2xLZXkpIDogdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFzTmV4dENvbCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIOaoquWQkemBjeWOhuihqOagvFxuICogQHBhcmFtIHNoZWV0IHhsc3jooajmoLzlr7nosaFcbiAqIEBwYXJhbSBzdGFydFJvdyDlvIDlp4vooYwg5LuOMeW8gOWni1xuICogQHBhcmFtIHN0YXJ0Q29sIOWIl+Wtl+espiDmr5TlpoJBIEJcbiAqIEBwYXJhbSBjYWxsYmFjayDpgY3ljoblm57osIMgKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4gdm9pZFxuICogQHBhcmFtIGlzU2hlZXRSb3dFbmQg5piv5ZCm6KGM57uT5p2f5Yik5pat5pa55rOVXG4gKiBAcGFyYW0gaXNTaGVldENvbEVuZCDmmK/lkKbliJfnu5PmnZ/liKTmlq3mlrnms5VcbiAqIEBwYXJhbSBpc1NraXBTaGVldFJvdyDmmK/lkKbot7Pov4fooYxcbiAqIEBwYXJhbSBpc1NraXBTaGVldENvbCDmmK/lkKbot7Pov4fliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhvcml6b250YWxGb3JFYWNoU2hlZXQoXG4gICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgc3RhcnRSb3c6IG51bWJlcixcbiAgICBzdGFydENvbDogc3RyaW5nLFxuICAgIGNhbGxiYWNrOiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB2b2lkLFxuICAgIGlzU2hlZXRSb3dFbmQ/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IGJvb2xlYW4sXG4gICAgaXNTaGVldENvbEVuZD86IChzaGVldDogeGxzeC5TaGVldCwgY29sa2V5OiBzdHJpbmcpID0+IGJvb2xlYW4sXG4gICAgaXNTa2lwU2hlZXRSb3c/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IGJvb2xlYW4sXG4gICAgaXNTa2lwU2hlZXRDb2w/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKSA9PiBib29sZWFuXG4pIHtcbiAgICBjb25zdCBzaGVldFJlZjogc3RyaW5nID0gc2hlZXRbXCIhcmVmXCJdO1xuICAgIGNvbnN0IG1heFJvd051bSA9IHBhcnNlSW50KHNoZWV0UmVmLm1hdGNoKC9cXGQrJC8pWzBdKTtcblxuICAgIGNvbnN0IG1heENvbEtleSA9IHNoZWV0UmVmLnNwbGl0KFwiOlwiKVsxXS5tYXRjaCgvXltBLVphLXpdKy8pWzBdO1xuICAgIGNvbnN0IG1heENvbEtleUNvZGVTdW0gPSBnZXRDaGFyQ29kZVN1bShtYXhDb2xLZXkpO1xuICAgIGxldCBjb2xDaGFyQ29kZXM6IG51bWJlcltdO1xuICAgIGxldCBjb2xLZXk6IHN0cmluZztcbiAgICBjb2xDaGFyQ29kZXMgPSBzdHJpbmdUb0NoYXJDb2RlcyhzdGFydENvbCk7XG4gICAgbGV0IGN1ckNvbENvZGVTdW06IG51bWJlciA9IDA7XG4gICAgY29sS2V5ID0gc3RhcnRDb2w7XG4gICAgbGV0IGhhc05leHRDb2wgPSBpc1NoZWV0Q29sRW5kID8gIWlzU2hlZXRDb2xFbmQoc2hlZXQsIGNvbEtleSkgOiB0cnVlO1xuICAgIHdoaWxlIChoYXNOZXh0Q29sKSB7XG4gICAgICAgIGlmICghKGlzU2tpcFNoZWV0Q29sID8gaXNTa2lwU2hlZXRDb2woc2hlZXQsIGNvbEtleSkgOiBmYWxzZSkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBzdGFydFJvdzsgaSA8PSBtYXhSb3dOdW07IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpc1NoZWV0Um93RW5kID8gaXNTaGVldFJvd0VuZChzaGVldCwgaSkgOiBmYWxzZSkgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKGlzU2tpcFNoZWV0Um93ID8gaXNTa2lwU2hlZXRSb3coc2hlZXQsIGkpIDogZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNoZWV0LCBjb2xLZXksIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29sS2V5ID0gZ2V0TmV4dENvbEtleShjb2xDaGFyQ29kZXMpO1xuICAgICAgICBjdXJDb2xDb2RlU3VtID0gZ2V0Q2hhckNvZGVTdW0oY29sS2V5KTtcbiAgICAgICAgaWYgKG1heENvbEtleUNvZGVTdW0gPj0gY3VyQ29sQ29kZVN1bSkge1xuICAgICAgICAgICAgaGFzTmV4dENvbCA9IGlzU2hlZXRDb2xFbmQgPyAhaXNTaGVldENvbEVuZChzaGVldCwgY29sS2V5KSA6IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYXNOZXh0Q29sID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG5sZXQgY29sS2V5U3VtTWFwID0ge307XG5mdW5jdGlvbiBnZXRDaGFyQ29kZVN1bShjb2xLZXk6IHN0cmluZyk6IG51bWJlciB7XG4gICAgbGV0IHN1bTogbnVtYmVyID0gY29sS2V5U3VtTWFwW2NvbEtleV07XG4gICAgaWYgKCFzdW0pIHtcbiAgICAgICAgc3VtID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xLZXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBjb2xLZXkuY2hhckNvZGVBdChpKTtcbiAgICAgICAgfVxuICAgICAgICBjb2xLZXlTdW1NYXBbY29sS2V5XSA9IHN1bTtcbiAgICB9XG4gICAgcmV0dXJuIHN1bTtcbn1cbi8qKlxuICog6K+75Y+W6YWN572u6KGo5paH5Lu2IOWQjOatpeeahFxuICogQHBhcmFtIGZpbGVJbmZvXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkVGFibGVGaWxlKGZpbGVJbmZvOiBJRmlsZUluZm8pOiB4bHN4LldvcmtCb29rIHtcbiAgICBjb25zdCB3b3JrQm9vayA9IHhsc3gucmVhZEZpbGUoZmlsZUluZm8uZmlsZVBhdGgsIHsgdHlwZTogaXNDU1YoZmlsZUluZm8uZmlsZUV4dE5hbWUpID8gXCJzdHJpbmdcIiA6IFwiZmlsZVwiIH0pO1xuICAgIHJldHVybiB3b3JrQm9vaztcbn1cbi8qKlxuICog5qC55o2u5paH5Lu25ZCN5ZCO57yA5Yik5pat5piv5ZCm5Li6Y3N25paH5Lu2XG4gKiBAcGFyYW0gZmlsZUV4dE5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ1NWKGZpbGVFeHROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmlsZUV4dE5hbWUgPT09IFwiY3N2XCI7XG59XG4iLCJpbXBvcnQgKiBhcyB4bHN4IGZyb20gXCJ4bHN4XCI7XG5pbXBvcnQgeyB2YWx1ZVRyYW5zRnVuY01hcCB9IGZyb20gXCIuXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dlclwiO1xuaW1wb3J0IHsgaG9yaXpvbnRhbEZvckVhY2hTaGVldCwgaXNFbXB0eUNlbGwsIHJlYWRUYWJsZUZpbGUsIHZlcnRpY2FsRm9yRWFjaFNoZWV0IH0gZnJvbSBcIi4vdGFibGUtdXRpbHNcIjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJVGFibGVGaWVsZCB7XG4gICAgICAgIC8qKumFjee9ruihqOS4reazqOmHiuWAvCAqL1xuICAgICAgICB0ZXh0OiBzdHJpbmc7XG4gICAgICAgIC8qKumFjee9ruihqOS4reexu+Wei+WAvCAqL1xuICAgICAgICBvcmlnaW5UeXBlOiBzdHJpbmc7XG4gICAgICAgIC8qKumFjee9ruihqOS4reWtl+auteWQjeWAvCAqL1xuICAgICAgICBvcmlnaW5GaWVsZE5hbWU6IHN0cmluZztcbiAgICAgICAgLyoq6Kej5p6Q5ZCO55qE57G75Z6L5YC8ICovXG4gICAgICAgIHR5cGU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuino+aekOWQjueahOWtkOexu+Wei+WAvCAqL1xuICAgICAgICBzdWJUeXBlPzogc3RyaW5nO1xuICAgICAgICAvKirop6PmnpDlkI7nmoTlrZfmrrXlkI3lgLwgKi9cbiAgICAgICAgZmllbGROYW1lPzogc3RyaW5nO1xuICAgICAgICAvKirlr7nosaHnmoTlrZDlrZfmrrXlkI0gKi9cbiAgICAgICAgc3ViRmllbGROYW1lPzogc3RyaW5nO1xuICAgICAgICAvKirlpJrliJflr7nosaEgKi9cbiAgICAgICAgaXNNdXRpQ29sT2JqPzogYm9vbGVhbjtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElUYWJsZURlZmluZSB7XG4gICAgICAgIC8qKumFjee9ruihqOWQjSAqL1xuICAgICAgICB0YWJsZU5hbWU6IHN0cmluZztcbiAgICAgICAgLyoq6YWN572u6KGo57G75Z6LIOm7mOiupOS4pOenjTogdmVydGljYWwg5ZKMIGhvcml6b250YWwqL1xuICAgICAgICB0YWJsZVR5cGU6IHN0cmluZztcblxuICAgICAgICAvKirlvIDlp4vooYzku44x5byA5aeLICovXG4gICAgICAgIHN0YXJ0Um93OiBudW1iZXI7XG4gICAgICAgIC8qKuW8gOWni+WIl+S7jkHlvIDlp4sgKi9cbiAgICAgICAgc3RhcnRDb2w6IHN0cmluZztcbiAgICAgICAgLyoq5Z6C55u06Kej5p6Q5a2X5q615a6a5LmJICovXG4gICAgICAgIHZlcnRpY2FsRmllbGREZWZpbmU6IElWZXJ0aWNhbEZpZWxkRGVmaW5lO1xuICAgICAgICAvKirmqKrlkJHop6PmnpDlrZfmrrXlrprkuYkgKi9cbiAgICAgICAgaG9yaXpvbnRhbEZpZWxkRGVmaW5lOiBJSG9yaXpvbnRhbEZpZWxkRGVmaW5lO1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSUhvcml6b250YWxGaWVsZERlZmluZSB7XG4gICAgICAgIC8qKuexu+Wei+ihjCAqL1xuICAgICAgICB0eXBlQ29sOiBzdHJpbmc7XG4gICAgICAgIC8qKuWtl+auteWQjeihjCAqL1xuICAgICAgICBmaWVsZENvbDogc3RyaW5nO1xuICAgICAgICAvKirms6jph4rooYwgKi9cbiAgICAgICAgdGV4dENvbDogc3RyaW5nO1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSVZlcnRpY2FsRmllbGREZWZpbmUge1xuICAgICAgICAvKirnsbvlnovooYwgKi9cbiAgICAgICAgdHlwZVJvdzogbnVtYmVyO1xuICAgICAgICAvKirlrZfmrrXlkI3ooYwgKi9cbiAgICAgICAgZmllbGRSb3c6IG51bWJlcjtcbiAgICAgICAgLyoq5rOo6YeK6KGMICovXG4gICAgICAgIHRleHRSb3c6IG51bWJlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5a2X5q615a2X5YW4XG4gICAgICoga2V55piv5YiXY29sS2V5XG4gICAgICogdmFsdWXmmK/lrZfmrrXlr7nosaFcbiAgICAgKi9cbiAgICB0eXBlIENvbEtleVRhYmxlRmllbGRNYXAgPSB7IFtrZXk6IHN0cmluZ106IElUYWJsZUZpZWxkIH07XG5cbiAgICAvKipcbiAgICAgKiDooajmoLznmoTkuIDooYzmiJbogIXkuIDliJdcbiAgICAgKiBrZXnkuLrlrZfmrrXlkI3lgLzvvIx2YWx1ZeS4uuihqOagvOeahOS4gOagvFxuICAgICAqL1xuICAgIHR5cGUgVGFibGVSb3dPckNvbCA9IHsgW2tleTogc3RyaW5nXTogSVRhYmxlQ2VsbCB9O1xuICAgIC8qKlxuICAgICAqIOihqOagvOeahOS4gOagvFxuICAgICAqL1xuICAgIGludGVyZmFjZSBJVGFibGVDZWxsIHtcbiAgICAgICAgLyoq5a2X5q615a+56LGhICovXG4gICAgICAgIGZpbGVkOiBJVGFibGVGaWVsZDtcbiAgICAgICAgLyoq5YC8ICovXG4gICAgICAgIHZhbHVlOiBhbnk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOihqOagvOihjOaIluWIl+eahOWtl+WFuFxuICAgICAqIGtleeS4uuihjOe0ouW8le+8jHZhbHVl5Li66KGo5qC855qE5LiA6KGMXG4gICAgICovXG4gICAgdHlwZSBUYWJsZVJvd09yQ29sTWFwID0geyBba2V5OiBzdHJpbmddOiBUYWJsZVJvd09yQ29sIH07XG4gICAgLyoqXG4gICAgICog6KGo5qC86KGM5oiW5YiX5YC85pWw57uEXG4gICAgICoga2V55Li76ZSu77yMdmFsdWXmmK/lgLzmlbDnu4RcbiAgICAgKi9cbiAgICB0eXBlIFJvd09yQ29sVmFsdWVzTWFwID0geyBba2V5OiBzdHJpbmddOiBhbnlbXSB9O1xuICAgIGludGVyZmFjZSBJVGFibGVWYWx1ZXMge1xuICAgICAgICAvKirlrZfmrrXlkI3mlbDnu4QgKi9cbiAgICAgICAgZmllbGRzOiBzdHJpbmdbXTtcbiAgICAgICAgLyoq6KGo5qC85YC85pWw57uEICovXG4gICAgICAgIHJvd09yQ29sVmFsdWVzTWFwOiBSb3dPckNvbFZhbHVlc01hcDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kej5p6Q57uT5p6cXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElUYWJsZVBhcnNlUmVzdWx0IHtcbiAgICAgICAgLyoq6YWN572u6KGo5a6a5LmJICovXG4gICAgICAgIHRhYmxlRGVmaW5lPzogSVRhYmxlRGVmaW5lO1xuICAgICAgICAvKirlvZPliY3liIbooajlkI0gKi9cbiAgICAgICAgY3VyU2hlZXROYW1lPzogc3RyaW5nO1xuICAgICAgICAvKirlrZfmrrXlrZflhbggKi9cbiAgICAgICAgZmlsZWRNYXA/OiBDb2xLZXlUYWJsZUZpZWxkTWFwO1xuICAgICAgICAvLyAvKirooajmoLzooYzmiJbliJfnmoTlrZflhbggKi9cbiAgICAgICAgLy8gcm93T3JDb2xNYXA6IFRhYmxlUm93T3JDb2xNYXBcbiAgICAgICAgLyoq5Y2V5Liq6KGo5qC85a+56LGhICovXG4gICAgICAgIC8qKmtleeaYr+S4u+mUruWAvO+8jHZhbHVl5piv5LiA6KGM5a+56LGhICovXG4gICAgICAgIHRhYmxlT2JqPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcbiAgICAgICAgLyoq5b2T5YmN6KGM5oiW5YiX5a+56LGhICovXG4gICAgICAgIGN1clJvd09yQ29sT2JqPzogYW55O1xuICAgICAgICAvKirkuLvplK7lgLwgKi9cbiAgICAgICAgbWFpbktleUZpZWxkTmFtZT86IHN0cmluZztcbiAgICB9XG5cbiAgICAvKirlgLzovazmjaLmlrnms5UgKi9cbiAgICBpbnRlcmZhY2UgSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgICAgICBlcnJvcj86IGFueTtcbiAgICAgICAgdmFsdWU/OiBhbnk7XG4gICAgfVxuICAgIHR5cGUgVmFsdWVUcmFuc0Z1bmMgPSAoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBhbnkpID0+IElUcmFuc1ZhbHVlUmVzdWx0O1xuICAgIC8qKlxuICAgICAqIOWAvOi9rOaNouaWueazleWtl+WFuFxuICAgICAqIGtleeaYr+exu+Wei2tleVxuICAgICAqIHZhbHVl5piv5pa55rOVXG4gICAgICovXG4gICAgdHlwZSBWYWx1ZVRyYW5zRnVuY01hcCA9IHsgW2tleTogc3RyaW5nXTogVmFsdWVUcmFuc0Z1bmMgfTtcbn1cbmV4cG9ydCBlbnVtIFRhYmxlVHlwZSB7XG4gICAgdmVydGljYWwgPSBcInZlcnRpY2FsXCIsXG4gICAgaG9yaXpvbnRhbCA9IFwiaG9yaXpvbnRhbFwiXG59XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0UGFyc2VIYW5kbGVyIGltcGxlbWVudHMgSVRhYmxlUGFyc2VIYW5kbGVyIHtcbiAgICBwcml2YXRlIF92YWx1ZVRyYW5zRnVuY01hcDogVmFsdWVUcmFuc0Z1bmNNYXA7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlVHJhbnNGdW5jTWFwID0gdmFsdWVUcmFuc0Z1bmNNYXA7XG4gICAgfVxuICAgIGdldFRhYmxlRGVmaW5lKGZpbGVJbmZvOiBJRmlsZUluZm8sIHdvcmtCb29rOiB4bHN4LldvcmtCb29rKTogSVRhYmxlRGVmaW5lIHtcbiAgICAgICAgLy/lj5booajmoLzmlofku7blkI3kuLrooajmoLzlkI1cbiAgICAgICAgY29uc3QgdGFibGVOYW1lID0gZmlsZUluZm8uZmlsZU5hbWU7XG5cbiAgICAgICAgY29uc3QgdGFibGVEZWZpbmU6IFBhcnRpYWw8SVRhYmxlRGVmaW5lPiA9IHtcbiAgICAgICAgICAgIHRhYmxlTmFtZTogdGFibGVOYW1lXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGNlbGxLZXk6IHN0cmluZztcbiAgICAgICAgbGV0IGNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdDtcbiAgICAgICAgLy/lj5bnrKzkuIDkuKrooahcbiAgICAgICAgY29uc3Qgc2hlZXROYW1lcyA9IHdvcmtCb29rLlNoZWV0TmFtZXM7XG4gICAgICAgIGxldCBzaGVldDogeGxzeC5TaGVldDtcbiAgICAgICAgbGV0IGZpcnN0Q2VsbFZhbHVlOiB7IHRhYmxlTmFtZUluU2hlZXQ6IHN0cmluZzsgdGFibGVUeXBlOiBzdHJpbmcgfTtcbiAgICAgICAgbGV0IGZpcnN0Q2VsbE9iajogeGxzeC5DZWxsT2JqZWN0O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNoZWV0ID0gd29ya0Jvb2suU2hlZXRzW3NoZWV0TmFtZXNbaV1dO1xuICAgICAgICAgICAgZmlyc3RDZWxsT2JqID0gc2hlZXRbXCJBXCIgKyAxXTtcbiAgICAgICAgICAgIGlmICghaXNFbXB0eUNlbGwoZmlyc3RDZWxsT2JqKSkge1xuICAgICAgICAgICAgICAgIGZpcnN0Q2VsbFZhbHVlID0gdGhpcy5fZ2V0Rmlyc3RDZWxsVmFsdWUoZmlyc3RDZWxsT2JqKTtcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RDZWxsVmFsdWUgJiYgZmlyc3RDZWxsVmFsdWUudGFibGVOYW1lSW5TaGVldCA9PT0gdGFibGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZpcnN0Q2VsbFZhbHVlIHx8IGZpcnN0Q2VsbFZhbHVlLnRhYmxlTmFtZUluU2hlZXQgIT09IHRhYmxlTmFtZSkge1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhg6KGo5qC85LiN6KeE6IyDLOi3s+i/h+ino+aekCzot6/lvoQ6JHtmaWxlSW5mby5maWxlUGF0aH1gLCBcImVycm9yXCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGFibGVEZWZpbmUudGFibGVUeXBlID0gZmlyc3RDZWxsVmFsdWUudGFibGVUeXBlO1xuICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLnZlcnRpY2FsRmllbGREZWZpbmUgPSB7fSBhcyBhbnk7XG4gICAgICAgICAgICBjb25zdCB2ZXJ0aWNhbEZpZWxkRGVmaW5lOiBJVmVydGljYWxGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLnZlcnRpY2FsRmllbGREZWZpbmU7XG4gICAgICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnRleHRSb3cgPSAxO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgICAgIGNlbGxLZXkgPSBcIkFcIiArIGk7XG4gICAgICAgICAgICAgICAgY2VsbE9iaiA9IHNoZWV0W2NlbGxLZXldO1xuICAgICAgICAgICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsT2JqKSB8fCBjZWxsT2JqLnYgPT09IFwiTk9cIiB8fCBjZWxsT2JqLnYgPT09IFwiRU5EXCIgfHwgY2VsbE9iai52ID09PSBcIlNUQVJUXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3cgPSBpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2VsbE9iai52ID09PSBcIkNMSUVOVFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3cgPSBpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2VsbE9iai52ID09PSBcIlRZUEVcIikge1xuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3cgPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGFibGVEZWZpbmUuc3RhcnRSb3cgJiYgdmVydGljYWxGaWVsZERlZmluZS5maWVsZFJvdyAmJiB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3cpIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydENvbCA9IFwiQlwiO1xuICAgICAgICB9IGVsc2UgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLmhvcml6b250YWxGaWVsZERlZmluZSA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgIGNvbnN0IGhvcml6b250YWxGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLmhvcml6b250YWxGaWVsZERlZmluZTtcbiAgICAgICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZS50ZXh0Q29sID0gXCJBXCI7XG4gICAgICAgICAgICBob3Jpem9udGFsRmllbGREZWZpbmUudHlwZUNvbCA9IFwiQlwiO1xuICAgICAgICAgICAgaG9yaXpvbnRhbEZpZWxkRGVmaW5lLmZpZWxkQ29sID0gXCJDXCI7XG4gICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydENvbCA9IFwiRVwiO1xuICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3cgPSAyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhYmxlRGVmaW5lIGFzIGFueTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfZ2V0Rmlyc3RDZWxsVmFsdWUoZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QpIHtcbiAgICAgICAgaWYgKCFmaXJzdENlbGxPYmopIHJldHVybjtcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlcyA9IChmaXJzdENlbGxPYmoudiBhcyBzdHJpbmcpLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgbGV0IHRhYmxlTmFtZUluU2hlZXQ6IHN0cmluZztcbiAgICAgICAgbGV0IHRhYmxlVHlwZTogc3RyaW5nO1xuICAgICAgICBpZiAoY2VsbFZhbHVlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB0YWJsZU5hbWVJblNoZWV0ID0gY2VsbFZhbHVlc1sxXTtcbiAgICAgICAgICAgIHRhYmxlVHlwZSA9IGNlbGxWYWx1ZXNbMF0gPT09IFwiSFwiID8gVGFibGVUeXBlLmhvcml6b250YWwgOiBUYWJsZVR5cGUudmVydGljYWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YWJsZU5hbWVJblNoZWV0ID0gY2VsbFZhbHVlc1swXTtcbiAgICAgICAgICAgIHRhYmxlVHlwZSA9IFRhYmxlVHlwZS52ZXJ0aWNhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB0YWJsZU5hbWVJblNoZWV0OiB0YWJsZU5hbWVJblNoZWV0LCB0YWJsZVR5cGU6IHRhYmxlVHlwZSB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDliKTmlq3ooajmoLzmmK/lkKbog73op6PmnpBcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKi9cbiAgICBjaGVja1NoZWV0Q2FuUGFyc2UodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIHNoZWV0TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8v5aaC5p6c6L+Z5Liq6KGo5Liq56ys5LiA5qC85YC85LiN562J5LqO6KGo5ZCN77yM5YiZ5LiN6Kej5p6QXG4gICAgICAgIGNvbnN0IGZpcnN0Q2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbXCJBXCIgKyAxXTtcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsVmFsdWUgPSB0aGlzLl9nZXRGaXJzdENlbGxWYWx1ZShmaXJzdENlbGxPYmopO1xuICAgICAgICBpZiAoZmlyc3RDZWxsT2JqICYmIHRhYmxlRGVmaW5lKSB7XG4gICAgICAgICAgICBpZiAoZmlyc3RDZWxsVmFsdWUudGFibGVOYW1lSW5TaGVldCAhPT0gdGFibGVEZWZpbmUudGFibGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6KGo6KGM57uT5p2f5Yik5patXG4gICAgICogQHBhcmFtIHRhYmxlRGVmaW5lXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIHJvd1xuICAgICAqL1xuICAgIGlzU2hlZXRSb3dFbmQodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIHJvdzogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xuXG4gICAgICAgIC8vIH0gZWxzZSBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuXG4gICAgICAgIC8vIH1cbiAgICAgICAgLy/liKTmlq3kuIrkuIDooYznmoTmoIflv5fmmK/lkKbkuLpFTkRcbiAgICAgICAgaWYgKHJvdyA+IDEpIHtcbiAgICAgICAgICAgIHJvdyA9IHJvdyAtIDE7XG4gICAgICAgICAgICBjb25zdCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtcIkFcIiArIHJvd107XG4gICAgICAgICAgICByZXR1cm4gY2VsbE9iaiAmJiBjZWxsT2JqLnYgPT09IFwiRU5EXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6KGo5YiX57uT5p2f5Yik5patXG4gICAgICogQHBhcmFtIHRhYmxlRGVmaW5lXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIGNvbEtleVxuICAgICAqL1xuICAgIGlzU2hlZXRDb2xFbmQodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8v5Yik5pat6L+Z5LiA5YiX56ys5LiA6KGM5piv5ZCm5Li656m6XG4gICAgICAgIGNvbnN0IGZpcnN0Q2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgMV07XG4gICAgICAgIC8vIGNvbnN0IHR5cGVDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyB0YWJsZUZpbGUudGFibGVEZWZpbmUudHlwZVJvd107XG4gICAgICAgIHJldHVybiBpc0VtcHR5Q2VsbChmaXJzdENlbGxPYmopO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmo4Dmn6XooYzmmK/lkKbpnIDopoHop6PmnpBcbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmVcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gcm93SW5kZXhcbiAgICAgKi9cbiAgICBjaGVja1Jvd05lZWRQYXJzZSh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtcIkFcIiArIHJvd0luZGV4XTtcbiAgICAgICAgaWYgKGNlbGxPYmogJiYgY2VsbE9iai52ID09PSBcIk5PXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kej5p6Q5Y2V5Liq5qC85a2QXG4gICAgICogQHBhcmFtIHRhYmxlUGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICogQHBhcmFtIHJvd0luZGV4XG4gICAgICogQHBhcmFtIGlzTmV3Um93T3JDb2wg5piv5ZCm5Li65paw55qE5LiA6KGM5oiW6ICF5LiA5YiXXG4gICAgICovXG4gICAgcGFyc2VWZXJ0aWNhbENlbGwoXG4gICAgICAgIHRhYmxlUGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICAgICAgY29sS2V5OiBzdHJpbmcsXG4gICAgICAgIHJvd0luZGV4OiBudW1iZXIsXG4gICAgICAgIGlzTmV3Um93T3JDb2w6IGJvb2xlYW5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmllbGRJbmZvID0gdGhpcy5nZXRWZXJ0aWNhbFRhYmxlRmllbGQodGFibGVQYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgpO1xuICAgICAgICBpZiAoIWZpZWxkSW5mbykgcmV0dXJuO1xuICAgICAgICBjb25zdCBjZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJhbnNSZXN1bHQgPSB0aGlzLnRyYW5zVmFsdWUodGFibGVQYXJzZVJlc3VsdCwgZmllbGRJbmZvLCBjZWxsLnYpO1xuICAgICAgICBpZiAodHJhbnNSZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgICAgIExvZ2dlci5sb2coXG4gICAgICAgICAgICAgICAgYOihqOagvDoke3RhYmxlUGFyc2VSZXN1bHQuZmlsZVBhdGh9LOWIhuihqDoke3RhYmxlUGFyc2VSZXN1bHQuY3VyU2hlZXROYW1lfSzooYw6JHtyb3dJbmRleH0s5YiX77yaJHtjb2xLZXl96Kej5p6Q5Ye66ZSZYCxcbiAgICAgICAgICAgICAgICBcImVycm9yXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBMb2dnZXIubG9nKHRyYW5zUmVzdWx0LmVycm9yLCBcImVycm9yXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyYW5zZWRWYWx1ZSA9IHRyYW5zUmVzdWx0LnZhbHVlO1xuICAgICAgICBsZXQgbWFpbktleUZpZWxkTmFtZTogc3RyaW5nID0gdGFibGVQYXJzZVJlc3VsdC5tYWluS2V5RmllbGROYW1lO1xuICAgICAgICBpZiAoIW1haW5LZXlGaWVsZE5hbWUpIHtcbiAgICAgICAgICAgIC8v56ys5LiA5Liq5a2X5q615bCx5piv5Li76ZSuXG4gICAgICAgICAgICBtYWluS2V5RmllbGROYW1lID0gZmllbGRJbmZvLmZpZWxkTmFtZTtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQubWFpbktleUZpZWxkTmFtZSA9IGZpZWxkSW5mby5maWVsZE5hbWU7XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqID0ge307XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJvd09yQ29sT2JqOiBhbnkgPSB0YWJsZVBhcnNlUmVzdWx0LmN1clJvd09yQ29sT2JqO1xuICAgICAgICBpZiAoaXNOZXdSb3dPckNvbCkge1xuICAgICAgICAgICAgLy/mlrDnmoTkuIDooYxcbiAgICAgICAgICAgIHJvd09yQ29sT2JqID0ge307XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LmN1clJvd09yQ29sT2JqID0gdGFibGVQYXJzZVJlc3VsdC50YWJsZU9ialt0cmFuc2VkVmFsdWVdID0gcm93T3JDb2xPYmo7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGRJbmZvLmlzTXV0aUNvbE9iaikge1xuICAgICAgICAgICAgbGV0IHN1Yk9iaiA9IHJvd09yQ29sT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdO1xuICAgICAgICAgICAgaWYgKCFzdWJPYmopIHtcbiAgICAgICAgICAgICAgICBzdWJPYmogPSB7fTtcbiAgICAgICAgICAgICAgICByb3dPckNvbE9ialtmaWVsZEluZm8uZmllbGROYW1lXSA9IHN1Yk9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1Yk9ialtmaWVsZEluZm8uc3ViRmllbGROYW1lXSA9IHRyYW5zZWRWYWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJvd09yQ29sT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdID0gdHJhbnNlZFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOaoquWQkeWNleS4quagvOWtkFxuICAgICAqIEBwYXJhbSB0YWJsZVBhcnNlUmVzdWx0XG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIGNvbEtleVxuICAgICAqIEBwYXJhbSByb3dJbmRleFxuICAgICAqIEBwYXJhbSBpc05ld1Jvd09yQ29sIOaYr+WQpuS4uuaWsOeahOS4gOihjOaIluiAheS4gOWIl1xuICAgICAqL1xuICAgIHBhcnNlSG9yaXpvbnRhbENlbGwoXG4gICAgICAgIHRhYmxlUGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICAgICAgY29sS2V5OiBzdHJpbmcsXG4gICAgICAgIHJvd0luZGV4OiBudW1iZXIsXG4gICAgICAgIGlzTmV3Um93T3JDb2w6IGJvb2xlYW5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmllbGRJbmZvID0gdGhpcy5nZXRIb3Jpem9udGFsVGFibGVGaWVsZCh0YWJsZVBhcnNlUmVzdWx0LCBzaGVldCwgY29sS2V5LCByb3dJbmRleCk7XG4gICAgICAgIGlmICghZmllbGRJbmZvKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGNlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHJvd0luZGV4XTtcbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKGNlbGwpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJhbnNSZXN1bHQgPSB0aGlzLnRyYW5zVmFsdWUodGFibGVQYXJzZVJlc3VsdCwgZmllbGRJbmZvLCBjZWxsLnYpO1xuICAgICAgICBpZiAodHJhbnNSZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgICAgIExvZ2dlci5sb2coXG4gICAgICAgICAgICAgICAgYOihqOagvDoke3RhYmxlUGFyc2VSZXN1bHQuZmlsZVBhdGh9LOWIhuihqDoke3RhYmxlUGFyc2VSZXN1bHQuY3VyU2hlZXROYW1lfSzooYw6JHtyb3dJbmRleH0s5YiX77yaJHtjb2xLZXl96Kej5p6Q5Ye66ZSZYCxcbiAgICAgICAgICAgICAgICBcImVycm9yXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBMb2dnZXIubG9nKHRyYW5zUmVzdWx0LmVycm9yLCBcImVycm9yXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyYW5zZWRWYWx1ZSA9IHRyYW5zUmVzdWx0LnZhbHVlO1xuICAgICAgICBpZiAoIXRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmopIHtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmogPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmllbGRJbmZvLmlzTXV0aUNvbE9iaikge1xuICAgICAgICAgICAgbGV0IHN1Yk9iaiA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV07XG4gICAgICAgICAgICBpZiAoIXN1Yk9iaikge1xuICAgICAgICAgICAgICAgIHN1Yk9iaiA9IHt9O1xuICAgICAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSBzdWJPYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJPYmpbZmllbGRJbmZvLnN1YkZpZWxkTmFtZV0gPSB0cmFuc2VkVmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdID0gdHJhbnNlZFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOWHuuWtl+auteWvueixoVxuICAgICAqIEBwYXJhbSB0YWJsZVBhcnNlUmVzdWx0XG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIGNvbEtleVxuICAgICAqIEBwYXJhbSByb3dJbmRleFxuICAgICAqL1xuICAgIGdldFZlcnRpY2FsVGFibGVGaWVsZChcbiAgICAgICAgdGFibGVQYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsXG4gICAgICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgICAgICBjb2xLZXk6IHN0cmluZyxcbiAgICAgICAgcm93SW5kZXg6IG51bWJlclxuICAgICk6IElUYWJsZUZpZWxkIHtcbiAgICAgICAgY29uc3QgdGFibGVEZWZpbmUgPSB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lO1xuICAgICAgICBsZXQgdGFibGVGaWxlZE1hcCA9IHRhYmxlUGFyc2VSZXN1bHQuZmlsZWRNYXA7XG4gICAgICAgIGlmICghdGFibGVGaWxlZE1hcCkge1xuICAgICAgICAgICAgdGFibGVGaWxlZE1hcCA9IHt9O1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5maWxlZE1hcCA9IHRhYmxlRmlsZWRNYXA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmVydGljYWxGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLnZlcnRpY2FsRmllbGREZWZpbmU7XG4gICAgICAgIGNvbnN0IGZpbGVkQ2VsbCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3ddO1xuICAgICAgICBsZXQgb3JpZ2luRmllbGROYW1lOiBzdHJpbmc7XG4gICAgICAgIGlmICghaXNFbXB0eUNlbGwoZmlsZWRDZWxsKSkge1xuICAgICAgICAgICAgb3JpZ2luRmllbGROYW1lID0gZmlsZWRDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGlmICghb3JpZ2luRmllbGROYW1lKSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IGZpZWxkOiBJVGFibGVGaWVsZCA9IHt9IGFzIGFueTtcbiAgICAgICAgLy/nvJPlrZhcbiAgICAgICAgaWYgKHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIC8v5rOo6YeKXG4gICAgICAgIGNvbnN0IHRleHRDZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnRleHRSb3ddO1xuICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKHRleHRDZWxsKSkge1xuICAgICAgICAgICAgZmllbGQudGV4dCA9IHRleHRDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIC8v57G75Z6LXG4gICAgICAgIGxldCBpc09ialR5cGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgY29uc3QgdHlwZUNlbGwgPSBzaGVldFtjb2xLZXkgKyB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3ddO1xuXG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbCh0eXBlQ2VsbCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmllbGQub3JpZ2luVHlwZSA9IHR5cGVDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICAgICAgaWYgKGZpZWxkLm9yaWdpblR5cGUuaW5jbHVkZXMoXCJtZjpcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlU3RycyA9IGZpZWxkLm9yaWdpblR5cGUuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlU3Rycy5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gdHlwZVN0cnNbMl07XG4gICAgICAgICAgICAgICAgaXNPYmpUeXBlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmllbGQudHlwZSA9IGZpZWxkLm9yaWdpblR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmllbGQuaXNNdXRpQ29sT2JqID0gaXNPYmpUeXBlO1xuICAgICAgICAvL+Wtl+auteWQjVxuICAgICAgICBmaWVsZC5vcmlnaW5GaWVsZE5hbWUgPSBvcmlnaW5GaWVsZE5hbWU7XG4gICAgICAgIGlmIChpc09ialR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkU3RycyA9IGZpZWxkLm9yaWdpbkZpZWxkTmFtZS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICBpZiAoZmllbGRTdHJzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkU3Ryc1swXTtcbiAgICAgICAgICAgIGZpZWxkLnN1YkZpZWxkTmFtZSA9IGZpZWxkU3Ryc1sxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkLm9yaWdpbkZpZWxkTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhYmxlRmlsZWRNYXBbY29sS2V5XSA9IGZpZWxkO1xuICAgICAgICByZXR1cm4gZmllbGQ7XG4gICAgfVxuICAgIGdldEhvcml6b250YWxUYWJsZUZpZWxkKFxuICAgICAgICB0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgICAgIGNvbEtleTogc3RyaW5nLFxuICAgICAgICByb3dJbmRleDogbnVtYmVyXG4gICAgKTogSVRhYmxlRmllbGQge1xuICAgICAgICBjb25zdCB0YWJsZURlZmluZSA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVEZWZpbmU7XG4gICAgICAgIGxldCB0YWJsZUZpbGVkTWFwID0gdGFibGVQYXJzZVJlc3VsdC5maWxlZE1hcDtcbiAgICAgICAgaWYgKCF0YWJsZUZpbGVkTWFwKSB7XG4gICAgICAgICAgICB0YWJsZUZpbGVkTWFwID0ge307XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LmZpbGVkTWFwID0gdGFibGVGaWxlZE1hcDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS5ob3Jpem9udGFsRmllbGREZWZpbmU7XG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZUNlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2hGaWVsZERlZmluZS5maWVsZENvbCArIHJvd0luZGV4XTtcbiAgICAgICAgbGV0IG9yaWdpbkZpZWxkTmFtZTogc3RyaW5nO1xuICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGZpZWxkTmFtZUNlbGwpKSB7XG4gICAgICAgICAgICBvcmlnaW5GaWVsZE5hbWUgPSBmaWVsZE5hbWVDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGlmICghb3JpZ2luRmllbGROYW1lKSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGxldCBmaWVsZDogSVRhYmxlRmllbGQgPSB7fSBhcyBhbnk7XG5cbiAgICAgICAgY29uc3QgdGV4dENlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2hGaWVsZERlZmluZS50ZXh0Q29sICsgcm93SW5kZXhdO1xuICAgICAgICAvL+azqOmHilxuICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKHRleHRDZWxsKSkge1xuICAgICAgICAgICAgZmllbGQudGV4dCA9IHRleHRDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGxldCBpc09ialR5cGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgLy/nsbvlnotcbiAgICAgICAgY29uc3QgdHlwZUNlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2hGaWVsZERlZmluZS50eXBlQ29sICsgcm93SW5kZXhdO1xuXG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbCh0eXBlQ2VsbCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/lpITnkIbnsbvlnotcbiAgICAgICAgICAgIGZpZWxkLm9yaWdpblR5cGUgPSB0eXBlQ2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgICAgIGlmIChmaWVsZC5vcmlnaW5UeXBlLmluY2x1ZGVzKFwibWY6XCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZVN0cnMgPSBmaWVsZC5vcmlnaW5UeXBlLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZVN0cnMubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmllbGQudHlwZSA9IHR5cGVTdHJzWzJdO1xuICAgICAgICAgICAgICAgIGlzT2JqVHlwZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpZWxkLnR5cGUgPSBmaWVsZC5vcmlnaW5UeXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpZWxkLmlzTXV0aUNvbE9iaiA9IGlzT2JqVHlwZTtcbiAgICAgICAgZmllbGQub3JpZ2luRmllbGROYW1lID0gb3JpZ2luRmllbGROYW1lO1xuICAgICAgICBpZiAoaXNPYmpUeXBlKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZFN0cnMgPSBmaWVsZC5vcmlnaW5GaWVsZE5hbWUuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgaWYgKGZpZWxkU3Rycy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWVsZC5maWVsZE5hbWUgPSBmaWVsZFN0cnNbMF07XG4gICAgICAgICAgICBmaWVsZC5zdWJGaWVsZE5hbWUgPSBmaWVsZFN0cnNbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZC5maWVsZE5hbWUgPSBmaWVsZC5vcmlnaW5GaWVsZE5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgdGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdID0gZmllbGQ7XG4gICAgICAgIHJldHVybiBmaWVsZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qOA5p+l5YiX5piv5ZCm6ZyA6KaB6Kej5p6QXG4gICAgICogQHBhcmFtIHRhYmxlRGVmaW5lXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIGNvbEtleVxuICAgICAqL1xuICAgIGNoZWNrQ29sTmVlZFBhcnNlKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAvLyDlpoLmnpznsbvlnovmiJbogIXliJnkuI3pnIDopoHop6PmnpBcbiAgICAgICAgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLnZlcnRpY2FsKSB7XG4gICAgICAgICAgICBjb25zdCB2ZXJ0aWNhbEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUudmVydGljYWxGaWVsZERlZmluZTtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3ddO1xuICAgICAgICAgICAgY29uc3QgZmllbGRDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyB2ZXJ0aWNhbEZpZWxkRGVmaW5lLmZpZWxkUm93XTtcbiAgICAgICAgICAgIGlmIChpc0VtcHR5Q2VsbCh0eXBlQ2VsbE9iaikgfHwgaXNFbXB0eUNlbGwoZmllbGRDZWxsT2JqKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuICAgICAgICAgICAgY29uc3QgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgMV07XG4gICAgICAgICAgICBpZiAoaXNFbXB0eUNlbGwoY2VsbE9iaikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOi9rOaNouihqOagvOeahOWAvFxuICAgICAqIEBwYXJhbSBwYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBmaWxlZEl0ZW1cbiAgICAgKiBAcGFyYW0gY2VsbFZhbHVlXG4gICAgICovXG4gICAgcHVibGljIHRyYW5zVmFsdWUocGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LCBmaWxlZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IGFueSk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICAgICAgbGV0IHRyYW5zUmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdDtcblxuICAgICAgICBsZXQgdHJhbnNGdW5jID0gdGhpcy5fdmFsdWVUcmFuc0Z1bmNNYXBbZmlsZWRJdGVtLnR5cGVdO1xuICAgICAgICBpZiAoIXRyYW5zRnVuYykge1xuICAgICAgICAgICAgdHJhbnNGdW5jID0gdGhpcy5fdmFsdWVUcmFuc0Z1bmNNYXBbXCJqc29uXCJdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zUmVzdWx0ID0gdHJhbnNGdW5jKGZpbGVkSXRlbSwgY2VsbFZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRyYW5zUmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOino+aekOmFjee9ruihqOaWh+S7tlxuICAgICAqIEBwYXJhbSBwYXJzZUNvbmZpZyDop6PmnpDphY3nva5cbiAgICAgKiBAcGFyYW0gZmlsZUluZm8g5paH5Lu25L+h5oGvXG4gICAgICogQHBhcmFtIHBhcnNlUmVzdWx0IOino+aekOe7k+aenFxuICAgICAqL1xuICAgIHB1YmxpYyBwYXJzZVRhYmxlRmlsZShcbiAgICAgICAgcGFyc2VDb25maWc6IElUYWJsZUNvbnZlcnRDb25maWcsXG4gICAgICAgIGZpbGVJbmZvOiBJRmlsZUluZm8sXG4gICAgICAgIHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdFxuICAgICk6IElUYWJsZVBhcnNlUmVzdWx0IHtcbiAgICAgICAgY29uc3Qgd29ya2Jvb2sgPSByZWFkVGFibGVGaWxlKGZpbGVJbmZvKTtcbiAgICAgICAgaWYgKCF3b3JrYm9vay5TaGVldE5hbWVzLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNoZWV0TmFtZXMgPSB3b3JrYm9vay5TaGVldE5hbWVzO1xuICAgICAgICBjb25zdCB0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lID0gdGhpcy5nZXRUYWJsZURlZmluZShmaWxlSW5mbywgd29ya2Jvb2spO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHt9XG4gICAgICAgIGlmICghdGFibGVEZWZpbmUpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgc2hlZXROYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBzaGVldDogeGxzeC5TaGVldDtcbiAgICAgICAgY29uc3QgaXNTaGVldFJvd0VuZCA9IHRoaXMuaXNTaGVldFJvd0VuZC5iaW5kKG51bGwsIHRhYmxlRGVmaW5lKTtcbiAgICAgICAgY29uc3QgaXNTaGVldENvbEVuZCA9IHRoaXMuaXNTaGVldENvbEVuZC5iaW5kKG51bGwsIHRhYmxlRGVmaW5lKTtcbiAgICAgICAgY29uc3QgaXNTa2lwU2hlZXRSb3cgPSAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5jaGVja1Jvd05lZWRQYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIHJvd0luZGV4KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaXNTa2lwU2hlZXRDb2wgPSAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRoaXMuY2hlY2tDb2xOZWVkUGFyc2UodGFibGVEZWZpbmUsIHNoZWV0LCBjb2xLZXkpO1xuICAgICAgICB9O1xuICAgICAgICBsZXQgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0O1xuICAgICAgICBwYXJzZVJlc3VsdC50YWJsZURlZmluZSA9IHRhYmxlRGVmaW5lO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNoZWV0TmFtZSA9IHNoZWV0TmFtZXNbaV07XG4gICAgICAgICAgICBzaGVldCA9IHdvcmtib29rLlNoZWV0c1tzaGVldE5hbWVdO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNoZWNrU2hlZXRDYW5QYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIHNoZWV0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnNlUmVzdWx0LmN1clNoZWV0TmFtZSA9IHNoZWV0TmFtZTtcbiAgICAgICAgICAgIExvZ2dlci5sb2coYOino+aekDoke2ZpbGVJbmZvLmZpbGVQYXRofT0+IHNoZWV0OiR7c2hlZXROYW1lfSAuLi4uYCk7XG4gICAgICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcbiAgICAgICAgICAgICAgICBsZXQgbGFzdFJvd0luZGV4OiBudW1iZXI7XG5cbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbEZvckVhY2hTaGVldChcbiAgICAgICAgICAgICAgICAgICAgc2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Um93LFxuICAgICAgICAgICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydENvbCxcbiAgICAgICAgICAgICAgICAgICAgKHNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlzTmV3Um93T3JDb2wgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXN0Um93SW5kZXggIT09IHJvd0luZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFJvd0luZGV4ID0gcm93SW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNOZXdSb3dPckNvbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxsT2JqID0gc2hlZXRbY29sS2V5ICsgcm93SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChjZWxsT2JqKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyc2VWZXJ0aWNhbENlbGwocGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4LCBpc05ld1Jvd09yQ29sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldFJvd0VuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldENvbEVuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTa2lwU2hlZXRSb3csXG4gICAgICAgICAgICAgICAgICAgIGlzU2tpcFNoZWV0Q29sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuICAgICAgICAgICAgICAgIGxldCBsYXN0Q29sS2V5OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICBob3Jpem9udGFsRm9yRWFjaFNoZWV0KFxuICAgICAgICAgICAgICAgICAgICBzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3csXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Q29sLFxuICAgICAgICAgICAgICAgICAgICAoc2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNOZXdSb3dPckNvbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RDb2xLZXkgIT09IGNvbEtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb2xLZXkgPSBjb2xLZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNOZXdSb3dPckNvbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxPYmogPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGNlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJzZUhvcml6b250YWxDZWxsKHBhcnNlUmVzdWx0LCBzaGVldCwgY29sS2V5LCByb3dJbmRleCwgaXNOZXdSb3dPckNvbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGlzU2hlZXRSb3dFbmQsXG4gICAgICAgICAgICAgICAgICAgIGlzU2hlZXRDb2xFbmQsXG4gICAgICAgICAgICAgICAgICAgIGlzU2tpcFNoZWV0Um93LFxuICAgICAgICAgICAgICAgICAgICBpc1NraXBTaGVldENvbFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VSZXN1bHQgYXMgYW55O1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJvcy5wbGF0Zm9ybSIsIlRhYmxlVHlwZSIsInBhdGguam9pbiIsImRlZmxhdGVTeW5jIiwiZnMuc3RhdFN5bmMiLCJmcy5yZWFkZGlyU3luYyIsImZzLmV4aXN0c1N5bmMiLCJmcy51bmxpbmtTeW5jIiwiZnMuZW5zdXJlRmlsZVN5bmMiLCJmcy53cml0ZUZpbGUiLCJmcy53cml0ZUZpbGVTeW5jIiwiZnMucmVhZEZpbGVTeW5jIiwiY3J5cHRvLmNyZWF0ZUhhc2giLCJwYXRoLnBhcnNlIiwibW1hdGNoLmFsbCIsInBhdGguaXNBYnNvbHV0ZSIsIldvcmtlciIsInBhdGguZGlybmFtZSIsInhsc3gucmVhZEZpbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFDQSxNQUFNLFFBQVEsR0FBR0EsV0FBVyxFQUFFLENBQUM7QUFDL0I7QUFDTyxNQUFNLEtBQUssR0FBRyxRQUFRLEtBQUssT0FBTyxHQUFHLElBQUksR0FBRyxNQUFNOztBQ0R6RCxJQUFLLFlBS0o7QUFMRCxXQUFLLFlBQVk7SUFDYiwrQ0FBSSxDQUFBO0lBQ0osK0NBQUksQ0FBQTtJQUNKLGlEQUFLLENBQUE7SUFDTCwyQ0FBRSxDQUFBO0FBQ04sQ0FBQyxFQUxJLFlBQVksS0FBWixZQUFZLFFBS2hCO01BQ1ksTUFBTTtJQUlSLE9BQU8sSUFBSSxDQUFDLFdBQWdDO1FBQy9DLE1BQU0sS0FBSyxHQUFhLFdBQVcsQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDN0UsSUFBSSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFdBQVcsQ0FBQyxhQUFhLEtBQUssU0FBUyxHQUFHLElBQUksR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDO0tBQzFHOzs7Ozs7SUFNTSxPQUFPLEdBQUcsQ0FBQyxPQUFlLEVBQUUsUUFBa0IsTUFBTTtRQUN2RCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDaEIsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdkMsUUFBUSxL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
