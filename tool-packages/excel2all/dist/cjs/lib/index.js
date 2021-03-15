'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var jsBase64 = require('js-base64');
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

/**类型字符串映射字典 */
const typeStrMap = { int: "number", json: "any", "[int]": "number[]", "[string]": "string[]" };
class Trans2JsonAndDtsHandler {
    trans2Files(parseConfig, changedFileInfos, deleteFileInfos, parseResultMap) {
        let outputConfig = parseConfig.outputConfig;
        if (!outputConfig) {
            outputConfig = {
                clientSingleTableJsonDir: path.join(process.cwd(), "./excelJsonOut")
            };
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
            if (parseResult.tableDefine.tableType === exports.TableType.horizontal) {
                tableTypeMapDtsStr += "\treadonly " + tableName + "?: " + `IT_${tableName};` + osEol;
            }
            else {
                tableTypeMapDtsStr += this._getOneTableTypeStr(tableName);
            }
            //合并多个同名表
            tableObj = tableObjMap[tableName];
            if (tableObj) {
                tableObj = Object.assign(tableObj, parseResult.tableObj);
            }
            else {
                tableObj = parseResult.tableObj;
            }
            tableObjMap[tableName] = tableObj;
            objTypeTableMap[tableName] = parseResult.tableDefine.tableType === exports.TableType.horizontal;
            if (outputConfig.isGenDts) {
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
                const bundleDtsFilePath = path.join(outputConfig.clientDtsOutDir, "tableMap.d.ts");
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
            if (outputConfig.bundleJsonIsEncode2Base64) {
                outputData = jsBase64.Base64.encode(outputData);
                if (outputConfig.preBase64UglyString) {
                    outputData = outputConfig.preBase64UglyString + outputData;
                }
                if (outputConfig.sufBase64UglyString) {
                    outputData += outputConfig.sufBase64UglyString;
                }
            }
            if (outputConfig.isZip) {
                outputData = zlib.deflateSync(outputData);
            }
            outputFileMap[jsonBundleFilePath] = {
                filePath: jsonBundleFilePath,
                encoding: typeof outputData !== "string" ? "binary" : "utf-8",
                data: outputData
            };
        }
        return outputFileMap;
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
     * 输出日志
     * @param message
     * @param level
     */
    static log(message, level = "info") {
        if (level === "no")
            return;
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
 * 解析配置表生成指定文件
 * @param parseConfig 解析配置
 * @param trans2FileHandler 转换解析结果为输出文件
 */
function generate(parseConfig, trans2FileHandler) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!parseConfig.projRoot) {
            parseConfig.projRoot = process.cwd();
        }
        const tableFileDir = parseConfig.tableFileDir;
        if (!tableFileDir) {
            Logger.log(`配置表目录：tableFileDir为空`, "error");
            return;
        }
        if (!fs.existsSync(tableFileDir)) {
            Logger.log(`配置表文件夹不存在：${tableFileDir}`, "error");
            return;
        }
        const defaultPattern = ["**/*.{xlsx,csv}", "!**/~$*.*", "!**/~.*.*"];
        if (!parseConfig.pattern) {
            parseConfig.pattern = defaultPattern;
        }
        else if (parseConfig.pattern && typeof parseConfig.pattern === "object") {
            for (let i = 0; i < defaultPattern.length; i++) {
                if (!parseConfig.pattern.includes(defaultPattern[i])) {
                    parseConfig.pattern.push(defaultPattern[i]);
                }
            }
        }
        if (parseConfig.useMultiThread && isNaN(parseConfig.threadParseFileMaxNum)) {
            parseConfig.threadParseFileMaxNum = 5;
        }
        Logger.init(parseConfig);
        let fileInfos = [];
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
        const matchPattern = parseConfig.pattern;
        const eachFileCallback = (filePath, isDelete) => {
            const fileInfo = getFileInfo(filePath);
            let canRead;
            if (isDelete) {
                deleteFileInfos.push(fileInfo);
            }
            else {
                canRead = mmatch.all(fileInfo.filePath, matchPattern);
                if (canRead) {
                    fileInfos.push(fileInfo);
                }
            }
            return { fileInfo, canRead };
        };
        let parseResultMap = {};
        //缓存处理
        let cacheFileDirPath = parseConfig.cacheFileDirPath;
        let parseResultMapCacheFilePath;
        if (!parseConfig.useCache) {
            forEachFile(tableFileDir, eachFileCallback);
        }
        else {
            if (!cacheFileDirPath)
                cacheFileDirPath = ".cache";
            if (!path.isAbsolute(cacheFileDirPath)) {
                cacheFileDirPath = path.join(parseConfig.projRoot, cacheFileDirPath);
                parseResultMapCacheFilePath = path.join(cacheFileDirPath, ".egfprmc");
            }
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
        if (fileInfos.length > parseConfig.threadParseFileMaxNum && parseConfig.useMultiThread) {
            let logStr = "";
            const count = Math.floor(fileInfos.length / parseConfig.threadParseFileMaxNum) + 1;
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
                    writeFiles(parseConfig, parseResultMapCacheFilePath, trans2FileHandler, fileInfos, deleteFileInfos, parseResultMap, logStr);
                }
            };
            for (let i = 0; i < count; i++) {
                subFileInfos = fileInfos.splice(0, parseConfig.threadParseFileMaxNum);
                Logger.log(`----------------线程开始:${i}-----------------`);
                worker = new worker_threads.Worker(path.join(path.dirname(__filename), "../../../worker_scripts/worker.js"), {
                    workerData: {
                        threadId: i,
                        fileInfos: subFileInfos,
                        parseResultMap: parseResultMap,
                        parseConfig: parseConfig
                    }
                });
                worker.on("message", onWorkerParseEnd);
            }
        }
        else {
            const t1 = new Date().getTime();
            let parseHandler;
            if (parseConfig.customParseHandlerPath) {
                if (!path.isAbsolute(parseConfig.customParseHandlerPath)) {
                    parseConfig.customParseHandlerPath = path.resolve(parseConfig.projRoot, parseConfig.customParseHandlerPath);
                }
                parseHandler = require(parseConfig.customParseHandlerPath);
            }
            if (!parseHandler) {
                parseHandler = new DefaultParseHandler();
            }
            doParse(parseConfig, fileInfos, parseResultMap, parseHandler);
            const t2 = new Date().getTime();
            Logger.log(`[单线程导表时间]:${t2 - t1}`);
            writeFiles(parseConfig, parseResultMapCacheFilePath, trans2FileHandler, fileInfos, deleteFileInfos, parseResultMap, Logger.logStr);
        }
    });
}
function writeFiles(parseConfig, parseResultMapCacheFilePath, trans2FileHandler, fileInfos, deleteFileInfos, parseResultMap, logStr) {
    //写入解析缓存
    if (parseConfig.useCache) {
        writeCacheData(parseResultMapCacheFilePath, parseResultMap);
    }
    //解析结束，做导出处理
    let outputFileMap = trans2FileHandler.trans2Files(parseConfig, fileInfos, deleteFileInfos, parseResultMap);
    const outputFiles = Object.values(outputFileMap);
    //写入和删除文件处理
    Logger.log(`开始写入文件:0/${outputFiles.length}`);
    writeOrDeleteOutPutFiles(outputFiles, (filePath, total, now, isOk) => {
        Logger.log(`[写入文件] 进度:(${now}/${total}) 路径:${filePath}`);
    }, () => {
        Logger.log(`写入结束~`);
        //日志文件
        if (!logStr) {
            logStr = Logger.logStr;
        }
        const outputLogFileInfo = {
            filePath: path.join(process.cwd(), "excel2all.log"),
            data: logStr
        };
        writeOrDeleteOutPutFiles([outputLogFileInfo]);
    });
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
exports.DefaultParseHandler = DefaultParseHandler;
exports.Logger = Logger;
exports.Trans2JsonAndDtsHandler = Trans2JsonAndDtsHandler;
exports.ZCharCode = ZCharCode;
exports.charCodesToString = charCodesToString;
exports.doParse = doParse;
exports.forEachChangedFile = forEachChangedFile;
exports.forEachFile = forEachFile;
exports.generate = generate;
exports.getCacheData = getCacheData;
exports.getFileMd5 = getFileMd5;
exports.getFileMd5Sync = getFileMd5Sync;
exports.getNextColKey = getNextColKey;
exports.horizontalForEachSheet = horizontalForEachSheet;
exports.isCSV = isCSV;
exports.isEmptyCell = isEmptyCell;
exports.readTableFile = readTableFile;
exports.stringToCharCodes = stringToCharCodes;
exports.valueTransFuncMap = valueTransFuncMap;
exports.verticalForEachSheet = verticalForEachSheet;
exports.writeCacheData = writeCacheData;
exports.writeOrDeleteOutPutFiles = writeOrDeleteOutPutFiles;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9nZXQtb3MtZW9sLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdHJhbnMyZmlsZS1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdmFsdWUtZnVuYy1tYXAudHMiLCIuLi8uLi8uLi9zcmMvZG8tcGFyc2UudHMiLCIuLi8uLi8uLi9zcmMvbG9nZXIudHMiLCIuLi8uLi8uLi9zcmMvZmlsZS11dGlscy50cyIsIi4uLy4uLy4uL3NyYy9nZW5lcmF0ZS50cyIsIi4uLy4uLy4uL3NyYy90YWJsZS11dGlscy50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXBhcnNlLWhhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgb3MgZnJvbSBcIm9zXCI7XG5jb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4vKirlvZPliY3ns7vnu5/ooYzlsL4gIHBsYXRmb3JtID09PSBcIndpbjMyXCIgPyBcIlxcblwiIDogXCJcXHJcXG5cIjsqL1xuZXhwb3J0IGNvbnN0IG9zRW9sID0gcGxhdGZvcm0gPT09IFwid2luMzJcIiA/IFwiXFxuXCIgOiBcIlxcclxcblwiO1xuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgVGFibGVUeXBlIH0gZnJvbSBcIi4vZGVmYXVsdC1wYXJzZS1oYW5kbGVyXCI7XG5pbXBvcnQgeyBCYXNlNjQgfSBmcm9tIFwianMtYmFzZTY0XCI7XG5pbXBvcnQgeyBkZWZsYXRlU3luYyB9IGZyb20gXCJ6bGliXCI7XG5pbXBvcnQgeyBvc0VvbCB9IGZyb20gXCIuL2dldC1vcy1lb2xcIjtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICAvKipcbiAgICAgKiDovpPlh7rphY3nva5cbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSU91dHB1dENvbmZpZyB7XG4gICAgICAgIC8qKumFjee9ruihqOi+k+WHuuebruW9lei3r+W+hO+8jOm7mOiupOi+k+WHuuWIsOW9k+WJjeaJp+ihjOebruW9leS4i+eahC4vZXhjZWxKc29uT3V0ICovXG4gICAgICAgIGNsaWVudFNpbmdsZVRhYmxlSnNvbkRpcjogc3RyaW5nO1xuICAgICAgICAvKirmiYDmnInphY3nva7ooajmiZPljIXovpPlh7rnm67lvZXvvIzlpoLmnpzkuI3phY3nva7liJnkuI3lkIjlubZqc29uICovXG4gICAgICAgIGNsaWVudEJ1bmRsZUpzb25PdXRQYXRoPzogc3RyaW5nO1xuICAgICAgICAvKirmmK/lkKbmoLzlvI/ljJblkIjlubblkI7nmoRqc29u77yM6buY6K6k5LiNICovXG4gICAgICAgIGlzRm9ybWF0QnVuZGxlSnNvbj86IGJvb2xlYW47XG4gICAgICAgIC8qKuaYr+WQpueUn+aIkOWjsOaYjuaWh+S7tu+8jOm7mOiupOS4jei+k+WHuiAqL1xuICAgICAgICBpc0dlbkR0cz86IGJvb2xlYW47XG4gICAgICAgIC8qKuWjsOaYjuaWh+S7tui+k+WHuuebruW9lSAqL1xuICAgICAgICBjbGllbnREdHNPdXREaXI/OiBzdHJpbmc7XG4gICAgICAgIC8qKuaYr+WQpuWQiOW5tuaJgOacieWjsOaYjuS4uuS4gOS4quaWh+S7tizpu5jorqR0cnVlICovXG4gICAgICAgIGlzQnVuZGxlRHRzPzogYm9vbGVhbjtcbiAgICAgICAgLyoq5piv5ZCm5bCGanNvbuagvOW8j+WOi+e8qSzpu5jorqTlkKYs5YeP5bCRanNvbuWtl+auteWQjeWtl+espizmlYjmnpzovoPlsI8gKi9cbiAgICAgICAgaXNDb21wcmVzcz86IGJvb2xlYW47XG4gICAgICAgIC8qKuaYr+WQplppcOWOi+e8qSzkvb/nlKh6bGliICovXG4gICAgICAgIGlzWmlwPzogYm9vbGVhbjtcbiAgICAgICAgLyoq5piv5ZCm5bCG6L6T5Ye655qE5ZCI5bm2anNvbui9rOS4umJhc2U2NO+8jOm7mOiupOWQpiovXG4gICAgICAgIGJ1bmRsZUpzb25Jc0VuY29kZTJCYXNlNjQ/OiBib29sZWFuO1xuICAgICAgICAvKirliqDlr4bmt7fmt4blrZfnrKbkuLLliY3nvIAgKi9cbiAgICAgICAgcHJlQmFzZTY0VWdseVN0cmluZz86IHN0cmluZztcbiAgICAgICAgLyoq5Yqg5a+G5re35reG5a2X56ym5Liy5ZCO57yAICovXG4gICAgICAgIHN1ZkJhc2U2NFVnbHlTdHJpbmc/OiBzdHJpbmc7XG4gICAgfVxufVxuLyoq57G75Z6L5a2X56ym5Liy5pig5bCE5a2X5YW4ICovXG5jb25zdCB0eXBlU3RyTWFwID0geyBpbnQ6IFwibnVtYmVyXCIsIGpzb246IFwiYW55XCIsIFwiW2ludF1cIjogXCJudW1iZXJbXVwiLCBcIltzdHJpbmddXCI6IFwic3RyaW5nW11cIiB9O1xuZXhwb3J0IGNsYXNzIFRyYW5zMkpzb25BbmREdHNIYW5kbGVyIGltcGxlbWVudHMgSVRyYW5zUmVzdWx0MkFueUZpbGVIYW5kbGVyIHtcbiAgICB0cmFuczJGaWxlcyhcbiAgICAgICAgcGFyc2VDb25maWc6IElUYWJsZVBhcnNlQ29uZmlnLFxuICAgICAgICBjaGFuZ2VkRmlsZUluZm9zOiBJRmlsZUluZm9bXSxcbiAgICAgICAgZGVsZXRlRmlsZUluZm9zOiBJRmlsZUluZm9bXSxcbiAgICAgICAgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXBcbiAgICApOiBPdXRQdXRGaWxlTWFwIHtcbiAgICAgICAgbGV0IG91dHB1dENvbmZpZzogSU91dHB1dENvbmZpZyA9IHBhcnNlQ29uZmlnLm91dHB1dENvbmZpZztcbiAgICAgICAgaWYgKCFvdXRwdXRDb25maWcpIHtcbiAgICAgICAgICAgIG91dHB1dENvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICBjbGllbnRTaW5nbGVUYWJsZUpzb25EaXI6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBcIi4vZXhjZWxKc29uT3V0XCIpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRhYmxlT2JqTWFwOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gICAgICAgIGxldCBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwID0ge307XG4gICAgICAgIGxldCB0YWJsZVR5cGVNYXBEdHNTdHIgPSBcIlwiO1xuICAgICAgICBsZXQgdGFibGVUeXBlRHRzU3RycyA9IFwiXCI7XG4gICAgICAgIGxldCBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQ7XG4gICAgICAgIGxldCB0YWJsZU5hbWU6IHN0cmluZztcbiAgICAgICAgbGV0IHRhYmxlT2JqOiBhbnk7XG4gICAgICAgIGxldCBvYmpUeXBlVGFibGVNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgICAgIGZvciAobGV0IGZpbGVQYXRoIGluIHBhcnNlUmVzdWx0TWFwKSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXTtcbiAgICAgICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVEZWZpbmUpIGNvbnRpbnVlO1xuICAgICAgICAgICAgdGFibGVOYW1lID0gcGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lO1xuICAgICAgICAgICAgaWYgKHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcbiAgICAgICAgICAgICAgICB0YWJsZVR5cGVNYXBEdHNTdHIgKz0gXCJcXHRyZWFkb25seSBcIiArIHRhYmxlTmFtZSArIFwiPzogXCIgKyBgSVRfJHt0YWJsZU5hbWV9O2AgKyBvc0VvbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFibGVUeXBlTWFwRHRzU3RyICs9IHRoaXMuX2dldE9uZVRhYmxlVHlwZVN0cih0YWJsZU5hbWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+WQiOW5tuWkmuS4quWQjOWQjeihqFxuICAgICAgICAgICAgdGFibGVPYmogPSB0YWJsZU9iak1hcFt0YWJsZU5hbWVdO1xuICAgICAgICAgICAgaWYgKHRhYmxlT2JqKSB7XG4gICAgICAgICAgICAgICAgdGFibGVPYmogPSBPYmplY3QuYXNzaWduKHRhYmxlT2JqLCBwYXJzZVJlc3VsdC50YWJsZU9iaik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhYmxlT2JqID0gcGFyc2VSZXN1bHQudGFibGVPYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YWJsZU9iak1hcFt0YWJsZU5hbWVdID0gdGFibGVPYmo7XG4gICAgICAgICAgICBvYmpUeXBlVGFibGVNYXBbdGFibGVOYW1lXSA9IHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWw7XG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzR2VuRHRzKSB7XG4gICAgICAgICAgICAgICAgLy/ovpPlh7rljZXkuKrmlofku7ZcbiAgICAgICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzQnVuZGxlRHRzID09PSB1bmRlZmluZWQpIG91dHB1dENvbmZpZy5pc0J1bmRsZUR0cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKCFvdXRwdXRDb25maWcuaXNCdW5kbGVEdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkU2luZ2xlVGFibGVEdHNPdXRwdXRGaWxlKG91dHB1dENvbmZpZywgcGFyc2VSZXN1bHQsIG91dHB1dEZpbGVNYXApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlVHlwZUR0c1N0cnMgKz0gdGhpcy5fZ2V0U2luZ2xlVGFibGVEdHMocGFyc2VSZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/nlJ/miJDljZXkuKrooahqc29uXG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmNsaWVudFNpbmdsZVRhYmxlSnNvbkRpcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFNpbmdsZVRhYmxlSnNvbk91dHB1dEZpbGUob3V0cHV0Q29uZmlnLCBwYXJzZVJlc3VsdCwgb3V0cHV0RmlsZU1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0dlbkR0cykge1xuICAgICAgICAgICAgLy/ovpPlh7rlo7DmmI7mlofku7ZcbiAgICAgICAgICAgIGxldCBpdEJhc2VTdHIgPSBcImludGVyZmFjZSBJVEJhc2U8VD4geyBba2V5OnN0cmluZ106VH1cIiArIG9zRW9sO1xuXG4gICAgICAgICAgICB0YWJsZVR5cGVNYXBEdHNTdHIgPSBpdEJhc2VTdHIgKyBcImludGVyZmFjZSBJVF9UYWJsZU1hcCB7XCIgKyBvc0VvbCArIHRhYmxlVHlwZU1hcER0c1N0ciArIFwifVwiICsgb3NFb2w7XG5cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNCdW5kbGVEdHMpIHtcbiAgICAgICAgICAgICAgICAvL+WQiOaIkOS4gOS4quaWh+S7tlxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZUR0c0ZpbGVQYXRoID0gcGF0aC5qb2luKG91dHB1dENvbmZpZy5jbGllbnREdHNPdXREaXIsIFwidGFibGVNYXAuZC50c1wiKTtcbiAgICAgICAgICAgICAgICBvdXRwdXRGaWxlTWFwW2J1bmRsZUR0c0ZpbGVQYXRoXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGJ1bmRsZUR0c0ZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YWJsZVR5cGVNYXBEdHNTdHIgKyB0YWJsZVR5cGVEdHNTdHJzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy/mi4bliIbmlofku7bovpPlh7pcbiAgICAgICAgICAgICAgICBjb25zdCB0YWJsZVR5cGVNYXBEdHNGaWxlUGF0aCA9IHBhdGguam9pbihvdXRwdXRDb25maWcuY2xpZW50RHRzT3V0RGlyLCBcInRhYmxlTWFwLmQudHNcIik7XG4gICAgICAgICAgICAgICAgb3V0cHV0RmlsZU1hcFt0YWJsZVR5cGVNYXBEdHNGaWxlUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiB0YWJsZVR5cGVNYXBEdHNGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFibGVUeXBlTWFwRHRzU3RyXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vanNvbkJ1bmRsZUZpbGVcbiAgICAgICAgaWYgKG91dHB1dENvbmZpZy5jbGllbnRCdW5kbGVKc29uT3V0UGF0aCkge1xuICAgICAgICAgICAgbGV0IGpzb25CdW5kbGVGaWxlUGF0aCA9IG91dHB1dENvbmZpZy5jbGllbnRCdW5kbGVKc29uT3V0UGF0aDtcbiAgICAgICAgICAgIGxldCBvdXRwdXREYXRhOiBhbnk7XG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzQ29tcHJlc3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdUYWJsZU9iak1hcCA9IHt9O1xuICAgICAgICAgICAgICAgIGxldCB0YWJsZU9iajogYW55O1xuICAgICAgICAgICAgICAgIGxldCBuZXdUYWJsZU9iajogYW55O1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHRhYmxlTmFtZSBpbiB0YWJsZU9iak1hcCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAob2JqVHlwZVRhYmxlTWFwW3RhYmxlTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSB0YWJsZU9iak1hcFt0YWJsZU5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGFibGVPYmogPSB0YWJsZU9iak1hcFt0YWJsZU5hbWVdO1xuICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iaiA9IHsgZmllbGRWYWx1ZXNNYXA6IHt9IH07XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1haW5LZXkgaW4gdGFibGVPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmV3VGFibGVPYmouZmllbGROYW1lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqLmZpZWxkTmFtZXMgPSBPYmplY3Qua2V5cyh0YWJsZU9ialttYWluS2V5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iai5maWVsZFZhbHVlc01hcFttYWluS2V5XSA9IE9iamVjdC52YWx1ZXModGFibGVPYmpbbWFpbktleV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSBuZXdUYWJsZU9iajtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IEpTT04uc3RyaW5naWZ5KG5ld1RhYmxlT2JqTWFwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IEpTT04uc3RyaW5naWZ5KHRhYmxlT2JqTWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuYnVuZGxlSnNvbklzRW5jb2RlMkJhc2U2NCkge1xuICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBCYXNlNjQuZW5jb2RlKG91dHB1dERhdGEpO1xuICAgICAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcucHJlQmFzZTY0VWdseVN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXREYXRhID0gb3V0cHV0Q29uZmlnLnByZUJhc2U2NFVnbHlTdHJpbmcgKyBvdXRwdXREYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLnN1ZkJhc2U2NFVnbHlTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0RGF0YSArPSBvdXRwdXRDb25maWcuc3VmQmFzZTY0VWdseVN0cmluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzWmlwKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IGRlZmxhdGVTeW5jKG91dHB1dERhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0cHV0RmlsZU1hcFtqc29uQnVuZGxlRmlsZVBhdGhdID0ge1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBqc29uQnVuZGxlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgZW5jb2Rpbmc6IHR5cGVvZiBvdXRwdXREYXRhICE9PSBcInN0cmluZ1wiID8gXCJiaW5hcnlcIiA6IFwidXRmLThcIixcbiAgICAgICAgICAgICAgICBkYXRhOiBvdXRwdXREYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXRGaWxlTWFwO1xuICAgIH1cbiAgICBwcml2YXRlIF9hZGRTaW5nbGVUYWJsZUR0c091dHB1dEZpbGUoXG4gICAgICAgIGNvbmZpZzogSU91dHB1dENvbmZpZyxcbiAgICAgICAgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwXG4gICAgKTogdm9pZCB7XG4gICAgICAgIC8v5aaC5p6c5YC85rKh5pyJ5bCx5LiN6L6T5Ye657G75Z6L5L+h5oGv5LqGXG4gICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVPYmopIHJldHVybjtcbiAgICAgICAgbGV0IGR0c0ZpbGVQYXRoOiBzdHJpbmcgPSBwYXRoLmpvaW4oY29uZmlnLmNsaWVudER0c091dERpciwgYCR7cGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lfS5kLnRzYCk7XG5cbiAgICAgICAgaWYgKCFvdXRwdXRGaWxlTWFwW2R0c0ZpbGVQYXRoXSkge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIGNvbnN0IGR0c1N0ciA9IHRoaXMuX2dldFNpbmdsZVRhYmxlRHRzKHBhcnNlUmVzdWx0KTtcbiAgICAgICAgICAgIGlmIChkdHNTdHIpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRGaWxlTWFwW2R0c0ZpbGVQYXRoXSA9IHsgZmlsZVBhdGg6IGR0c0ZpbGVQYXRoLCBkYXRhOiBkdHNTdHIgfSBhcyBhbnk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kej5p6Q5Ye65Y2V5Liq6YWN572u6KGo57G75Z6L5pWw5o2uXG4gICAgICogQHBhcmFtIHBhcnNlUmVzdWx0XG4gICAgICovXG4gICAgcHJpdmF0ZSBfZ2V0U2luZ2xlVGFibGVEdHMocGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0KTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgdGFibGVOYW1lID0gcGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lO1xuXG4gICAgICAgIGNvbnN0IGNvbEtleVRhYmxlRmllbGRNYXA6IENvbEtleVRhYmxlRmllbGRNYXAgPSBwYXJzZVJlc3VsdC5maWxlZE1hcDtcbiAgICAgICAgbGV0IGl0ZW1JbnRlcmZhY2UgPSBcImludGVyZmFjZSBJVF9cIiArIHRhYmxlTmFtZSArIFwiIHtcIiArIG9zRW9sO1xuICAgICAgICBsZXQgdGFibGVGaWVsZDogSVRhYmxlRmllbGQ7XG4gICAgICAgIGxldCB0eXBlU3RyOiBzdHJpbmc7XG4gICAgICAgIGxldCBvYmpUeXBlU3RyTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG5cbiAgICAgICAgZm9yIChsZXQgY29sS2V5IGluIGNvbEtleVRhYmxlRmllbGRNYXApIHtcbiAgICAgICAgICAgIHRhYmxlRmllbGQgPSBjb2xLZXlUYWJsZUZpZWxkTWFwW2NvbEtleV07XG4gICAgICAgICAgICBpZiAoIXRhYmxlRmllbGQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCF0YWJsZUZpZWxkLmlzTXV0aUNvbE9iaikge1xuICAgICAgICAgICAgICAgIC8v5rOo6YeK6KGMXG4gICAgICAgICAgICAgICAgaXRlbUludGVyZmFjZSArPSBcIlxcdC8qKiBcIiArIHRhYmxlRmllbGQudGV4dCArIFwiICovXCIgKyBvc0VvbDtcbiAgICAgICAgICAgICAgICAvL+Wtl+auteexu+Wei+WjsOaYjuihjFxuICAgICAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz1cbiAgICAgICAgICAgICAgICAgICAgXCJcXHRyZWFkb25seSBcIiArXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRmllbGQuZmllbGROYW1lICtcbiAgICAgICAgICAgICAgICAgICAgXCI/OiBcIiArXG4gICAgICAgICAgICAgICAgICAgICh0eXBlU3RyTWFwW3RhYmxlRmllbGQudHlwZV0gPyB0eXBlU3RyTWFwW3RhYmxlRmllbGQudHlwZV0gOiB0YWJsZUZpZWxkLnR5cGUpICtcbiAgICAgICAgICAgICAgICAgICAgXCI7XCIgK1xuICAgICAgICAgICAgICAgICAgICBvc0VvbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2JqRmllbGRLZXkgPSB0YWJsZUZpZWxkLmZpZWxkTmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoIW9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldID0gXCJcIjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL+azqOmHiuihjFxuICAgICAgICAgICAgICAgIG9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldICs9IFwiXFx0XFx0LyoqIFwiICsgdGFibGVGaWVsZC50ZXh0ICsgXCIgKi9cIiArIG9zRW9sO1xuXG4gICAgICAgICAgICAgICAgLy/lrZfmrrXnsbvlnovlo7DmmI7ooYxcbiAgICAgICAgICAgICAgICBvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XSArPVxuICAgICAgICAgICAgICAgICAgICBcIlxcdFxcdHJlYWRvbmx5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVGaWVsZC5zdWJGaWVsZE5hbWUgK1xuICAgICAgICAgICAgICAgICAgICBcIj86IFwiICtcbiAgICAgICAgICAgICAgICAgICAgKHR5cGVTdHJNYXBbdGFibGVGaWVsZC5zdWJUeXBlXSA/IHR5cGVTdHJNYXBbdGFibGVGaWVsZC5zdWJUeXBlXSA6IHRhYmxlRmllbGQuc3ViVHlwZSkgK1xuICAgICAgICAgICAgICAgICAgICBcIjtcIiArXG4gICAgICAgICAgICAgICAgICAgIG9zRW9sO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8v56ys5LqM5bGC5a+56LGhXG4gICAgICAgIGZvciAobGV0IG9iakZpZWxkS2V5IGluIG9ialR5cGVTdHJNYXApIHtcbiAgICAgICAgICAgIC8v5a2X5q6157G75Z6L5aOw5piO6KGMXG4gICAgICAgICAgICBpdGVtSW50ZXJmYWNlICs9IFwiXFx0cmVhZG9ubHkgXCIgKyBvYmpGaWVsZEtleSArIFwiPzoge1wiICsgb3NFb2wgKyBvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XTtcbiAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJcXHR9XCIgKyBvc0VvbDtcbiAgICAgICAgfVxuICAgICAgICBpdGVtSW50ZXJmYWNlICs9IFwifVwiICsgb3NFb2w7XG5cbiAgICAgICAgcmV0dXJuIGl0ZW1JbnRlcmZhY2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOa3u+WKoOWNleeLrOWvvOWHuumFjee9ruihqGpzb27mlofku7ZcbiAgICAgKiBAcGFyYW0gY29uZmlnXG4gICAgICogQHBhcmFtIHBhcnNlUmVzdWx0XG4gICAgICogQHBhcmFtIG91dHB1dEZpbGVNYXBcbiAgICAgKi9cbiAgICBwcml2YXRlIF9hZGRTaW5nbGVUYWJsZUpzb25PdXRwdXRGaWxlKFxuICAgICAgICBjb25maWc6IElPdXRwdXRDb25maWcsXG4gICAgICAgIHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgb3V0cHV0RmlsZU1hcDogT3V0UHV0RmlsZU1hcFxuICAgICkge1xuICAgICAgICBjb25zdCB0YWJsZU9iaiA9IHBhcnNlUmVzdWx0LnRhYmxlT2JqO1xuICAgICAgICBpZiAoIXRhYmxlT2JqKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHRhYmxlTmFtZSA9IHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlTmFtZTtcbiAgICAgICAgbGV0IHNpbmdsZUpzb25GaWxlUGF0aCA9IHBhdGguam9pbihjb25maWcuY2xpZW50U2luZ2xlVGFibGVKc29uRGlyLCBgJHt0YWJsZU5hbWV9Lmpzb25gKTtcbiAgICAgICAgbGV0IHNpbmdsZUpzb25EYXRhID0gSlNPTi5zdHJpbmdpZnkodGFibGVPYmosIG51bGwsIFwiXFx0XCIpO1xuXG4gICAgICAgIGxldCBzaW5nbGVPdXRwdXRGaWxlSW5mbyA9IG91dHB1dEZpbGVNYXBbc2luZ2xlSnNvbkZpbGVQYXRoXTtcbiAgICAgICAgaWYgKHNpbmdsZU91dHB1dEZpbGVJbmZvKSB7XG4gICAgICAgICAgICBzaW5nbGVPdXRwdXRGaWxlSW5mby5kYXRhID0gc2luZ2xlSnNvbkRhdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaW5nbGVPdXRwdXRGaWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDogc2luZ2xlSnNvbkZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIGRhdGE6IHNpbmdsZUpzb25EYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgb3V0cHV0RmlsZU1hcFtzaW5nbGVKc29uRmlsZVBhdGhdID0gc2luZ2xlT3V0cHV0RmlsZUluZm87XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJpdmF0ZSBfZ2V0T25lVGFibGVUeXBlU3RyKHRhYmxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiXFx0cmVhZG9ubHkgXCIgKyB0YWJsZU5hbWUgKyBcIj86IFwiICsgXCJJVEJhc2U8XCIgKyBcIklUX1wiICsgdGFibGVOYW1lICsgXCI+O1wiICsgb3NFb2w7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZXJcIjtcblxuZXhwb3J0IGNvbnN0IHZhbHVlVHJhbnNGdW5jTWFwOiB7XG4gICAgW2tleTogc3RyaW5nXTogVmFsdWVUcmFuc0Z1bmM7XG59ID0ge307XG52YWx1ZVRyYW5zRnVuY01hcFtcImludFwiXSA9IHN0clRvSW50O1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJzdHJpbmdcIl0gPSBhbnlUb1N0cjtcbnZhbHVlVHJhbnNGdW5jTWFwW1wiW2ludF1cIl0gPSBzdHJUb0ludEFycjtcbnZhbHVlVHJhbnNGdW5jTWFwW1wiW3N0cmluZ11cIl0gPSBzdHJUb1N0ckFycjtcbnZhbHVlVHJhbnNGdW5jTWFwW1wianNvblwiXSA9IHN0clRvSnNvbk9iajtcbmZ1bmN0aW9uIHN0clRvSW50QXJyKGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogc3RyaW5nKTogSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgIGNlbGxWYWx1ZSA9IChjZWxsVmFsdWUgKyBcIlwiKS5yZXBsYWNlKC/vvIwvZywgXCIsXCIpOyAvL+S4uuS6humYsuatouetluWIkuivr+Whq++8jOWFiOi/m+ihjOi9rOaNolxuICAgIGNlbGxWYWx1ZSA9IGNlbGxWYWx1ZS50cmltKCk7XG4gICAgbGV0IGludEFycjogbnVtYmVyW107XG4gICAgY29uc3QgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9O1xuICAgIGlmIChjZWxsVmFsdWUgIT09IFwiXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGludEFyciA9IEpTT04ucGFyc2UoY2VsbFZhbHVlKTtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGludEFycjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvciA9IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIHN0clRvU3RyQXJyKGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogc3RyaW5nKTogSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgIGNlbGxWYWx1ZSA9IChjZWxsVmFsdWUgKyBcIlwiKS5yZXBsYWNlKC/vvIwvZywgXCIsXCIpOyAvL+S4uuS6humYsuatouetluWIkuivr+Whq++8jOWFiOi/m+ihjOi9rOaNolxuICAgIGNlbGxWYWx1ZSA9IGNlbGxWYWx1ZS50cmltKCk7XG4gICAgbGV0IHJlc3VsdDogSVRyYW5zVmFsdWVSZXN1bHQgPSB7fTtcbiAgICBsZXQgYXJyOiBzdHJpbmdbXTtcbiAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhcnIgPSBKU09OLnBhcnNlKGNlbGxWYWx1ZSk7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBhcnI7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXN1bHQuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gc3RyVG9JbnQoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgbGV0IHJlc3VsdDogSVRyYW5zVmFsdWVSZXN1bHQgPSB7fSBhcyBhbnk7XG4gICAgaWYgKHR5cGVvZiBjZWxsVmFsdWUgPT09IFwic3RyaW5nXCIgJiYgY2VsbFZhbHVlLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWUuaW5jbHVkZXMoXCIuXCIpID8gcGFyc2VGbG9hdChjZWxsVmFsdWUpIDogKHBhcnNlSW50KGNlbGxWYWx1ZSkgYXMgYW55KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZWxsVmFsdWUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgcmVzdWx0LnZhbHVlID0gY2VsbFZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gc3RyVG9Kc29uT2JqKGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogc3RyaW5nKTogSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgIGNlbGxWYWx1ZSA9IChjZWxsVmFsdWUgKyBcIlwiKS5yZXBsYWNlKC/vvIwvZywgXCIsXCIpOyAvL+S4uuS6humYsuatouetluWIkuivr+Whq++8jOWFiOi/m+ihjOi9rOaNolxuICAgIGNlbGxWYWx1ZSA9IGNlbGxWYWx1ZS50cmltKCk7XG4gICAgbGV0IG9iajtcbiAgICBsZXQgZXJyb3I7XG4gICAgaWYgKGNlbGxWYWx1ZSAhPT0gXCJcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgb2JqID0gSlNPTi5wYXJzZShjZWxsVmFsdWUpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGVycm9yID0gZXJyO1xuICAgICAgICAgICAgb2JqID0gY2VsbFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IGVycm9yOiBlcnJvciwgdmFsdWU6IG9iaiB9O1xufVxuZnVuY3Rpb24gYW55VG9TdHIoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBhbnkpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgbGV0IHJlc3VsdDogSVRyYW5zVmFsdWVSZXN1bHQgPSB7fSBhcyBhbnk7XG4gICAgaWYgKHR5cGVvZiBjZWxsVmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICAgICAgaWYgKGNlbGxWYWx1ZSAhPT0gXCJcIikge1xuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gY2VsbFZhbHVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnZhbHVlID0gY2VsbFZhbHVlICsgXCJcIjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBkb1BhcnNlKFxuICAgIHBhcnNlQ29uZmlnOiBJVGFibGVQYXJzZUNvbmZpZyxcbiAgICBmaWxlSW5mb3M6IElGaWxlSW5mb1tdLFxuICAgIHBhcnNlUmVzdWx0TWFwOiBUYWJsZVBhcnNlUmVzdWx0TWFwLFxuICAgIHBhcnNlSGFuZGxlcjogSVRhYmxlUGFyc2VIYW5kbGVyXG4pIHtcbiAgICBsZXQgcGFyc2VSZXN1bHQ7XG4gICAgZm9yIChsZXQgaSA9IGZpbGVJbmZvcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBwYXJzZVJlc3VsdCA9IHBhcnNlUmVzdWx0TWFwW2ZpbGVJbmZvc1tpXS5maWxlUGF0aF07XG4gICAgICAgIGlmICghcGFyc2VSZXN1bHQpIHtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0geyBmaWxlUGF0aDogZmlsZUluZm9zW2ldLmZpbGVQYXRoIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwYXJzZVJlc3VsdC50YWJsZU9iaikge1xuICAgICAgICAgICAgcGFyc2VSZXN1bHQgPSBwYXJzZUhhbmRsZXIucGFyc2VUYWJsZUZpbGUocGFyc2VDb25maWcsIGZpbGVJbmZvc1tpXSwgcGFyc2VSZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJzZVJlc3VsdCkge1xuICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXBbZmlsZUluZm9zW2ldLmZpbGVQYXRoXSA9IHBhcnNlUmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgb3NFb2wgfSBmcm9tIFwiLi9nZXQtb3MtZW9sXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5lbnVtIExvZ0xldmVsRW51bSB7XG4gICAgaW5mbyxcbiAgICB3YXJuLFxuICAgIGVycm9yLFxuICAgIG5vXG59XG5leHBvcnQgY2xhc3MgTG9nZ2VyIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfZW5hYmxlT3V0UHV0TG9nRmlsZTogYm9vbGVhbjtcbiAgICBwcml2YXRlIHN0YXRpYyBfbG9nTGV2ZWw6IExvZ0xldmVsRW51bTtcbiAgICBwcml2YXRlIHN0YXRpYyBfbG9nU3RyOiBzdHJpbmcgPSBcIlwiO1xuICAgIHB1YmxpYyBzdGF0aWMgaW5pdChwYXJzZUNvbmZpZzogSVRhYmxlUGFyc2VDb25maWcpIHtcbiAgICAgICAgY29uc3QgbGV2ZWw6IExvZ0xldmVsID0gcGFyc2VDb25maWcubG9nTGV2ZWwgPyBwYXJzZUNvbmZpZy5sb2dMZXZlbCA6IFwiaW5mb1wiO1xuICAgICAgICB0aGlzLl9sb2dMZXZlbCA9IExvZ0xldmVsRW51bVtsZXZlbF07XG4gICAgICAgIHRoaXMuX2VuYWJsZU91dFB1dExvZ0ZpbGUgPSBwYXJzZUNvbmZpZy5vdXRwdXRMb2dGaWxlID09PSB1bmRlZmluZWQgPyB0cnVlIDogcGFyc2VDb25maWcub3V0cHV0TG9nRmlsZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6L6T5Ye65pel5b+XXG4gICAgICogQHBhcmFtIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gbGV2ZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGxvZyhtZXNzYWdlOiBzdHJpbmcsIGxldmVsOiBMb2dMZXZlbCA9IFwiaW5mb1wiKSB7XG4gICAgICAgIGlmIChsZXZlbCA9PT0gXCJub1wiKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLl9sb2dMZXZlbCA8PSBMb2dMZXZlbEVudW1bbGV2ZWxdKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJpbmZvXCI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwid2FyblwiOlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fZW5hYmxlT3V0UHV0TG9nRmlsZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sb2dTdHIgKz0gbWVzc2FnZSArIG9zRW9sO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDov5Tlm57ml6Xlv5fmlbDmja7lubbmuIXnqbpcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldCBsb2dTdHIoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVPdXRQdXRMb2dGaWxlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgbG9nU3RyID0gdGhpcy5fbG9nU3RyO1xuICAgICAgICB0aGlzLl9sb2dTdHIgPSBcIlwiOyAvL+a4heepulxuICAgICAgICByZXR1cm4gbG9nU3RyO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2VyXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSU91dFB1dEZpbGVJbmZvIHtcbiAgICAgICAgZmlsZVBhdGg6IHN0cmluZztcbiAgICAgICAgLyoq5YaZ5YWl57yW56CB77yM5a2X56ym5Liy6buY6K6kdXRmOCAqL1xuICAgICAgICBlbmNvZGluZz86IEJ1ZmZlckVuY29kaW5nO1xuICAgICAgICAvKirmmK/lkKbliKDpmaQgKi9cbiAgICAgICAgaXNEZWxldGU/OiBib29sZWFuO1xuICAgICAgICBkYXRhPzogYW55O1xuICAgIH1cbn1cbi8qKlxuICog6YGN5Y6G5paH5Lu2XG4gKiBAcGFyYW0gZGlyUGF0aCDmlofku7blpLnot6/lvoRcbiAqIEBwYXJhbSBlYWNoQ2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChmaWxlUGF0aDogc3RyaW5nKSA9PiB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JFYWNoRmlsZShmaWxlT3JEaXJQYXRoOiBzdHJpbmcsIGVhY2hDYWxsYmFjaz86IChmaWxlUGF0aDogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgaWYgKGZzLnN0YXRTeW5jKGZpbGVPckRpclBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWVzID0gZnMucmVhZGRpclN5bmMoZmlsZU9yRGlyUGF0aCk7XG4gICAgICAgIGxldCBjaGlsZEZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjaGlsZEZpbGVQYXRoID0gcGF0aC5qb2luKGZpbGVPckRpclBhdGgsIGZpbGVOYW1lc1tpXSk7XG4gICAgICAgICAgICBmb3JFYWNoRmlsZShjaGlsZEZpbGVQYXRoLCBlYWNoQ2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZWFjaENhbGxiYWNrKGZpbGVPckRpclBhdGgpO1xuICAgIH1cbn1cbi8qKlxuICog5om56YeP5YaZ5YWl5ZKM5Yig6Zmk5paH5Lu2XG4gKiBAcGFyYW0gb3V0cHV0RmlsZUluZm9zIOmcgOimgeWGmeWFpeeahOaWh+S7tuS/oeaBr+aVsOe7hFxuICogQHBhcmFtIG9uUHJvZ3Jlc3Mg6L+b5bqm5Y+Y5YyW5Zue6LCDXG4gKiBAcGFyYW0gY29tcGxldGUg5a6M5oiQ5Zue6LCDXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMoXG4gICAgb3V0cHV0RmlsZUluZm9zOiBJT3V0UHV0RmlsZUluZm9bXSxcbiAgICBvblByb2dyZXNzPzogKGZpbGVQYXRoOiBzdHJpbmcsIHRvdGFsOiBudW1iZXIsIG5vdzogbnVtYmVyLCBpc09rOiBib29sZWFuKSA9PiB2b2lkLFxuICAgIGNvbXBsZXRlPzogKHRvdGFsOiBudW1iZXIpID0+IHZvaWRcbikge1xuICAgIGxldCBmaWxlSW5mbzogSU91dFB1dEZpbGVJbmZvO1xuICAgIGNvbnN0IHRvdGFsID0gb3V0cHV0RmlsZUluZm9zLmxlbmd0aDtcbiAgICBpZiAob3V0cHV0RmlsZUluZm9zICYmIHRvdGFsKSB7XG4gICAgICAgIGxldCBub3cgPSAwO1xuICAgICAgICBjb25zdCBvbldyaXRlRW5kID0gKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIExvZ2dlci5sb2coZXJyLCBcImVycm9yXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm93Kys7XG4gICAgICAgICAgICBvblByb2dyZXNzICYmIG9uUHJvZ3Jlc3Mob3V0cHV0RmlsZUluZm9zW25vdyAtIDFdLmZpbGVQYXRoLCB0b3RhbCwgbm93LCAhZXJyKTtcbiAgICAgICAgICAgIGlmIChub3cgPj0gdG90YWwpIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSAmJiBjb21wbGV0ZSh0b3RhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZvciAobGV0IGkgPSBvdXRwdXRGaWxlSW5mb3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGZpbGVJbmZvID0gb3V0cHV0RmlsZUluZm9zW2ldO1xuICAgICAgICAgICAgaWYgKGZpbGVJbmZvLmlzRGVsZXRlICYmIGZzLmV4aXN0c1N5bmMoZmlsZUluZm8uZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgZnMudW5saW5rU3luYyhmaWxlSW5mby5maWxlUGF0aCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghZmlsZUluZm8uZW5jb2RpbmcgJiYgdHlwZW9mIGZpbGVJbmZvLmRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZW5jb2RpbmcgPSBcInV0ZjhcIjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmcy5lbnN1cmVGaWxlU3luYyhmaWxlSW5mby5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlKFxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby5maWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZW5jb2RpbmcgPyB7IGVuY29kaW5nOiBmaWxlSW5mby5lbmNvZGluZyB9IDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBvbldyaXRlRW5kXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICog6I635Y+W5Y+Y5YyW6L+H55qE5paH5Lu25pWw57uEXG4gKiBAcGFyYW0gZGlyIOebruagh+ebruW9lVxuICogQHBhcmFtIGNhY2hlRmlsZVBhdGgg57yT5a2Y5paH5Lu257ud5a+56Lev5b6EXG4gKiBAcGFyYW0gZWFjaENhbGxiYWNrIOmBjeWOhuWbnuiwg1xuICogQHJldHVybnMg6L+U5Zue57yT5a2Y5paH5Lu26Lev5b6EXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JFYWNoQ2hhbmdlZEZpbGUoXG4gICAgZGlyOiBzdHJpbmcsXG4gICAgY2FjaGVGaWxlUGF0aD86IHN0cmluZyxcbiAgICBlYWNoQ2FsbGJhY2s/OiAoZmlsZVBhdGg6IHN0cmluZywgaXNEZWxldGU/OiBib29sZWFuKSA9PiB2b2lkXG4pIHtcbiAgICBjb25zdCBnY2ZDYWNoZSA9IGdldENhY2hlRGF0YShjYWNoZUZpbGVQYXRoKTtcbiAgICBjb25zdCBvbGRGaWxlUGF0aHMgPSBPYmplY3Qua2V5cyhnY2ZDYWNoZSk7XG4gICAgbGV0IG9sZEZpbGVQYXRoSW5kZXg6IG51bWJlcjtcbiAgICBmb3JFYWNoRmlsZShkaXIsIChmaWxlUGF0aCkgPT4ge1xuICAgICAgICB2YXIgbWQ1c3RyID0gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGgpO1xuICAgICAgICBpZiAoIWdjZkNhY2hlW2ZpbGVQYXRoXSB8fCAoZ2NmQ2FjaGVbZmlsZVBhdGhdICYmIGdjZkNhY2hlW2ZpbGVQYXRoXSAhPT0gbWQ1c3RyKSkge1xuICAgICAgICAgICAgZ2NmQ2FjaGVbZmlsZVBhdGhdID0gbWQ1c3RyO1xuICAgICAgICAgICAgZWFjaENhbGxiYWNrKGZpbGVQYXRoLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgb2xkRmlsZVBhdGhJbmRleCA9IG9sZEZpbGVQYXRocy5pbmRleE9mKGZpbGVQYXRoKTtcbiAgICAgICAgaWYgKG9sZEZpbGVQYXRoSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgY29uc3QgZW5kRmlsZVBhdGggPSBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRoSW5kZXhdID0gZW5kRmlsZVBhdGg7XG4gICAgICAgICAgICBvbGRGaWxlUGF0aHMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZEZpbGVQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZWxldGUgZ2NmQ2FjaGVbb2xkRmlsZVBhdGhzW2ldXTtcbiAgICAgICAgZWFjaENhbGxiYWNrKG9sZEZpbGVQYXRoc1tpXSwgdHJ1ZSk7XG4gICAgfVxuICAgIGZzLndyaXRlRmlsZVN5bmMoY2FjaGVGaWxlUGF0aCwgSlNPTi5zdHJpbmdpZnkoZ2NmQ2FjaGUpLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSk7XG59XG4vKipcbiAqIOWGmeWFpee8k+WtmOaVsOaNrlxuICogQHBhcmFtIGNhY2hlRmlsZVBhdGhcbiAqIEBwYXJhbSBjYWNoZURhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlQ2FjaGVEYXRhKGNhY2hlRmlsZVBhdGg6IHN0cmluZywgY2FjaGVEYXRhOiBhbnkpIHtcbiAgICBpZiAoIWNhY2hlRmlsZVBhdGgpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhgY2FjaGVGaWxlUGF0aCBpcyBudWxsYCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmcy53cml0ZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGNhY2hlRGF0YSksIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KTtcbn1cbi8qKlxuICog6K+75Y+W57yT5a2Y5pWw5o2uXG4gKiBAcGFyYW0gY2FjaGVGaWxlUGF0aFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FjaGVEYXRhKGNhY2hlRmlsZVBhdGg6IHN0cmluZyk6IGFueSB7XG4gICAgaWYgKCFjYWNoZUZpbGVQYXRoKSB7XG4gICAgICAgIExvZ2dlci5sb2coYGNhY2hlRmlsZVBhdGggaXMgbnVsbGAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGNhY2hlRmlsZVBhdGgpKSB7XG4gICAgICAgIGZzLmVuc3VyZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIFwie31cIiwgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0pO1xuICAgIH1cbiAgICBjb25zdCBnY2ZDYWNoZUZpbGUgPSBmcy5yZWFkRmlsZVN5bmMoY2FjaGVGaWxlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICBjb25zdCBnY2ZDYWNoZSA9IEpTT04ucGFyc2UoZ2NmQ2FjaGVGaWxlKTtcbiAgICByZXR1cm4gZ2NmQ2FjaGU7XG59XG4vKipcbiAqIOiOt+WPluaWh+S7tm1kNSAo5ZCM5q2lKVxuICogQHBhcmFtIGZpbGVQYXRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlTWQ1U3luYyhmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBmaWxlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCBcInV0Zi04XCIpO1xuICAgIHZhciBtZDV1bSA9IGNyeXB0by5jcmVhdGVIYXNoKFwibWQ1XCIpO1xuICAgIG1kNXVtLnVwZGF0ZShmaWxlKTtcbiAgICByZXR1cm4gbWQ1dW0uZGlnZXN0KFwiaGV4XCIpO1xufVxuLyoqXG4gKiDojrflj5bmlofku7YgbWQ1XG4gKiBAcGFyYW0gZmlsZVBhdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEZpbGVNZDUoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHJldHVybiBnZXRGaWxlTWQ1U3luYyhmaWxlUGF0aCk7XG59XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCAqIGFzIG1tYXRjaCBmcm9tIFwibWljcm9tYXRjaFwiO1xuaW1wb3J0IHsgZm9yRWFjaEZpbGUsIGdldENhY2hlRGF0YSwgZ2V0RmlsZU1kNVN5bmMsIHdyaXRlQ2FjaGVEYXRhLCB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMgfSBmcm9tIFwiLi9maWxlLXV0aWxzXCI7XG5pbXBvcnQgeyBXb3JrZXIgfSBmcm9tIFwid29ya2VyX3RocmVhZHNcIjtcbmltcG9ydCB7IGRvUGFyc2UgfSBmcm9tIFwiLi9kby1wYXJzZVwiO1xuaW1wb3J0IHsgRGVmYXVsdFBhcnNlSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtcGFyc2UtaGFuZGxlclwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZXJcIjtcbi8qKlxuICog6Kej5p6Q6YWN572u6KGo55Sf5oiQ5oyH5a6a5paH5Lu2XG4gKiBAcGFyYW0gcGFyc2VDb25maWcg6Kej5p6Q6YWN572uXG4gKiBAcGFyYW0gdHJhbnMyRmlsZUhhbmRsZXIg6L2s5o2i6Kej5p6Q57uT5p6c5Li66L6T5Ye65paH5Lu2XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZShwYXJzZUNvbmZpZzogSVRhYmxlUGFyc2VDb25maWcsIHRyYW5zMkZpbGVIYW5kbGVyOiBJVHJhbnNSZXN1bHQyQW55RmlsZUhhbmRsZXIpIHtcbiAgICBpZiAoIXBhcnNlQ29uZmlnLnByb2pSb290KSB7XG4gICAgICAgIHBhcnNlQ29uZmlnLnByb2pSb290ID0gcHJvY2Vzcy5jd2QoKTtcbiAgICB9XG4gICAgY29uc3QgdGFibGVGaWxlRGlyID0gcGFyc2VDb25maWcudGFibGVGaWxlRGlyO1xuICAgIGlmICghdGFibGVGaWxlRGlyKSB7XG4gICAgICAgIExvZ2dlci5sb2coYOmFjee9ruihqOebruW9le+8mnRhYmxlRmlsZURpcuS4uuepumAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHRhYmxlRmlsZURpcikpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhg6YWN572u6KGo5paH5Lu25aS55LiN5a2Y5Zyo77yaJHt0YWJsZUZpbGVEaXJ9YCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkZWZhdWx0UGF0dGVybiA9IFtcIioqLyoue3hsc3gsY3N2fVwiLCBcIiEqKi9+JCouKlwiLCBcIiEqKi9+LiouKlwiXTtcbiAgICBpZiAoIXBhcnNlQ29uZmlnLnBhdHRlcm4pIHtcbiAgICAgICAgcGFyc2VDb25maWcucGF0dGVybiA9IGRlZmF1bHRQYXR0ZXJuO1xuICAgIH0gZWxzZSBpZiAocGFyc2VDb25maWcucGF0dGVybiAmJiB0eXBlb2YgcGFyc2VDb25maWcucGF0dGVybiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZmF1bHRQYXR0ZXJuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIXBhcnNlQ29uZmlnLnBhdHRlcm4uaW5jbHVkZXMoZGVmYXVsdFBhdHRlcm5baV0pKSB7XG4gICAgICAgICAgICAgICAgcGFyc2VDb25maWcucGF0dGVybi5wdXNoKGRlZmF1bHRQYXR0ZXJuW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocGFyc2VDb25maWcudXNlTXVsdGlUaHJlYWQgJiYgaXNOYU4ocGFyc2VDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtKSkge1xuICAgICAgICBwYXJzZUNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0gPSA1O1xuICAgIH1cbiAgICBMb2dnZXIuaW5pdChwYXJzZUNvbmZpZyk7XG4gICAgbGV0IGZpbGVJbmZvczogSUZpbGVJbmZvW10gPSBbXTtcbiAgICBsZXQgZGVsZXRlRmlsZUluZm9zOiBJRmlsZUluZm9bXSA9IFtdO1xuICAgIGNvbnN0IGdldEZpbGVJbmZvID0gKGZpbGVQYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGhQYXJzZSA9IHBhdGgucGFyc2UoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBmaWxlSW5mbzogSUZpbGVJbmZvID0ge1xuICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgZmlsZU5hbWU6IGZpbGVQYXRoUGFyc2UubmFtZSxcbiAgICAgICAgICAgIGZpbGVFeHROYW1lOiBmaWxlUGF0aFBhcnNlLmV4dCxcbiAgICAgICAgICAgIGlzRGVsZXRlOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZmlsZUluZm87XG4gICAgfTtcbiAgICBjb25zdCBtYXRjaFBhdHRlcm4gPSBwYXJzZUNvbmZpZy5wYXR0ZXJuO1xuICAgIGNvbnN0IGVhY2hGaWxlQ2FsbGJhY2sgPSAoZmlsZVBhdGg6IHN0cmluZywgaXNEZWxldGU/OiBib29sZWFuKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVJbmZvID0gZ2V0RmlsZUluZm8oZmlsZVBhdGgpO1xuICAgICAgICBsZXQgY2FuUmVhZDogYm9vbGVhbjtcbiAgICAgICAgaWYgKGlzRGVsZXRlKSB7XG4gICAgICAgICAgICBkZWxldGVGaWxlSW5mb3MucHVzaChmaWxlSW5mbyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW5SZWFkID0gbW1hdGNoLmFsbChmaWxlSW5mby5maWxlUGF0aCwgbWF0Y2hQYXR0ZXJuKTtcbiAgICAgICAgICAgIGlmIChjYW5SZWFkKSB7XG4gICAgICAgICAgICAgICAgZmlsZUluZm9zLnB1c2goZmlsZUluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGZpbGVJbmZvLCBjYW5SZWFkIH07XG4gICAgfTtcbiAgICBsZXQgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXAgPSB7fTtcblxuICAgIC8v57yT5a2Y5aSE55CGXG4gICAgbGV0IGNhY2hlRmlsZURpclBhdGg6IHN0cmluZyA9IHBhcnNlQ29uZmlnLmNhY2hlRmlsZURpclBhdGg7XG4gICAgbGV0IHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aDogc3RyaW5nO1xuXG4gICAgaWYgKCFwYXJzZUNvbmZpZy51c2VDYWNoZSkge1xuICAgICAgICBmb3JFYWNoRmlsZSh0YWJsZUZpbGVEaXIsIGVhY2hGaWxlQ2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghY2FjaGVGaWxlRGlyUGF0aCkgY2FjaGVGaWxlRGlyUGF0aCA9IFwiLmNhY2hlXCI7XG4gICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKGNhY2hlRmlsZURpclBhdGgpKSB7XG4gICAgICAgICAgICBjYWNoZUZpbGVEaXJQYXRoID0gcGF0aC5qb2luKHBhcnNlQ29uZmlnLnByb2pSb290LCBjYWNoZUZpbGVEaXJQYXRoKTtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCA9IHBhdGguam9pbihjYWNoZUZpbGVEaXJQYXRoLCBcIi5lZ2Zwcm1jXCIpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnNlUmVzdWx0TWFwID0gZ2V0Q2FjaGVEYXRhKHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCk7XG4gICAgICAgIGlmICghcGFyc2VSZXN1bHRNYXApIHtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwID0ge307XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb2xkRmlsZVBhdGhzID0gT2JqZWN0LmtleXMocGFyc2VSZXN1bHRNYXApO1xuICAgICAgICBsZXQgb2xkRmlsZVBhdGhJbmRleDogbnVtYmVyO1xuICAgICAgICBsZXQgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0O1xuICAgICAgICBmb3JFYWNoRmlsZSh0YWJsZUZpbGVEaXIsIChmaWxlUGF0aCkgPT4ge1xuICAgICAgICAgICAgdmFyIG1kNXN0ciA9IGdldEZpbGVNZDVTeW5jKGZpbGVQYXRoKTtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VSZXN1bHRNYXBbZmlsZVBhdGhdO1xuICAgICAgICAgICAgaWYgKCFwYXJzZVJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXSA9IHBhcnNlUmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnNlUmVzdWx0ICYmIHBhcnNlUmVzdWx0Lm1kNWhhc2ggIT09IG1kNXN0cikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgZmlsZUluZm8sIGNhblJlYWQgfSA9IGVhY2hGaWxlQ2FsbGJhY2soZmlsZVBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FuUmVhZCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdC5tZDVoYXNoID0gbWQ1c3RyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9sZEZpbGVQYXRoSW5kZXggPSBvbGRGaWxlUGF0aHMuaW5kZXhPZihmaWxlUGF0aCk7XG4gICAgICAgICAgICBpZiAob2xkRmlsZVBhdGhJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kRmlsZVBhdGggPSBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIG9sZEZpbGVQYXRoc1tvbGRGaWxlUGF0aEluZGV4XSA9IGVuZEZpbGVQYXRoO1xuICAgICAgICAgICAgICAgIG9sZEZpbGVQYXRocy5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2xkRmlsZVBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyc2VSZXN1bHRNYXBbb2xkRmlsZVBhdGhzW2ldXTtcbiAgICAgICAgICAgIGVhY2hGaWxlQ2FsbGJhY2sob2xkRmlsZVBhdGhzW2ldLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZmlsZUluZm9zLmxlbmd0aCA+IHBhcnNlQ29uZmlnLnRocmVhZFBhcnNlRmlsZU1heE51bSAmJiBwYXJzZUNvbmZpZy51c2VNdWx0aVRocmVhZCkge1xuICAgICAgICBsZXQgbG9nU3RyOiBzdHJpbmcgPSBcIlwiO1xuICAgICAgICBjb25zdCBjb3VudCA9IE1hdGguZmxvb3IoZmlsZUluZm9zLmxlbmd0aCAvIHBhcnNlQ29uZmlnLnRocmVhZFBhcnNlRmlsZU1heE51bSkgKyAxO1xuICAgICAgICBsZXQgd29ya2VyOiBXb3JrZXI7XG4gICAgICAgIGxldCBzdWJGaWxlSW5mb3M6IElGaWxlSW5mb1tdO1xuICAgICAgICBsZXQgd29ya2VyTWFwOiB7IFtrZXk6IG51bWJlcl06IFdvcmtlciB9ID0ge307XG4gICAgICAgIGxldCBjb21wbGV0ZUNvdW50OiBudW1iZXIgPSAwO1xuICAgICAgICBjb25zdCB0MSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBjb25zdCBvbldvcmtlclBhcnNlRW5kID0gKGRhdGE6IElXb3JrRG9SZXN1bHQpID0+IHtcbiAgICAgICAgICAgIExvZ2dlci5sb2coYC0tLS0tLS0tLS0tLS0tLS3nur/nqIvnu5PmnZ86JHtkYXRhLnRocmVhZElkfS0tLS0tLS0tLS0tLS0tLS0tYCk7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRNYXAgPSBkYXRhLnBhcnNlUmVzdWx0TWFwO1xuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHBhcnNlZE1hcCkge1xuICAgICAgICAgICAgICAgIGlmICghcGFyc2VSZXN1bHRNYXBba2V5XS50YWJsZURlZmluZSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcFtrZXldID0gcGFyc2VkTWFwW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcGxldGVDb3VudCsrO1xuICAgICAgICAgICAgbG9nU3RyICs9IGRhdGEubG9nU3RyICsgTG9nZ2VyLmxvZ1N0cjtcbiAgICAgICAgICAgIGlmIChjb21wbGV0ZUNvdW50ID49IGNvdW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdDIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICBMb2dnZXIubG9nKGBb5aSa57q/56iL5a+86KGo5pe26Ze0XToke3QyIC0gdDF9YCk7XG4gICAgICAgICAgICAgICAgd3JpdGVGaWxlcyhcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VDb25maWcsXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnMyRmlsZUhhbmRsZXIsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvcyxcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlRmlsZUluZm9zLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcCxcbiAgICAgICAgICAgICAgICAgICAgbG9nU3RyXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBzdWJGaWxlSW5mb3MgPSBmaWxlSW5mb3Muc3BsaWNlKDAsIHBhcnNlQ29uZmlnLnRocmVhZFBhcnNlRmlsZU1heE51bSk7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGAtLS0tLS0tLS0tLS0tLS0t57q/56iL5byA5aeLOiR7aX0tLS0tLS0tLS0tLS0tLS0tLWApO1xuICAgICAgICAgICAgd29ya2VyID0gbmV3IFdvcmtlcihwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKF9fZmlsZW5hbWUpLCBcIi4uLy4uLy4uL3dvcmtlcl9zY3JpcHRzL3dvcmtlci5qc1wiKSwge1xuICAgICAgICAgICAgICAgIHdvcmtlckRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdGhyZWFkSWQ6IGksXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvczogc3ViRmlsZUluZm9zLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcDogcGFyc2VSZXN1bHRNYXAsXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlQ29uZmlnOiBwYXJzZUNvbmZpZ1xuICAgICAgICAgICAgICAgIH0gYXMgSVdvcmtlclNoYXJlRGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3b3JrZXJNYXBbaV0gPSB3b3JrZXI7XG4gICAgICAgICAgICB3b3JrZXIub24oXCJtZXNzYWdlXCIsIG9uV29ya2VyUGFyc2VFbmQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdDEgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgbGV0IHBhcnNlSGFuZGxlcjogSVRhYmxlUGFyc2VIYW5kbGVyO1xuICAgICAgICBpZiAocGFyc2VDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aCkge1xuICAgICAgICAgICAgaWYgKCFwYXRoLmlzQWJzb2x1dGUocGFyc2VDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aCkpIHtcbiAgICAgICAgICAgICAgICBwYXJzZUNvbmZpZy5jdXN0b21QYXJzZUhhbmRsZXJQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUNvbmZpZy5wcm9qUm9vdCxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJzZUhhbmRsZXIgPSByZXF1aXJlKHBhcnNlQ29uZmlnLmN1c3RvbVBhcnNlSGFuZGxlclBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGFyc2VIYW5kbGVyKSB7XG4gICAgICAgICAgICBwYXJzZUhhbmRsZXIgPSBuZXcgRGVmYXVsdFBhcnNlSGFuZGxlcigpO1xuICAgICAgICB9XG4gICAgICAgIGRvUGFyc2UocGFyc2VDb25maWcsIGZpbGVJbmZvcywgcGFyc2VSZXN1bHRNYXAsIHBhcnNlSGFuZGxlcik7XG4gICAgICAgIGNvbnN0IHQyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIExvZ2dlci5sb2coYFvljZXnur/nqIvlr7zooajml7bpl7RdOiR7dDIgLSB0MX1gKTtcbiAgICAgICAgd3JpdGVGaWxlcyhcbiAgICAgICAgICAgIHBhcnNlQ29uZmlnLFxuICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoLFxuICAgICAgICAgICAgdHJhbnMyRmlsZUhhbmRsZXIsXG4gICAgICAgICAgICBmaWxlSW5mb3MsXG4gICAgICAgICAgICBkZWxldGVGaWxlSW5mb3MsXG4gICAgICAgICAgICBwYXJzZVJlc3VsdE1hcCxcbiAgICAgICAgICAgIExvZ2dlci5sb2dTdHJcbiAgICAgICAgKTtcbiAgICB9XG59XG5mdW5jdGlvbiB3cml0ZUZpbGVzKFxuICAgIHBhcnNlQ29uZmlnOiBJVGFibGVQYXJzZUNvbmZpZyxcbiAgICBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGg6IHN0cmluZyxcbiAgICB0cmFuczJGaWxlSGFuZGxlcjogSVRyYW5zUmVzdWx0MkFueUZpbGVIYW5kbGVyLFxuICAgIGZpbGVJbmZvczogSUZpbGVJbmZvW10sXG4gICAgZGVsZXRlRmlsZUluZm9zOiBJRmlsZUluZm9bXSxcbiAgICBwYXJzZVJlc3VsdE1hcDogVGFibGVQYXJzZVJlc3VsdE1hcCxcbiAgICBsb2dTdHI/OiBzdHJpbmdcbikge1xuICAgIC8v5YaZ5YWl6Kej5p6Q57yT5a2YXG4gICAgaWYgKHBhcnNlQ29uZmlnLnVzZUNhY2hlKSB7XG4gICAgICAgIHdyaXRlQ2FjaGVEYXRhKHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCwgcGFyc2VSZXN1bHRNYXApO1xuICAgIH1cblxuICAgIC8v6Kej5p6Q57uT5p2f77yM5YGa5a+85Ye65aSE55CGXG4gICAgbGV0IG91dHB1dEZpbGVNYXA6IE91dFB1dEZpbGVNYXAgPSB0cmFuczJGaWxlSGFuZGxlci50cmFuczJGaWxlcyhcbiAgICAgICAgcGFyc2VDb25maWcsXG4gICAgICAgIGZpbGVJbmZvcyxcbiAgICAgICAgZGVsZXRlRmlsZUluZm9zLFxuICAgICAgICBwYXJzZVJlc3VsdE1hcFxuICAgICk7XG4gICAgY29uc3Qgb3V0cHV0RmlsZXMgPSBPYmplY3QudmFsdWVzKG91dHB1dEZpbGVNYXApO1xuXG4gICAgLy/lhpnlhaXlkozliKDpmaTmlofku7blpITnkIZcbiAgICBMb2dnZXIubG9nKGDlvIDlp4vlhpnlhaXmlofku7Y6MC8ke291dHB1dEZpbGVzLmxlbmd0aH1gKTtcblxuICAgIHdyaXRlT3JEZWxldGVPdXRQdXRGaWxlcyhcbiAgICAgICAgb3V0cHV0RmlsZXMsXG4gICAgICAgIChmaWxlUGF0aCwgdG90YWwsIG5vdywgaXNPaykgPT4ge1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhgW+WGmeWFpeaWh+S7tl0g6L+b5bqmOigke25vd30vJHt0b3RhbH0pIOi3r+W+hDoke2ZpbGVQYXRofWApO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGDlhpnlhaXnu5PmnZ9+YCk7XG4gICAgICAgICAgICAvL+aXpeW/l+aWh+S7tlxuICAgICAgICAgICAgaWYgKCFsb2dTdHIpIHtcbiAgICAgICAgICAgICAgICBsb2dTdHIgPSBMb2dnZXIubG9nU3RyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgb3V0cHV0TG9nRmlsZUluZm86IElPdXRQdXRGaWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIFwiZXhjZWwyYWxsLmxvZ1wiKSxcbiAgICAgICAgICAgICAgICBkYXRhOiBsb2dTdHJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMoW291dHB1dExvZ0ZpbGVJbmZvXSk7XG4gICAgICAgIH1cbiAgICApO1xufVxuIiwiaW1wb3J0ICogYXMgeGxzeCBmcm9tIFwieGxzeFwiO1xuLyoqXG4gKiDmmK/lkKbkuLrnqbrooajmoLzmoLzlrZBcbiAqIEBwYXJhbSBjZWxsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5Q2VsbChjZWxsOiB4bHN4LkNlbGxPYmplY3QpIHtcbiAgICBpZiAoY2VsbCAmJiBjZWxsLnYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwudiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuIGNlbGwudiA9PT0gXCJcIjtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbC52ID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNOYU4oY2VsbC52KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbi8qKlxuICog5a2X5q+NWueahOe8lueggVxuICovXG5leHBvcnQgY29uc3QgWkNoYXJDb2RlID0gOTA7XG4vKipcbiAqIOWtl+avjUHnmoTnvJbnoIFcbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBBQ2hhckNvZGUgPSA2NTtcbi8qKlxuICog5qC55o2u5b2T5YmN5YiX55qEY2hhckNvZGVz6I635Y+W5LiL5LiA5YiXS2V5XG4gKiBAcGFyYW0gY2hhckNvZGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROZXh0Q29sS2V5KGNoYXJDb2RlczogbnVtYmVyW10pOiBzdHJpbmcge1xuICAgIGxldCBpc0FkZDogYm9vbGVhbjtcbiAgICBmb3IgKGxldCBpID0gY2hhckNvZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmIChjaGFyQ29kZXNbaV0gPCBaQ2hhckNvZGUpIHtcbiAgICAgICAgICAgIGNoYXJDb2Rlc1tpXSArPSAxO1xuICAgICAgICAgICAgaXNBZGQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hhckNvZGVzW2ldID09PSBaQ2hhckNvZGUpIHtcbiAgICAgICAgICAgIGNoYXJDb2Rlc1tpXSA9IEFDaGFyQ29kZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzQWRkKSB7XG4gICAgICAgIGNoYXJDb2Rlcy5wdXNoKEFDaGFyQ29kZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYXJDb2Rlc1RvU3RyaW5nKGNoYXJDb2Rlcyk7XG59XG5cbi8qKlxuICog5YiX55qE5a2X56ym57yW56CB5pWw57uE6L2s5a2X56ym5LiyXG4gKiBAcGFyYW0gY2hhckNvZGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGFyQ29kZXNUb1N0cmluZyhjaGFyQ29kZXM6IG51bWJlcltdKTogc3RyaW5nIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSguLi5jaGFyQ29kZXMpO1xufVxuLyoqXG4gKiDlrZfnrKbkuLLovaznvJbnoIHmlbDnu4RcbiAqIEBwYXJhbSBjb2xLZXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1RvQ2hhckNvZGVzKGNvbEtleTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2hhckNvZGVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xLZXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2hhckNvZGVzLnB1c2goY29sS2V5LmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cbiAgICByZXR1cm4gY2hhckNvZGVzO1xufVxuLyoqXG4gKiDnurXlkJHpgY3ljobooajmoLxcbiAqIEBwYXJhbSBzaGVldCB4bHN46KGo5qC85a+56LGhXG4gKiBAcGFyYW0gc3RhcnRSb3cg5byA5aeL6KGMIOS7jjHlvIDlp4tcbiAqIEBwYXJhbSBzdGFydENvbCDliJflrZfnrKYg5q+U5aaCQSBCXG4gKiBAcGFyYW0gY2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWRcbiAqIEBwYXJhbSBpc1NoZWV0Um93RW5kIOaYr+WQpuihjOe7k+adn+WIpOaWreaWueazlVxuICogQHBhcmFtIGlzU2hlZXRDb2xFbmQg5piv5ZCm5YiX57uT5p2f5Yik5pat5pa55rOVXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRSb3cg5piv5ZCm6Lez6L+H6KGMXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRDb2wg5piv5ZCm6Lez6L+H5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJ0aWNhbEZvckVhY2hTaGVldChcbiAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICBzdGFydFJvdzogbnVtYmVyLFxuICAgIHN0YXJ0Q29sOiBzdHJpbmcsXG4gICAgY2FsbGJhY2s6IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWQsXG4gICAgaXNTaGVldFJvd0VuZD86IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbixcbiAgICBpc1NoZWV0Q29sRW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xrZXk6IHN0cmluZykgPT4gYm9vbGVhbixcbiAgICBpc1NraXBTaGVldFJvdz86IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbixcbiAgICBpc1NraXBTaGVldENvbD86IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpID0+IGJvb2xlYW5cbikge1xuICAgIGNvbnN0IHNoZWV0UmVmOiBzdHJpbmcgPSBzaGVldFtcIiFyZWZcIl07XG4gICAgY29uc3QgbWF4Um93TnVtID0gcGFyc2VJbnQoc2hlZXRSZWYubWF0Y2goL1xcZCskLylbMF0pO1xuXG4gICAgY29uc3QgbWF4Q29sS2V5ID0gc2hlZXRSZWYuc3BsaXQoXCI6XCIpWzFdLm1hdGNoKC9eW0EtWmEtel0rLylbMF07XG4gICAgbGV0IG1heENvbEtleUNvZGVTdW0gPSBnZXRDaGFyQ29kZVN1bShtYXhDb2xLZXkpO1xuXG4gICAgbGV0IGNvbENoYXJDb2RlczogbnVtYmVyW107XG4gICAgbGV0IGNvbEtleTogc3RyaW5nO1xuICAgIGxldCBjdXJDb2xDb2RlU3VtOiBudW1iZXIgPSAwO1xuICAgIGNvbnN0IHN0YXJ0Q2hhcmNvZGVzID0gc3RyaW5nVG9DaGFyQ29kZXMoc3RhcnRDb2wpO1xuICAgIGZvciAobGV0IGkgPSBzdGFydFJvdzsgaSA8PSBtYXhSb3dOdW07IGkrKykge1xuICAgICAgICBpZiAoaXNTaGVldFJvd0VuZCA/IGlzU2hlZXRSb3dFbmQoc2hlZXQsIGkpIDogZmFsc2UpIGJyZWFrO1xuICAgICAgICBpZiAoaXNTa2lwU2hlZXRSb3cgPyBpc1NraXBTaGVldFJvdyhzaGVldCwgaSkgOiBmYWxzZSkgY29udGludWU7XG4gICAgICAgIGNvbENoYXJDb2RlcyA9IHN0YXJ0Q2hhcmNvZGVzLmNvbmNhdChbXSk7XG5cbiAgICAgICAgY29sS2V5ID0gc3RhcnRDb2w7XG5cbiAgICAgICAgbGV0IGhhc05leHRDb2wgPSBpc1NoZWV0Q29sRW5kID8gIWlzU2hlZXRDb2xFbmQoc2hlZXQsIGNvbEtleSkgOiB0cnVlO1xuICAgICAgICB3aGlsZSAoaGFzTmV4dENvbCkge1xuICAgICAgICAgICAgaWYgKCEoaXNTa2lwU2hlZXRDb2wgPyBpc1NraXBTaGVldENvbChzaGVldCwgY29sS2V5KSA6IGZhbHNlKSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNoZWV0LCBjb2xLZXksIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29sS2V5ID0gZ2V0TmV4dENvbEtleShjb2xDaGFyQ29kZXMpO1xuICAgICAgICAgICAgY3VyQ29sQ29kZVN1bSA9IGdldENoYXJDb2RlU3VtKGNvbEtleSk7XG4gICAgICAgICAgICBpZiAobWF4Q29sS2V5Q29kZVN1bSA+PSBjdXJDb2xDb2RlU3VtKSB7XG4gICAgICAgICAgICAgICAgaGFzTmV4dENvbCA9IGlzU2hlZXRDb2xFbmQgPyAhaXNTaGVldENvbEVuZChzaGVldCwgY29sS2V5KSA6IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhc05leHRDb2wgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiDmqKrlkJHpgY3ljobooajmoLxcbiAqIEBwYXJhbSBzaGVldCB4bHN46KGo5qC85a+56LGhXG4gKiBAcGFyYW0gc3RhcnRSb3cg5byA5aeL6KGMIOS7jjHlvIDlp4tcbiAqIEBwYXJhbSBzdGFydENvbCDliJflrZfnrKYg5q+U5aaCQSBCXG4gKiBAcGFyYW0gY2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWRcbiAqIEBwYXJhbSBpc1NoZWV0Um93RW5kIOaYr+WQpuihjOe7k+adn+WIpOaWreaWueazlVxuICogQHBhcmFtIGlzU2hlZXRDb2xFbmQg5piv5ZCm5YiX57uT5p2f5Yik5pat5pa55rOVXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRSb3cg5piv5ZCm6Lez6L+H6KGMXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRDb2wg5piv5ZCm6Lez6L+H5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBob3Jpem9udGFsRm9yRWFjaFNoZWV0KFxuICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgIHN0YXJ0Um93OiBudW1iZXIsXG4gICAgc3RhcnRDb2w6IHN0cmluZyxcbiAgICBjYWxsYmFjazogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4gdm9pZCxcbiAgICBpc1NoZWV0Um93RW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxuICAgIGlzU2hlZXRDb2xFbmQ/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbGtleTogc3RyaW5nKSA9PiBib29sZWFuLFxuICAgIGlzU2tpcFNoZWV0Um93PzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxuICAgIGlzU2tpcFNoZWV0Q29sPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZykgPT4gYm9vbGVhblxuKSB7XG4gICAgY29uc3Qgc2hlZXRSZWY6IHN0cmluZyA9IHNoZWV0W1wiIXJlZlwiXTtcbiAgICBjb25zdCBtYXhSb3dOdW0gPSBwYXJzZUludChzaGVldFJlZi5tYXRjaCgvXFxkKyQvKVswXSk7XG5cbiAgICBjb25zdCBtYXhDb2xLZXkgPSBzaGVldFJlZi5zcGxpdChcIjpcIilbMV0ubWF0Y2goL15bQS1aYS16XSsvKVswXTtcbiAgICBjb25zdCBtYXhDb2xLZXlDb2RlU3VtID0gZ2V0Q2hhckNvZGVTdW0obWF4Q29sS2V5KTtcbiAgICBsZXQgY29sQ2hhckNvZGVzOiBudW1iZXJbXTtcbiAgICBsZXQgY29sS2V5OiBzdHJpbmc7XG4gICAgY29sQ2hhckNvZGVzID0gc3RyaW5nVG9DaGFyQ29kZXMoc3RhcnRDb2wpO1xuICAgIGxldCBjdXJDb2xDb2RlU3VtOiBudW1iZXIgPSAwO1xuICAgIGNvbEtleSA9IHN0YXJ0Q29sO1xuICAgIGxldCBoYXNOZXh0Q29sID0gaXNTaGVldENvbEVuZCA/ICFpc1NoZWV0Q29sRW5kKHNoZWV0LCBjb2xLZXkpIDogdHJ1ZTtcbiAgICB3aGlsZSAoaGFzTmV4dENvbCkge1xuICAgICAgICBpZiAoIShpc1NraXBTaGVldENvbCA/IGlzU2tpcFNoZWV0Q29sKHNoZWV0LCBjb2xLZXkpIDogZmFsc2UpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gc3RhcnRSb3c7IGkgPD0gbWF4Um93TnVtOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNTaGVldFJvd0VuZCA/IGlzU2hlZXRSb3dFbmQoc2hlZXQsIGkpIDogZmFsc2UpIGJyZWFrO1xuICAgICAgICAgICAgICAgIGlmIChpc1NraXBTaGVldFJvdyA/IGlzU2tpcFNoZWV0Um93KHNoZWV0LCBpKSA6IGZhbHNlKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhzaGVldCwgY29sS2V5LCBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbEtleSA9IGdldE5leHRDb2xLZXkoY29sQ2hhckNvZGVzKTtcbiAgICAgICAgY3VyQ29sQ29kZVN1bSA9IGdldENoYXJDb2RlU3VtKGNvbEtleSk7XG4gICAgICAgIGlmIChtYXhDb2xLZXlDb2RlU3VtID49IGN1ckNvbENvZGVTdW0pIHtcbiAgICAgICAgICAgIGhhc05leHRDb2wgPSBpc1NoZWV0Q29sRW5kID8gIWlzU2hlZXRDb2xFbmQoc2hlZXQsIGNvbEtleSkgOiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFzTmV4dENvbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxubGV0IGNvbEtleVN1bU1hcCA9IHt9O1xuZnVuY3Rpb24gZ2V0Q2hhckNvZGVTdW0oY29sS2V5OiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGxldCBzdW06IG51bWJlciA9IGNvbEtleVN1bU1hcFtjb2xLZXldO1xuICAgIGlmICghc3VtKSB7XG4gICAgICAgIHN1bSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sS2V5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzdW0gKz0gY29sS2V5LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgY29sS2V5U3VtTWFwW2NvbEtleV0gPSBzdW07XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59XG4vKipcbiAqIOivu+WPlumFjee9ruihqOaWh+S7tiDlkIzmraXnmoRcbiAqIEBwYXJhbSBmaWxlSW5mb1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZFRhYmxlRmlsZShmaWxlSW5mbzogSUZpbGVJbmZvKTogeGxzeC5Xb3JrQm9vayB7XG4gICAgY29uc3Qgd29ya0Jvb2sgPSB4bHN4LnJlYWRGaWxlKGZpbGVJbmZvLmZpbGVQYXRoLCB7IHR5cGU6IGlzQ1NWKGZpbGVJbmZvLmZpbGVFeHROYW1lKSA/IFwic3RyaW5nXCIgOiBcImZpbGVcIiB9KTtcbiAgICByZXR1cm4gd29ya0Jvb2s7XG59XG4vKipcbiAqIOagueaNruaWh+S7tuWQjeWQjue8gOWIpOaWreaYr+WQpuS4umNzduaWh+S7tlxuICogQHBhcmFtIGZpbGVFeHROYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NTVihmaWxlRXh0TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZpbGVFeHROYW1lID09PSBcImNzdlwiO1xufVxuIiwiaW1wb3J0ICogYXMgeGxzeCBmcm9tIFwieGxzeFwiO1xuaW1wb3J0IHsgdmFsdWVUcmFuc0Z1bmNNYXAgfSBmcm9tIFwiLlwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZXJcIjtcbmltcG9ydCB7IGhvcml6b250YWxGb3JFYWNoU2hlZXQsIGlzRW1wdHlDZWxsLCByZWFkVGFibGVGaWxlLCB2ZXJ0aWNhbEZvckVhY2hTaGVldCB9IGZyb20gXCIuL3RhYmxlLXV0aWxzXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSVRhYmxlRmllbGQge1xuICAgICAgICAvKirphY3nva7ooajkuK3ms6jph4rlgLwgKi9cbiAgICAgICAgdGV4dDogc3RyaW5nO1xuICAgICAgICAvKirphY3nva7ooajkuK3nsbvlnovlgLwgKi9cbiAgICAgICAgb3JpZ2luVHlwZTogc3RyaW5nO1xuICAgICAgICAvKirphY3nva7ooajkuK3lrZfmrrXlkI3lgLwgKi9cbiAgICAgICAgb3JpZ2luRmllbGROYW1lOiBzdHJpbmc7XG4gICAgICAgIC8qKuino+aekOWQjueahOexu+Wei+WAvCAqL1xuICAgICAgICB0eXBlPzogc3RyaW5nO1xuICAgICAgICAvKirop6PmnpDlkI7nmoTlrZDnsbvlnovlgLwgKi9cbiAgICAgICAgc3ViVHlwZT86IHN0cmluZztcbiAgICAgICAgLyoq6Kej5p6Q5ZCO55qE5a2X5q615ZCN5YC8ICovXG4gICAgICAgIGZpZWxkTmFtZT86IHN0cmluZztcbiAgICAgICAgLyoq5a+56LGh55qE5a2Q5a2X5q615ZCNICovXG4gICAgICAgIHN1YkZpZWxkTmFtZT86IHN0cmluZztcbiAgICAgICAgLyoq5aSa5YiX5a+56LGhICovXG4gICAgICAgIGlzTXV0aUNvbE9iaj86IGJvb2xlYW47XG4gICAgfVxuICAgIGludGVyZmFjZSBJVGFibGVEZWZpbmUge1xuICAgICAgICAvKirphY3nva7ooajlkI0gKi9cbiAgICAgICAgdGFibGVOYW1lOiBzdHJpbmc7XG4gICAgICAgIC8qKumFjee9ruihqOexu+WeiyDpu5jorqTkuKTnp406IHZlcnRpY2FsIOWSjCBob3Jpem9udGFsKi9cbiAgICAgICAgdGFibGVUeXBlOiBzdHJpbmc7XG5cbiAgICAgICAgLyoq5byA5aeL6KGM5LuOMeW8gOWniyAqL1xuICAgICAgICBzdGFydFJvdzogbnVtYmVyO1xuICAgICAgICAvKirlvIDlp4vliJfku45B5byA5aeLICovXG4gICAgICAgIHN0YXJ0Q29sOiBzdHJpbmc7XG4gICAgICAgIC8qKuWeguebtOino+aekOWtl+auteWumuS5iSAqL1xuICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lOiBJVmVydGljYWxGaWVsZERlZmluZTtcbiAgICAgICAgLyoq5qiq5ZCR6Kej5p6Q5a2X5q615a6a5LmJICovXG4gICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZTogSUhvcml6b250YWxGaWVsZERlZmluZTtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElIb3Jpem9udGFsRmllbGREZWZpbmUge1xuICAgICAgICAvKirnsbvlnovooYwgKi9cbiAgICAgICAgdHlwZUNvbDogc3RyaW5nO1xuICAgICAgICAvKirlrZfmrrXlkI3ooYwgKi9cbiAgICAgICAgZmllbGRDb2w6IHN0cmluZztcbiAgICAgICAgLyoq5rOo6YeK6KGMICovXG4gICAgICAgIHRleHRDb2w6IHN0cmluZztcbiAgICB9XG4gICAgaW50ZXJmYWNlIElWZXJ0aWNhbEZpZWxkRGVmaW5lIHtcbiAgICAgICAgLyoq57G75Z6L6KGMICovXG4gICAgICAgIHR5cGVSb3c6IG51bWJlcjtcbiAgICAgICAgLyoq5a2X5q615ZCN6KGMICovXG4gICAgICAgIGZpZWxkUm93OiBudW1iZXI7XG4gICAgICAgIC8qKuazqOmHiuihjCAqL1xuICAgICAgICB0ZXh0Um93OiBudW1iZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWtl+auteWtl+WFuFxuICAgICAqIGtleeaYr+WIl2NvbEtleVxuICAgICAqIHZhbHVl5piv5a2X5q615a+56LGhXG4gICAgICovXG4gICAgdHlwZSBDb2xLZXlUYWJsZUZpZWxkTWFwID0geyBba2V5OiBzdHJpbmddOiBJVGFibGVGaWVsZCB9O1xuXG4gICAgLyoqXG4gICAgICog6KGo5qC855qE5LiA6KGM5oiW6ICF5LiA5YiXXG4gICAgICoga2V55Li65a2X5q615ZCN5YC877yMdmFsdWXkuLrooajmoLznmoTkuIDmoLxcbiAgICAgKi9cbiAgICB0eXBlIFRhYmxlUm93T3JDb2wgPSB7IFtrZXk6IHN0cmluZ106IElUYWJsZUNlbGwgfTtcbiAgICAvKipcbiAgICAgKiDooajmoLznmoTkuIDmoLxcbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSVRhYmxlQ2VsbCB7XG4gICAgICAgIC8qKuWtl+auteWvueixoSAqL1xuICAgICAgICBmaWxlZDogSVRhYmxlRmllbGQ7XG4gICAgICAgIC8qKuWAvCAqL1xuICAgICAgICB2YWx1ZTogYW55O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDooajmoLzooYzmiJbliJfnmoTlrZflhbhcbiAgICAgKiBrZXnkuLrooYzntKLlvJXvvIx2YWx1ZeS4uuihqOagvOeahOS4gOihjFxuICAgICAqL1xuICAgIHR5cGUgVGFibGVSb3dPckNvbE1hcCA9IHsgW2tleTogc3RyaW5nXTogVGFibGVSb3dPckNvbCB9O1xuICAgIC8qKlxuICAgICAqIOihqOagvOihjOaIluWIl+WAvOaVsOe7hFxuICAgICAqIGtleeS4u+mUru+8jHZhbHVl5piv5YC85pWw57uEXG4gICAgICovXG4gICAgdHlwZSBSb3dPckNvbFZhbHVlc01hcCA9IHsgW2tleTogc3RyaW5nXTogYW55W10gfTtcbiAgICBpbnRlcmZhY2UgSVRhYmxlVmFsdWVzIHtcbiAgICAgICAgLyoq5a2X5q615ZCN5pWw57uEICovXG4gICAgICAgIGZpZWxkczogc3RyaW5nW107XG4gICAgICAgIC8qKuihqOagvOWAvOaVsOe7hCAqL1xuICAgICAgICByb3dPckNvbFZhbHVlc01hcDogUm93T3JDb2xWYWx1ZXNNYXA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOe7k+aenFxuICAgICAqL1xuICAgIGludGVyZmFjZSBJVGFibGVQYXJzZVJlc3VsdCB7XG4gICAgICAgIC8qKumFjee9ruihqOWumuS5iSAqL1xuICAgICAgICB0YWJsZURlZmluZT86IElUYWJsZURlZmluZTtcbiAgICAgICAgLyoq5b2T5YmN5YiG6KGo5ZCNICovXG4gICAgICAgIGN1clNoZWV0TmFtZT86IHN0cmluZztcbiAgICAgICAgLyoq5a2X5q615a2X5YW4ICovXG4gICAgICAgIGZpbGVkTWFwPzogQ29sS2V5VGFibGVGaWVsZE1hcDtcbiAgICAgICAgLy8gLyoq6KGo5qC86KGM5oiW5YiX55qE5a2X5YW4ICovXG4gICAgICAgIC8vIHJvd09yQ29sTWFwOiBUYWJsZVJvd09yQ29sTWFwXG4gICAgICAgIC8qKuWNleS4quihqOagvOWvueixoSAqL1xuICAgICAgICAvKiprZXnmmK/kuLvplK7lgLzvvIx2YWx1ZeaYr+S4gOihjOWvueixoSAqL1xuICAgICAgICB0YWJsZU9iaj86IHsgW2tleTogc3RyaW5nXTogYW55IH07XG4gICAgICAgIC8qKuW9k+WJjeihjOaIluWIl+WvueixoSAqL1xuICAgICAgICBjdXJSb3dPckNvbE9iaj86IGFueTtcbiAgICAgICAgLyoq5Li76ZSu5YC8ICovXG4gICAgICAgIG1haW5LZXlGaWVsZE5hbWU/OiBzdHJpbmc7XG4gICAgfVxuXG4gICAgLyoq5YC86L2s5o2i5pa55rOVICovXG4gICAgaW50ZXJmYWNlIElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICAgICAgZXJyb3I/OiBhbnk7XG4gICAgICAgIHZhbHVlPzogYW55O1xuICAgIH1cbiAgICB0eXBlIFZhbHVlVHJhbnNGdW5jID0gKGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogYW55KSA9PiBJVHJhbnNWYWx1ZVJlc3VsdDtcbiAgICAvKipcbiAgICAgKiDlgLzovazmjaLmlrnms5XlrZflhbhcbiAgICAgKiBrZXnmmK/nsbvlnotrZXlcbiAgICAgKiB2YWx1ZeaYr+aWueazlVxuICAgICAqL1xuICAgIHR5cGUgVmFsdWVUcmFuc0Z1bmNNYXAgPSB7IFtrZXk6IHN0cmluZ106IFZhbHVlVHJhbnNGdW5jIH07XG59XG5leHBvcnQgZW51bSBUYWJsZVR5cGUge1xuICAgIHZlcnRpY2FsID0gXCJ2ZXJ0aWNhbFwiLFxuICAgIGhvcml6b250YWwgPSBcImhvcml6b250YWxcIlxufVxuXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBhcnNlSGFuZGxlciBpbXBsZW1lbnRzIElUYWJsZVBhcnNlSGFuZGxlciB7XG4gICAgcHJpdmF0ZSBfdmFsdWVUcmFuc0Z1bmNNYXA6IFZhbHVlVHJhbnNGdW5jTWFwO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl92YWx1ZVRyYW5zRnVuY01hcCA9IHZhbHVlVHJhbnNGdW5jTWFwO1xuICAgIH1cbiAgICBnZXRUYWJsZURlZmluZShmaWxlSW5mbzogSUZpbGVJbmZvLCB3b3JrQm9vazogeGxzeC5Xb3JrQm9vayk6IElUYWJsZURlZmluZSB7XG4gICAgICAgIC8v5Y+W6KGo5qC85paH5Lu25ZCN5Li66KGo5qC85ZCNXG4gICAgICAgIGNvbnN0IHRhYmxlTmFtZSA9IGZpbGVJbmZvLmZpbGVOYW1lO1xuXG4gICAgICAgIGNvbnN0IHRhYmxlRGVmaW5lOiBQYXJ0aWFsPElUYWJsZURlZmluZT4gPSB7XG4gICAgICAgICAgICB0YWJsZU5hbWU6IHRhYmxlTmFtZVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBjZWxsS2V5OiBzdHJpbmc7XG4gICAgICAgIGxldCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3Q7XG4gICAgICAgIC8v5Y+W56ys5LiA5Liq6KGoXG4gICAgICAgIGNvbnN0IHNoZWV0TmFtZXMgPSB3b3JrQm9vay5TaGVldE5hbWVzO1xuICAgICAgICBsZXQgc2hlZXQ6IHhsc3guU2hlZXQ7XG4gICAgICAgIGxldCBmaXJzdENlbGxWYWx1ZTogeyB0YWJsZU5hbWVJblNoZWV0OiBzdHJpbmc7IHRhYmxlVHlwZTogc3RyaW5nIH07XG4gICAgICAgIGxldCBmaXJzdENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGVldE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzaGVldCA9IHdvcmtCb29rLlNoZWV0c1tzaGVldE5hbWVzW2ldXTtcbiAgICAgICAgICAgIGZpcnN0Q2VsbE9iaiA9IHNoZWV0W1wiQVwiICsgMV07XG4gICAgICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGZpcnN0Q2VsbE9iaikpIHtcbiAgICAgICAgICAgICAgICBmaXJzdENlbGxWYWx1ZSA9IHRoaXMuX2dldEZpcnN0Q2VsbFZhbHVlKGZpcnN0Q2VsbE9iaik7XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Q2VsbFZhbHVlICYmIGZpcnN0Q2VsbFZhbHVlLnRhYmxlTmFtZUluU2hlZXQgPT09IHRhYmxlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmaXJzdENlbGxWYWx1ZSB8fCBmaXJzdENlbGxWYWx1ZS50YWJsZU5hbWVJblNoZWV0ICE9PSB0YWJsZU5hbWUpIHtcbiAgICAgICAgICAgIExvZ2dlci5sb2coYOihqOagvOS4jeinhOiMgyzot7Pov4fop6PmnpAs6Lev5b6EOiR7ZmlsZUluZm8uZmlsZVBhdGh9YCwgXCJlcnJvclwiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9IGZpcnN0Q2VsbFZhbHVlLnRhYmxlVHlwZTtcbiAgICAgICAgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLnZlcnRpY2FsKSB7XG4gICAgICAgICAgICB0YWJsZURlZmluZS52ZXJ0aWNhbEZpZWxkRGVmaW5lID0ge30gYXMgYW55O1xuICAgICAgICAgICAgY29uc3QgdmVydGljYWxGaWVsZERlZmluZTogSVZlcnRpY2FsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS52ZXJ0aWNhbEZpZWxkRGVmaW5lO1xuICAgICAgICAgICAgdmVydGljYWxGaWVsZERlZmluZS50ZXh0Um93ID0gMTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgMTAwOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjZWxsS2V5ID0gXCJBXCIgKyBpO1xuICAgICAgICAgICAgICAgIGNlbGxPYmogPSBzaGVldFtjZWxsS2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eUNlbGwoY2VsbE9iaikgfHwgY2VsbE9iai52ID09PSBcIk5PXCIgfHwgY2VsbE9iai52ID09PSBcIkVORFwiIHx8IGNlbGxPYmoudiA9PT0gXCJTVEFSVFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Um93ID0gaTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNlbGxPYmoudiA9PT0gXCJDTElFTlRcIikge1xuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lLmZpZWxkUm93ID0gaTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNlbGxPYmoudiA9PT0gXCJUWVBFXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWxGaWVsZERlZmluZS50eXBlUm93ID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRhYmxlRGVmaW5lLnN0YXJ0Um93ICYmIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3cgJiYgdmVydGljYWxGaWVsZERlZmluZS50eXBlUm93KSBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRDb2wgPSBcIkJcIjtcbiAgICAgICAgfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICB0YWJsZURlZmluZS5ob3Jpem9udGFsRmllbGREZWZpbmUgPSB7fSBhcyBhbnk7XG4gICAgICAgICAgICBjb25zdCBob3Jpem9udGFsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS5ob3Jpem9udGFsRmllbGREZWZpbmU7XG4gICAgICAgICAgICBob3Jpem9udGFsRmllbGREZWZpbmUudGV4dENvbCA9IFwiQVwiO1xuICAgICAgICAgICAgaG9yaXpvbnRhbEZpZWxkRGVmaW5lLnR5cGVDb2wgPSBcIkJcIjtcbiAgICAgICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZS5maWVsZENvbCA9IFwiQ1wiO1xuICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRDb2wgPSBcIkVcIjtcbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Um93ID0gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YWJsZURlZmluZSBhcyBhbnk7XG4gICAgfVxuICAgIHByaXZhdGUgX2dldEZpcnN0Q2VsbFZhbHVlKGZpcnN0Q2VsbE9iajogeGxzeC5DZWxsT2JqZWN0KSB7XG4gICAgICAgIGlmICghZmlyc3RDZWxsT2JqKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZXMgPSAoZmlyc3RDZWxsT2JqLnYgYXMgc3RyaW5nKS5zcGxpdChcIjpcIik7XG4gICAgICAgIGxldCB0YWJsZU5hbWVJblNoZWV0OiBzdHJpbmc7XG4gICAgICAgIGxldCB0YWJsZVR5cGU6IHN0cmluZztcbiAgICAgICAgaWYgKGNlbGxWYWx1ZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGFibGVOYW1lSW5TaGVldCA9IGNlbGxWYWx1ZXNbMV07XG4gICAgICAgICAgICB0YWJsZVR5cGUgPSBjZWxsVmFsdWVzWzBdID09PSBcIkhcIiA/IFRhYmxlVHlwZS5ob3Jpem9udGFsIDogVGFibGVUeXBlLnZlcnRpY2FsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFibGVOYW1lSW5TaGVldCA9IGNlbGxWYWx1ZXNbMF07XG4gICAgICAgICAgICB0YWJsZVR5cGUgPSBUYWJsZVR5cGUudmVydGljYWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdGFibGVOYW1lSW5TaGVldDogdGFibGVOYW1lSW5TaGVldCwgdGFibGVUeXBlOiB0YWJsZVR5cGUgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5Yik5pat6KGo5qC85piv5ZCm6IO96Kej5p6QXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICovXG4gICAgY2hlY2tTaGVldENhblBhcnNlKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCBzaGVldE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAvL+WmguaenOi/meS4quihqOS4quesrOS4gOagvOWAvOS4jeetieS6juihqOWQje+8jOWImeS4jeino+aekFxuICAgICAgICBjb25zdCBmaXJzdENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W1wiQVwiICsgMV07XG4gICAgICAgIGNvbnN0IGZpcnN0Q2VsbFZhbHVlID0gdGhpcy5fZ2V0Rmlyc3RDZWxsVmFsdWUoZmlyc3RDZWxsT2JqKTtcbiAgICAgICAgaWYgKGZpcnN0Q2VsbE9iaiAmJiB0YWJsZURlZmluZSkge1xuICAgICAgICAgICAgaWYgKGZpcnN0Q2VsbFZhbHVlLnRhYmxlTmFtZUluU2hlZXQgIT09IHRhYmxlRGVmaW5lLnRhYmxlTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOihqOihjOe7k+adn+WIpOaWrVxuICAgICAqIEBwYXJhbSB0YWJsZURlZmluZVxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSByb3dcbiAgICAgKi9cbiAgICBpc1NoZWV0Um93RW5kKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCByb3c6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvLyBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcblxuICAgICAgICAvLyB9IGVsc2UgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcblxuICAgICAgICAvLyB9XG4gICAgICAgIC8v5Yik5pat5LiK5LiA6KGM55qE5qCH5b+X5piv5ZCm5Li6RU5EXG4gICAgICAgIGlmIChyb3cgPiAxKSB7XG4gICAgICAgICAgICByb3cgPSByb3cgLSAxO1xuICAgICAgICAgICAgY29uc3QgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbXCJBXCIgKyByb3ddO1xuICAgICAgICAgICAgcmV0dXJuIGNlbGxPYmogJiYgY2VsbE9iai52ID09PSBcIkVORFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOihqOWIl+e7k+adn+WIpOaWrVxuICAgICAqIEBwYXJhbSB0YWJsZURlZmluZVxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKi9cbiAgICBpc1NoZWV0Q29sRW5kKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAvL+WIpOaWrei/meS4gOWIl+esrOS4gOihjOaYr+WQpuS4uuepulxuICAgICAgICBjb25zdCBmaXJzdENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIDFdO1xuICAgICAgICAvLyBjb25zdCB0eXBlQ2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgdGFibGVGaWxlLnRhYmxlRGVmaW5lLnR5cGVSb3ddO1xuICAgICAgICByZXR1cm4gaXNFbXB0eUNlbGwoZmlyc3RDZWxsT2JqKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qOA5p+l6KGM5piv5ZCm6ZyA6KaB6Kej5p6QXG4gICAgICogQHBhcmFtIHRhYmxlRGVmaW5lXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIHJvd0luZGV4XG4gICAgICovXG4gICAgY2hlY2tSb3dOZWVkUGFyc2UodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbXCJBXCIgKyByb3dJbmRleF07XG4gICAgICAgIGlmIChjZWxsT2JqICYmIGNlbGxPYmoudiA9PT0gXCJOT1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOWNleS4quagvOWtkFxuICAgICAqIEBwYXJhbSB0YWJsZVBhcnNlUmVzdWx0XG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIGNvbEtleVxuICAgICAqIEBwYXJhbSByb3dJbmRleFxuICAgICAqIEBwYXJhbSBpc05ld1Jvd09yQ29sIOaYr+WQpuS4uuaWsOeahOS4gOihjOaIluiAheS4gOWIl1xuICAgICAqL1xuICAgIHBhcnNlVmVydGljYWxDZWxsKFxuICAgICAgICB0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgICAgIGNvbEtleTogc3RyaW5nLFxuICAgICAgICByb3dJbmRleDogbnVtYmVyLFxuICAgICAgICBpc05ld1Jvd09yQ29sOiBib29sZWFuXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpZWxkSW5mbyA9IHRoaXMuZ2V0VmVydGljYWxUYWJsZUZpZWxkKHRhYmxlUGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4KTtcbiAgICAgICAgaWYgKCFmaWVsZEluZm8pIHJldHVybjtcbiAgICAgICAgY29uc3QgY2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgcm93SW5kZXhdO1xuICAgICAgICBpZiAoaXNFbXB0eUNlbGwoY2VsbCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRyYW5zUmVzdWx0ID0gdGhpcy50cmFuc1ZhbHVlKHRhYmxlUGFyc2VSZXN1bHQsIGZpZWxkSW5mbywgY2VsbC52KTtcbiAgICAgICAgaWYgKHRyYW5zUmVzdWx0LmVycm9yKSB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKFxuICAgICAgICAgICAgICAgIGDooajmoLw6JHt0YWJsZVBhcnNlUmVzdWx0LmZpbGVQYXRofSzliIbooag6JHt0YWJsZVBhcnNlUmVzdWx0LmN1clNoZWV0TmFtZX0s6KGMOiR7cm93SW5kZXh9LOWIl++8miR7Y29sS2V5feino+aekOWHuumUmWAsXG4gICAgICAgICAgICAgICAgXCJlcnJvclwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyh0cmFuc1Jlc3VsdC5lcnJvciwgXCJlcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0cmFuc2VkVmFsdWUgPSB0cmFuc1Jlc3VsdC52YWx1ZTtcbiAgICAgICAgbGV0IG1haW5LZXlGaWVsZE5hbWU6IHN0cmluZyA9IHRhYmxlUGFyc2VSZXN1bHQubWFpbktleUZpZWxkTmFtZTtcbiAgICAgICAgaWYgKCFtYWluS2V5RmllbGROYW1lKSB7XG4gICAgICAgICAgICAvL+esrOS4gOS4quWtl+auteWwseaYr+S4u+mUrlxuICAgICAgICAgICAgbWFpbktleUZpZWxkTmFtZSA9IGZpZWxkSW5mby5maWVsZE5hbWU7XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0Lm1haW5LZXlGaWVsZE5hbWUgPSBmaWVsZEluZm8uZmllbGROYW1lO1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9iaiA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGxldCByb3dPckNvbE9iajogYW55ID0gdGFibGVQYXJzZVJlc3VsdC5jdXJSb3dPckNvbE9iajtcbiAgICAgICAgaWYgKGlzTmV3Um93T3JDb2wpIHtcbiAgICAgICAgICAgIC8v5paw55qE5LiA6KGMXG4gICAgICAgICAgICByb3dPckNvbE9iaiA9IHt9O1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5jdXJSb3dPckNvbE9iaiA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbdHJhbnNlZFZhbHVlXSA9IHJvd09yQ29sT2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkSW5mby5pc011dGlDb2xPYmopIHtcbiAgICAgICAgICAgIGxldCBzdWJPYmogPSByb3dPckNvbE9ialtmaWVsZEluZm8uZmllbGROYW1lXTtcbiAgICAgICAgICAgIGlmICghc3ViT2JqKSB7XG4gICAgICAgICAgICAgICAgc3ViT2JqID0ge307XG4gICAgICAgICAgICAgICAgcm93T3JDb2xPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSBzdWJPYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJPYmpbZmllbGRJbmZvLnN1YkZpZWxkTmFtZV0gPSB0cmFuc2VkVmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb3dPckNvbE9ialtmaWVsZEluZm8uZmllbGROYW1lXSA9IHRyYW5zZWRWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDmqKrlkJHljZXkuKrmoLzlrZBcbiAgICAgKiBAcGFyYW0gdGFibGVQYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKiBAcGFyYW0gcm93SW5kZXhcbiAgICAgKiBAcGFyYW0gaXNOZXdSb3dPckNvbCDmmK/lkKbkuLrmlrDnmoTkuIDooYzmiJbogIXkuIDliJdcbiAgICAgKi9cbiAgICBwYXJzZUhvcml6b250YWxDZWxsKFxuICAgICAgICB0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgICAgIGNvbEtleTogc3RyaW5nLFxuICAgICAgICByb3dJbmRleDogbnVtYmVyLFxuICAgICAgICBpc05ld1Jvd09yQ29sOiBib29sZWFuXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpZWxkSW5mbyA9IHRoaXMuZ2V0SG9yaXpvbnRhbFRhYmxlRmllbGQodGFibGVQYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgpO1xuICAgICAgICBpZiAoIWZpZWxkSW5mbykgcmV0dXJuO1xuICAgICAgICBjb25zdCBjZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyYW5zUmVzdWx0ID0gdGhpcy50cmFuc1ZhbHVlKHRhYmxlUGFyc2VSZXN1bHQsIGZpZWxkSW5mbywgY2VsbC52KTtcbiAgICAgICAgaWYgKHRyYW5zUmVzdWx0LmVycm9yKSB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKFxuICAgICAgICAgICAgICAgIGDooajmoLw6JHt0YWJsZVBhcnNlUmVzdWx0LmZpbGVQYXRofSzliIbooag6JHt0YWJsZVBhcnNlUmVzdWx0LmN1clNoZWV0TmFtZX0s6KGMOiR7cm93SW5kZXh9LOWIl++8miR7Y29sS2V5feino+aekOWHuumUmWAsXG4gICAgICAgICAgICAgICAgXCJlcnJvclwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyh0cmFuc1Jlc3VsdC5lcnJvciwgXCJlcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0cmFuc2VkVmFsdWUgPSB0cmFuc1Jlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKCF0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqKSB7XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpZWxkSW5mby5pc011dGlDb2xPYmopIHtcbiAgICAgICAgICAgIGxldCBzdWJPYmogPSB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdO1xuICAgICAgICAgICAgaWYgKCFzdWJPYmopIHtcbiAgICAgICAgICAgICAgICBzdWJPYmogPSB7fTtcbiAgICAgICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdID0gc3ViT2JqO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3ViT2JqW2ZpZWxkSW5mby5zdWJGaWVsZE5hbWVdID0gdHJhbnNlZFZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9ialtmaWVsZEluZm8uZmllbGROYW1lXSA9IHRyYW5zZWRWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDlh7rlrZfmrrXlr7nosaFcbiAgICAgKiBAcGFyYW0gdGFibGVQYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKiBAcGFyYW0gcm93SW5kZXhcbiAgICAgKi9cbiAgICBnZXRWZXJ0aWNhbFRhYmxlRmllbGQoXG4gICAgICAgIHRhYmxlUGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICAgICAgY29sS2V5OiBzdHJpbmcsXG4gICAgICAgIHJvd0luZGV4OiBudW1iZXJcbiAgICApOiBJVGFibGVGaWVsZCB7XG4gICAgICAgIGNvbnN0IHRhYmxlRGVmaW5lID0gdGFibGVQYXJzZVJlc3VsdC50YWJsZURlZmluZTtcbiAgICAgICAgbGV0IHRhYmxlRmlsZWRNYXAgPSB0YWJsZVBhcnNlUmVzdWx0LmZpbGVkTWFwO1xuICAgICAgICBpZiAoIXRhYmxlRmlsZWRNYXApIHtcbiAgICAgICAgICAgIHRhYmxlRmlsZWRNYXAgPSB7fTtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQuZmlsZWRNYXAgPSB0YWJsZUZpbGVkTWFwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZlcnRpY2FsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS52ZXJ0aWNhbEZpZWxkRGVmaW5lO1xuICAgICAgICBjb25zdCBmaWxlZENlbGwgPSBzaGVldFtjb2xLZXkgKyB2ZXJ0aWNhbEZpZWxkRGVmaW5lLmZpZWxkUm93XTtcbiAgICAgICAgbGV0IG9yaWdpbkZpZWxkTmFtZTogc3RyaW5nO1xuICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGZpbGVkQ2VsbCkpIHtcbiAgICAgICAgICAgIG9yaWdpbkZpZWxkTmFtZSA9IGZpbGVkQ2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW9yaWdpbkZpZWxkTmFtZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBmaWVsZDogSVRhYmxlRmllbGQgPSB7fSBhcyBhbnk7XG4gICAgICAgIC8v57yT5a2YXG4gICAgICAgIGlmICh0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXTtcbiAgICAgICAgfVxuICAgICAgICAvL+azqOmHilxuICAgICAgICBjb25zdCB0ZXh0Q2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS50ZXh0Um93XTtcbiAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbCh0ZXh0Q2VsbCkpIHtcbiAgICAgICAgICAgIGZpZWxkLnRleHQgPSB0ZXh0Q2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgfVxuICAgICAgICAvL+exu+Wei1xuICAgICAgICBsZXQgaXNPYmpUeXBlOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHR5cGVDZWxsID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS50eXBlUm93XTtcblxuICAgICAgICBpZiAoaXNFbXB0eUNlbGwodHlwZUNlbGwpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZWxkLm9yaWdpblR5cGUgPSB0eXBlQ2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgICAgIGlmIChmaWVsZC5vcmlnaW5UeXBlLmluY2x1ZGVzKFwibWY6XCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZVN0cnMgPSBmaWVsZC5vcmlnaW5UeXBlLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZVN0cnMubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmllbGQudHlwZSA9IHR5cGVTdHJzWzJdO1xuICAgICAgICAgICAgICAgIGlzT2JqVHlwZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpZWxkLnR5cGUgPSBmaWVsZC5vcmlnaW5UeXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpZWxkLmlzTXV0aUNvbE9iaiA9IGlzT2JqVHlwZTtcbiAgICAgICAgLy/lrZfmrrXlkI1cbiAgICAgICAgZmllbGQub3JpZ2luRmllbGROYW1lID0gb3JpZ2luRmllbGROYW1lO1xuICAgICAgICBpZiAoaXNPYmpUeXBlKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZFN0cnMgPSBmaWVsZC5vcmlnaW5GaWVsZE5hbWUuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgaWYgKGZpZWxkU3Rycy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWVsZC5maWVsZE5hbWUgPSBmaWVsZFN0cnNbMF07XG4gICAgICAgICAgICBmaWVsZC5zdWJGaWVsZE5hbWUgPSBmaWVsZFN0cnNbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZC5maWVsZE5hbWUgPSBmaWVsZC5vcmlnaW5GaWVsZE5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICB0YWJsZUZpbGVkTWFwW2NvbEtleV0gPSBmaWVsZDtcbiAgICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH1cbiAgICBnZXRIb3Jpem9udGFsVGFibGVGaWVsZChcbiAgICAgICAgdGFibGVQYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsXG4gICAgICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgICAgICBjb2xLZXk6IHN0cmluZyxcbiAgICAgICAgcm93SW5kZXg6IG51bWJlclxuICAgICk6IElUYWJsZUZpZWxkIHtcbiAgICAgICAgY29uc3QgdGFibGVEZWZpbmUgPSB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lO1xuICAgICAgICBsZXQgdGFibGVGaWxlZE1hcCA9IHRhYmxlUGFyc2VSZXN1bHQuZmlsZWRNYXA7XG4gICAgICAgIGlmICghdGFibGVGaWxlZE1hcCkge1xuICAgICAgICAgICAgdGFibGVGaWxlZE1hcCA9IHt9O1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5maWxlZE1hcCA9IHRhYmxlRmlsZWRNYXA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUuaG9yaXpvbnRhbEZpZWxkRGVmaW5lO1xuICAgICAgICBjb25zdCBmaWVsZE5hbWVDZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtoRmllbGREZWZpbmUuZmllbGRDb2wgKyByb3dJbmRleF07XG4gICAgICAgIGxldCBvcmlnaW5GaWVsZE5hbWU6IHN0cmluZztcbiAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChmaWVsZE5hbWVDZWxsKSkge1xuICAgICAgICAgICAgb3JpZ2luRmllbGROYW1lID0gZmllbGROYW1lQ2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW9yaWdpbkZpZWxkTmFtZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICh0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZmllbGQ6IElUYWJsZUZpZWxkID0ge30gYXMgYW55O1xuXG4gICAgICAgIGNvbnN0IHRleHRDZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtoRmllbGREZWZpbmUudGV4dENvbCArIHJvd0luZGV4XTtcbiAgICAgICAgLy/ms6jph4pcbiAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbCh0ZXh0Q2VsbCkpIHtcbiAgICAgICAgICAgIGZpZWxkLnRleHQgPSB0ZXh0Q2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgfVxuICAgICAgICBsZXQgaXNPYmpUeXBlOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIC8v57G75Z6LXG4gICAgICAgIGNvbnN0IHR5cGVDZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtoRmllbGREZWZpbmUudHlwZUNvbCArIHJvd0luZGV4XTtcblxuICAgICAgICBpZiAoaXNFbXB0eUNlbGwodHlwZUNlbGwpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v5aSE55CG57G75Z6LXG4gICAgICAgICAgICBmaWVsZC5vcmlnaW5UeXBlID0gdHlwZUNlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgICAgICBpZiAoZmllbGQub3JpZ2luVHlwZS5pbmNsdWRlcyhcIm1mOlwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVTdHJzID0gZmllbGQub3JpZ2luVHlwZS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVTdHJzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpZWxkLnR5cGUgPSB0eXBlU3Ryc1syXTtcbiAgICAgICAgICAgICAgICBpc09ialR5cGUgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gZmllbGQub3JpZ2luVHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWVsZC5pc011dGlDb2xPYmogPSBpc09ialR5cGU7XG4gICAgICAgIGZpZWxkLm9yaWdpbkZpZWxkTmFtZSA9IG9yaWdpbkZpZWxkTmFtZTtcbiAgICAgICAgaWYgKGlzT2JqVHlwZSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTdHJzID0gZmllbGQub3JpZ2luRmllbGROYW1lLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgIGlmIChmaWVsZFN0cnMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmllbGQuZmllbGROYW1lID0gZmllbGRTdHJzWzBdO1xuICAgICAgICAgICAgZmllbGQuc3ViRmllbGROYW1lID0gZmllbGRTdHJzWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmllbGQuZmllbGROYW1lID0gZmllbGQub3JpZ2luRmllbGROYW1lO1xuICAgICAgICB9XG4gICAgICAgIHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXSA9IGZpZWxkO1xuICAgICAgICByZXR1cm4gZmllbGQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOajgOafpeWIl+aYr+WQpumcgOimgeino+aekFxuICAgICAqIEBwYXJhbSB0YWJsZURlZmluZVxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKi9cbiAgICBjaGVja0NvbE5lZWRQYXJzZSh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgLy8g5aaC5p6c57G75Z6L5oiW6ICF5YiZ5LiN6ZyA6KaB6Kej5p6QXG4gICAgICAgIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xuICAgICAgICAgICAgY29uc3QgdmVydGljYWxGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLnZlcnRpY2FsRmllbGREZWZpbmU7XG4gICAgICAgICAgICBjb25zdCB0eXBlQ2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS50eXBlUm93XTtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkQ2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS5maWVsZFJvd107XG4gICAgICAgICAgICBpZiAoaXNFbXB0eUNlbGwodHlwZUNlbGxPYmopIHx8IGlzRW1wdHlDZWxsKGZpZWxkQ2VsbE9iaikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIDFdO1xuICAgICAgICAgICAgaWYgKGlzRW1wdHlDZWxsKGNlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDovazmjaLooajmoLznmoTlgLxcbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gZmlsZWRJdGVtXG4gICAgICogQHBhcmFtIGNlbGxWYWx1ZVxuICAgICAqL1xuICAgIHB1YmxpYyB0cmFuc1ZhbHVlKHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCwgZmlsZWRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBhbnkpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgICAgIGxldCB0cmFuc1Jlc3VsdDogSVRyYW5zVmFsdWVSZXN1bHQ7XG5cbiAgICAgICAgbGV0IHRyYW5zRnVuYyA9IHRoaXMuX3ZhbHVlVHJhbnNGdW5jTWFwW2ZpbGVkSXRlbS50eXBlXTtcbiAgICAgICAgaWYgKCF0cmFuc0Z1bmMpIHtcbiAgICAgICAgICAgIHRyYW5zRnVuYyA9IHRoaXMuX3ZhbHVlVHJhbnNGdW5jTWFwW1wianNvblwiXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc1Jlc3VsdCA9IHRyYW5zRnVuYyhmaWxlZEl0ZW0sIGNlbGxWYWx1ZSk7XG4gICAgICAgIHJldHVybiB0cmFuc1Jlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDop6PmnpDphY3nva7ooajmlofku7ZcbiAgICAgKiBAcGFyYW0gcGFyc2VDb25maWcg6Kej5p6Q6YWN572uXG4gICAgICogQHBhcmFtIGZpbGVJbmZvIOaWh+S7tuS/oeaBr1xuICAgICAqIEBwYXJhbSBwYXJzZVJlc3VsdCDop6PmnpDnu5PmnpxcbiAgICAgKi9cbiAgICBwdWJsaWMgcGFyc2VUYWJsZUZpbGUoXG4gICAgICAgIHBhcnNlQ29uZmlnOiBJVGFibGVQYXJzZUNvbmZpZyxcbiAgICAgICAgZmlsZUluZm86IElGaWxlSW5mbyxcbiAgICAgICAgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0XG4gICAgKTogSVRhYmxlUGFyc2VSZXN1bHQge1xuICAgICAgICBjb25zdCB3b3JrYm9vayA9IHJlYWRUYWJsZUZpbGUoZmlsZUluZm8pO1xuICAgICAgICBpZiAoIXdvcmtib29rLlNoZWV0TmFtZXMubGVuZ3RoKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc2hlZXROYW1lcyA9IHdvcmtib29rLlNoZWV0TmFtZXM7XG4gICAgICAgIGNvbnN0IHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUgPSB0aGlzLmdldFRhYmxlRGVmaW5lKGZpbGVJbmZvLCB3b3JrYm9vayk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hlZXROYW1lcy5sZW5ndGg7IGkrKykge31cbiAgICAgICAgaWYgKCF0YWJsZURlZmluZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBzaGVldE5hbWU6IHN0cmluZztcbiAgICAgICAgbGV0IHNoZWV0OiB4bHN4LlNoZWV0O1xuICAgICAgICBjb25zdCBpc1NoZWV0Um93RW5kID0gdGhpcy5pc1NoZWV0Um93RW5kLmJpbmQobnVsbCwgdGFibGVEZWZpbmUpO1xuICAgICAgICBjb25zdCBpc1NoZWV0Q29sRW5kID0gdGhpcy5pc1NoZWV0Q29sRW5kLmJpbmQobnVsbCwgdGFibGVEZWZpbmUpO1xuICAgICAgICBjb25zdCBpc1NraXBTaGVldFJvdyA9IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICF0aGlzLmNoZWNrUm93TmVlZFBhcnNlKHRhYmxlRGVmaW5lLCBzaGVldCwgcm93SW5kZXgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBpc1NraXBTaGVldENvbCA9IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5jaGVja0NvbE5lZWRQYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIGNvbEtleSk7XG4gICAgICAgIH07XG4gICAgICAgIGxldCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3Q7XG4gICAgICAgIHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lID0gdGFibGVEZWZpbmU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hlZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2hlZXROYW1lID0gc2hlZXROYW1lc1tpXTtcbiAgICAgICAgICAgIHNoZWV0ID0gd29ya2Jvb2suU2hlZXRzW3NoZWV0TmFtZV07XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2hlY2tTaGVldENhblBhcnNlKHRhYmxlRGVmaW5lLCBzaGVldCwgc2hlZXROYW1lKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyc2VSZXN1bHQuY3VyU2hlZXROYW1lID0gc2hlZXROYW1lO1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhg6Kej5p6QOiR7ZmlsZUluZm8uZmlsZVBhdGh9PT4gc2hlZXQ6JHtzaGVldE5hbWV9IC4uLi5gKTtcbiAgICAgICAgICAgIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xuICAgICAgICAgICAgICAgIGxldCBsYXN0Um93SW5kZXg6IG51bWJlcjtcblxuICAgICAgICAgICAgICAgIHZlcnRpY2FsRm9yRWFjaFNoZWV0KFxuICAgICAgICAgICAgICAgICAgICBzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3csXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Q29sLFxuICAgICAgICAgICAgICAgICAgICAoc2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNOZXdSb3dPckNvbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RSb3dJbmRleCAhPT0gcm93SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Um93SW5kZXggPSByb3dJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05ld1Jvd09yQ29sID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxPYmogPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGNlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJzZVZlcnRpY2FsQ2VsbChwYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgsIGlzTmV3Um93T3JDb2wpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBpc1NoZWV0Um93RW5kLFxuICAgICAgICAgICAgICAgICAgICBpc1NoZWV0Q29sRW5kLFxuICAgICAgICAgICAgICAgICAgICBpc1NraXBTaGVldFJvdyxcbiAgICAgICAgICAgICAgICAgICAgaXNTa2lwU2hlZXRDb2xcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGxhc3RDb2xLZXk6IHN0cmluZztcblxuICAgICAgICAgICAgICAgIGhvcml6b250YWxGb3JFYWNoU2hlZXQoXG4gICAgICAgICAgICAgICAgICAgIHNoZWV0LFxuICAgICAgICAgICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydFJvdyxcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRDb2wsXG4gICAgICAgICAgICAgICAgICAgIChzaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc05ld1Jvd09yQ29sID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFzdENvbEtleSAhPT0gY29sS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbEtleSA9IGNvbEtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05ld1Jvd09yQ29sID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY2VsbE9iaiA9IHNoZWV0W2NvbEtleSArIHJvd0luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNFbXB0eUNlbGwoY2VsbE9iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnNlSG9yaXpvbnRhbENlbGwocGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4LCBpc05ld1Jvd09yQ29sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldFJvd0VuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldENvbEVuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTa2lwU2hlZXRSb3csXG4gICAgICAgICAgICAgICAgICAgIGlzU2tpcFNoZWV0Q29sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZVJlc3VsdCBhcyBhbnk7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbIm9zLnBsYXRmb3JtIiwicGF0aC5qb2luIiwiVGFibGVUeXBlIiwiQmFzZTY0IiwiZGVmbGF0ZVN5bmMiLCJmcy5zdGF0U3luYyIsImZzLnJlYWRkaXJTeW5jIiwiZnMuZXhpc3RzU3luYyIsImZzLnVubGlua1N5bmMiLCJmcy5lbnN1cmVGaWxlU3luYyIsImZzLndyaXRlRmlsZSIsImZzLndyaXRlRmlsZVN5bmMiLCJmcy5yZWFkRmlsZVN5bmMiLCJjcnlwdG8uY3JlYXRlSGFzaCIsInBhdGgucGFyc2UiLCJtbWF0Y2guYWxsIiwicGF0aC5pc0Fic29sdXRlIiwiV29ya2VyIiwicGF0aC5kaXJuYW1lIiwicGF0aC5yZXNvbHZlIiwieGxzeC5yZWFkRmlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFDQSxNQUFNLFFBQVEsR0FBR0EsV0FBVyxFQUFFLENBQUM7QUFDL0I7QUFDTyxNQUFNLEtBQUssR0FBRyxRQUFRLEtBQUssT0FBTyxHQUFHLElBQUksR0FBRyxNQUFNOztBQytCekQ7QUFDQSxNQUFNLFVBQVUsR0FBRyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQztNQUNsRix1QkFBdUI7SUFDaEMsV0FBVyxDQUNQLFdBQThCLEVBQzlCLGdCQUE2QixFQUM3QixlQUE0QixFQUM1QixjQUFtQztRQUVuQyxJQUFJLFlBQVksR0FBa0IsV0FBVyxDQUFDLFlBQVksQ0FBQztRQUMzRCxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsWUFBWSxHQUFHO2dCQUNYLHdCQUF3QixFQUFFQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGdCQUFnQixDQUFDO2FBQ3ZFLENBQUM7U0FDTDtRQUVELElBQUksV0FBVyxHQUEyQixFQUFFLENBQUM7UUFDN0MsSUFBSSxhQUFhLEdBQWtCLEVBQUUsQ0FBQztRQUN0QyxJQUFJLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztRQUM1QixJQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUMxQixJQUFJLFdBQThCLENBQUM7UUFDbkMsSUFBSSxTQUFpQixDQUFDO1FBQ3RCLElBQUksUUFBYSxDQUFDO1FBQ2xCLElBQUksZUFBZSxHQUErQixFQUFFLENBQUM7UUFDckQsS0FBSyxJQUFJLFFBQVEsSUFBSSxjQUFjLEVBQUU7WUFDakMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVc7Z0JBQUUsU0FBUztZQUN2QyxTQUFTLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7WUFDOUMsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsS0FBS0MsaUJBQVMsQ0FBQyxVQUFVLEVBQUU7Z0JBQzVELGtCQUFrQixJQUFJLGFBQWEsR0FBRyxTQUFTLEdBQUcsS0FBSyxHQUFHLE1BQU0sU0FBUyxHQUFHLEdBQUcsS0FBSyxDQUFDO2FBQ3hGO2lCQUFNO2dCQUNILGtCQUFrQixJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM3RDs7WUFHRCxRQUFRLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksUUFBUSxFQUFFO2dCQUNWLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDNUQ7aUJBQU07Z0JBQ0gsUUFBUSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7YUFDbkM7WUFDRCxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsUUFBUSxDQUFDO1lBQ2xDLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsS0FBS0EsaUJBQVMsQ0FBQyxVQUFVLENBQUM7WUFDeEYsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFOztnQkFFdkIsSUFBSSxZQUFZLENBQUMsV0FBVyxLQUFLLFNBQVM7b0JBQUUsWUFBWSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7Z0JBQzVFLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFO29CQUMzQixJQUFJLENBQUMsNEJBQTRCLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztpQkFDL0U7cUJBQU07b0JBQ0gsZ0JBQWdCLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUM1RDthQUNKOztZQUdELElBQUksWUFBWSxDQUFDLHdCQUF3QixFQUFFO2dCQUN2QyxJQUFJLENBQUMsNkJBQTZCLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQzthQUNoRjtTQUNKO1FBQ0QsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFOztZQUV2QixJQUFJLFNBQVMsR0FBRyx1Q0FBdUMsR0FBRyxLQUFLLENBQUM7WUFFaEUsa0JBQWtCLEdBQUcsU0FBUyxHQUFHLHlCQUF5QixHQUFHLEtBQUssR0FBRyxrQkFBa0IsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDO1lBRXRHLElBQUksWUFBWSxDQUFDLFdBQVcsRUFBRTs7Z0JBRTFCLE1BQU0saUJBQWlCLEdBQUdELFNBQVMsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUNuRixhQUFhLENBQUMsaUJBQWlCLENBQUMsR0FBRztvQkFDL0IsUUFBUSxFQUFFLGlCQUFpQjtvQkFDM0IsSUFBSSxFQUFFLGtCQUFrQixHQUFHLGdCQUFnQjtpQkFDOUMsQ0FBQzthQUNMO2lCQUFNOztnQkFFSCxNQUFNLHVCQUF1QixHQUFHQSxTQUFTLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDekYsYUFBYSxDQUFDLHVCQUF1QixDQUFDLEdBQUc7b0JBQ3JDLFFBQVEsRUFBRSx1QkFBdUI7b0JBQ2pDLElBQUksRUFBRSxrQkFBa0I7aUJBQzNCLENBQUM7YUFDTDtTQUNKOztRQUdELElBQUksWUFBWSxDQUFDLHVCQUF1QixFQUFFO1lBQ3RDLElBQUksa0JBQWtCLEdBQUcsWUFBWSxDQUFDLHVCQUF1QixDQUFDO1lBQzlELElBQUksVUFBZSxDQUFDO1lBQ3BCLElBQUksWUFBWSxDQUFDLFVBQVUsRUFBRTtnQkFDekIsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO2dCQUMxQixJQUFJLFFBQWEsQ0FBQztnQkFDbEIsSUFBSSxXQUFnQixDQUFDO2dCQUNyQixLQUFLLElBQUksU0FBUyxJQUFJLFdBQVcsRUFBRTtvQkFDL0IsSUFBSSxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUU7d0JBQzVCLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ25ELFNBQVM7cUJBQ1o7b0JBQ0QsUUFBUSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDbEMsV0FBVyxHQUFHLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUNyQyxLQUFLLElBQUksT0FBTyxJQUFJLFFBQVEsRUFBRTt3QkFDMUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUU7NEJBQ3pCLFdBQVcsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzt5QkFDM0Q7d0JBQ0QsV0FBVyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO3FCQUMxRTtvQkFDRCxjQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsV0FBVyxDQUFDO2lCQUMzQztnQkFDRCxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUMvQztpQkFBTTtnQkFDSCxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUM1QztZQUNELElBQUksWUFBWSxDQUFDLHlCQUF5QixFQUFFO2dCQUN4QyxVQUFVLEdBQUdFLGVBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksWUFBWSxDQUFDLG1CQUFtQixFQUFFO29CQUNsQyxVQUFVLEdBQUcsWUFBWSxDQUFDLG1CQUFtQixHQUFHLFVBQVUsQ0FBQztpQkFDOUQ7Z0JBQ0QsSUFBSSxZQUFZLENBQUMsbUJBQW1CLEVBQUU7b0JBQ2xDLFVBQVUsSUFBSSxZQUFZLENBQUMsbUJBQW1CLENBQUM7aUJBQ2xEO2FBQ0o7WUFDRCxJQUFJLFlBQVksQ0FBQyxLQUFLLEVBQUU7Z0JBQ3BCLFVBQVUsR0FBR0MsZ0JBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUN4QztZQUNELGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHO2dCQUNoQyxRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QixRQUFRLEVBQUUsT0FBTyxVQUFVLEtBQUssUUFBUSxHQUFHLFFBQVEsR0FBRyxPQUFPO2dCQUM3RCxJQUFJLEVBQUUsVUFBVTthQUNuQixDQUFDO1NBQ0w7UUFDRCxPQUFPLGFBQWEsQ0FBQztLQUN4QjtJQUNPLDRCQUE0QixDQUNoQyxNQUFxQixFQUNyQixXQUE4QixFQUM5QixhQUE0Qjs7UUFHNUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUNsQyxJQUFJLFdBQVcsR0FBV0gsU0FBUyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsT0FBTyxDQUFDLENBQUM7UUFFekcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRTs7WUFFN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BELElBQUksTUFBTSxFQUFFO2dCQUNSLGFBQWEsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBUyxDQUFDO2FBQy9FO1NBQ0o7S0FDSjs7Ozs7SUFLTyxrQkFBa0IsQ0FBQyxXQUE4QjtRQUNyRCxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztRQUVwRCxNQUFNLG1CQUFtQixHQUF3QixXQUFXLENBQUMsUUFBUSxDQUFDO1FBQ3RFLElBQUksYUFBYSxHQUFHLGVBQWUsR0FBRyxTQUFTLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUMvRCxJQUFJLFVBQXVCLENBQUM7UUFFNUIsSUFBSSxhQUFhLEdBQThCLEVBQUUsQ0FBQztRQUVsRCxLQUFLLElBQUksTUFBTSxJQUFJLG1CQUFtQixFQUFFO1lBQ3BDLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsVUFBVTtnQkFBRSxTQUFTO1lBQzFCLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFOztnQkFFMUIsYUFBYSxJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O2dCQUU1RCxhQUFhO29CQUNULGFBQWE7d0JBQ2IsVUFBVSxDQUFDLFNBQVM7d0JBQ3BCLEtBQUs7eUJBQ0osVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0JBQzdFLEdBQUc7d0JBQ0gsS0FBSyxDQUFDO2FBQ2I7aUJBQU07Z0JBQ0gsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDN0IsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztpQkFDbkM7O2dCQUdELGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDOztnQkFHM0UsYUFBYSxDQUFDLFdBQVcsQ0FBQztvQkFDdEIsZUFBZTt3QkFDZixVQUFVLENBQUMsWUFBWTt3QkFDdkIsS0FBSzt5QkFDSixVQUFVLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQzt3QkFDdEYsR0FBRzt3QkFDSCxLQUFLLENBQUM7YUFDYjtTQUNKOztRQUVELEtBQUssSUFBSSxXQUFXLElBQUksYUFBYSxFQUFFOztZQUVuQyxhQUFhLElBQUksYUFBYSxHQUFHLFdBQVcsR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMzRixhQUFhLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztTQUNsQztRQUNELGFBQWEsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDO1FBRTdCLE9BQU8sYUFBYSxDQUFDO0tBQ3hCOzs7Ozs7O0lBT08sNkJBQTZCLENBQ2pDLE1BQXFCLEVBQ3JCLFdBQThCLEVBQzlCLGFBQTRCO1FBRTVCLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDdEMsSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFPO1FBQ3RCLE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO1FBQ3BELElBQUksa0JBQWtCLEdBQUdBLFNBQVMsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxTQUFTLE9BQU8sQ0FBQyxDQUFDO1FBQ3pGLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUxRCxJQUFJLG9CQUFvQixHQUFHLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzdELElBQUksb0JBQW9CLEVBQUU7WUFDdEIsb0JBQW9CLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQztTQUM5QzthQUFNO1lBQ0gsb0JBQW9CLEdBQUc7Z0JBQ25CLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLElBQUksRUFBRSxjQUFjO2FBQ3ZCLENBQUM7WUFDRixhQUFhLENBQUMsa0JBQWtCLENBQUMsR0FBRyxvQkFBb0IsQ0FBQztTQUM1RDtLQUNKO0lBQ08sbUJBQW1CLENBQUMsU0FBaUI7UUFDekMsT0FBTyxhQUFhLEdBQUcsU0FBUyxHQUFHLEtBQUssR0FBRyxTQUFTLEdBQUcsS0FBSyxHQUFHLFNBQVMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO0tBQzNGOzs7TUN2UVEsaUJBQWlCLEdBRTFCLEdBQUc7QUFDUCxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUM7QUFDcEMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQ3ZDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLFdBQVcsQ0FBQztBQUN6QyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxXQUFXLENBQUM7QUFDNUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDO0FBQ3pDLFNBQVMsV0FBVyxDQUFDLFNBQXNCLEVBQUUsU0FBaUI7SUFDMUQsU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLEVBQUUsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2hELFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsSUFBSSxNQUFnQixDQUFDO0lBQ3JCLE1BQU0sTUFBTSxHQUFzQixFQUFFLENBQUM7SUFDckMsSUFBSSxTQUFTLEtBQUssRUFBRSxFQUFFO1FBQ2xCLElBQUk7WUFDQSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztTQUN6QjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7U0FDeEI7S0FDSjtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFDRCxTQUFTLFdBQVcsQ0FBQyxTQUFzQixFQUFFLFNBQWlCO0lBQzFELFNBQVMsR0FBRyxDQUFDLFNBQVMsR0FBRyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoRCxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzdCLElBQUksTUFBTSxHQUFzQixFQUFFLENBQUM7SUFDbkMsSUFBSSxHQUFhLENBQUM7SUFDbEIsSUFBSSxTQUFTLEtBQUssRUFBRSxFQUFFO1FBQ2xCLElBQUk7WUFDQSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztTQUN0QjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7U0FDeEI7S0FDSjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFDRCxTQUFTLFFBQVEsQ0FBQyxTQUFzQixFQUFFLFNBQWlCO0lBQ3ZELElBQUksTUFBTSxHQUFzQixFQUFTLENBQUM7SUFDMUMsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUMxRCxNQUFNLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFJLFFBQVEsQ0FBQyxTQUFTLENBQVMsQ0FBQztLQUNqRztTQUFNLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO1FBQ3RDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0tBQzVCO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQUNELFNBQVMsWUFBWSxDQUFDLFNBQXNCLEVBQUUsU0FBaUI7SUFDM0QsU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLEVBQUUsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2hELFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsSUFBSSxHQUFHLENBQUM7SUFDUixJQUFJLEtBQUssQ0FBQztJQUNWLElBQUksU0FBUyxLQUFLLEVBQUUsRUFBRTtRQUNsQixJQUFJO1lBQ0EsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDL0I7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLEtBQUssR0FBRyxHQUFHLENBQUM7WUFDWixHQUFHLEdBQUcsU0FBUyxDQUFDO1NBQ25CO0tBQ0o7SUFDRCxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDeEMsQ0FBQztBQUNELFNBQVMsUUFBUSxDQUFDLFNBQXNCLEVBQUUsU0FBYztJQUNwRCxJQUFJLE1BQU0sR0FBc0IsRUFBUyxDQUFDO0lBQzFDLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO1FBQy9CLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0IsSUFBSSxTQUFTLEtBQUssRUFBRSxFQUFFO1lBQ2xCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO1NBQzVCO0tBQ0o7U0FBTTtRQUNILE1BQU0sQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLEVBQUUsQ0FBQztLQUNqQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCOztTQzVFZ0IsT0FBTyxDQUNuQixXQUE4QixFQUM5QixTQUFzQixFQUN0QixjQUFtQyxFQUNuQyxZQUFnQztJQUVoQyxJQUFJLFdBQVcsQ0FBQztJQUNoQixLQUFLLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDNUMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNkLFdBQVcsR0FBRyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDckQ7UUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUN2QixXQUFXLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3JGO1FBQ0QsSUFBSSxXQUFXLEVBQUU7WUFDYixjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFdBQVcsQ0FBQztTQUN2RDtLQUNKO0FBQ0w7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakJBLElBQUssWUFLSjtBQUxELFdBQUssWUFBWTtJQUNiLCtDQUFJLENBQUE7SUFDSiwrQ0FBSSxDQUFBO0lBQ0osaURBQUssQ0FBQTtJQUNMLDJDQUFFLENBQUE7QUFDTixDQUFDLEVBTEksWUFBWSxLQUFaLFlBQVksUUFLaEI7TUFDWSxNQUFNO0lBSVIsT0FBTyxJQUFJLENBQUMsV0FBOEI7UUFDN0MsTUFBTSxLQUFLLEdBQWEsV0FBVyxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztRQUM3RSxJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsV0FBVyxDQUFDLGFBQWEsS0FBSyxTQUFTLEdBQUcsSUFBSSxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUM7S0FDMUc7Ozs7OztJQU1NLE9BQU8sR0FBRyxDQUFDLE9BQWUsRUFBRSxRQUFrQixNQUFNO1FBQ3ZELElBQUksS0FBSyxLQUFLLElBQUk7WUFBRSxPQUFPO1FBQzNCLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDdkMsUUFBUSxLQUFLO2dCQUNULEtBQUssT0FBTztvQkFDUixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN2QixNQUFNO2dCQUNWLEtBQUssTUFBTTtvQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNyQixNQUFNO2dCQUNWLEtBQUssTUFBTTtvQkFDUCxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN0QixNQUFNO2FBQ2I7U0FDSjtRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CO1lBQUUsT0FBTztRQUN2QyxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7S0FDbkM7Ozs7SUFJTSxXQUFXLE1BQU07UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0I7WUFBRSxPQUFPLElBQUksQ0FBQztRQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLE9BQU8sTUFBTSxDQUFDO0tBQ2pCOztBQXJDYyxjQUFPLEdBQVcsRUFBRTs7QUNJdkM7Ozs7O1NBS2dCLFdBQVcsQ0FBQyxhQUFxQixFQUFFLFlBQXlDO0lBQ3hGLElBQUlJLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtRQUMxQyxNQUFNLFNBQVMsR0FBR0MsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hELElBQUksYUFBcUIsQ0FBQztRQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN2QyxhQUFhLEdBQUdMLFNBQVMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsV0FBVyxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztTQUM1QztLQUNKO1NBQU07UUFDSCxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDL0I7QUFDTCxDQUFDO0FBQ0Q7Ozs7OztTQU1nQix3QkFBd0IsQ0FDcEMsZUFBa0MsRUFDbEMsVUFBa0YsRUFDbEYsUUFBa0M7SUFFbEMsSUFBSSxRQUF5QixDQUFDO0lBQzlCLE1BQU0sS0FBSyxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7SUFDckMsSUFBSSxlQUFlLElBQUksS0FBSyxFQUFFO1FBQzFCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLE1BQU0sVUFBVSxHQUFHLENBQUMsR0FBRztZQUNuQixJQUFJLEdBQUcsRUFBRTtnQkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUM1QjtZQUNELEdBQUcsRUFBRSxDQUFDO1lBQ04sVUFBVSxJQUFJLFVBQVUsQ0FBQyxlQUFlLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUUsSUFBSSxHQUFHLElBQUksS0FBSyxFQUFFO2dCQUNkLFFBQVEsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDL0I7U0FDSixDQUFDO1FBQ0YsS0FBSyxJQUFJLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2xELFFBQVEsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxRQUFRLENBQUMsUUFBUSxJQUFJTSxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN2REMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNwQztpQkFBTTtnQkFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxPQUFPLFFBQVEsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO29CQUN6RCxRQUFRLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztpQkFDOUI7Z0JBRURDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDckNDLFlBQVksQ0FDUixRQUFRLENBQUMsUUFBUSxFQUNqQixRQUFRLENBQUMsSUFBSSxFQUNiLFFBQVEsQ0FBQyxRQUFRLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLFNBQVMsRUFDL0QsVUFBVSxDQUNiLENBQUM7YUFDTDtTQUNKO0tBQ0o7QUFDTCxDQUFDO0FBQ0Q7Ozs7Ozs7U0FPZ0Isa0JBQWtCLENBQzlCLEdBQVcsRUFDWCxhQUFzQixFQUN0QixZQUE2RDtJQUU3RCxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDN0MsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMzQyxJQUFJLGdCQUF3QixDQUFDO0lBQzdCLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRO1FBQ3RCLElBQUksTUFBTSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTSxDQUFDLEVBQUU7WUFDOUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQztZQUM1QixZQUFZLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxJQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ3ZCLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzFELFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLFdBQVcsQ0FBQztZQUM3QyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDdEI7S0FDSixDQUFDLENBQUM7SUFDSCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMxQyxPQUFPLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3ZDO0lBQ0RDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDckYsQ0FBQztBQUNEOzs7OztTQUtnQixjQUFjLENBQUMsYUFBcUIsRUFBRSxTQUFjO0lBQ2hFLElBQUksQ0FBQyxhQUFhLEVBQUU7UUFDaEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QyxPQUFPO0tBQ1Y7SUFDREEsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUN0RixDQUFDO0FBQ0Q7Ozs7U0FJZ0IsWUFBWSxDQUFDLGFBQXFCO0lBQzlDLElBQUksQ0FBQyxhQUFhLEVBQUU7UUFDaEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QyxPQUFPO0tBQ1Y7SUFDRCxJQUFJLENBQUNKLGFBQWEsQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUMvQkUsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDakNFLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztLQUNoRTtJQUNELE1BQU0sWUFBWSxHQUFHQyxlQUFlLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUMsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQztBQUNEOzs7O1NBSWdCLGNBQWMsQ0FBQyxRQUFnQjtJQUMzQyxNQUFNLElBQUksR0FBR0EsZUFBZSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNoRCxJQUFJLEtBQUssR0FBR0MsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUNEOzs7O1NBSXNCLFVBQVUsQ0FBQyxRQUFnQjs7UUFDN0MsT0FBTyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbkM7OztBQ3BKRDs7Ozs7U0FLc0IsUUFBUSxDQUFDLFdBQThCLEVBQUUsaUJBQThDOztRQUN6RyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUN2QixXQUFXLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUN4QztRQUNELE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUM7UUFDOUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLE1BQU0sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDNUMsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDTixhQUFhLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLFlBQVksRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELE9BQU87U0FDVjtRQUNELE1BQU0sY0FBYyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFO1lBQ3RCLFdBQVcsQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDO1NBQ3hDO2FBQU0sSUFBSSxXQUFXLENBQUMsT0FBTyxJQUFJLE9BQU8sV0FBVyxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDdkUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDbEQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQy9DO2FBQ0o7U0FDSjtRQUNELElBQUksV0FBVyxDQUFDLGNBQWMsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLEVBQUU7WUFDeEUsV0FBVyxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQztTQUN6QztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDekIsSUFBSSxTQUFTLEdBQWdCLEVBQUUsQ0FBQztRQUNoQyxJQUFJLGVBQWUsR0FBZ0IsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sV0FBVyxHQUFHLENBQUMsUUFBZ0I7WUFDakMsTUFBTSxhQUFhLEdBQUdPLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQyxNQUFNLFFBQVEsR0FBYztnQkFDeEIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFFBQVEsRUFBRSxhQUFhLENBQUMsSUFBSTtnQkFDNUIsV0FBVyxFQUFFLGFBQWEsQ0FBQyxHQUFHO2dCQUM5QixRQUFRLEVBQUUsS0FBSzthQUNsQixDQUFDO1lBQ0YsT0FBTyxRQUFRLENBQUM7U0FDbkIsQ0FBQztRQUNGLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDekMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFFBQWdCLEVBQUUsUUFBa0I7WUFDMUQsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksT0FBZ0IsQ0FBQztZQUNyQixJQUFJLFFBQVEsRUFBRTtnQkFDVixlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2xDO2lCQUFNO2dCQUNILE9BQU8sR0FBR0MsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ3RELElBQUksT0FBTyxFQUFFO29CQUNULFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzVCO2FBQ0o7WUFDRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDO1NBQ2hDLENBQUM7UUFDRixJQUFJLGNBQWMsR0FBd0IsRUFBRSxDQUFDOztRQUc3QyxJQUFJLGdCQUFnQixHQUFXLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM1RCxJQUFJLDJCQUFtQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFO1lBQ3ZCLFdBQVcsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztTQUMvQzthQUFNO1lBQ0gsSUFBSSxDQUFDLGdCQUFnQjtnQkFBRSxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7WUFDbkQsSUFBSSxDQUFDQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDcEMsZ0JBQWdCLEdBQUdmLFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3JFLDJCQUEyQixHQUFHQSxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDekU7WUFDRCxjQUFjLEdBQUcsWUFBWSxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDakIsY0FBYyxHQUFHLEVBQUUsQ0FBQzthQUN2QjtZQUNELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDakQsSUFBSSxnQkFBd0IsQ0FBQztZQUM3QixJQUFJLFdBQThCLENBQUM7WUFDbkMsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDLFFBQVE7Z0JBQy9CLElBQUksTUFBTSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdEMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDZCxXQUFXLEdBQUc7d0JBQ1YsUUFBUSxFQUFFLFFBQVE7cUJBQ3JCLENBQUM7b0JBQ0YsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFdBQVcsQ0FBQztpQkFDMUM7Z0JBQ0QsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLE9BQU8sS0FBSyxNQUFNLEVBQUU7b0JBQy9DLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNoRSxJQUFJLE9BQU8sRUFBRTt3QkFDVCxXQUFXLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztxQkFDaEM7aUJBQ0o7Z0JBQ0QsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDdkIsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzFELFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLFdBQVcsQ0FBQztvQkFDN0MsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO2lCQUN0QjthQUNKLENBQUMsQ0FBQztZQUNILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxQyxPQUFPLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzNDO1NBQ0o7UUFDRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLHFCQUFxQixJQUFJLFdBQVcsQ0FBQyxjQUFjLEVBQUU7WUFDcEYsSUFBSSxNQUFNLEdBQVcsRUFBRSxDQUFDO1lBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkYsSUFBSSxNQUFjLENBQUM7WUFDbkIsSUFBSSxZQUF5QixDQUFDO1lBRTlCLElBQUksYUFBYSxHQUFXLENBQUMsQ0FBQztZQUM5QixNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxJQUFtQjtnQkFDekMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLFFBQVEsbUJBQW1CLENBQUMsQ0FBQztnQkFDckUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztnQkFDdEMsS0FBSyxJQUFJLEdBQUcsSUFBSSxTQUFTLEVBQUU7b0JBQ3ZCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFO3dCQUNsQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUN4QztpQkFDSjtnQkFDRCxhQUFhLEVBQUUsQ0FBQztnQkFDaEIsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDdEMsSUFBSSxhQUFhLElBQUksS0FBSyxFQUFFO29CQUN4QixNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNoQyxNQUFNLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ25DLFVBQVUsQ0FDTixXQUFXLEVBQ1gsMkJBQTJCLEVBQzNCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsZUFBZSxFQUNmLGNBQWMsRUFDZCxNQUFNLENBQ1QsQ0FBQztpQkFDTDthQUNKLENBQUM7WUFDRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM1QixZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQ3RFLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDekQsTUFBTSxHQUFHLElBQUlnQixxQkFBTSxDQUFDaEIsU0FBUyxDQUFDaUIsWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFLG1DQUFtQyxDQUFDLEVBQUU7b0JBQzFGLFVBQVUsRUFBRTt3QkFDUixRQUFRLEVBQUUsQ0FBQzt3QkFDWCxTQUFTLEVBQUUsWUFBWTt3QkFDdkIsY0FBYyxFQUFFLGNBQWM7d0JBQzlCLFdBQVcsRUFBRSxXQUFXO3FCQUNQO2lCQUN4QixDQUFDLENBQUM7Z0JBRUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQzthQUMxQztTQUNKO2FBQU07WUFDSCxNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hDLElBQUksWUFBZ0MsQ0FBQztZQUNyQyxJQUFJLFdBQVcsQ0FBQyxzQkFBc0IsRUFBRTtnQkFDcEMsSUFBSSxDQUFDRixlQUFlLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLEVBQUU7b0JBQ3RELFdBQVcsQ0FBQyxzQkFBc0IsR0FBR0csWUFBWSxDQUM3QyxXQUFXLENBQUMsUUFBUSxFQUNwQixXQUFXLENBQUMsc0JBQXNCLENBQ3JDLENBQUM7aUJBQ0w7Z0JBQ0QsWUFBWSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQzthQUM5RDtZQUNELElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2YsWUFBWSxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQzthQUM1QztZQUNELE9BQU8sQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUM5RCxNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNuQyxVQUFVLENBQ04sV0FBVyxFQUNYLDJCQUEyQixFQUMzQixpQkFBaUIsRUFDakIsU0FBUyxFQUNULGVBQWUsRUFDZixjQUFjLEVBQ2QsTUFBTSxDQUFDLE1BQU0sQ0FDaEIsQ0FBQztTQUNMO0tBQ0o7Q0FBQTtBQUNELFNBQVMsVUFBVSxDQUNmLFdBQThCLEVBQzlCLDJCQUFtQyxFQUNuQyxpQkFBOEMsRUFDOUMsU0FBc0IsRUFDdEIsZUFBNEIsRUFDNUIsY0FBbUMsRUFDbkMsTUFBZTs7SUFHZixJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUU7UUFDdEIsY0FBYyxDQUFDLDJCQUEyQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQy9EOztJQUdELElBQUksYUFBYSxHQUFrQixpQkFBaUIsQ0FBQyxXQUFXLENBQzVELFdBQVcsRUFDWCxTQUFTLEVBQ1QsZUFBZSxFQUNmLGNBQWMsQ0FDakIsQ0FBQztJQUNGLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7O0lBR2pELE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUU3Qyx3QkFBd0IsQ0FDcEIsV0FBVyxFQUNYLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSTtRQUN2QixNQUFNLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyxJQUFJLEtBQUssUUFBUSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQzVELEVBQ0Q7UUFDSSxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztRQUVwQixJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7U0FDMUI7UUFDRCxNQUFNLGlCQUFpQixHQUFvQjtZQUN2QyxRQUFRLEVBQUVsQixTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGVBQWUsQ0FBQztZQUNuRCxJQUFJLEVBQUUsTUFBTTtTQUNmLENBQUM7UUFDRix3QkFBd0IsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztLQUNqRCxDQUNKLENBQUM7QUFDTjs7QUN4T0E7Ozs7U0FJZ0IsV0FBVyxDQUFDLElBQXFCO0lBQzdDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO1FBQzlCLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtZQUM1QixPQUFPLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3hCO2FBQU0sSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO1lBQ25DLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN4QjthQUFNO1lBQ0gsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjtTQUFNO1FBQ0gsT0FBTyxJQUFJLENBQUM7S0FDZjtBQUNMLENBQUM7QUFDRDs7O01BR2EsU0FBUyxHQUFHLEdBQUc7QUFDNUI7Ozs7TUFJYSxTQUFTLEdBQUcsR0FBRztBQUM1Qjs7OztTQUlnQixhQUFhLENBQUMsU0FBbUI7SUFDN0MsSUFBSSxLQUFjLENBQUM7SUFDbkIsS0FBSyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzVDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsRUFBRTtZQUMxQixTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xCLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDYixNQUFNO1NBQ1Q7YUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUU7WUFDbkMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztTQUM1QjtLQUNKO0lBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNSLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDN0I7SUFFRCxPQUFPLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRDs7OztTQUlnQixpQkFBaUIsQ0FBQyxTQUFtQjtJQUNqRCxPQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBQ0Q7Ozs7U0FJZ0IsaUJBQWlCLENBQUMsTUFBYztJQUM1QyxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDcEMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDeEM7SUFDRCxPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBQ0Q7Ozs7Ozs7Ozs7O1NBV2dCLG9CQUFvQixDQUNoQyxLQUFpQixFQUNqQixRQUFnQixFQUNoQixRQUFnQixFQUNoQixRQUF1RSxFQUN2RSxhQUFnRSxFQUNoRSxhQUE4RCxFQUM5RCxjQUFpRSxFQUNqRSxjQUErRDtJQUUvRCxNQUFNLFFBQVEsR0FBVyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0RCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRSxJQUFJLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVqRCxJQUFJLFlBQXNCLENBQUM7SUFDM0IsSUFBSSxNQUFjLENBQUM7SUFDbkIsSUFBSSxhQUFhLEdBQVcsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sY0FBYyxHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELEtBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEMsSUFBSSxhQUFhLEdBQUcsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLO1lBQUUsTUFBTTtRQUMzRCxJQUFJLGNBQWMsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUs7WUFBRSxTQUFTO1FBQ2hFLFlBQVksR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sR0FBRyxRQUFRLENBQUM7UUFFbEIsSUFBSSxVQUFVLEdBQUcsYUFBYSxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDdEUsT0FBTyxVQUFVLEVBQUU7WUFDZixJQUFJLEVBQUUsY0FBYyxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUU7Z0JBQzNELFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzlCO1lBQ0QsTUFBTSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNyQyxhQUFhLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLElBQUksZ0JBQWdCLElBQUksYUFBYSxFQUFFO2dCQUNuQyxVQUFVLEdBQUcsYUFBYSxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDckU7aUJBQU07Z0JBQ0gsVUFBVSxHQUFHLEtBQUssQ0FBQzthQUN0QjtTQUNKO0tBQ0o7QUFDTCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7O1NBV2dCLHNCQUFzQixDQUNsQyxLQUFpQixFQUNqQixRQUFnQixFQUNoQixRQUFnQixFQUNoQixRQUF1RSxFQUN2RSxhQUFnRSxFQUNoRSxhQUE4RCxFQUM5RCxjQUFpRSxFQUNqRSxjQUErRDtJQUUvRCxNQUFNLFFBQVEsR0FBVyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0RCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRSxNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuRCxJQUFJLFlBQXNCLENBQUM7SUFDM0IsSUFBSSxNQUFjLENBQUM7SUFDbkIsWUFBWSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLElBQUksYUFBYSxHQUFXLENBQUMsQ0FBQztJQUM5QixNQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ2xCLElBQUksVUFBVSxHQUFHLGFBQWEsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ3RFLE9BQU8sVUFBVSxFQUFFO1FBQ2YsSUFBSSxFQUFFLGNBQWMsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQzNELEtBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hDLElBQUksYUFBYSxHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSztvQkFBRSxNQUFNO2dCQUMzRCxJQUFJLGNBQWMsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUs7b0JBQUUsU0FBUztnQkFDaEUsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDOUI7U0FDSjtRQUVELE1BQU0sR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDckMsYUFBYSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLGdCQUFnQixJQUFJLGFBQWEsRUFBRTtZQUNuQyxVQUFVLEdBQUcsYUFBYSxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDckU7YUFBTTtZQUNILFVBQVUsR0FBRyxLQUFLLENBQUM7U0FDdEI7S0FDSjtBQUNMLENBQUM7QUFDRCxJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDdEIsU0FBUyxjQUFjLENBQUMsTUFBYztJQUNsQyxJQUFJLEdBQUcsR0FBVyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkMsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNOLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDUixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQyxHQUFHLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMvQjtRQUNELFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUM7S0FDOUI7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFDRDs7OztTQUlnQixhQUFhLENBQUMsUUFBbUI7SUFDN0MsTUFBTSxRQUFRLEdBQUdtQixhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQzdHLE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFDRDs7OztTQUlnQixLQUFLLENBQUMsV0FBbUI7SUFDckMsT0FBTyxXQUFXLEtBQUssS0FBSyxDQUFDO0FBQ2pDOztBQ3ZFQSxXQUFZLFNBQVM7SUFDakIsa0NBQXFCLENBQUE7SUFDckIsc0NBQXlCLENBQUE7QUFDN0IsQ0FBQyxFQUhXbEIsaUJBQVMsS0FBVEEsaUJBQVMsUUFHcEI7TUFFWSxtQkFBbUI7SUFFNUI7UUFDSSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUM7S0FDL0M7SUFDRCxjQUFjLENBQUMsUUFBbUIsRUFBRSxRQUF1Qjs7UUFFdkQsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztRQUVwQyxNQUFNLFdBQVcsR0FBMEI7WUFDdkMsU0FBUyxFQUFFLFNBQVM7U0FDdkIsQ0FBQztRQUVGLElBQUksT0FBZSxDQUFDO1FBQ3BCLElBQUksT0FBd0IsQ0FBQzs7UUFFN0IsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztRQUN2QyxJQUFJLEtBQWlCLENBQUM7UUFDdEIsSUFBSSxjQUErRCxDQUFDO1FBQ3BFLElBQUksWUFBNkIsQ0FBQztRQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QyxLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxZQUFZLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUM1QixjQUFjLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxFQUFFO29CQUNqRSxNQUFNO2lCQUNUO2FBQ0o7U0FDSjtRQUNELElBQUksQ0FBQyxjQUFjLElBQUksY0FBYyxDQUFDLGdCQUFnQixLQUFLLFNBQVMsRUFBRTtZQUNsRSxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDMUQsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNELFdBQVcsQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQztRQUNqRCxJQUFJLFdBQVcsQ0FBQyxTQUFTLEtBQUtBLGlCQUFTLENBQUMsUUFBUSxFQUFFO1lBQzlDLFdBQVcsQ0FBQyxtQkFBbUIsR0FBRyxFQUFTLENBQUM7WUFDNUMsTUFBTSxtQkFBbUIsR0FBeUIsV0FBVyxDQUFDLG1CQUFtQixDQUFDO1lBQ2xGLG1CQUFtQixDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUIsT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFO29CQUM1RixXQUFXLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztpQkFDNUI7cUJBQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtvQkFDL0IsbUJBQW1CLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztpQkFDcEM7cUJBQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLLE1BQU0sRUFBRTtvQkFDN0IsbUJBQW1CLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztpQkFDbkM7Z0JBQ0QsSUFBSSxXQUFXLENBQUMsUUFBUSxJQUFJLG1CQUFtQixDQUFDLFFBQVEsSUFBSSxtQkFBbUIsQ0FBQyxPQUFPO29CQUFFLE1BQU07YUFDbEc7WUFFRCxXQUFXLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztTQUM5QjthQUFNLElBQUksV0FBVyxDQUFDLFNBQVMsS0FBS0EsaUJBQVMsQ0FBQyxVQUFVLEVBQUU7WUFDdkQsV0FBVyxDQUFDLHFCQUFxQixHQUFHLEVBQVMsQ0FBQztZQUM5QyxNQUFNLHFCQUFxQixHQUFHLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQztZQUNoRSxxQkFBcUIsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ3BDLHFCQUFxQixDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7WUFDcEMscUJBQXFCLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUNyQyxXQUFXLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUMzQixXQUFXLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztTQUM1QjtRQUVELE9BQU8sV0FBa0IsQ0FBQztLQUM3QjtJQUNPLGtCQUFrQixDQUFDLFlBQTZCO1FBQ3BELElBQUksQ0FBQyxZQUFZO1lBQUUsT0FBTztRQUMxQixNQUFNLFVBQVUsR0FBSSxZQUFZLENBQUMsQ0FBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6RCxJQUFJLGdCQUF3QixDQUFDO1FBQzdCLElBQUksU0FBaUIsQ0FBQztRQUN0QixJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZCLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBR0EsaUJBQVMsQ0FBQyxVQUFVLEdBQUdBLGlCQUFTLENBQUMsUUFBUSxDQUFDO1NBQ2pGO2FBQU07WUFDSCxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsU0FBUyxHQUFHQSxpQkFBUyxDQUFDLFFBQVEsQ0FBQztTQUNsQztRQUNELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDdkU7Ozs7O0lBS0Qsa0JBQWtCLENBQUMsV0FBeUIsRUFBRSxLQUFpQixFQUFFLFNBQWlCOztRQUU5RSxNQUFNLFlBQVksR0FBb0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0QsSUFBSSxZQUFZLElBQUksV0FBVyxFQUFFO1lBQzdCLElBQUksY0FBYyxDQUFDLGdCQUFnQixLQUFLLFdBQVcsQ0FBQyxTQUFTLEVBQUU7Z0JBQzNELE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDZjthQUFNO1lBQ0gsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjs7Ozs7OztJQU9ELGFBQWEsQ0FBQyxXQUF5QixFQUFFLEtBQWlCLEVBQUUsR0FBVzs7Ozs7UUFPbkUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO1lBQ1QsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDZCxNQUFNLE9BQU8sR0FBb0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNsRCxPQUFPLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQztTQUN6QzthQUFNO1lBQ0gsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjs7Ozs7OztJQU9ELGFBQWEsQ0FBQyxXQUF5QixFQUFFLEtBQWlCLEVBQUUsTUFBYzs7UUFFdEUsTUFBTSxZQUFZLEdBQW9CLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7O1FBRXhELE9BQU8sV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ3BDOzs7Ozs7O0lBT0QsaUJBQWlCLENBQUMsV0FBeUIsRUFBRSxLQUFpQixFQUFFLFFBQWdCO1FBQzVFLE1BQU0sT0FBTyxHQUFvQixLQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZELElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQy9CLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxJQUFJLENBQUM7S0FDZjs7Ozs7Ozs7O0lBU0QsaUJBQWlCLENBQ2IsZ0JBQW1DLEVBQ25DLEtBQWlCLEVBQ2pCLE1BQWMsRUFDZCxRQUFnQixFQUNoQixhQUFzQjtRQUV0QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4RixJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFDdkIsTUFBTSxJQUFJLEdBQW9CLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDdkQsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkIsT0FBTztTQUNWO1FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRTtZQUNuQixNQUFNLENBQUMsR0FBRyxDQUNOLE1BQU0sZ0JBQWdCLENBQUMsUUFBUSxPQUFPLGdCQUFnQixDQUFDLFlBQVksTUFBTSxRQUFRLE1BQU0sTUFBTSxNQUFNLEVBQ25HLE9BQU8sQ0FDVixDQUFDO1lBQ0YsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQzFDO1FBQ0QsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUN2QyxJQUFJLGdCQUFnQixHQUFXLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDO1FBQ2pFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTs7WUFFbkIsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztZQUN2QyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1lBQ3hELGdCQUFnQixDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7U0FDbEM7UUFDRCxJQUFJLFdBQVcsR0FBUSxnQkFBZ0IsQ0FBQyxjQUFjLENBQUM7UUFDdkQsSUFBSSxhQUFhLEVBQUU7O1lBRWYsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUNqQixnQkFBZ0IsQ0FBQyxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLFdBQVcsQ0FBQztTQUMzRjtRQUVELElBQUksU0FBUyxDQUFDLFlBQVksRUFBRTtZQUN4QixJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1QsTUFBTSxHQUFHLEVBQUUsQ0FBQztnQkFDWixXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQzthQUM3QztZQUNELE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsWUFBWSxDQUFDO1NBQ2pEO2FBQU07WUFDSCxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFlBQVksQ0FBQztTQUNuRDtLQUNKOzs7Ozs7Ozs7SUFTRCxtQkFBbUIsQ0FDZixnQkFBbUMsRUFDbkMsS0FBaUIsRUFDakIsTUFBYyxFQUNkLFFBQWdCLEVBQ2hCLGFBQXNCO1FBRXRCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzFGLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUN2QixNQUFNLElBQUksR0FBb0IsS0FBSyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsQ0FBQztRQUN2RCxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuQixPQUFPO1NBQ1Y7UUFDRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekUsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQ04sTUFBTSxnQkFBZ0IsQ0FBQyxRQUFRLE9BQU8sZ0JBQWdCLENBQUMsWUFBWSxNQUFNLFFBQVEsTUFBTSxNQUFNLE1BQU0sRUFDbkcsT0FBTyxDQUNWLENBQUM7WUFDRixNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDMUM7UUFDRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7WUFDNUIsZ0JBQWdCLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztTQUNsQztRQUNELElBQUksU0FBUyxDQUFDLFlBQVksRUFBRTtZQUN4QixJQUFJLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1QsTUFBTSxHQUFHLEVBQUUsQ0FBQztnQkFDWixnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQzthQUMzRDtZQUNELE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsWUFBWSxDQUFDO1NBQ2pEO2FBQU07WUFDSCxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFlBQVksQ0FBQztTQUNqRTtLQUNKOzs7Ozs7OztJQVFELHFCQUFxQixDQUNqQixnQkFBbUMsRUFDbkMsS0FBaUIsRUFDakIsTUFBYyxFQUNkLFFBQWdCO1FBRWhCLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQztRQUNqRCxJQUFJLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7UUFDOUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNoQixhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ25CLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUM7U0FDN0M7UUFDRCxNQUFNLG1CQUFtQixHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQztRQUM1RCxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9ELElBQUksZUFBdUIsQ0FBQztRQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3pCLGVBQWUsR0FBRyxTQUFTLENBQUMsQ0FBVyxDQUFDO1NBQzNDO1FBQ0QsSUFBSSxDQUFDLGVBQWU7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNsQyxJQUFJLEtBQUssR0FBZ0IsRUFBUyxDQUFDOztRQUVuQyxJQUFJLGFBQWEsQ0FBQyxlQUFlLENBQUMsS0FBSyxTQUFTLEVBQUU7WUFDOUMsT0FBTyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDekM7O1FBRUQsTUFBTSxRQUFRLEdBQW9CLEtBQUssQ0FBQyxNQUFNLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN4QixLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFXLENBQUM7U0FDckM7O1FBRUQsSUFBSSxTQUFTLEdBQVksS0FBSyxDQUFDO1FBQy9CLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFN0QsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUM7U0FDZjthQUFNO1lBQ0gsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsQ0FBVyxDQUFDO1lBQ3hDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNyQixPQUFPLElBQUksQ0FBQztpQkFDZjtnQkFDRCxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsU0FBUyxHQUFHLElBQUksQ0FBQzthQUNwQjtpQkFBTTtnQkFDSCxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7YUFDakM7U0FDSjtRQUNELEtBQUssQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDOztRQUUvQixLQUFLLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN4QyxJQUFJLFNBQVMsRUFBRTtZQUNYLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25ELElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3RCLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFDRCxLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixLQUFLLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNyQzthQUFNO1lBQ0gsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDO1NBQzNDO1FBRUQsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUM5QixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUNELHVCQUF1QixDQUNuQixnQkFBbUMsRUFDbkMsS0FBaUIsRUFDakIsTUFBYyxFQUNkLFFBQWdCO1FBRWhCLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQztRQUNqRCxJQUFJLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7UUFDOUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNoQixhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ25CLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUM7U0FDN0M7UUFDRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMscUJBQXFCLENBQUM7UUFDdkQsTUFBTSxhQUFhLEdBQW9CLEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDO1FBQy9FLElBQUksZUFBdUIsQ0FBQztRQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQzdCLGVBQWUsR0FBRyxhQUFhLENBQUMsQ0FBVyxDQUFDO1NBQy9DO1FBQ0QsSUFBSSxDQUFDLGVBQWU7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNsQyxJQUFJLGFBQWEsQ0FBQyxlQUFlLENBQUMsS0FBSyxTQUFTLEVBQUU7WUFDOUMsT0FBTyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDekM7UUFDRCxJQUFJLEtBQUssR0FBZ0IsRUFBUyxDQUFDO1FBRW5DLE1BQU0sUUFBUSxHQUFvQixLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQzs7UUFFekUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN4QixLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFXLENBQUM7U0FDckM7UUFDRCxJQUFJLFNBQVMsR0FBWSxLQUFLLENBQUM7O1FBRS9CLE1BQU0sUUFBUSxHQUFvQixLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQztRQUV6RSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN2QixPQUFPLElBQUksQ0FBQztTQUNmO2FBQU07O1lBRUgsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsQ0FBVyxDQUFDO1lBQ3hDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNyQixPQUFPLElBQUksQ0FBQztpQkFDZjtnQkFDRCxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsU0FBUyxHQUFHLElBQUksQ0FBQzthQUNwQjtpQkFBTTtnQkFDSCxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7YUFDakM7U0FDSjtRQUNELEtBQUssQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO1FBQy9CLEtBQUssQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3hDLElBQUksU0FBUyxFQUFFO1lBQ1gsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkQsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdEIsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUNELEtBQUssQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLEtBQUssQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO2FBQU07WUFDSCxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUM7U0FDM0M7UUFDRCxhQUFhLENBQUMsZUFBZSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3ZDLE9BQU8sS0FBSyxDQUFDO0tBQ2hCOzs7Ozs7O0lBT0QsaUJBQWlCLENBQUMsV0FBeUIsRUFBRSxLQUFpQixFQUFFLE1BQWM7O1FBRTFFLElBQUksV0FBVyxDQUFDLFNBQVMsS0FBS0EsaUJBQVMsQ0FBQyxRQUFRLEVBQUU7WUFDOUMsTUFBTSxtQkFBbUIsR0FBRyxXQUFXLENBQUMsbUJBQW1CLENBQUM7WUFDNUQsTUFBTSxXQUFXLEdBQW9CLEtBQUssQ0FBQyxNQUFNLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakYsTUFBTSxZQUFZLEdBQW9CLEtBQUssQ0FBQyxNQUFNLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkYsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUN2RCxPQUFPLEtBQUssQ0FBQzthQUNoQjtpQkFBTTtnQkFDSCxPQUFPLElBQUksQ0FBQzthQUNmO1NBQ0o7YUFBTSxJQUFJLFdBQVcsQ0FBQyxTQUFTLEtBQUtBLGlCQUFTLENBQUMsVUFBVSxFQUFFO1lBQ3ZELE1BQU0sT0FBTyxHQUFvQixLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25ELElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN0QixPQUFPLEtBQUssQ0FBQzthQUNoQjtpQkFBTTtnQkFDSCxPQUFPLElBQUksQ0FBQzthQUNmO1NBQ0o7S0FDSjs7Ozs7OztJQU9NLFVBQVUsQ0FBQyxXQUE4QixFQUFFLFNBQXNCLEVBQUUsU0FBYztRQUNwRixJQUFJLFdBQThCLENBQUM7UUFFbkMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ1osU0FBUyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMvQztRQUNELFdBQVcsR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLE9BQU8sV0FBVyxDQUFDO0tBQ3RCOzs7Ozs7O0lBUU0sY0FBYyxDQUNqQixXQUE4QixFQUM5QixRQUFtQixFQUNuQixXQUE4QjtRQUU5QixNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTTtZQUFFLE9BQU87UUFFeEMsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztRQUN2QyxNQUFNLFdBQVcsR0FBaUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRTtRQUM5QyxJQUFJLENBQUMsV0FBVztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQzlCLElBQUksU0FBaUIsQ0FBQztRQUN0QixJQUFJLEtBQWlCLENBQUM7UUFDdEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNqRSxNQUFNLGNBQWMsR0FBRyxDQUFDLEtBQWlCLEVBQUUsUUFBZ0I7WUFDdkQsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2hFLENBQUM7UUFDRixNQUFNLGNBQWMsR0FBRyxDQUFDLEtBQWlCLEVBQUUsTUFBYztZQUNyRCxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDOUQsQ0FBQztRQUNGLElBQUksT0FBd0IsQ0FBQztRQUM3QixXQUFXLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUN0QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QyxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRTtnQkFDekQsU0FBUzthQUNaO1lBQ0QsV0FBVyxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7WUFDckMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxRQUFRLFlBQVksU0FBUyxPQUFPLENBQUMsQ0FBQztZQUNoRSxJQUFJLFdBQVcsQ0FBQyxTQUFTLEtBQUtBLGlCQUFTLENBQUMsUUFBUSxFQUFFO2dCQUM5QyxJQUFJLFlBQW9CLENBQUM7Z0JBRXpCLG9CQUFvQixDQUNoQixLQUFLLEVBQ0wsV0FBVyxDQUFDLFFBQVEsRUFDcEIsV0FBVyxDQUFDLFFBQVEsRUFDcEIsQ0FBQyxLQUFLLEVBQUUsTUFBYyxFQUFFLFFBQWdCO29CQUNwQyxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7b0JBQzFCLElBQUksWUFBWSxLQUFLLFFBQVEsRUFBRTt3QkFDM0IsWUFBWSxHQUFHLFFBQVEsQ0FBQzt3QkFDeEIsYUFBYSxHQUFHLElBQUksQ0FBQztxQkFDeEI7b0JBQ0QsT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUM7b0JBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7cUJBQy9FO2lCQUNKLEVBQ0QsYUFBYSxFQUNiLGFBQWEsRUFDYixjQUFjLEVBQ2QsY0FBYyxDQUNqQixDQUFDO2FBQ0w7aUJBQU0sSUFBSSxXQUFXLENBQUMsU0FBUyxLQUFLQSxpQkFBUyxDQUFDLFVBQVUsRUFBRTtnQkFDdkQsSUFBSSxVQUFrQixDQUFDO2dCQUV2QixzQkFBc0IsQ0FDbEIsS0FBSyxFQUNMLFdBQVcsQ0FBQyxRQUFRLEVBQ3BCLFdBQVcsQ0FBQyxRQUFRLEVBQ3BCLENBQUMsS0FBSyxFQUFFLE1BQWMsRUFBRSxRQUFnQjtvQkFDcEMsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO29CQUMxQixJQUFJLFVBQVUsS0FBSyxNQUFNLEVBQUU7d0JBQ3ZCLFVBQVUsR0FBRyxNQUFNLENBQUM7d0JBQ3BCLGFBQWEsR0FBRyxJQUFJLENBQUM7cUJBQ3hCO29CQUVELE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDO29CQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUN2QixJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO3FCQUNqRjtpQkFDSixFQUNELGFBQWEsRUFDYixhQUFhLEVBQ2IsY0FBYyxFQUNkLGNBQWMsQ0FDakIsQ0FBQzthQUNMO1NBQ0o7UUFFRCxPQUFPLFdBQWtCLENBQUM7S0FDN0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
