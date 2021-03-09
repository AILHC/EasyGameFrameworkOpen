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

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () {
                        return e[k];
                    }
                });
            }
        });
    }
    n['default'] = e;
    return Object.freeze(n);
}

const platform = os.platform();
/**当前系统行尾  platform === "win32" ? "\n" : "\r\n";*/
const osEol = platform === "win32" ? "\n" : "\r\n";

/**类型字符串映射字典 */
const typeStrMap = { int: "number", json: "any", "[int]": "number[]", "[string]": "string[]" };
class Trans2JsonAndDtsHandler {
    constructor() { }
    init(option) {
        if (!option) {
            this._outputConfig = {
                clientSingleTableJsonDir: path.join(process.cwd(), "./excelJsonOut")
            };
        }
        this._outputConfig = option;
    }
    trans2Files(changedFileInfos, deleteFileInfos, parseResultMap) {
        let tableObjMap = {};
        let outputFileMap = {};
        const outputConfig = this._outputConfig;
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

function doParse(fileInfos, parseResultMap, parseHandler) {
    let parseResult;
    for (let i = fileInfos.length - 1; i >= 0; i--) {
        parseResult = parseResultMap[fileInfos[i].filePath];
        if (!parseResult) {
            parseResult = { filePath: fileInfos[i].filePath };
        }
        if (!parseResult.tableObj) {
            parseResult = parseHandler.parseTableFile(fileInfos[i], parseResult);
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
                cacheFileDirPath = path.join(tableFileDir, cacheFileDirPath);
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
                parseResultMap = Object.assign(parseResultMap, data.parseResultMap);
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
                    parseConfig.customParseHandlerPath = path.resolve(__dirname, parseConfig.customParseHandlerPath);
                }
                parseHandler = yield Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(parseConfig.customParseHandlerPath)); });
            }
            if (!parseHandler) {
                parseHandler = new DefaultParseHandler();
            }
            doParse(fileInfos, parseResultMap, parseHandler);
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
    let outputFileMap = trans2FileHandler.trans2Files(fileInfos, deleteFileInfos, parseResultMap);
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
     * @param fileInfo
     * @param parseResult 解析结果
     */
    parseTableFile(fileInfo, parseResult) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9nZXQtb3MtZW9sLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdHJhbnMyZmlsZS1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdmFsdWUtZnVuYy1tYXAudHMiLCIuLi8uLi8uLi9zcmMvZG8tcGFyc2UudHMiLCIuLi8uLi8uLi9zcmMvbG9nZXIudHMiLCIuLi8uLi8uLi9zcmMvZmlsZS11dGlscy50cyIsIi4uLy4uLy4uL3NyYy9nZW5lcmF0ZS50cyIsIi4uLy4uLy4uL3NyYy90YWJsZS11dGlscy50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXBhcnNlLWhhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgb3MgZnJvbSBcIm9zXCI7XG5jb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4vKirlvZPliY3ns7vnu5/ooYzlsL4gIHBsYXRmb3JtID09PSBcIndpbjMyXCIgPyBcIlxcblwiIDogXCJcXHJcXG5cIjsqL1xuZXhwb3J0IGNvbnN0IG9zRW9sID0gcGxhdGZvcm0gPT09IFwid2luMzJcIiA/IFwiXFxuXCIgOiBcIlxcclxcblwiO1xuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgVGFibGVUeXBlIH0gZnJvbSBcIi4vZGVmYXVsdC1wYXJzZS1oYW5kbGVyXCI7XG5pbXBvcnQgeyBCYXNlNjQgfSBmcm9tIFwianMtYmFzZTY0XCI7XG5pbXBvcnQgeyBkZWZsYXRlU3luYyB9IGZyb20gXCJ6bGliXCI7XG5pbXBvcnQgeyBvc0VvbCB9IGZyb20gXCIuL2dldC1vcy1lb2xcIjtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICAvKipcbiAgICAgKiDovpPlh7rphY3nva5cbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSU91dHB1dENvbmZpZyB7XG4gICAgICAgIC8qKumFjee9ruihqOi+k+WHuuebruW9lei3r+W+hO+8jOm7mOiupOi+k+WHuuWIsOW9k+WJjeaJp+ihjOebruW9leS4i+eahC4vZXhjZWxKc29uT3V0ICovXG4gICAgICAgIGNsaWVudFNpbmdsZVRhYmxlSnNvbkRpcjogc3RyaW5nO1xuICAgICAgICAvKirmiYDmnInphY3nva7ooajmiZPljIXovpPlh7rnm67lvZXvvIzlpoLmnpzkuI3phY3nva7liJnkuI3lkIjlubZqc29uICovXG4gICAgICAgIGNsaWVudEJ1bmRsZUpzb25PdXRQYXRoPzogc3RyaW5nO1xuICAgICAgICAvKirmmK/lkKbmoLzlvI/ljJblkIjlubblkI7nmoRqc29u77yM6buY6K6k5LiNICovXG4gICAgICAgIGlzRm9ybWF0QnVuZGxlSnNvbj86IGJvb2xlYW47XG4gICAgICAgIC8qKuaYr+WQpueUn+aIkOWjsOaYjuaWh+S7tu+8jOm7mOiupOS4jei+k+WHuiAqL1xuICAgICAgICBpc0dlbkR0cz86IGJvb2xlYW47XG4gICAgICAgIC8qKuWjsOaYjuaWh+S7tui+k+WHuuebruW9lSAqL1xuICAgICAgICBjbGllbnREdHNPdXREaXI/OiBzdHJpbmc7XG4gICAgICAgIC8qKuaYr+WQpuWQiOW5tuaJgOacieWjsOaYjuS4uuS4gOS4quaWh+S7tizpu5jorqR0cnVlICovXG4gICAgICAgIGlzQnVuZGxlRHRzPzogYm9vbGVhbjtcbiAgICAgICAgLyoq5piv5ZCm5bCGanNvbuagvOW8j+WOi+e8qSzpu5jorqTlkKYs5YeP5bCRanNvbuWtl+auteWQjeWtl+espizmlYjmnpzovoPlsI8gKi9cbiAgICAgICAgaXNDb21wcmVzcz86IGJvb2xlYW47XG4gICAgICAgIC8qKuaYr+WQplppcOWOi+e8qSzkvb/nlKh6bGliICovXG4gICAgICAgIGlzWmlwPzogYm9vbGVhbjtcbiAgICAgICAgLyoq5piv5ZCm5bCG6L6T5Ye655qE5ZCI5bm2anNvbui9rOS4umJhc2U2NO+8jOm7mOiupOWQpiovXG4gICAgICAgIGJ1bmRsZUpzb25Jc0VuY29kZTJCYXNlNjQ/OiBib29sZWFuO1xuICAgICAgICAvKirliqDlr4bmt7fmt4blrZfnrKbkuLLliY3nvIAgKi9cbiAgICAgICAgcHJlQmFzZTY0VWdseVN0cmluZz86IHN0cmluZztcbiAgICAgICAgLyoq5Yqg5a+G5re35reG5a2X56ym5Liy5ZCO57yAICovXG4gICAgICAgIHN1ZkJhc2U2NFVnbHlTdHJpbmc/OiBzdHJpbmc7XG4gICAgfVxufVxuLyoq57G75Z6L5a2X56ym5Liy5pig5bCE5a2X5YW4ICovXG5jb25zdCB0eXBlU3RyTWFwID0geyBpbnQ6IFwibnVtYmVyXCIsIGpzb246IFwiYW55XCIsIFwiW2ludF1cIjogXCJudW1iZXJbXVwiLCBcIltzdHJpbmddXCI6IFwic3RyaW5nW11cIiB9O1xuZXhwb3J0IGNsYXNzIFRyYW5zMkpzb25BbmREdHNIYW5kbGVyIGltcGxlbWVudHMgSVRyYW5zUmVzdWx0MkFueUZpbGVIYW5kbGVyIHtcbiAgICBwcml2YXRlIF9vdXRwdXRDb25maWc6IElPdXRwdXRDb25maWc7XG4gICAgY29uc3RydWN0b3IoKSB7fVxuICAgIGluaXQob3B0aW9uPzogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICghb3B0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl9vdXRwdXRDb25maWcgPSB7XG4gICAgICAgICAgICAgICAgY2xpZW50U2luZ2xlVGFibGVKc29uRGlyOiBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgXCIuL2V4Y2VsSnNvbk91dFwiKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9vdXRwdXRDb25maWcgPSBvcHRpb247XG4gICAgfVxuICAgIHRyYW5zMkZpbGVzKFxuICAgICAgICBjaGFuZ2VkRmlsZUluZm9zOiBJRmlsZUluZm9bXSxcbiAgICAgICAgZGVsZXRlRmlsZUluZm9zOiBJRmlsZUluZm9bXSxcbiAgICAgICAgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXBcbiAgICApOiBPdXRQdXRGaWxlTWFwIHtcbiAgICAgICAgbGV0IHRhYmxlT2JqTWFwOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gICAgICAgIGxldCBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwID0ge307XG4gICAgICAgIGNvbnN0IG91dHB1dENvbmZpZyA9IHRoaXMuX291dHB1dENvbmZpZztcbiAgICAgICAgbGV0IHRhYmxlVHlwZU1hcER0c1N0ciA9IFwiXCI7XG4gICAgICAgIGxldCB0YWJsZVR5cGVEdHNTdHJzID0gXCJcIjtcbiAgICAgICAgbGV0IHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdDtcbiAgICAgICAgbGV0IHRhYmxlTmFtZTogc3RyaW5nO1xuICAgICAgICBsZXQgdGFibGVPYmo6IGFueTtcbiAgICAgICAgbGV0IG9ialR5cGVUYWJsZU1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICAgICAgZm9yIChsZXQgZmlsZVBhdGggaW4gcGFyc2VSZXN1bHRNYXApIHtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VSZXN1bHRNYXBbZmlsZVBhdGhdO1xuICAgICAgICAgICAgaWYgKCFwYXJzZVJlc3VsdC50YWJsZURlZmluZSkgY29udGludWU7XG4gICAgICAgICAgICB0YWJsZU5hbWUgPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZU5hbWU7XG4gICAgICAgICAgICBpZiAocGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuICAgICAgICAgICAgICAgIHRhYmxlVHlwZU1hcER0c1N0ciArPSBcIlxcdHJlYWRvbmx5IFwiICsgdGFibGVOYW1lICsgXCI/OiBcIiArIGBJVF8ke3RhYmxlTmFtZX07YCArIG9zRW9sO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YWJsZVR5cGVNYXBEdHNTdHIgKz0gdGhpcy5fZ2V0T25lVGFibGVUeXBlU3RyKHRhYmxlTmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v5ZCI5bm25aSa5Liq5ZCM5ZCN6KGoXG4gICAgICAgICAgICB0YWJsZU9iaiA9IHRhYmxlT2JqTWFwW3RhYmxlTmFtZV07XG4gICAgICAgICAgICBpZiAodGFibGVPYmopIHtcbiAgICAgICAgICAgICAgICB0YWJsZU9iaiA9IE9iamVjdC5hc3NpZ24odGFibGVPYmosIHBhcnNlUmVzdWx0LnRhYmxlT2JqKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFibGVPYmogPSBwYXJzZVJlc3VsdC50YWJsZU9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSB0YWJsZU9iajtcbiAgICAgICAgICAgIG9ialR5cGVUYWJsZU1hcFt0YWJsZU5hbWVdID0gcGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbDtcbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNHZW5EdHMpIHtcbiAgICAgICAgICAgICAgICAvL+i+k+WHuuWNleS4quaWh+S7tlxuICAgICAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNCdW5kbGVEdHMgPT09IHVuZGVmaW5lZCkgb3V0cHV0Q29uZmlnLmlzQnVuZGxlRHRzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIW91dHB1dENvbmZpZy5pc0J1bmRsZUR0cykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRTaW5nbGVUYWJsZUR0c091dHB1dEZpbGUob3V0cHV0Q29uZmlnLCBwYXJzZVJlc3VsdCwgb3V0cHV0RmlsZU1hcCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVUeXBlRHRzU3RycyArPSB0aGlzLl9nZXRTaW5nbGVUYWJsZUR0cyhwYXJzZVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+eUn+aIkOWNleS4quihqGpzb25cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuY2xpZW50U2luZ2xlVGFibGVKc29uRGlyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkU2luZ2xlVGFibGVKc29uT3V0cHV0RmlsZShvdXRwdXRDb25maWcsIHBhcnNlUmVzdWx0LCBvdXRwdXRGaWxlTWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzR2VuRHRzKSB7XG4gICAgICAgICAgICAvL+i+k+WHuuWjsOaYjuaWh+S7tlxuICAgICAgICAgICAgbGV0IGl0QmFzZVN0ciA9IFwiaW50ZXJmYWNlIElUQmFzZTxUPiB7IFtrZXk6c3RyaW5nXTpUfVwiICsgb3NFb2w7XG5cbiAgICAgICAgICAgIHRhYmxlVHlwZU1hcER0c1N0ciA9IGl0QmFzZVN0ciArIFwiaW50ZXJmYWNlIElUX1RhYmxlTWFwIHtcIiArIG9zRW9sICsgdGFibGVUeXBlTWFwRHRzU3RyICsgXCJ9XCIgKyBvc0VvbDtcblxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0J1bmRsZUR0cykge1xuICAgICAgICAgICAgICAgIC8v5ZCI5oiQ5LiA5Liq5paH5Lu2XG4gICAgICAgICAgICAgICAgY29uc3QgYnVuZGxlRHRzRmlsZVBhdGggPSBwYXRoLmpvaW4ob3V0cHV0Q29uZmlnLmNsaWVudER0c091dERpciwgXCJ0YWJsZU1hcC5kLnRzXCIpO1xuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbYnVuZGxlRHRzRmlsZVBhdGhdID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogYnVuZGxlRHRzRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhYmxlVHlwZU1hcER0c1N0ciArIHRhYmxlVHlwZUR0c1N0cnNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL+aLhuWIhuaWh+S7tui+k+WHulxuICAgICAgICAgICAgICAgIGNvbnN0IHRhYmxlVHlwZU1hcER0c0ZpbGVQYXRoID0gcGF0aC5qb2luKG91dHB1dENvbmZpZy5jbGllbnREdHNPdXREaXIsIFwidGFibGVNYXAuZC50c1wiKTtcbiAgICAgICAgICAgICAgICBvdXRwdXRGaWxlTWFwW3RhYmxlVHlwZU1hcER0c0ZpbGVQYXRoXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IHRhYmxlVHlwZU1hcER0c0ZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YWJsZVR5cGVNYXBEdHNTdHJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9qc29uQnVuZGxlRmlsZVxuICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmNsaWVudEJ1bmRsZUpzb25PdXRQYXRoKSB7XG4gICAgICAgICAgICBsZXQganNvbkJ1bmRsZUZpbGVQYXRoID0gb3V0cHV0Q29uZmlnLmNsaWVudEJ1bmRsZUpzb25PdXRQYXRoO1xuICAgICAgICAgICAgbGV0IG91dHB1dERhdGE6IGFueTtcbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNDb21wcmVzcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RhYmxlT2JqTWFwID0ge307XG4gICAgICAgICAgICAgICAgbGV0IHRhYmxlT2JqOiBhbnk7XG4gICAgICAgICAgICAgICAgbGV0IG5ld1RhYmxlT2JqOiBhbnk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdGFibGVOYW1lIGluIHRhYmxlT2JqTWFwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmpUeXBlVGFibGVNYXBbdGFibGVOYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VGFibGVPYmpNYXBbdGFibGVOYW1lXSA9IHRhYmxlT2JqTWFwW3RhYmxlTmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0YWJsZU9iaiA9IHRhYmxlT2JqTWFwW3RhYmxlTmFtZV07XG4gICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqID0geyBmaWVsZFZhbHVlc01hcDoge30gfTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWFpbktleSBpbiB0YWJsZU9iaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXdUYWJsZU9iai5maWVsZE5hbWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3VGFibGVPYmouZmllbGROYW1lcyA9IE9iamVjdC5rZXlzKHRhYmxlT2JqW21haW5LZXldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqLmZpZWxkVmFsdWVzTWFwW21haW5LZXldID0gT2JqZWN0LnZhbHVlcyh0YWJsZU9ialttYWluS2V5XSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbmV3VGFibGVPYmpNYXBbdGFibGVOYW1lXSA9IG5ld1RhYmxlT2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvdXRwdXREYXRhID0gSlNPTi5zdHJpbmdpZnkobmV3VGFibGVPYmpNYXApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXRwdXREYXRhID0gSlNPTi5zdHJpbmdpZnkodGFibGVPYmpNYXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5idW5kbGVKc29uSXNFbmNvZGUyQmFzZTY0KSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IEJhc2U2NC5lbmNvZGUob3V0cHV0RGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5wcmVCYXNlNjRVZ2x5U3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBvdXRwdXRDb25maWcucHJlQmFzZTY0VWdseVN0cmluZyArIG91dHB1dERhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuc3VmQmFzZTY0VWdseVN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXREYXRhICs9IG91dHB1dENvbmZpZy5zdWZCYXNlNjRVZ2x5U3RyaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNaaXApIHtcbiAgICAgICAgICAgICAgICBvdXRwdXREYXRhID0gZGVmbGF0ZVN5bmMob3V0cHV0RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwdXRGaWxlTWFwW2pzb25CdW5kbGVGaWxlUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgZmlsZVBhdGg6IGpzb25CdW5kbGVGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICBlbmNvZGluZzogdHlwZW9mIG91dHB1dERhdGEgIT09IFwic3RyaW5nXCIgPyBcImJpbmFyeVwiIDogXCJ1dGYtOFwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IG91dHB1dERhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dEZpbGVNYXA7XG4gICAgfVxuICAgIHByaXZhdGUgX2FkZFNpbmdsZVRhYmxlRHRzT3V0cHV0RmlsZShcbiAgICAgICAgY29uZmlnOiBJT3V0cHV0Q29uZmlnLFxuICAgICAgICBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsXG4gICAgICAgIG91dHB1dEZpbGVNYXA6IE91dFB1dEZpbGVNYXBcbiAgICApOiB2b2lkIHtcbiAgICAgICAgLy/lpoLmnpzlgLzmsqHmnInlsLHkuI3ovpPlh7rnsbvlnovkv6Hmga/kuoZcbiAgICAgICAgaWYgKCFwYXJzZVJlc3VsdC50YWJsZU9iaikgcmV0dXJuO1xuICAgICAgICBsZXQgZHRzRmlsZVBhdGg6IHN0cmluZyA9IHBhdGguam9pbihjb25maWcuY2xpZW50RHRzT3V0RGlyLCBgJHtwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZU5hbWV9LmQudHNgKTtcblxuICAgICAgICBpZiAoIW91dHB1dEZpbGVNYXBbZHRzRmlsZVBhdGhdKSB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgY29uc3QgZHRzU3RyID0gdGhpcy5fZ2V0U2luZ2xlVGFibGVEdHMocGFyc2VSZXN1bHQpO1xuICAgICAgICAgICAgaWYgKGR0c1N0cikge1xuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbZHRzRmlsZVBhdGhdID0geyBmaWxlUGF0aDogZHRzRmlsZVBhdGgsIGRhdGE6IGR0c1N0ciB9IGFzIGFueTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDlh7rljZXkuKrphY3nva7ooajnsbvlnovmlbDmja5cbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHRcbiAgICAgKi9cbiAgICBwcml2YXRlIF9nZXRTaW5nbGVUYWJsZUR0cyhwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCB0YWJsZU5hbWUgPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZU5hbWU7XG5cbiAgICAgICAgY29uc3QgY29sS2V5VGFibGVGaWVsZE1hcDogQ29sS2V5VGFibGVGaWVsZE1hcCA9IHBhcnNlUmVzdWx0LmZpbGVkTWFwO1xuICAgICAgICBsZXQgaXRlbUludGVyZmFjZSA9IFwiaW50ZXJmYWNlIElUX1wiICsgdGFibGVOYW1lICsgXCIge1wiICsgb3NFb2w7XG4gICAgICAgIGxldCB0YWJsZUZpZWxkOiBJVGFibGVGaWVsZDtcbiAgICAgICAgbGV0IHR5cGVTdHI6IHN0cmluZztcbiAgICAgICAgbGV0IG9ialR5cGVTdHJNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcblxuICAgICAgICBmb3IgKGxldCBjb2xLZXkgaW4gY29sS2V5VGFibGVGaWVsZE1hcCkge1xuICAgICAgICAgICAgdGFibGVGaWVsZCA9IGNvbEtleVRhYmxlRmllbGRNYXBbY29sS2V5XTtcbiAgICAgICAgICAgIGlmICghdGFibGVGaWVsZCkgY29udGludWU7XG4gICAgICAgICAgICBpZiAoIXRhYmxlRmllbGQuaXNNdXRpQ29sT2JqKSB7XG4gICAgICAgICAgICAgICAgLy/ms6jph4rooYxcbiAgICAgICAgICAgICAgICBpdGVtSW50ZXJmYWNlICs9IFwiXFx0LyoqIFwiICsgdGFibGVGaWVsZC50ZXh0ICsgXCIgKi9cIiArIG9zRW9sO1xuICAgICAgICAgICAgICAgIC8v5a2X5q6157G75Z6L5aOw5piO6KGMXG4gICAgICAgICAgICAgICAgaXRlbUludGVyZmFjZSArPVxuICAgICAgICAgICAgICAgICAgICBcIlxcdHJlYWRvbmx5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVGaWVsZC5maWVsZE5hbWUgK1xuICAgICAgICAgICAgICAgICAgICBcIj86IFwiICtcbiAgICAgICAgICAgICAgICAgICAgKHR5cGVTdHJNYXBbdGFibGVGaWVsZC50eXBlXSA/IHR5cGVTdHJNYXBbdGFibGVGaWVsZC50eXBlXSA6IHRhYmxlRmllbGQudHlwZSkgK1xuICAgICAgICAgICAgICAgICAgICBcIjtcIiArXG4gICAgICAgICAgICAgICAgICAgIG9zRW9sO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvYmpGaWVsZEtleSA9IHRhYmxlRmllbGQuZmllbGROYW1lO1xuICAgICAgICAgICAgICAgIGlmICghb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0gPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8v5rOo6YeK6KGMXG4gICAgICAgICAgICAgICAgb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0gKz0gXCJcXHRcXHQvKiogXCIgKyB0YWJsZUZpZWxkLnRleHQgKyBcIiAqL1wiICsgb3NFb2w7XG5cbiAgICAgICAgICAgICAgICAvL+Wtl+auteexu+Wei+WjsOaYjuihjFxuICAgICAgICAgICAgICAgIG9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldICs9XG4gICAgICAgICAgICAgICAgICAgIFwiXFx0XFx0cmVhZG9ubHkgXCIgK1xuICAgICAgICAgICAgICAgICAgICB0YWJsZUZpZWxkLnN1YkZpZWxkTmFtZSArXG4gICAgICAgICAgICAgICAgICAgIFwiPzogXCIgK1xuICAgICAgICAgICAgICAgICAgICAodHlwZVN0ck1hcFt0YWJsZUZpZWxkLnN1YlR5cGVdID8gdHlwZVN0ck1hcFt0YWJsZUZpZWxkLnN1YlR5cGVdIDogdGFibGVGaWVsZC5zdWJUeXBlKSArXG4gICAgICAgICAgICAgICAgICAgIFwiO1wiICtcbiAgICAgICAgICAgICAgICAgICAgb3NFb2w7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy/nrKzkuozlsYLlr7nosaFcbiAgICAgICAgZm9yIChsZXQgb2JqRmllbGRLZXkgaW4gb2JqVHlwZVN0ck1hcCkge1xuICAgICAgICAgICAgLy/lrZfmrrXnsbvlnovlo7DmmI7ooYxcbiAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJcXHRyZWFkb25seSBcIiArIG9iakZpZWxkS2V5ICsgXCI/OiB7XCIgKyBvc0VvbCArIG9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldO1xuICAgICAgICAgICAgaXRlbUludGVyZmFjZSArPSBcIlxcdH1cIiArIG9zRW9sO1xuICAgICAgICB9XG4gICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJ9XCIgKyBvc0VvbDtcblxuICAgICAgICByZXR1cm4gaXRlbUludGVyZmFjZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5re75Yqg5Y2V54us5a+85Ye66YWN572u6KGoanNvbuaWh+S7tlxuICAgICAqIEBwYXJhbSBjb25maWdcbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gb3V0cHV0RmlsZU1hcFxuICAgICAqL1xuICAgIHByaXZhdGUgX2FkZFNpbmdsZVRhYmxlSnNvbk91dHB1dEZpbGUoXG4gICAgICAgIGNvbmZpZzogSU91dHB1dENvbmZpZyxcbiAgICAgICAgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHRhYmxlT2JqID0gcGFyc2VSZXN1bHQudGFibGVPYmo7XG4gICAgICAgIGlmICghdGFibGVPYmopIHJldHVybjtcbiAgICAgICAgY29uc3QgdGFibGVOYW1lID0gcGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lO1xuICAgICAgICBsZXQgc2luZ2xlSnNvbkZpbGVQYXRoID0gcGF0aC5qb2luKGNvbmZpZy5jbGllbnRTaW5nbGVUYWJsZUpzb25EaXIsIGAke3RhYmxlTmFtZX0uanNvbmApO1xuICAgICAgICBsZXQgc2luZ2xlSnNvbkRhdGEgPSBKU09OLnN0cmluZ2lmeSh0YWJsZU9iaiwgbnVsbCwgXCJcXHRcIik7XG5cbiAgICAgICAgbGV0IHNpbmdsZU91dHB1dEZpbGVJbmZvID0gb3V0cHV0RmlsZU1hcFtzaW5nbGVKc29uRmlsZVBhdGhdO1xuICAgICAgICBpZiAoc2luZ2xlT3V0cHV0RmlsZUluZm8pIHtcbiAgICAgICAgICAgIHNpbmdsZU91dHB1dEZpbGVJbmZvLmRhdGEgPSBzaW5nbGVKc29uRGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpbmdsZU91dHB1dEZpbGVJbmZvID0ge1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBzaW5nbGVKc29uRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YTogc2luZ2xlSnNvbkRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBvdXRwdXRGaWxlTWFwW3NpbmdsZUpzb25GaWxlUGF0aF0gPSBzaW5nbGVPdXRwdXRGaWxlSW5mbztcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcml2YXRlIF9nZXRPbmVUYWJsZVR5cGVTdHIodGFibGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJcXHRyZWFkb25seSBcIiArIHRhYmxlTmFtZSArIFwiPzogXCIgKyBcIklUQmFzZTxcIiArIFwiSVRfXCIgKyB0YWJsZU5hbWUgKyBcIj47XCIgKyBvc0VvbDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dlclwiO1xuXG5leHBvcnQgY29uc3QgdmFsdWVUcmFuc0Z1bmNNYXA6IHtcbiAgICBba2V5OiBzdHJpbmddOiBWYWx1ZVRyYW5zRnVuYztcbn0gPSB7fTtcbnZhbHVlVHJhbnNGdW5jTWFwW1wiaW50XCJdID0gc3RyVG9JbnQ7XG52YWx1ZVRyYW5zRnVuY01hcFtcInN0cmluZ1wiXSA9IGFueVRvU3RyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJbaW50XVwiXSA9IHN0clRvSW50QXJyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJbc3RyaW5nXVwiXSA9IHN0clRvU3RyQXJyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJqc29uXCJdID0gc3RyVG9Kc29uT2JqO1xuZnVuY3Rpb24gc3RyVG9JbnRBcnIoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgaW50QXJyOiBudW1iZXJbXTtcbiAgICBjb25zdCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge307XG4gICAgaWYgKGNlbGxWYWx1ZSAhPT0gXCJcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaW50QXJyID0gSlNPTi5wYXJzZShjZWxsVmFsdWUpO1xuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gaW50QXJyO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gc3RyVG9TdHJBcnIoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9O1xuICAgIGxldCBhcnI6IHN0cmluZ1tdO1xuICAgIGlmIChjZWxsVmFsdWUgIT09IFwiXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGFyciA9IEpTT04ucGFyc2UoY2VsbFZhbHVlKTtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGFycjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvciA9IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBzdHJUb0ludChmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9IGFzIGFueTtcbiAgICBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiBjZWxsVmFsdWUudHJpbSgpICE9PSBcIlwiKSB7XG4gICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZS5pbmNsdWRlcyhcIi5cIikgPyBwYXJzZUZsb2F0KGNlbGxWYWx1ZSkgOiAocGFyc2VJbnQoY2VsbFZhbHVlKSBhcyBhbnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBzdHJUb0pzb25PYmooZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgb2JqO1xuICAgIGxldCBlcnJvcjtcbiAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBvYmogPSBKU09OLnBhcnNlKGNlbGxWYWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICBvYmogPSBjZWxsVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgZXJyb3I6IGVycm9yLCB2YWx1ZTogb2JqIH07XG59XG5mdW5jdGlvbiBhbnlUb1N0cihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IGFueSk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9IGFzIGFueTtcbiAgICBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xuICAgICAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWUgKyBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGRvUGFyc2UoZmlsZUluZm9zOiBJRmlsZUluZm9bXSwgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXAsIHBhcnNlSGFuZGxlcjogSVRhYmxlUGFyc2VIYW5kbGVyKSB7XG4gICAgbGV0IHBhcnNlUmVzdWx0O1xuICAgIGZvciAobGV0IGkgPSBmaWxlSW5mb3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgcGFyc2VSZXN1bHQgPSBwYXJzZVJlc3VsdE1hcFtmaWxlSW5mb3NbaV0uZmlsZVBhdGhdO1xuICAgICAgICBpZiAoIXBhcnNlUmVzdWx0KSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHsgZmlsZVBhdGg6IGZpbGVJbmZvc1tpXS5maWxlUGF0aCB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVPYmopIHtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VIYW5kbGVyLnBhcnNlVGFibGVGaWxlKGZpbGVJbmZvc1tpXSwgcGFyc2VSZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJzZVJlc3VsdCkge1xuICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXBbZmlsZUluZm9zW2ldLmZpbGVQYXRoXSA9IHBhcnNlUmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgb3NFb2wgfSBmcm9tIFwiLi9nZXQtb3MtZW9sXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5lbnVtIExvZ0xldmVsRW51bSB7XG4gICAgaW5mbyxcbiAgICB3YXJuLFxuICAgIGVycm9yLFxuICAgIG5vXG59XG5leHBvcnQgY2xhc3MgTG9nZ2VyIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfZW5hYmxlT3V0UHV0TG9nRmlsZTogYm9vbGVhbjtcbiAgICBwcml2YXRlIHN0YXRpYyBfbG9nTGV2ZWw6IExvZ0xldmVsRW51bTtcbiAgICBwcml2YXRlIHN0YXRpYyBfbG9nU3RyOiBzdHJpbmcgPSBcIlwiO1xuICAgIHB1YmxpYyBzdGF0aWMgaW5pdChwYXJzZUNvbmZpZzogSVRhYmxlUGFyc2VDb25maWcpIHtcbiAgICAgICAgY29uc3QgbGV2ZWw6IExvZ0xldmVsID0gcGFyc2VDb25maWcubG9nTGV2ZWwgPyBwYXJzZUNvbmZpZy5sb2dMZXZlbCA6IFwiaW5mb1wiO1xuICAgICAgICB0aGlzLl9sb2dMZXZlbCA9IExvZ0xldmVsRW51bVtsZXZlbF07XG4gICAgICAgIHRoaXMuX2VuYWJsZU91dFB1dExvZ0ZpbGUgPSBwYXJzZUNvbmZpZy5vdXRwdXRMb2dGaWxlID09PSB1bmRlZmluZWQgPyB0cnVlIDogcGFyc2VDb25maWcub3V0cHV0TG9nRmlsZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6L6T5Ye65pel5b+XXG4gICAgICogQHBhcmFtIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gbGV2ZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGxvZyhtZXNzYWdlOiBzdHJpbmcsIGxldmVsOiBMb2dMZXZlbCA9IFwiaW5mb1wiKSB7XG4gICAgICAgIGlmIChsZXZlbCA9PT0gXCJub1wiKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLl9sb2dMZXZlbCA8PSBMb2dMZXZlbEVudW1bbGV2ZWxdKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJpbmZvXCI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwid2FyblwiOlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fZW5hYmxlT3V0UHV0TG9nRmlsZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sb2dTdHIgKz0gbWVzc2FnZSArIG9zRW9sO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDov5Tlm57ml6Xlv5fmlbDmja7lubbmuIXnqbpcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldCBsb2dTdHIoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVPdXRQdXRMb2dGaWxlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgbG9nU3RyID0gdGhpcy5fbG9nU3RyO1xuICAgICAgICB0aGlzLl9sb2dTdHIgPSBcIlwiOyAvL+a4heepulxuICAgICAgICByZXR1cm4gbG9nU3RyO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2VyXCI7XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElPdXRQdXRGaWxlSW5mbyB7XG4gICAgICAgIGZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgIC8qKuWGmeWFpee8luegge+8jOWtl+espuS4sum7mOiupHV0ZjggKi9cbiAgICAgICAgZW5jb2Rpbmc/OiBCdWZmZXJFbmNvZGluZztcbiAgICAgICAgLyoq5piv5ZCm5Yig6ZmkICovXG4gICAgICAgIGlzRGVsZXRlPzogYm9vbGVhbjtcbiAgICAgICAgZGF0YT86IGFueTtcbiAgICB9XG59XG4vKipcbiAqIOmBjeWOhuaWh+S7tlxuICogQHBhcmFtIGRpclBhdGgg5paH5Lu25aS56Lev5b6EXG4gKiBAcGFyYW0gZWFjaENhbGxiYWNrIOmBjeWOhuWbnuiwgyAoZmlsZVBhdGg6IHN0cmluZykgPT4gdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaEZpbGUoZmlsZU9yRGlyUGF0aDogc3RyaW5nLCBlYWNoQ2FsbGJhY2s/OiAoZmlsZVBhdGg6IHN0cmluZykgPT4gdm9pZCkge1xuICAgIGlmIChmcy5zdGF0U3luYyhmaWxlT3JEaXJQYXRoKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lcyA9IGZzLnJlYWRkaXJTeW5jKGZpbGVPckRpclBhdGgpO1xuICAgICAgICBsZXQgY2hpbGRGaWxlUGF0aDogc3RyaW5nO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY2hpbGRGaWxlUGF0aCA9IHBhdGguam9pbihmaWxlT3JEaXJQYXRoLCBmaWxlTmFtZXNbaV0pO1xuICAgICAgICAgICAgZm9yRWFjaEZpbGUoY2hpbGRGaWxlUGF0aCwgZWFjaENhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGVhY2hDYWxsYmFjayhmaWxlT3JEaXJQYXRoKTtcbiAgICB9XG59XG4vKipcbiAqIOaJuemHj+WGmeWFpeWSjOWIoOmZpOaWh+S7tlxuICogQHBhcmFtIG91dHB1dEZpbGVJbmZvcyDpnIDopoHlhpnlhaXnmoTmlofku7bkv6Hmga/mlbDnu4RcbiAqIEBwYXJhbSBvblByb2dyZXNzIOi/m+W6puWPmOWMluWbnuiwg1xuICogQHBhcmFtIGNvbXBsZXRlIOWujOaIkOWbnuiwg1xuICovXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVPckRlbGV0ZU91dFB1dEZpbGVzKFxuICAgIG91dHB1dEZpbGVJbmZvczogSU91dFB1dEZpbGVJbmZvW10sXG4gICAgb25Qcm9ncmVzcz86IChmaWxlUGF0aDogc3RyaW5nLCB0b3RhbDogbnVtYmVyLCBub3c6IG51bWJlciwgaXNPazogYm9vbGVhbikgPT4gdm9pZCxcbiAgICBjb21wbGV0ZT86ICh0b3RhbDogbnVtYmVyKSA9PiB2b2lkXG4pIHtcbiAgICBsZXQgZmlsZUluZm86IElPdXRQdXRGaWxlSW5mbztcbiAgICBjb25zdCB0b3RhbCA9IG91dHB1dEZpbGVJbmZvcy5sZW5ndGg7XG4gICAgaWYgKG91dHB1dEZpbGVJbmZvcyAmJiB0b3RhbCkge1xuICAgICAgICBsZXQgbm93ID0gMDtcbiAgICAgICAgY29uc3Qgb25Xcml0ZUVuZCA9IChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBMb2dnZXIubG9nKGVyciwgXCJlcnJvclwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vdysrO1xuICAgICAgICAgICAgb25Qcm9ncmVzcyAmJiBvblByb2dyZXNzKG91dHB1dEZpbGVJbmZvc1tub3cgLSAxXS5maWxlUGF0aCwgdG90YWwsIG5vdywgIWVycik7XG4gICAgICAgICAgICBpZiAobm93ID49IHRvdGFsKSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGUgJiYgY29tcGxldGUodG90YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKGxldCBpID0gb3V0cHV0RmlsZUluZm9zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBmaWxlSW5mbyA9IG91dHB1dEZpbGVJbmZvc1tpXTtcbiAgICAgICAgICAgIGlmIChmaWxlSW5mby5pc0RlbGV0ZSAmJiBmcy5leGlzdHNTeW5jKGZpbGVJbmZvLmZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgIGZzLnVubGlua1N5bmMoZmlsZUluZm8uZmlsZVBhdGgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWZpbGVJbmZvLmVuY29kaW5nICYmIHR5cGVvZiBmaWxlSW5mby5kYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmVuY29kaW5nID0gXCJ1dGY4XCI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZnMuZW5zdXJlRmlsZVN5bmMoZmlsZUluZm8uZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZShcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmVuY29kaW5nID8geyBlbmNvZGluZzogZmlsZUluZm8uZW5jb2RpbmcgfSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgb25Xcml0ZUVuZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIOiOt+WPluWPmOWMlui/h+eahOaWh+S7tuaVsOe7hFxuICogQHBhcmFtIGRpciDnm67moIfnm67lvZVcbiAqIEBwYXJhbSBjYWNoZUZpbGVQYXRoIOe8k+WtmOaWh+S7tue7neWvuei3r+W+hFxuICogQHBhcmFtIGVhY2hDYWxsYmFjayDpgY3ljoblm57osINcbiAqIEByZXR1cm5zIOi/lOWbnue8k+WtmOaWh+S7tui3r+W+hFxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaENoYW5nZWRGaWxlKFxuICAgIGRpcjogc3RyaW5nLFxuICAgIGNhY2hlRmlsZVBhdGg/OiBzdHJpbmcsXG4gICAgZWFjaENhbGxiYWNrPzogKGZpbGVQYXRoOiBzdHJpbmcsIGlzRGVsZXRlPzogYm9vbGVhbikgPT4gdm9pZFxuKSB7XG4gICAgY29uc3QgZ2NmQ2FjaGUgPSBnZXRDYWNoZURhdGEoY2FjaGVGaWxlUGF0aCk7XG4gICAgY29uc3Qgb2xkRmlsZVBhdGhzID0gT2JqZWN0LmtleXMoZ2NmQ2FjaGUpO1xuICAgIGxldCBvbGRGaWxlUGF0aEluZGV4OiBudW1iZXI7XG4gICAgZm9yRWFjaEZpbGUoZGlyLCAoZmlsZVBhdGgpID0+IHtcbiAgICAgICAgdmFyIG1kNXN0ciA9IGdldEZpbGVNZDVTeW5jKGZpbGVQYXRoKTtcbiAgICAgICAgaWYgKCFnY2ZDYWNoZVtmaWxlUGF0aF0gfHwgKGdjZkNhY2hlW2ZpbGVQYXRoXSAmJiBnY2ZDYWNoZVtmaWxlUGF0aF0gIT09IG1kNXN0cikpIHtcbiAgICAgICAgICAgIGdjZkNhY2hlW2ZpbGVQYXRoXSA9IG1kNXN0cjtcbiAgICAgICAgICAgIGVhY2hDYWxsYmFjayhmaWxlUGF0aCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIG9sZEZpbGVQYXRoSW5kZXggPSBvbGRGaWxlUGF0aHMuaW5kZXhPZihmaWxlUGF0aCk7XG4gICAgICAgIGlmIChvbGRGaWxlUGF0aEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGVuZEZpbGVQYXRoID0gb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRocy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIG9sZEZpbGVQYXRoc1tvbGRGaWxlUGF0aEluZGV4XSA9IGVuZEZpbGVQYXRoO1xuICAgICAgICAgICAgb2xkRmlsZVBhdGhzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvbGRGaWxlUGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVsZXRlIGdjZkNhY2hlW29sZEZpbGVQYXRoc1tpXV07XG4gICAgICAgIGVhY2hDYWxsYmFjayhvbGRGaWxlUGF0aHNbaV0sIHRydWUpO1xuICAgIH1cbiAgICBmcy53cml0ZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGdjZkNhY2hlKSwgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0pO1xufVxuLyoqXG4gKiDlhpnlhaXnvJPlrZjmlbDmja5cbiAqIEBwYXJhbSBjYWNoZUZpbGVQYXRoXG4gKiBAcGFyYW0gY2FjaGVEYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZUNhY2hlRGF0YShjYWNoZUZpbGVQYXRoOiBzdHJpbmcsIGNhY2hlRGF0YTogYW55KSB7XG4gICAgaWYgKCFjYWNoZUZpbGVQYXRoKSB7XG4gICAgICAgIExvZ2dlci5sb2coYGNhY2hlRmlsZVBhdGggaXMgbnVsbGAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZnMud3JpdGVGaWxlU3luYyhjYWNoZUZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShjYWNoZURhdGEpLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSk7XG59XG4vKipcbiAqIOivu+WPlue8k+WtmOaVsOaNrlxuICogQHBhcmFtIGNhY2hlRmlsZVBhdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlRGF0YShjYWNoZUZpbGVQYXRoOiBzdHJpbmcpOiBhbnkge1xuICAgIGlmICghY2FjaGVGaWxlUGF0aCkge1xuICAgICAgICBMb2dnZXIubG9nKGBjYWNoZUZpbGVQYXRoIGlzIG51bGxgLCBcImVycm9yXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghZnMuZXhpc3RzU3luYyhjYWNoZUZpbGVQYXRoKSkge1xuICAgICAgICBmcy5lbnN1cmVGaWxlU3luYyhjYWNoZUZpbGVQYXRoKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhjYWNoZUZpbGVQYXRoLCBcInt9XCIsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KTtcbiAgICB9XG4gICAgY29uc3QgZ2NmQ2FjaGVGaWxlID0gZnMucmVhZEZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIFwidXRmLThcIik7XG4gICAgY29uc3QgZ2NmQ2FjaGUgPSBKU09OLnBhcnNlKGdjZkNhY2hlRmlsZSk7XG4gICAgcmV0dXJuIGdjZkNhY2hlO1xufVxuLyoqXG4gKiDojrflj5bmlofku7ZtZDUgKOWQjOatpSlcbiAqIEBwYXJhbSBmaWxlUGF0aFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgZmlsZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICB2YXIgbWQ1dW0gPSBjcnlwdG8uY3JlYXRlSGFzaChcIm1kNVwiKTtcbiAgICBtZDV1bS51cGRhdGUoZmlsZSk7XG4gICAgcmV0dXJuIG1kNXVtLmRpZ2VzdChcImhleFwiKTtcbn1cbi8qKlxuICog6I635Y+W5paH5Lu2IG1kNVxuICogQHBhcmFtIGZpbGVQYXRoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRGaWxlTWQ1KGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGgpO1xufVxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgKiBhcyBtbWF0Y2ggZnJvbSBcIm1pY3JvbWF0Y2hcIjtcbmltcG9ydCB7IGZvckVhY2hGaWxlLCBnZXRDYWNoZURhdGEsIGdldEZpbGVNZDVTeW5jLCB3cml0ZUNhY2hlRGF0YSwgd3JpdGVPckRlbGV0ZU91dFB1dEZpbGVzIH0gZnJvbSBcIi4vZmlsZS11dGlsc1wiO1xuaW1wb3J0IHsgV29ya2VyIH0gZnJvbSBcIndvcmtlcl90aHJlYWRzXCI7XG5pbXBvcnQgeyBkb1BhcnNlIH0gZnJvbSBcIi4vZG8tcGFyc2VcIjtcbmltcG9ydCB7IERlZmF1bHRQYXJzZUhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LXBhcnNlLWhhbmRsZXJcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2VyXCI7XG4vKipcbiAqIOino+aekOmFjee9ruihqOeUn+aIkOaMh+WumuaWh+S7tlxuICogQHBhcmFtIHBhcnNlQ29uZmlnIOino+aekOmFjee9rlxuICogQHBhcmFtIHRyYW5zMkZpbGVIYW5kbGVyIOi9rOaNouino+aekOe7k+aenOS4uui+k+WHuuaWh+S7tlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGUocGFyc2VDb25maWc6IElUYWJsZVBhcnNlQ29uZmlnLCB0cmFuczJGaWxlSGFuZGxlcjogSVRyYW5zUmVzdWx0MkFueUZpbGVIYW5kbGVyKSB7XG4gICAgY29uc3QgdGFibGVGaWxlRGlyID0gcGFyc2VDb25maWcudGFibGVGaWxlRGlyO1xuICAgIGlmICghdGFibGVGaWxlRGlyKSB7XG4gICAgICAgIExvZ2dlci5sb2coYOmFjee9ruihqOebruW9le+8mnRhYmxlRmlsZURpcuS4uuepumAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHRhYmxlRmlsZURpcikpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhg6YWN572u6KGo5paH5Lu25aS55LiN5a2Y5Zyo77yaJHt0YWJsZUZpbGVEaXJ9YCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkZWZhdWx0UGF0dGVybiA9IFtcIioqLyoue3hsc3gsY3N2fVwiLCBcIiEqKi9+JCouKlwiLCBcIiEqKi9+LiouKlwiXTtcbiAgICBpZiAoIXBhcnNlQ29uZmlnLnBhdHRlcm4pIHtcbiAgICAgICAgcGFyc2VDb25maWcucGF0dGVybiA9IGRlZmF1bHRQYXR0ZXJuO1xuICAgIH0gZWxzZSBpZiAocGFyc2VDb25maWcucGF0dGVybiAmJiB0eXBlb2YgcGFyc2VDb25maWcucGF0dGVybiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZmF1bHRQYXR0ZXJuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIXBhcnNlQ29uZmlnLnBhdHRlcm4uaW5jbHVkZXMoZGVmYXVsdFBhdHRlcm5baV0pKSB7XG4gICAgICAgICAgICAgICAgcGFyc2VDb25maWcucGF0dGVybi5wdXNoKGRlZmF1bHRQYXR0ZXJuW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocGFyc2VDb25maWcudXNlTXVsdGlUaHJlYWQgJiYgaXNOYU4ocGFyc2VDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtKSkge1xuICAgICAgICBwYXJzZUNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0gPSA1O1xuICAgIH1cbiAgICBMb2dnZXIuaW5pdChwYXJzZUNvbmZpZyk7XG4gICAgbGV0IGZpbGVJbmZvczogSUZpbGVJbmZvW10gPSBbXTtcbiAgICBsZXQgZGVsZXRlRmlsZUluZm9zOiBJRmlsZUluZm9bXSA9IFtdO1xuICAgIGNvbnN0IGdldEZpbGVJbmZvID0gKGZpbGVQYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGhQYXJzZSA9IHBhdGgucGFyc2UoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBmaWxlSW5mbzogSUZpbGVJbmZvID0ge1xuICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgZmlsZU5hbWU6IGZpbGVQYXRoUGFyc2UubmFtZSxcbiAgICAgICAgICAgIGZpbGVFeHROYW1lOiBmaWxlUGF0aFBhcnNlLmV4dCxcbiAgICAgICAgICAgIGlzRGVsZXRlOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZmlsZUluZm87XG4gICAgfTtcbiAgICBjb25zdCBtYXRjaFBhdHRlcm4gPSBwYXJzZUNvbmZpZy5wYXR0ZXJuO1xuICAgIGNvbnN0IGVhY2hGaWxlQ2FsbGJhY2sgPSAoZmlsZVBhdGg6IHN0cmluZywgaXNEZWxldGU/OiBib29sZWFuKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVJbmZvID0gZ2V0RmlsZUluZm8oZmlsZVBhdGgpO1xuICAgICAgICBsZXQgY2FuUmVhZDogYm9vbGVhbjtcbiAgICAgICAgaWYgKGlzRGVsZXRlKSB7XG4gICAgICAgICAgICBkZWxldGVGaWxlSW5mb3MucHVzaChmaWxlSW5mbyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW5SZWFkID0gbW1hdGNoLmFsbChmaWxlSW5mby5maWxlUGF0aCwgbWF0Y2hQYXR0ZXJuKTtcbiAgICAgICAgICAgIGlmIChjYW5SZWFkKSB7XG4gICAgICAgICAgICAgICAgZmlsZUluZm9zLnB1c2goZmlsZUluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGZpbGVJbmZvLCBjYW5SZWFkIH07XG4gICAgfTtcbiAgICBsZXQgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXAgPSB7fTtcblxuICAgIC8v57yT5a2Y5aSE55CGXG4gICAgbGV0IGNhY2hlRmlsZURpclBhdGg6IHN0cmluZyA9IHBhcnNlQ29uZmlnLmNhY2hlRmlsZURpclBhdGg7XG4gICAgbGV0IHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aDogc3RyaW5nO1xuXG4gICAgaWYgKCFwYXJzZUNvbmZpZy51c2VDYWNoZSkge1xuICAgICAgICBmb3JFYWNoRmlsZSh0YWJsZUZpbGVEaXIsIGVhY2hGaWxlQ2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghY2FjaGVGaWxlRGlyUGF0aCkgY2FjaGVGaWxlRGlyUGF0aCA9IFwiLmNhY2hlXCI7XG4gICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKGNhY2hlRmlsZURpclBhdGgpKSB7XG4gICAgICAgICAgICBjYWNoZUZpbGVEaXJQYXRoID0gcGF0aC5qb2luKHRhYmxlRmlsZURpciwgY2FjaGVGaWxlRGlyUGF0aCk7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGggPSBwYXRoLmpvaW4oY2FjaGVGaWxlRGlyUGF0aCwgXCIuZWdmcHJtY1wiKTtcbiAgICAgICAgfVxuICAgICAgICBwYXJzZVJlc3VsdE1hcCA9IGdldENhY2hlRGF0YShwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgpO1xuICAgICAgICBpZiAoIXBhcnNlUmVzdWx0TWFwKSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdE1hcCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9sZEZpbGVQYXRocyA9IE9iamVjdC5rZXlzKHBhcnNlUmVzdWx0TWFwKTtcbiAgICAgICAgbGV0IG9sZEZpbGVQYXRoSW5kZXg6IG51bWJlcjtcbiAgICAgICAgbGV0IHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdDtcbiAgICAgICAgZm9yRWFjaEZpbGUodGFibGVGaWxlRGlyLCAoZmlsZVBhdGgpID0+IHtcbiAgICAgICAgICAgIHZhciBtZDVzdHIgPSBnZXRGaWxlTWQ1U3luYyhmaWxlUGF0aCk7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXTtcbiAgICAgICAgICAgIGlmICghcGFyc2VSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcFtmaWxlUGF0aF0gPSBwYXJzZVJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJzZVJlc3VsdCAmJiBwYXJzZVJlc3VsdC5tZDVoYXNoICE9PSBtZDVzdHIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGZpbGVJbmZvLCBjYW5SZWFkIH0gPSBlYWNoRmlsZUNhbGxiYWNrKGZpbGVQYXRoLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNhblJlYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VSZXN1bHQubWQ1aGFzaCA9IG1kNXN0cjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvbGRGaWxlUGF0aEluZGV4ID0gb2xkRmlsZVBhdGhzLmluZGV4T2YoZmlsZVBhdGgpO1xuICAgICAgICAgICAgaWYgKG9sZEZpbGVQYXRoSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZEZpbGVQYXRoID0gb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRocy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhJbmRleF0gPSBlbmRGaWxlUGF0aDtcbiAgICAgICAgICAgICAgICBvbGRGaWxlUGF0aHMucG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZEZpbGVQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGVsZXRlIHBhcnNlUmVzdWx0TWFwW29sZEZpbGVQYXRoc1tpXV07XG4gICAgICAgICAgICBlYWNoRmlsZUNhbGxiYWNrKG9sZEZpbGVQYXRoc1tpXSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZpbGVJbmZvcy5sZW5ndGggPiBwYXJzZUNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0gJiYgcGFyc2VDb25maWcudXNlTXVsdGlUaHJlYWQpIHtcbiAgICAgICAgbGV0IGxvZ1N0cjogc3RyaW5nID0gXCJcIjtcbiAgICAgICAgY29uc3QgY291bnQgPSBNYXRoLmZsb29yKGZpbGVJbmZvcy5sZW5ndGggLyBwYXJzZUNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0pICsgMTtcbiAgICAgICAgbGV0IHdvcmtlcjogV29ya2VyO1xuICAgICAgICBsZXQgc3ViRmlsZUluZm9zOiBJRmlsZUluZm9bXTtcbiAgICAgICAgbGV0IHdvcmtlck1hcDogeyBba2V5OiBudW1iZXJdOiBXb3JrZXIgfSA9IHt9O1xuICAgICAgICBsZXQgY29tcGxldGVDb3VudDogbnVtYmVyID0gMDtcbiAgICAgICAgY29uc3QgdDEgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgY29uc3Qgb25Xb3JrZXJQYXJzZUVuZCA9IChkYXRhOiBJV29ya0RvUmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGAtLS0tLS0tLS0tLS0tLS0t57q/56iL57uT5p2fOiR7ZGF0YS50aHJlYWRJZH0tLS0tLS0tLS0tLS0tLS0tLWApO1xuICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXAgPSBPYmplY3QuYXNzaWduKHBhcnNlUmVzdWx0TWFwLCBkYXRhLnBhcnNlUmVzdWx0TWFwKTtcbiAgICAgICAgICAgIGNvbXBsZXRlQ291bnQrKztcbiAgICAgICAgICAgIGxvZ1N0ciArPSBkYXRhLmxvZ1N0ciArIExvZ2dlci5sb2dTdHI7XG4gICAgICAgICAgICBpZiAoY29tcGxldGVDb3VudCA+PSBjb3VudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHQyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmxvZyhgW+Wkmue6v+eoi+WvvOihqOaXtumXtF06JHt0MiAtIHQxfWApO1xuICAgICAgICAgICAgICAgIHdyaXRlRmlsZXMoXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlQ29uZmlnLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zMkZpbGVIYW5kbGVyLFxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mb3MsXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUZpbGVJbmZvcyxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXAsXG4gICAgICAgICAgICAgICAgICAgIGxvZ1N0clxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgc3ViRmlsZUluZm9zID0gZmlsZUluZm9zLnNwbGljZSgwLCBwYXJzZUNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0pO1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhgLS0tLS0tLS0tLS0tLS0tLee6v+eoi+W8gOWnizoke2l9LS0tLS0tLS0tLS0tLS0tLS1gKTtcbiAgICAgICAgICAgIHdvcmtlciA9IG5ldyBXb3JrZXIocGF0aC5qb2luKHBhdGguZGlybmFtZShfX2ZpbGVuYW1lKSwgXCIuLi8uLi8uLi93b3JrZXJfc2NyaXB0cy93b3JrZXIuanNcIiksIHtcbiAgICAgICAgICAgICAgICB3b3JrZXJEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHRocmVhZElkOiBpLFxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mb3M6IHN1YkZpbGVJbmZvcyxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXA6IHBhcnNlUmVzdWx0TWFwLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUNvbmZpZzogcGFyc2VDb25maWdcbiAgICAgICAgICAgICAgICB9IGFzIElXb3JrZXJTaGFyZURhdGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgd29ya2VyTWFwW2ldID0gd29ya2VyO1xuICAgICAgICAgICAgd29ya2VyLm9uKFwibWVzc2FnZVwiLCBvbldvcmtlclBhcnNlRW5kKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHQxID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGxldCBwYXJzZUhhbmRsZXI6IElUYWJsZVBhcnNlSGFuZGxlcjtcbiAgICAgICAgaWYgKHBhcnNlQ29uZmlnLmN1c3RvbVBhcnNlSGFuZGxlclBhdGgpIHtcbiAgICAgICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKHBhcnNlQ29uZmlnLmN1c3RvbVBhcnNlSGFuZGxlclBhdGgpKSB7XG4gICAgICAgICAgICAgICAgcGFyc2VDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIHBhcnNlQ29uZmlnLmN1c3RvbVBhcnNlSGFuZGxlclBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyc2VIYW5kbGVyID0gYXdhaXQgaW1wb3J0KHBhcnNlQ29uZmlnLmN1c3RvbVBhcnNlSGFuZGxlclBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGFyc2VIYW5kbGVyKSB7XG4gICAgICAgICAgICBwYXJzZUhhbmRsZXIgPSBuZXcgRGVmYXVsdFBhcnNlSGFuZGxlcigpO1xuICAgICAgICB9XG4gICAgICAgIGRvUGFyc2UoZmlsZUluZm9zLCBwYXJzZVJlc3VsdE1hcCwgcGFyc2VIYW5kbGVyKTtcbiAgICAgICAgY29uc3QgdDIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgTG9nZ2VyLmxvZyhgW+WNlee6v+eoi+WvvOihqOaXtumXtF06JHt0MiAtIHQxfWApO1xuICAgICAgICB3cml0ZUZpbGVzKFxuICAgICAgICAgICAgcGFyc2VDb25maWcsXG4gICAgICAgICAgICBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgsXG4gICAgICAgICAgICB0cmFuczJGaWxlSGFuZGxlcixcbiAgICAgICAgICAgIGZpbGVJbmZvcyxcbiAgICAgICAgICAgIGRlbGV0ZUZpbGVJbmZvcyxcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwLFxuICAgICAgICAgICAgTG9nZ2VyLmxvZ1N0clxuICAgICAgICApO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHdyaXRlRmlsZXMoXG4gICAgcGFyc2VDb25maWc6IElUYWJsZVBhcnNlQ29uZmlnLFxuICAgIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aDogc3RyaW5nLFxuICAgIHRyYW5zMkZpbGVIYW5kbGVyOiBJVHJhbnNSZXN1bHQyQW55RmlsZUhhbmRsZXIsXG4gICAgZmlsZUluZm9zOiBJRmlsZUluZm9bXSxcbiAgICBkZWxldGVGaWxlSW5mb3M6IElGaWxlSW5mb1tdLFxuICAgIHBhcnNlUmVzdWx0TWFwOiBUYWJsZVBhcnNlUmVzdWx0TWFwLFxuICAgIGxvZ1N0cj86IHN0cmluZ1xuKSB7XG4gICAgLy/lhpnlhaXop6PmnpDnvJPlrZhcbiAgICBpZiAocGFyc2VDb25maWcudXNlQ2FjaGUpIHtcbiAgICAgICAgd3JpdGVDYWNoZURhdGEocGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoLCBwYXJzZVJlc3VsdE1hcCk7XG4gICAgfVxuXG4gICAgLy/op6PmnpDnu5PmnZ/vvIzlgZrlr7zlh7rlpITnkIZcbiAgICBsZXQgb3V0cHV0RmlsZU1hcDogT3V0UHV0RmlsZU1hcCA9IHRyYW5zMkZpbGVIYW5kbGVyLnRyYW5zMkZpbGVzKGZpbGVJbmZvcywgZGVsZXRlRmlsZUluZm9zLCBwYXJzZVJlc3VsdE1hcCk7XG4gICAgY29uc3Qgb3V0cHV0RmlsZXMgPSBPYmplY3QudmFsdWVzKG91dHB1dEZpbGVNYXApO1xuXG4gICAgLy/lhpnlhaXlkozliKDpmaTmlofku7blpITnkIZcbiAgICBMb2dnZXIubG9nKGDlvIDlp4vlhpnlhaXmlofku7Y6MC8ke291dHB1dEZpbGVzLmxlbmd0aH1gKTtcblxuICAgIHdyaXRlT3JEZWxldGVPdXRQdXRGaWxlcyhcbiAgICAgICAgb3V0cHV0RmlsZXMsXG4gICAgICAgIChmaWxlUGF0aCwgdG90YWwsIG5vdywgaXNPaykgPT4ge1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhgW+WGmeWFpeaWh+S7tl0g6L+b5bqmOigke25vd30vJHt0b3RhbH0pIOi3r+W+hDoke2ZpbGVQYXRofWApO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGDlhpnlhaXnu5PmnZ9+YCk7XG4gICAgICAgICAgICAvL+aXpeW/l+aWh+S7tlxuICAgICAgICAgICAgaWYgKCFsb2dTdHIpIHtcbiAgICAgICAgICAgICAgICBsb2dTdHIgPSBMb2dnZXIubG9nU3RyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgb3V0cHV0TG9nRmlsZUluZm86IElPdXRQdXRGaWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIFwiZXhjZWwyYWxsLmxvZ1wiKSxcbiAgICAgICAgICAgICAgICBkYXRhOiBsb2dTdHJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMoW291dHB1dExvZ0ZpbGVJbmZvXSk7XG4gICAgICAgIH1cbiAgICApO1xufVxuIiwiaW1wb3J0ICogYXMgeGxzeCBmcm9tIFwieGxzeFwiO1xuLyoqXG4gKiDmmK/lkKbkuLrnqbrooajmoLzmoLzlrZBcbiAqIEBwYXJhbSBjZWxsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5Q2VsbChjZWxsOiB4bHN4LkNlbGxPYmplY3QpIHtcbiAgICBpZiAoY2VsbCAmJiBjZWxsLnYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwudiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuIGNlbGwudiA9PT0gXCJcIjtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbC52ID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNOYU4oY2VsbC52KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbi8qKlxuICog5a2X5q+NWueahOe8lueggVxuICovXG5leHBvcnQgY29uc3QgWkNoYXJDb2RlID0gOTA7XG4vKipcbiAqIOWtl+avjUHnmoTnvJbnoIFcbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBBQ2hhckNvZGUgPSA2NTtcbi8qKlxuICog5qC55o2u5b2T5YmN5YiX55qEY2hhckNvZGVz6I635Y+W5LiL5LiA5YiXS2V5XG4gKiBAcGFyYW0gY2hhckNvZGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROZXh0Q29sS2V5KGNoYXJDb2RlczogbnVtYmVyW10pOiBzdHJpbmcge1xuICAgIGxldCBpc0FkZDogYm9vbGVhbjtcbiAgICBmb3IgKGxldCBpID0gY2hhckNvZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmIChjaGFyQ29kZXNbaV0gPCBaQ2hhckNvZGUpIHtcbiAgICAgICAgICAgIGNoYXJDb2Rlc1tpXSArPSAxO1xuICAgICAgICAgICAgaXNBZGQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hhckNvZGVzW2ldID09PSBaQ2hhckNvZGUpIHtcbiAgICAgICAgICAgIGNoYXJDb2Rlc1tpXSA9IEFDaGFyQ29kZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzQWRkKSB7XG4gICAgICAgIGNoYXJDb2Rlcy5wdXNoKEFDaGFyQ29kZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYXJDb2Rlc1RvU3RyaW5nKGNoYXJDb2Rlcyk7XG59XG5cbi8qKlxuICog5YiX55qE5a2X56ym57yW56CB5pWw57uE6L2s5a2X56ym5LiyXG4gKiBAcGFyYW0gY2hhckNvZGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGFyQ29kZXNUb1N0cmluZyhjaGFyQ29kZXM6IG51bWJlcltdKTogc3RyaW5nIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSguLi5jaGFyQ29kZXMpO1xufVxuLyoqXG4gKiDlrZfnrKbkuLLovaznvJbnoIHmlbDnu4RcbiAqIEBwYXJhbSBjb2xLZXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1RvQ2hhckNvZGVzKGNvbEtleTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2hhckNvZGVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xLZXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2hhckNvZGVzLnB1c2goY29sS2V5LmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cbiAgICByZXR1cm4gY2hhckNvZGVzO1xufVxuLyoqXG4gKiDnurXlkJHpgY3ljobooajmoLxcbiAqIEBwYXJhbSBzaGVldCB4bHN46KGo5qC85a+56LGhXG4gKiBAcGFyYW0gc3RhcnRSb3cg5byA5aeL6KGMIOS7jjHlvIDlp4tcbiAqIEBwYXJhbSBzdGFydENvbCDliJflrZfnrKYg5q+U5aaCQSBCXG4gKiBAcGFyYW0gY2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWRcbiAqIEBwYXJhbSBpc1NoZWV0Um93RW5kIOaYr+WQpuihjOe7k+adn+WIpOaWreaWueazlVxuICogQHBhcmFtIGlzU2hlZXRDb2xFbmQg5piv5ZCm5YiX57uT5p2f5Yik5pat5pa55rOVXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRSb3cg5piv5ZCm6Lez6L+H6KGMXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRDb2wg5piv5ZCm6Lez6L+H5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJ0aWNhbEZvckVhY2hTaGVldChcbiAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICBzdGFydFJvdzogbnVtYmVyLFxuICAgIHN0YXJ0Q29sOiBzdHJpbmcsXG4gICAgY2FsbGJhY2s6IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWQsXG4gICAgaXNTaGVldFJvd0VuZD86IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbixcbiAgICBpc1NoZWV0Q29sRW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xrZXk6IHN0cmluZykgPT4gYm9vbGVhbixcbiAgICBpc1NraXBTaGVldFJvdz86IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbixcbiAgICBpc1NraXBTaGVldENvbD86IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpID0+IGJvb2xlYW5cbikge1xuICAgIGNvbnN0IHNoZWV0UmVmOiBzdHJpbmcgPSBzaGVldFtcIiFyZWZcIl07XG4gICAgY29uc3QgbWF4Um93TnVtID0gcGFyc2VJbnQoc2hlZXRSZWYubWF0Y2goL1xcZCskLylbMF0pO1xuXG4gICAgY29uc3QgbWF4Q29sS2V5ID0gc2hlZXRSZWYuc3BsaXQoXCI6XCIpWzFdLm1hdGNoKC9eW0EtWmEtel0rLylbMF07XG4gICAgbGV0IG1heENvbEtleUNvZGVTdW0gPSBnZXRDaGFyQ29kZVN1bShtYXhDb2xLZXkpO1xuXG4gICAgbGV0IGNvbENoYXJDb2RlczogbnVtYmVyW107XG4gICAgbGV0IGNvbEtleTogc3RyaW5nO1xuICAgIGxldCBjdXJDb2xDb2RlU3VtOiBudW1iZXIgPSAwO1xuICAgIGNvbnN0IHN0YXJ0Q2hhcmNvZGVzID0gc3RyaW5nVG9DaGFyQ29kZXMoc3RhcnRDb2wpO1xuICAgIGZvciAobGV0IGkgPSBzdGFydFJvdzsgaSA8PSBtYXhSb3dOdW07IGkrKykge1xuICAgICAgICBpZiAoaXNTaGVldFJvd0VuZCA/IGlzU2hlZXRSb3dFbmQoc2hlZXQsIGkpIDogZmFsc2UpIGJyZWFrO1xuICAgICAgICBpZiAoaXNTa2lwU2hlZXRSb3cgPyBpc1NraXBTaGVldFJvdyhzaGVldCwgaSkgOiBmYWxzZSkgY29udGludWU7XG4gICAgICAgIGNvbENoYXJDb2RlcyA9IHN0YXJ0Q2hhcmNvZGVzLmNvbmNhdChbXSk7XG5cbiAgICAgICAgY29sS2V5ID0gc3RhcnRDb2w7XG5cbiAgICAgICAgbGV0IGhhc05leHRDb2wgPSBpc1NoZWV0Q29sRW5kID8gIWlzU2hlZXRDb2xFbmQoc2hlZXQsIGNvbEtleSkgOiB0cnVlO1xuICAgICAgICB3aGlsZSAoaGFzTmV4dENvbCkge1xuICAgICAgICAgICAgaWYgKCEoaXNTa2lwU2hlZXRDb2wgPyBpc1NraXBTaGVldENvbChzaGVldCwgY29sS2V5KSA6IGZhbHNlKSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNoZWV0LCBjb2xLZXksIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29sS2V5ID0gZ2V0TmV4dENvbEtleShjb2xDaGFyQ29kZXMpO1xuICAgICAgICAgICAgY3VyQ29sQ29kZVN1bSA9IGdldENoYXJDb2RlU3VtKGNvbEtleSk7XG4gICAgICAgICAgICBpZiAobWF4Q29sS2V5Q29kZVN1bSA+PSBjdXJDb2xDb2RlU3VtKSB7XG4gICAgICAgICAgICAgICAgaGFzTmV4dENvbCA9IGlzU2hlZXRDb2xFbmQgPyAhaXNTaGVldENvbEVuZChzaGVldCwgY29sS2V5KSA6IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhc05leHRDb2wgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiDmqKrlkJHpgY3ljobooajmoLxcbiAqIEBwYXJhbSBzaGVldCB4bHN46KGo5qC85a+56LGhXG4gKiBAcGFyYW0gc3RhcnRSb3cg5byA5aeL6KGMIOS7jjHlvIDlp4tcbiAqIEBwYXJhbSBzdGFydENvbCDliJflrZfnrKYg5q+U5aaCQSBCXG4gKiBAcGFyYW0gY2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWRcbiAqIEBwYXJhbSBpc1NoZWV0Um93RW5kIOaYr+WQpuihjOe7k+adn+WIpOaWreaWueazlVxuICogQHBhcmFtIGlzU2hlZXRDb2xFbmQg5piv5ZCm5YiX57uT5p2f5Yik5pat5pa55rOVXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRSb3cg5piv5ZCm6Lez6L+H6KGMXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRDb2wg5piv5ZCm6Lez6L+H5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBob3Jpem9udGFsRm9yRWFjaFNoZWV0KFxuICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgIHN0YXJ0Um93OiBudW1iZXIsXG4gICAgc3RhcnRDb2w6IHN0cmluZyxcbiAgICBjYWxsYmFjazogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4gdm9pZCxcbiAgICBpc1NoZWV0Um93RW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxuICAgIGlzU2hlZXRDb2xFbmQ/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbGtleTogc3RyaW5nKSA9PiBib29sZWFuLFxuICAgIGlzU2tpcFNoZWV0Um93PzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxuICAgIGlzU2tpcFNoZWV0Q29sPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZykgPT4gYm9vbGVhblxuKSB7XG4gICAgY29uc3Qgc2hlZXRSZWY6IHN0cmluZyA9IHNoZWV0W1wiIXJlZlwiXTtcbiAgICBjb25zdCBtYXhSb3dOdW0gPSBwYXJzZUludChzaGVldFJlZi5tYXRjaCgvXFxkKyQvKVswXSk7XG5cbiAgICBjb25zdCBtYXhDb2xLZXkgPSBzaGVldFJlZi5zcGxpdChcIjpcIilbMV0ubWF0Y2goL15bQS1aYS16XSsvKVswXTtcbiAgICBjb25zdCBtYXhDb2xLZXlDb2RlU3VtID0gZ2V0Q2hhckNvZGVTdW0obWF4Q29sS2V5KTtcbiAgICBsZXQgY29sQ2hhckNvZGVzOiBudW1iZXJbXTtcbiAgICBsZXQgY29sS2V5OiBzdHJpbmc7XG4gICAgY29sQ2hhckNvZGVzID0gc3RyaW5nVG9DaGFyQ29kZXMoc3RhcnRDb2wpO1xuICAgIGxldCBjdXJDb2xDb2RlU3VtOiBudW1iZXIgPSAwO1xuICAgIGNvbEtleSA9IHN0YXJ0Q29sO1xuICAgIGxldCBoYXNOZXh0Q29sID0gaXNTaGVldENvbEVuZCA/ICFpc1NoZWV0Q29sRW5kKHNoZWV0LCBjb2xLZXkpIDogdHJ1ZTtcbiAgICB3aGlsZSAoaGFzTmV4dENvbCkge1xuICAgICAgICBpZiAoIShpc1NraXBTaGVldENvbCA/IGlzU2tpcFNoZWV0Q29sKHNoZWV0LCBjb2xLZXkpIDogZmFsc2UpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gc3RhcnRSb3c7IGkgPD0gbWF4Um93TnVtOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNTaGVldFJvd0VuZCA/IGlzU2hlZXRSb3dFbmQoc2hlZXQsIGkpIDogZmFsc2UpIGJyZWFrO1xuICAgICAgICAgICAgICAgIGlmIChpc1NraXBTaGVldFJvdyA/IGlzU2tpcFNoZWV0Um93KHNoZWV0LCBpKSA6IGZhbHNlKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhzaGVldCwgY29sS2V5LCBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbEtleSA9IGdldE5leHRDb2xLZXkoY29sQ2hhckNvZGVzKTtcbiAgICAgICAgY3VyQ29sQ29kZVN1bSA9IGdldENoYXJDb2RlU3VtKGNvbEtleSk7XG4gICAgICAgIGlmIChtYXhDb2xLZXlDb2RlU3VtID49IGN1ckNvbENvZGVTdW0pIHtcbiAgICAgICAgICAgIGhhc05leHRDb2wgPSBpc1NoZWV0Q29sRW5kID8gIWlzU2hlZXRDb2xFbmQoc2hlZXQsIGNvbEtleSkgOiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFzTmV4dENvbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxubGV0IGNvbEtleVN1bU1hcCA9IHt9O1xuZnVuY3Rpb24gZ2V0Q2hhckNvZGVTdW0oY29sS2V5OiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGxldCBzdW06IG51bWJlciA9IGNvbEtleVN1bU1hcFtjb2xLZXldO1xuICAgIGlmICghc3VtKSB7XG4gICAgICAgIHN1bSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sS2V5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzdW0gKz0gY29sS2V5LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgY29sS2V5U3VtTWFwW2NvbEtleV0gPSBzdW07XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59XG4vKipcbiAqIOivu+WPlumFjee9ruihqOaWh+S7tiDlkIzmraXnmoRcbiAqIEBwYXJhbSBmaWxlSW5mb1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZFRhYmxlRmlsZShmaWxlSW5mbzogSUZpbGVJbmZvKTogeGxzeC5Xb3JrQm9vayB7XG4gICAgY29uc3Qgd29ya0Jvb2sgPSB4bHN4LnJlYWRGaWxlKGZpbGVJbmZvLmZpbGVQYXRoLCB7IHR5cGU6IGlzQ1NWKGZpbGVJbmZvLmZpbGVFeHROYW1lKSA/IFwic3RyaW5nXCIgOiBcImZpbGVcIiB9KTtcbiAgICByZXR1cm4gd29ya0Jvb2s7XG59XG4vKipcbiAqIOagueaNruaWh+S7tuWQjeWQjue8gOWIpOaWreaYr+WQpuS4umNzduaWh+S7tlxuICogQHBhcmFtIGZpbGVFeHROYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NTVihmaWxlRXh0TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZpbGVFeHROYW1lID09PSBcImNzdlwiO1xufVxuIiwiaW1wb3J0ICogYXMgeGxzeCBmcm9tIFwieGxzeFwiO1xuaW1wb3J0IHsgdmFsdWVUcmFuc0Z1bmNNYXAgfSBmcm9tIFwiLlwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZXJcIjtcbmltcG9ydCB7IGhvcml6b250YWxGb3JFYWNoU2hlZXQsIGlzRW1wdHlDZWxsLCByZWFkVGFibGVGaWxlLCB2ZXJ0aWNhbEZvckVhY2hTaGVldCB9IGZyb20gXCIuL3RhYmxlLXV0aWxzXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSVRhYmxlRmllbGQge1xuICAgICAgICAvKirphY3nva7ooajkuK3ms6jph4rlgLwgKi9cbiAgICAgICAgdGV4dDogc3RyaW5nO1xuICAgICAgICAvKirphY3nva7ooajkuK3nsbvlnovlgLwgKi9cbiAgICAgICAgb3JpZ2luVHlwZTogc3RyaW5nO1xuICAgICAgICAvKirphY3nva7ooajkuK3lrZfmrrXlkI3lgLwgKi9cbiAgICAgICAgb3JpZ2luRmllbGROYW1lOiBzdHJpbmc7XG4gICAgICAgIC8qKuino+aekOWQjueahOexu+Wei+WAvCAqL1xuICAgICAgICB0eXBlPzogc3RyaW5nO1xuICAgICAgICAvKirop6PmnpDlkI7nmoTlrZDnsbvlnovlgLwgKi9cbiAgICAgICAgc3ViVHlwZT86IHN0cmluZztcbiAgICAgICAgLyoq6Kej5p6Q5ZCO55qE5a2X5q615ZCN5YC8ICovXG4gICAgICAgIGZpZWxkTmFtZT86IHN0cmluZztcbiAgICAgICAgLyoq5a+56LGh55qE5a2Q5a2X5q615ZCNICovXG4gICAgICAgIHN1YkZpZWxkTmFtZT86IHN0cmluZztcbiAgICAgICAgLyoq5aSa5YiX5a+56LGhICovXG4gICAgICAgIGlzTXV0aUNvbE9iaj86IGJvb2xlYW47XG4gICAgfVxuICAgIGludGVyZmFjZSBJVGFibGVEZWZpbmUge1xuICAgICAgICAvKirphY3nva7ooajlkI0gKi9cbiAgICAgICAgdGFibGVOYW1lOiBzdHJpbmc7XG4gICAgICAgIC8qKumFjee9ruihqOexu+WeiyDpu5jorqTkuKTnp406IHZlcnRpY2FsIOWSjCBob3Jpem9udGFsKi9cbiAgICAgICAgdGFibGVUeXBlOiBzdHJpbmc7XG5cbiAgICAgICAgLyoq5byA5aeL6KGM5LuOMeW8gOWniyAqL1xuICAgICAgICBzdGFydFJvdzogbnVtYmVyO1xuICAgICAgICAvKirlvIDlp4vliJfku45B5byA5aeLICovXG4gICAgICAgIHN0YXJ0Q29sOiBzdHJpbmc7XG4gICAgICAgIC8qKuWeguebtOino+aekOWtl+auteWumuS5iSAqL1xuICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lOiBJVmVydGljYWxGaWVsZERlZmluZTtcbiAgICAgICAgLyoq5qiq5ZCR6Kej5p6Q5a2X5q615a6a5LmJICovXG4gICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZTogSUhvcml6b250YWxGaWVsZERlZmluZTtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElIb3Jpem9udGFsRmllbGREZWZpbmUge1xuICAgICAgICAvKirnsbvlnovooYwgKi9cbiAgICAgICAgdHlwZUNvbDogc3RyaW5nO1xuICAgICAgICAvKirlrZfmrrXlkI3ooYwgKi9cbiAgICAgICAgZmllbGRDb2w6IHN0cmluZztcbiAgICAgICAgLyoq5rOo6YeK6KGMICovXG4gICAgICAgIHRleHRDb2w6IHN0cmluZztcbiAgICB9XG4gICAgaW50ZXJmYWNlIElWZXJ0aWNhbEZpZWxkRGVmaW5lIHtcbiAgICAgICAgLyoq57G75Z6L6KGMICovXG4gICAgICAgIHR5cGVSb3c6IG51bWJlcjtcbiAgICAgICAgLyoq5a2X5q615ZCN6KGMICovXG4gICAgICAgIGZpZWxkUm93OiBudW1iZXI7XG4gICAgICAgIC8qKuazqOmHiuihjCAqL1xuICAgICAgICB0ZXh0Um93OiBudW1iZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWtl+auteWtl+WFuFxuICAgICAqIGtleeaYr+WIl2NvbEtleVxuICAgICAqIHZhbHVl5piv5a2X5q615a+56LGhXG4gICAgICovXG4gICAgdHlwZSBDb2xLZXlUYWJsZUZpZWxkTWFwID0geyBba2V5OiBzdHJpbmddOiBJVGFibGVGaWVsZCB9O1xuXG4gICAgLyoqXG4gICAgICog6KGo5qC855qE5LiA6KGM5oiW6ICF5LiA5YiXXG4gICAgICoga2V55Li65a2X5q615ZCN5YC877yMdmFsdWXkuLrooajmoLznmoTkuIDmoLxcbiAgICAgKi9cbiAgICB0eXBlIFRhYmxlUm93T3JDb2wgPSB7IFtrZXk6IHN0cmluZ106IElUYWJsZUNlbGwgfTtcbiAgICAvKipcbiAgICAgKiDooajmoLznmoTkuIDmoLxcbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSVRhYmxlQ2VsbCB7XG4gICAgICAgIC8qKuWtl+auteWvueixoSAqL1xuICAgICAgICBmaWxlZDogSVRhYmxlRmllbGQ7XG4gICAgICAgIC8qKuWAvCAqL1xuICAgICAgICB2YWx1ZTogYW55O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDooajmoLzooYzmiJbliJfnmoTlrZflhbhcbiAgICAgKiBrZXnkuLrooYzntKLlvJXvvIx2YWx1ZeS4uuihqOagvOeahOS4gOihjFxuICAgICAqL1xuICAgIHR5cGUgVGFibGVSb3dPckNvbE1hcCA9IHsgW2tleTogc3RyaW5nXTogVGFibGVSb3dPckNvbCB9O1xuICAgIC8qKlxuICAgICAqIOihqOagvOihjOaIluWIl+WAvOaVsOe7hFxuICAgICAqIGtleeS4u+mUru+8jHZhbHVl5piv5YC85pWw57uEXG4gICAgICovXG4gICAgdHlwZSBSb3dPckNvbFZhbHVlc01hcCA9IHsgW2tleTogc3RyaW5nXTogYW55W10gfTtcbiAgICBpbnRlcmZhY2UgSVRhYmxlVmFsdWVzIHtcbiAgICAgICAgLyoq5a2X5q615ZCN5pWw57uEICovXG4gICAgICAgIGZpZWxkczogc3RyaW5nW107XG4gICAgICAgIC8qKuihqOagvOWAvOaVsOe7hCAqL1xuICAgICAgICByb3dPckNvbFZhbHVlc01hcDogUm93T3JDb2xWYWx1ZXNNYXA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOe7k+aenFxuICAgICAqL1xuICAgIGludGVyZmFjZSBJVGFibGVQYXJzZVJlc3VsdCB7XG4gICAgICAgIC8qKumFjee9ruihqOWumuS5iSAqL1xuICAgICAgICB0YWJsZURlZmluZT86IElUYWJsZURlZmluZTtcbiAgICAgICAgLyoq5b2T5YmN5YiG6KGo5ZCNICovXG4gICAgICAgIGN1clNoZWV0TmFtZT86IHN0cmluZztcbiAgICAgICAgLyoq5a2X5q615a2X5YW4ICovXG4gICAgICAgIGZpbGVkTWFwPzogQ29sS2V5VGFibGVGaWVsZE1hcDtcbiAgICAgICAgLy8gLyoq6KGo5qC86KGM5oiW5YiX55qE5a2X5YW4ICovXG4gICAgICAgIC8vIHJvd09yQ29sTWFwOiBUYWJsZVJvd09yQ29sTWFwXG4gICAgICAgIC8qKuWNleS4quihqOagvOWvueixoSAqL1xuICAgICAgICAvKiprZXnmmK/kuLvplK7lgLzvvIx2YWx1ZeaYr+S4gOihjOWvueixoSAqL1xuICAgICAgICB0YWJsZU9iaj86IHsgW2tleTogc3RyaW5nXTogYW55IH07XG4gICAgICAgIC8qKuW9k+WJjeihjOaIluWIl+WvueixoSAqL1xuICAgICAgICBjdXJSb3dPckNvbE9iaj86IGFueTtcbiAgICAgICAgLyoq5Li76ZSu5YC8ICovXG4gICAgICAgIG1haW5LZXlGaWVsZE5hbWU/OiBzdHJpbmc7XG4gICAgfVxuXG4gICAgLyoq5YC86L2s5o2i5pa55rOVICovXG4gICAgaW50ZXJmYWNlIElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICAgICAgZXJyb3I/OiBhbnk7XG4gICAgICAgIHZhbHVlPzogYW55O1xuICAgIH1cbiAgICB0eXBlIFZhbHVlVHJhbnNGdW5jID0gKGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogYW55KSA9PiBJVHJhbnNWYWx1ZVJlc3VsdDtcbiAgICAvKipcbiAgICAgKiDlgLzovazmjaLmlrnms5XlrZflhbhcbiAgICAgKiBrZXnmmK/nsbvlnotrZXlcbiAgICAgKiB2YWx1ZeaYr+aWueazlVxuICAgICAqL1xuICAgIHR5cGUgVmFsdWVUcmFuc0Z1bmNNYXAgPSB7IFtrZXk6IHN0cmluZ106IFZhbHVlVHJhbnNGdW5jIH07XG59XG5leHBvcnQgZW51bSBUYWJsZVR5cGUge1xuICAgIHZlcnRpY2FsID0gXCJ2ZXJ0aWNhbFwiLFxuICAgIGhvcml6b250YWwgPSBcImhvcml6b250YWxcIlxufVxuXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBhcnNlSGFuZGxlciBpbXBsZW1lbnRzIElUYWJsZVBhcnNlSGFuZGxlciB7XG4gICAgcHJpdmF0ZSBfdmFsdWVUcmFuc0Z1bmNNYXA6IFZhbHVlVHJhbnNGdW5jTWFwO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl92YWx1ZVRyYW5zRnVuY01hcCA9IHZhbHVlVHJhbnNGdW5jTWFwO1xuICAgIH1cbiAgICBnZXRUYWJsZURlZmluZShmaWxlSW5mbzogSUZpbGVJbmZvLCB3b3JrQm9vazogeGxzeC5Xb3JrQm9vayk6IElUYWJsZURlZmluZSB7XG4gICAgICAgIC8v5Y+W6KGo5qC85paH5Lu25ZCN5Li66KGo5qC85ZCNXG4gICAgICAgIGNvbnN0IHRhYmxlTmFtZSA9IGZpbGVJbmZvLmZpbGVOYW1lO1xuXG4gICAgICAgIGNvbnN0IHRhYmxlRGVmaW5lOiBQYXJ0aWFsPElUYWJsZURlZmluZT4gPSB7XG4gICAgICAgICAgICB0YWJsZU5hbWU6IHRhYmxlTmFtZVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBjZWxsS2V5OiBzdHJpbmc7XG4gICAgICAgIGxldCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3Q7XG4gICAgICAgIC8v5Y+W56ys5LiA5Liq6KGoXG4gICAgICAgIGNvbnN0IHNoZWV0TmFtZXMgPSB3b3JrQm9vay5TaGVldE5hbWVzO1xuICAgICAgICBsZXQgc2hlZXQ6IHhsc3guU2hlZXQ7XG4gICAgICAgIGxldCBmaXJzdENlbGxWYWx1ZTogeyB0YWJsZU5hbWVJblNoZWV0OiBzdHJpbmc7IHRhYmxlVHlwZTogc3RyaW5nIH07XG4gICAgICAgIGxldCBmaXJzdENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGVldE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzaGVldCA9IHdvcmtCb29rLlNoZWV0c1tzaGVldE5hbWVzW2ldXTtcbiAgICAgICAgICAgIGZpcnN0Q2VsbE9iaiA9IHNoZWV0W1wiQVwiICsgMV07XG4gICAgICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGZpcnN0Q2VsbE9iaikpIHtcbiAgICAgICAgICAgICAgICBmaXJzdENlbGxWYWx1ZSA9IHRoaXMuX2dldEZpcnN0Q2VsbFZhbHVlKGZpcnN0Q2VsbE9iaik7XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Q2VsbFZhbHVlICYmIGZpcnN0Q2VsbFZhbHVlLnRhYmxlTmFtZUluU2hlZXQgPT09IHRhYmxlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmaXJzdENlbGxWYWx1ZSB8fCBmaXJzdENlbGxWYWx1ZS50YWJsZU5hbWVJblNoZWV0ICE9PSB0YWJsZU5hbWUpIHtcbiAgICAgICAgICAgIExvZ2dlci5sb2coYOihqOagvOS4jeinhOiMgyzot7Pov4fop6PmnpAs6Lev5b6EOiR7ZmlsZUluZm8uZmlsZVBhdGh9YCwgXCJlcnJvclwiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9IGZpcnN0Q2VsbFZhbHVlLnRhYmxlVHlwZTtcbiAgICAgICAgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLnZlcnRpY2FsKSB7XG4gICAgICAgICAgICB0YWJsZURlZmluZS52ZXJ0aWNhbEZpZWxkRGVmaW5lID0ge30gYXMgYW55O1xuICAgICAgICAgICAgY29uc3QgdmVydGljYWxGaWVsZERlZmluZTogSVZlcnRpY2FsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS52ZXJ0aWNhbEZpZWxkRGVmaW5lO1xuICAgICAgICAgICAgdmVydGljYWxGaWVsZERlZmluZS50ZXh0Um93ID0gMTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgMTAwOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjZWxsS2V5ID0gXCJBXCIgKyBpO1xuICAgICAgICAgICAgICAgIGNlbGxPYmogPSBzaGVldFtjZWxsS2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eUNlbGwoY2VsbE9iaikgfHwgY2VsbE9iai52ID09PSBcIk5PXCIgfHwgY2VsbE9iai52ID09PSBcIkVORFwiIHx8IGNlbGxPYmoudiA9PT0gXCJTVEFSVFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Um93ID0gaTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNlbGxPYmoudiA9PT0gXCJDTElFTlRcIikge1xuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lLmZpZWxkUm93ID0gaTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNlbGxPYmoudiA9PT0gXCJUWVBFXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWxGaWVsZERlZmluZS50eXBlUm93ID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRhYmxlRGVmaW5lLnN0YXJ0Um93ICYmIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3cgJiYgdmVydGljYWxGaWVsZERlZmluZS50eXBlUm93KSBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRDb2wgPSBcIkJcIjtcbiAgICAgICAgfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICB0YWJsZURlZmluZS5ob3Jpem9udGFsRmllbGREZWZpbmUgPSB7fSBhcyBhbnk7XG4gICAgICAgICAgICBjb25zdCBob3Jpem9udGFsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS5ob3Jpem9udGFsRmllbGREZWZpbmU7XG4gICAgICAgICAgICBob3Jpem9udGFsRmllbGREZWZpbmUudGV4dENvbCA9IFwiQVwiO1xuICAgICAgICAgICAgaG9yaXpvbnRhbEZpZWxkRGVmaW5lLnR5cGVDb2wgPSBcIkJcIjtcbiAgICAgICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZS5maWVsZENvbCA9IFwiQ1wiO1xuICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRDb2wgPSBcIkVcIjtcbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Um93ID0gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YWJsZURlZmluZSBhcyBhbnk7XG4gICAgfVxuICAgIHByaXZhdGUgX2dldEZpcnN0Q2VsbFZhbHVlKGZpcnN0Q2VsbE9iajogeGxzeC5DZWxsT2JqZWN0KSB7XG4gICAgICAgIGlmICghZmlyc3RDZWxsT2JqKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZXMgPSAoZmlyc3RDZWxsT2JqLnYgYXMgc3RyaW5nKS5zcGxpdChcIjpcIik7XG4gICAgICAgIGxldCB0YWJsZU5hbWVJblNoZWV0OiBzdHJpbmc7XG4gICAgICAgIGxldCB0YWJsZVR5cGU6IHN0cmluZztcbiAgICAgICAgaWYgKGNlbGxWYWx1ZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGFibGVOYW1lSW5TaGVldCA9IGNlbGxWYWx1ZXNbMV07XG4gICAgICAgICAgICB0YWJsZVR5cGUgPSBjZWxsVmFsdWVzWzBdID09PSBcIkhcIiA/IFRhYmxlVHlwZS5ob3Jpem9udGFsIDogVGFibGVUeXBlLnZlcnRpY2FsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFibGVOYW1lSW5TaGVldCA9IGNlbGxWYWx1ZXNbMF07XG4gICAgICAgICAgICB0YWJsZVR5cGUgPSBUYWJsZVR5cGUudmVydGljYWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdGFibGVOYW1lSW5TaGVldDogdGFibGVOYW1lSW5TaGVldCwgdGFibGVUeXBlOiB0YWJsZVR5cGUgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5Yik5pat6KGo5qC85piv5ZCm6IO96Kej5p6QXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICovXG4gICAgY2hlY2tTaGVldENhblBhcnNlKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCBzaGVldE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAvL+WmguaenOi/meS4quihqOS4quesrOS4gOagvOWAvOS4jeetieS6juihqOWQje+8jOWImeS4jeino+aekFxuICAgICAgICBjb25zdCBmaXJzdENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W1wiQVwiICsgMV07XG4gICAgICAgIGNvbnN0IGZpcnN0Q2VsbFZhbHVlID0gdGhpcy5fZ2V0Rmlyc3RDZWxsVmFsdWUoZmlyc3RDZWxsT2JqKTtcbiAgICAgICAgaWYgKGZpcnN0Q2VsbE9iaiAmJiB0YWJsZURlZmluZSkge1xuICAgICAgICAgICAgaWYgKGZpcnN0Q2VsbFZhbHVlLnRhYmxlTmFtZUluU2hlZXQgIT09IHRhYmxlRGVmaW5lLnRhYmxlTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOihqOihjOe7k+adn+WIpOaWrVxuICAgICAqIEBwYXJhbSB0YWJsZURlZmluZVxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSByb3dcbiAgICAgKi9cbiAgICBpc1NoZWV0Um93RW5kKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCByb3c6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvLyBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcblxuICAgICAgICAvLyB9IGVsc2UgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcblxuICAgICAgICAvLyB9XG4gICAgICAgIC8v5Yik5pat5LiK5LiA6KGM55qE5qCH5b+X5piv5ZCm5Li6RU5EXG4gICAgICAgIGlmIChyb3cgPiAxKSB7XG4gICAgICAgICAgICByb3cgPSByb3cgLSAxO1xuICAgICAgICAgICAgY29uc3QgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbXCJBXCIgKyByb3ddO1xuICAgICAgICAgICAgcmV0dXJuIGNlbGxPYmogJiYgY2VsbE9iai52ID09PSBcIkVORFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOihqOWIl+e7k+adn+WIpOaWrVxuICAgICAqIEBwYXJhbSB0YWJsZURlZmluZVxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKi9cbiAgICBpc1NoZWV0Q29sRW5kKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAvL+WIpOaWrei/meS4gOWIl+esrOS4gOihjOaYr+WQpuS4uuepulxuICAgICAgICBjb25zdCBmaXJzdENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIDFdO1xuICAgICAgICAvLyBjb25zdCB0eXBlQ2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgdGFibGVGaWxlLnRhYmxlRGVmaW5lLnR5cGVSb3ddO1xuICAgICAgICByZXR1cm4gaXNFbXB0eUNlbGwoZmlyc3RDZWxsT2JqKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qOA5p+l6KGM5piv5ZCm6ZyA6KaB6Kej5p6QXG4gICAgICogQHBhcmFtIHRhYmxlRGVmaW5lXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIHJvd0luZGV4XG4gICAgICovXG4gICAgY2hlY2tSb3dOZWVkUGFyc2UodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbXCJBXCIgKyByb3dJbmRleF07XG4gICAgICAgIGlmIChjZWxsT2JqICYmIGNlbGxPYmoudiA9PT0gXCJOT1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOWNleS4quagvOWtkFxuICAgICAqIEBwYXJhbSB0YWJsZVBhcnNlUmVzdWx0XG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIGNvbEtleVxuICAgICAqIEBwYXJhbSByb3dJbmRleFxuICAgICAqIEBwYXJhbSBpc05ld1Jvd09yQ29sIOaYr+WQpuS4uuaWsOeahOS4gOihjOaIluiAheS4gOWIl1xuICAgICAqL1xuICAgIHBhcnNlVmVydGljYWxDZWxsKFxuICAgICAgICB0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgICAgIGNvbEtleTogc3RyaW5nLFxuICAgICAgICByb3dJbmRleDogbnVtYmVyLFxuICAgICAgICBpc05ld1Jvd09yQ29sOiBib29sZWFuXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpZWxkSW5mbyA9IHRoaXMuZ2V0VmVydGljYWxUYWJsZUZpZWxkKHRhYmxlUGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4KTtcbiAgICAgICAgaWYgKCFmaWVsZEluZm8pIHJldHVybjtcbiAgICAgICAgY29uc3QgY2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgcm93SW5kZXhdO1xuICAgICAgICBpZiAoaXNFbXB0eUNlbGwoY2VsbCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRyYW5zUmVzdWx0ID0gdGhpcy50cmFuc1ZhbHVlKHRhYmxlUGFyc2VSZXN1bHQsIGZpZWxkSW5mbywgY2VsbC52KTtcbiAgICAgICAgaWYgKHRyYW5zUmVzdWx0LmVycm9yKSB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKFxuICAgICAgICAgICAgICAgIGDooajmoLw6JHt0YWJsZVBhcnNlUmVzdWx0LmZpbGVQYXRofSzliIbooag6JHt0YWJsZVBhcnNlUmVzdWx0LmN1clNoZWV0TmFtZX0s6KGMOiR7cm93SW5kZXh9LOWIl++8miR7Y29sS2V5feino+aekOWHuumUmWAsXG4gICAgICAgICAgICAgICAgXCJlcnJvclwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyh0cmFuc1Jlc3VsdC5lcnJvciwgXCJlcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0cmFuc2VkVmFsdWUgPSB0cmFuc1Jlc3VsdC52YWx1ZTtcbiAgICAgICAgbGV0IG1haW5LZXlGaWVsZE5hbWU6IHN0cmluZyA9IHRhYmxlUGFyc2VSZXN1bHQubWFpbktleUZpZWxkTmFtZTtcbiAgICAgICAgaWYgKCFtYWluS2V5RmllbGROYW1lKSB7XG4gICAgICAgICAgICAvL+esrOS4gOS4quWtl+auteWwseaYr+S4u+mUrlxuICAgICAgICAgICAgbWFpbktleUZpZWxkTmFtZSA9IGZpZWxkSW5mby5maWVsZE5hbWU7XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0Lm1haW5LZXlGaWVsZE5hbWUgPSBmaWVsZEluZm8uZmllbGROYW1lO1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9iaiA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGxldCByb3dPckNvbE9iajogYW55ID0gdGFibGVQYXJzZVJlc3VsdC5jdXJSb3dPckNvbE9iajtcbiAgICAgICAgaWYgKGlzTmV3Um93T3JDb2wpIHtcbiAgICAgICAgICAgIC8v5paw55qE5LiA6KGMXG4gICAgICAgICAgICByb3dPckNvbE9iaiA9IHt9O1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5jdXJSb3dPckNvbE9iaiA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbdHJhbnNlZFZhbHVlXSA9IHJvd09yQ29sT2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkSW5mby5pc011dGlDb2xPYmopIHtcbiAgICAgICAgICAgIGxldCBzdWJPYmogPSByb3dPckNvbE9ialtmaWVsZEluZm8uZmllbGROYW1lXTtcbiAgICAgICAgICAgIGlmICghc3ViT2JqKSB7XG4gICAgICAgICAgICAgICAgc3ViT2JqID0ge307XG4gICAgICAgICAgICAgICAgcm93T3JDb2xPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSBzdWJPYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJPYmpbZmllbGRJbmZvLnN1YkZpZWxkTmFtZV0gPSB0cmFuc2VkVmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb3dPckNvbE9ialtmaWVsZEluZm8uZmllbGROYW1lXSA9IHRyYW5zZWRWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDmqKrlkJHljZXkuKrmoLzlrZBcbiAgICAgKiBAcGFyYW0gdGFibGVQYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKiBAcGFyYW0gcm93SW5kZXhcbiAgICAgKiBAcGFyYW0gaXNOZXdSb3dPckNvbCDmmK/lkKbkuLrmlrDnmoTkuIDooYzmiJbogIXkuIDliJdcbiAgICAgKi9cbiAgICBwYXJzZUhvcml6b250YWxDZWxsKFxuICAgICAgICB0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgICAgIGNvbEtleTogc3RyaW5nLFxuICAgICAgICByb3dJbmRleDogbnVtYmVyLFxuICAgICAgICBpc05ld1Jvd09yQ29sOiBib29sZWFuXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpZWxkSW5mbyA9IHRoaXMuZ2V0SG9yaXpvbnRhbFRhYmxlRmllbGQodGFibGVQYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgpO1xuICAgICAgICBpZiAoIWZpZWxkSW5mbykgcmV0dXJuO1xuICAgICAgICBjb25zdCBjZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyYW5zUmVzdWx0ID0gdGhpcy50cmFuc1ZhbHVlKHRhYmxlUGFyc2VSZXN1bHQsIGZpZWxkSW5mbywgY2VsbC52KTtcbiAgICAgICAgaWYgKHRyYW5zUmVzdWx0LmVycm9yKSB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKFxuICAgICAgICAgICAgICAgIGDooajmoLw6JHt0YWJsZVBhcnNlUmVzdWx0LmZpbGVQYXRofSzliIbooag6JHt0YWJsZVBhcnNlUmVzdWx0LmN1clNoZWV0TmFtZX0s6KGMOiR7cm93SW5kZXh9LOWIl++8miR7Y29sS2V5feino+aekOWHuumUmWAsXG4gICAgICAgICAgICAgICAgXCJlcnJvclwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyh0cmFuc1Jlc3VsdC5lcnJvciwgXCJlcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0cmFuc2VkVmFsdWUgPSB0cmFuc1Jlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKCF0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqKSB7XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpZWxkSW5mby5pc011dGlDb2xPYmopIHtcbiAgICAgICAgICAgIGxldCBzdWJPYmogPSB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdO1xuICAgICAgICAgICAgaWYgKCFzdWJPYmopIHtcbiAgICAgICAgICAgICAgICBzdWJPYmogPSB7fTtcbiAgICAgICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdID0gc3ViT2JqO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3ViT2JqW2ZpZWxkSW5mby5zdWJGaWVsZE5hbWVdID0gdHJhbnNlZFZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9ialtmaWVsZEluZm8uZmllbGROYW1lXSA9IHRyYW5zZWRWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDlh7rlrZfmrrXlr7nosaFcbiAgICAgKiBAcGFyYW0gdGFibGVQYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKiBAcGFyYW0gcm93SW5kZXhcbiAgICAgKi9cbiAgICBnZXRWZXJ0aWNhbFRhYmxlRmllbGQoXG4gICAgICAgIHRhYmxlUGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICAgICAgY29sS2V5OiBzdHJpbmcsXG4gICAgICAgIHJvd0luZGV4OiBudW1iZXJcbiAgICApOiBJVGFibGVGaWVsZCB7XG4gICAgICAgIGNvbnN0IHRhYmxlRGVmaW5lID0gdGFibGVQYXJzZVJlc3VsdC50YWJsZURlZmluZTtcbiAgICAgICAgbGV0IHRhYmxlRmlsZWRNYXAgPSB0YWJsZVBhcnNlUmVzdWx0LmZpbGVkTWFwO1xuICAgICAgICBpZiAoIXRhYmxlRmlsZWRNYXApIHtcbiAgICAgICAgICAgIHRhYmxlRmlsZWRNYXAgPSB7fTtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQuZmlsZWRNYXAgPSB0YWJsZUZpbGVkTWFwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZlcnRpY2FsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS52ZXJ0aWNhbEZpZWxkRGVmaW5lO1xuICAgICAgICBjb25zdCBmaWxlZENlbGwgPSBzaGVldFtjb2xLZXkgKyB2ZXJ0aWNhbEZpZWxkRGVmaW5lLmZpZWxkUm93XTtcbiAgICAgICAgbGV0IG9yaWdpbkZpZWxkTmFtZTogc3RyaW5nO1xuICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGZpbGVkQ2VsbCkpIHtcbiAgICAgICAgICAgIG9yaWdpbkZpZWxkTmFtZSA9IGZpbGVkQ2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW9yaWdpbkZpZWxkTmFtZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBmaWVsZDogSVRhYmxlRmllbGQgPSB7fSBhcyBhbnk7XG4gICAgICAgIC8v57yT5a2YXG4gICAgICAgIGlmICh0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXTtcbiAgICAgICAgfVxuICAgICAgICAvL+azqOmHilxuICAgICAgICBjb25zdCB0ZXh0Q2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS50ZXh0Um93XTtcbiAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbCh0ZXh0Q2VsbCkpIHtcbiAgICAgICAgICAgIGZpZWxkLnRleHQgPSB0ZXh0Q2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgfVxuICAgICAgICAvL+exu+Wei1xuICAgICAgICBsZXQgaXNPYmpUeXBlOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHR5cGVDZWxsID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS50eXBlUm93XTtcblxuICAgICAgICBpZiAoaXNFbXB0eUNlbGwodHlwZUNlbGwpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZWxkLm9yaWdpblR5cGUgPSB0eXBlQ2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgICAgIGlmIChmaWVsZC5vcmlnaW5UeXBlLmluY2x1ZGVzKFwibWY6XCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZVN0cnMgPSBmaWVsZC5vcmlnaW5UeXBlLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZVN0cnMubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmllbGQudHlwZSA9IHR5cGVTdHJzWzJdO1xuICAgICAgICAgICAgICAgIGlzT2JqVHlwZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpZWxkLnR5cGUgPSBmaWVsZC5vcmlnaW5UeXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpZWxkLmlzTXV0aUNvbE9iaiA9IGlzT2JqVHlwZTtcbiAgICAgICAgLy/lrZfmrrXlkI1cbiAgICAgICAgZmllbGQub3JpZ2luRmllbGROYW1lID0gb3JpZ2luRmllbGROYW1lO1xuICAgICAgICBpZiAoaXNPYmpUeXBlKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZFN0cnMgPSBmaWVsZC5vcmlnaW5GaWVsZE5hbWUuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgaWYgKGZpZWxkU3Rycy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWVsZC5maWVsZE5hbWUgPSBmaWVsZFN0cnNbMF07XG4gICAgICAgICAgICBmaWVsZC5zdWJGaWVsZE5hbWUgPSBmaWVsZFN0cnNbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZC5maWVsZE5hbWUgPSBmaWVsZC5vcmlnaW5GaWVsZE5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICB0YWJsZUZpbGVkTWFwW2NvbEtleV0gPSBmaWVsZDtcbiAgICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH1cbiAgICBnZXRIb3Jpem9udGFsVGFibGVGaWVsZChcbiAgICAgICAgdGFibGVQYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsXG4gICAgICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgICAgICBjb2xLZXk6IHN0cmluZyxcbiAgICAgICAgcm93SW5kZXg6IG51bWJlclxuICAgICk6IElUYWJsZUZpZWxkIHtcbiAgICAgICAgY29uc3QgdGFibGVEZWZpbmUgPSB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lO1xuICAgICAgICBsZXQgdGFibGVGaWxlZE1hcCA9IHRhYmxlUGFyc2VSZXN1bHQuZmlsZWRNYXA7XG4gICAgICAgIGlmICghdGFibGVGaWxlZE1hcCkge1xuICAgICAgICAgICAgdGFibGVGaWxlZE1hcCA9IHt9O1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5maWxlZE1hcCA9IHRhYmxlRmlsZWRNYXA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUuaG9yaXpvbnRhbEZpZWxkRGVmaW5lO1xuICAgICAgICBjb25zdCBmaWVsZE5hbWVDZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtoRmllbGREZWZpbmUuZmllbGRDb2wgKyByb3dJbmRleF07XG4gICAgICAgIGxldCBvcmlnaW5GaWVsZE5hbWU6IHN0cmluZztcbiAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChmaWVsZE5hbWVDZWxsKSkge1xuICAgICAgICAgICAgb3JpZ2luRmllbGROYW1lID0gZmllbGROYW1lQ2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW9yaWdpbkZpZWxkTmFtZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICh0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZmllbGQ6IElUYWJsZUZpZWxkID0ge30gYXMgYW55O1xuXG4gICAgICAgIGNvbnN0IHRleHRDZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtoRmllbGREZWZpbmUudGV4dENvbCArIHJvd0luZGV4XTtcbiAgICAgICAgLy/ms6jph4pcbiAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbCh0ZXh0Q2VsbCkpIHtcbiAgICAgICAgICAgIGZpZWxkLnRleHQgPSB0ZXh0Q2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgfVxuICAgICAgICBsZXQgaXNPYmpUeXBlOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIC8v57G75Z6LXG4gICAgICAgIGNvbnN0IHR5cGVDZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtoRmllbGREZWZpbmUudHlwZUNvbCArIHJvd0luZGV4XTtcblxuICAgICAgICBpZiAoaXNFbXB0eUNlbGwodHlwZUNlbGwpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v5aSE55CG57G75Z6LXG4gICAgICAgICAgICBmaWVsZC5vcmlnaW5UeXBlID0gdHlwZUNlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgICAgICBpZiAoZmllbGQub3JpZ2luVHlwZS5pbmNsdWRlcyhcIm1mOlwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVTdHJzID0gZmllbGQub3JpZ2luVHlwZS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVTdHJzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpZWxkLnR5cGUgPSB0eXBlU3Ryc1syXTtcbiAgICAgICAgICAgICAgICBpc09ialR5cGUgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gZmllbGQub3JpZ2luVHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWVsZC5pc011dGlDb2xPYmogPSBpc09ialR5cGU7XG4gICAgICAgIGZpZWxkLm9yaWdpbkZpZWxkTmFtZSA9IG9yaWdpbkZpZWxkTmFtZTtcbiAgICAgICAgaWYgKGlzT2JqVHlwZSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTdHJzID0gZmllbGQub3JpZ2luRmllbGROYW1lLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgIGlmIChmaWVsZFN0cnMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmllbGQuZmllbGROYW1lID0gZmllbGRTdHJzWzBdO1xuICAgICAgICAgICAgZmllbGQuc3ViRmllbGROYW1lID0gZmllbGRTdHJzWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmllbGQuZmllbGROYW1lID0gZmllbGQub3JpZ2luRmllbGROYW1lO1xuICAgICAgICB9XG4gICAgICAgIHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXSA9IGZpZWxkO1xuICAgICAgICByZXR1cm4gZmllbGQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOajgOafpeWIl+aYr+WQpumcgOimgeino+aekFxuICAgICAqIEBwYXJhbSB0YWJsZURlZmluZVxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKi9cbiAgICBjaGVja0NvbE5lZWRQYXJzZSh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgLy8g5aaC5p6c57G75Z6L5oiW6ICF5YiZ5LiN6ZyA6KaB6Kej5p6QXG4gICAgICAgIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xuICAgICAgICAgICAgY29uc3QgdmVydGljYWxGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLnZlcnRpY2FsRmllbGREZWZpbmU7XG4gICAgICAgICAgICBjb25zdCB0eXBlQ2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS50eXBlUm93XTtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkQ2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS5maWVsZFJvd107XG4gICAgICAgICAgICBpZiAoaXNFbXB0eUNlbGwodHlwZUNlbGxPYmopIHx8IGlzRW1wdHlDZWxsKGZpZWxkQ2VsbE9iaikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIDFdO1xuICAgICAgICAgICAgaWYgKGlzRW1wdHlDZWxsKGNlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDovazmjaLooajmoLznmoTlgLxcbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gZmlsZWRJdGVtXG4gICAgICogQHBhcmFtIGNlbGxWYWx1ZVxuICAgICAqL1xuICAgIHB1YmxpYyB0cmFuc1ZhbHVlKHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCwgZmlsZWRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBhbnkpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgICAgIGxldCB0cmFuc1Jlc3VsdDogSVRyYW5zVmFsdWVSZXN1bHQ7XG5cbiAgICAgICAgbGV0IHRyYW5zRnVuYyA9IHRoaXMuX3ZhbHVlVHJhbnNGdW5jTWFwW2ZpbGVkSXRlbS50eXBlXTtcbiAgICAgICAgaWYgKCF0cmFuc0Z1bmMpIHtcbiAgICAgICAgICAgIHRyYW5zRnVuYyA9IHRoaXMuX3ZhbHVlVHJhbnNGdW5jTWFwW1wianNvblwiXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc1Jlc3VsdCA9IHRyYW5zRnVuYyhmaWxlZEl0ZW0sIGNlbGxWYWx1ZSk7XG4gICAgICAgIHJldHVybiB0cmFuc1Jlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDop6PmnpDphY3nva7ooajmlofku7ZcbiAgICAgKiBAcGFyYW0gZmlsZUluZm9cbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHQg6Kej5p6Q57uT5p6cXG4gICAgICovXG4gICAgcHVibGljIHBhcnNlVGFibGVGaWxlKGZpbGVJbmZvOiBJRmlsZUluZm8sIHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCk6IElUYWJsZVBhcnNlUmVzdWx0IHtcbiAgICAgICAgY29uc3Qgd29ya2Jvb2sgPSByZWFkVGFibGVGaWxlKGZpbGVJbmZvKTtcbiAgICAgICAgaWYgKCF3b3JrYm9vay5TaGVldE5hbWVzLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNoZWV0TmFtZXMgPSB3b3JrYm9vay5TaGVldE5hbWVzO1xuICAgICAgICBjb25zdCB0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lID0gdGhpcy5nZXRUYWJsZURlZmluZShmaWxlSW5mbywgd29ya2Jvb2spO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHt9XG4gICAgICAgIGlmICghdGFibGVEZWZpbmUpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgc2hlZXROYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBzaGVldDogeGxzeC5TaGVldDtcbiAgICAgICAgY29uc3QgaXNTaGVldFJvd0VuZCA9IHRoaXMuaXNTaGVldFJvd0VuZC5iaW5kKG51bGwsIHRhYmxlRGVmaW5lKTtcbiAgICAgICAgY29uc3QgaXNTaGVldENvbEVuZCA9IHRoaXMuaXNTaGVldENvbEVuZC5iaW5kKG51bGwsIHRhYmxlRGVmaW5lKTtcbiAgICAgICAgY29uc3QgaXNTa2lwU2hlZXRSb3cgPSAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5jaGVja1Jvd05lZWRQYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIHJvd0luZGV4KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaXNTa2lwU2hlZXRDb2wgPSAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRoaXMuY2hlY2tDb2xOZWVkUGFyc2UodGFibGVEZWZpbmUsIHNoZWV0LCBjb2xLZXkpO1xuICAgICAgICB9O1xuICAgICAgICBsZXQgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0O1xuICAgICAgICBwYXJzZVJlc3VsdC50YWJsZURlZmluZSA9IHRhYmxlRGVmaW5lO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNoZWV0TmFtZSA9IHNoZWV0TmFtZXNbaV07XG4gICAgICAgICAgICBzaGVldCA9IHdvcmtib29rLlNoZWV0c1tzaGVldE5hbWVdO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNoZWNrU2hlZXRDYW5QYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIHNoZWV0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnNlUmVzdWx0LmN1clNoZWV0TmFtZSA9IHNoZWV0TmFtZTtcbiAgICAgICAgICAgIExvZ2dlci5sb2coYOino+aekDoke2ZpbGVJbmZvLmZpbGVQYXRofT0+IHNoZWV0OiR7c2hlZXROYW1lfSAuLi4uYCk7XG4gICAgICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcbiAgICAgICAgICAgICAgICBsZXQgbGFzdFJvd0luZGV4OiBudW1iZXI7XG5cbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbEZvckVhY2hTaGVldChcbiAgICAgICAgICAgICAgICAgICAgc2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Um93LFxuICAgICAgICAgICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydENvbCxcbiAgICAgICAgICAgICAgICAgICAgKHNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlzTmV3Um93T3JDb2wgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXN0Um93SW5kZXggIT09IHJvd0luZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFJvd0luZGV4ID0gcm93SW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNOZXdSb3dPckNvbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxsT2JqID0gc2hlZXRbY29sS2V5ICsgcm93SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChjZWxsT2JqKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyc2VWZXJ0aWNhbENlbGwocGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4LCBpc05ld1Jvd09yQ29sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldFJvd0VuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldENvbEVuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTa2lwU2hlZXRSb3csXG4gICAgICAgICAgICAgICAgICAgIGlzU2tpcFNoZWV0Q29sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuICAgICAgICAgICAgICAgIGxldCBsYXN0Q29sS2V5OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICBob3Jpem9udGFsRm9yRWFjaFNoZWV0KFxuICAgICAgICAgICAgICAgICAgICBzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3csXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Q29sLFxuICAgICAgICAgICAgICAgICAgICAoc2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNOZXdSb3dPckNvbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RDb2xLZXkgIT09IGNvbEtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb2xLZXkgPSBjb2xLZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNOZXdSb3dPckNvbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxPYmogPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGNlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJzZUhvcml6b250YWxDZWxsKHBhcnNlUmVzdWx0LCBzaGVldCwgY29sS2V5LCByb3dJbmRleCwgaXNOZXdSb3dPckNvbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGlzU2hlZXRSb3dFbmQsXG4gICAgICAgICAgICAgICAgICAgIGlzU2hlZXRDb2xFbmQsXG4gICAgICAgICAgICAgICAgICAgIGlzU2tpcFNoZWV0Um93LFxuICAgICAgICAgICAgICAgICAgICBpc1NraXBTaGVldENvbFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VSZXN1bHQgYXMgYW55O1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJvcy5wbGF0Zm9ybSIsInBhdGguam9pbiIsIlRhYmxlVHlwZSIsIkJhc2U2NCIsImRlZmxhdGVTeW5jIiwiZnMuc3RhdFN5bmMiLCJmcy5yZWFkZGlyU3luYyIsImZzLmV4aXN0c1N5bmMiLCJmcy51bmxpbmtTeW5jIiwiZnMuZW5zdXJlRmlsZVN5bmMiLCJmcy53cml0ZUZpbGUiLCJmcy53cml0ZUZpbGVTeW5jIiwiZnMucmVhZEZpbGVTeW5jIiwiY3J5cHRvLmNyZWF0ZUhhc2giLCJwYXRoLnBhcnNlIiwibW1hdGNoLmFsbCIsInBhdGguaXNBYnNvbHV0ZSIsIldvcmtlciIsInBhdGguZGlybmFtZSIsInBhdGgucmVzb2x2ZSIsInhsc3gucmVhZEZpbGUiXSwi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
