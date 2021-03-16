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
 * 转换
 * @param converConfig 解析配置
 */
function convert(converConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!converConfig.projRoot) {
            converConfig.projRoot = process.cwd();
        }
        let trans2FileHandler;
        if (converConfig.customTrans2FileHandlerPath) {
            trans2FileHandler = require(converConfig.customTrans2FileHandlerPath);
            if (!trans2FileHandler || typeof trans2FileHandler.trans2Files !== "function") {
                console.error(`自定义转换实现错误:${converConfig.customTrans2FileHandlerPath}`);
                return;
            }
        }
        else {
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
        else if (converConfig.pattern && typeof converConfig.pattern === "object") {
            for (let i = 0; i < defaultPattern.length; i++) {
                if (!converConfig.pattern.includes(defaultPattern[i])) {
                    converConfig.pattern.push(defaultPattern[i]);
                }
            }
        }
        if (converConfig.useMultiThread && isNaN(converConfig.threadParseFileMaxNum)) {
            converConfig.threadParseFileMaxNum = 5;
        }
        Logger.init(converConfig);
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
                    fileInfos.push(fileInfo);
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
        if (fileInfos.length > converConfig.threadParseFileMaxNum && converConfig.useMultiThread) {
            let logStr = "";
            const count = Math.floor(fileInfos.length / converConfig.threadParseFileMaxNum) + 1;
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
                    writeFiles(converConfig, parseResultMapCacheFilePath, trans2FileHandler, fileInfos, deleteFileInfos, parseResultMap, logStr);
                }
            };
            for (let i = 0; i < count; i++) {
                subFileInfos = fileInfos.splice(0, converConfig.threadParseFileMaxNum);
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
            doParse(converConfig, fileInfos, parseResultMap, parseHandler);
            const t2 = new Date().getTime();
            Logger.log(`[单线程导表时间]:${t2 - t1}`);
            writeFiles(converConfig, parseResultMapCacheFilePath, trans2FileHandler, fileInfos, deleteFileInfos, parseResultMap, Logger.logStr);
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
exports.valueTransFuncMap = valueTransFuncMap;
exports.verticalForEachSheet = verticalForEachSheet;
exports.writeCacheData = writeCacheData;
exports.writeOrDeleteOutPutFiles = writeOrDeleteOutPutFiles;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9nZXQtb3MtZW9sLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdHJhbnMyZmlsZS1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdmFsdWUtZnVuYy1tYXAudHMiLCIuLi8uLi8uLi9zcmMvZG8tcGFyc2UudHMiLCIuLi8uLi8uLi9zcmMvbG9nZXIudHMiLCIuLi8uLi8uLi9zcmMvZmlsZS11dGlscy50cyIsIi4uLy4uLy4uL3NyYy9jb252ZXJ0LnRzIiwiLi4vLi4vLi4vc3JjL3RhYmxlLXV0aWxzLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtcGFyc2UtaGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBvcyBmcm9tIFwib3NcIjtcbmNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbi8qKuW9k+WJjeezu+e7n+ihjOWwviAgcGxhdGZvcm0gPT09IFwid2luMzJcIiA/IFwiXFxuXCIgOiBcIlxcclxcblwiOyovXG5leHBvcnQgY29uc3Qgb3NFb2wgPSBwbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiID8gXCJcXG5cIiA6IFwiXFxyXFxuXCI7XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQge1RhYmxlVHlwZX0gZnJvbSBcIi4vZGVmYXVsdC1wYXJzZS1oYW5kbGVyXCI7XG5pbXBvcnQge0Jhc2U2NH0gZnJvbSBcImpzLWJhc2U2NFwiO1xuaW1wb3J0IHtkZWZsYXRlU3luY30gZnJvbSBcInpsaWJcIjtcbmltcG9ydCB7b3NFb2x9IGZyb20gXCIuL2dldC1vcy1lb2xcIjtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICAvKipcbiAgICAgKiDovpPlh7rphY3nva5cbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSU91dHB1dENvbmZpZyB7XG4gICAgICAgIC8qKuWNleS4qumFjee9ruihqGpzb27ovpPlh7rnm67lvZXot6/lvoTvvIzpu5jorqTovpPlh7rliLDlvZPliY3miafooYznm67lvZXkuIvnmoQuL2V4Y2VsSnNvbk91dCAqL1xuICAgICAgICBjbGllbnRTaW5nbGVUYWJsZUpzb25EaXI6IHN0cmluZztcbiAgICAgICAgLyoq5ZCI5bm26YWN572u6KGoanNvbui+k+WHuui3r+W+hCjljIXlkKvmlofku7blkI0p77yM5aaC5p6c5LiN6YWN572u5YiZ5LiN5ZCI5bm2anNvbiAqL1xuICAgICAgICBjbGllbnRCdW5kbGVKc29uT3V0UGF0aD86IHN0cmluZztcbiAgICAgICAgLyoq5piv5ZCm5qC85byP5YyW5ZCI5bm25ZCO55qEanNvbu+8jOm7mOiupOS4jSAqL1xuICAgICAgICBpc0Zvcm1hdEJ1bmRsZUpzb24/OiBib29sZWFuO1xuICAgICAgICAvKirmmK/lkKbnlJ/miJDlo7DmmI7mlofku7bvvIzpu5jorqTkuI3ovpPlh7ogKi9cbiAgICAgICAgaXNHZW5EdHM/OiBib29sZWFuO1xuICAgICAgICAvKirlo7DmmI7mlofku7bovpPlh7rnm67lvZUo5q+P5Liq6YWN572u6KGo5LiA5Liq5aOw5piOKe+8jOm7mOiupOS4jei+k+WHuiAqL1xuICAgICAgICBjbGllbnREdHNPdXREaXI/OiBzdHJpbmc7XG4gICAgICAgIC8qKuaYr+WQpuWQiOW5tuaJgOacieWjsOaYjuS4uuS4gOS4quaWh+S7tizpu5jorqR0cnVlICovXG4gICAgICAgIGlzQnVuZGxlRHRzPzogYm9vbGVhbjtcbiAgICAgICAgLyoq5ZCI5bm25ZCO55qE5aOw5piO5paH5Lu25ZCNICovXG4gICAgICAgIGJ1bmRsZUR0c0ZpbGVOYW1lPzogc3RyaW5nO1xuICAgICAgICAvKirmmK/lkKblsIZqc29u5qC85byP5Y6L57ypLOm7mOiupOWQpizlh4/lsJFqc29u5a2X5q615ZCN5a2X56ymLOaViOaenOi+g+WwjyAqL1xuICAgICAgICBpc0NvbXByZXNzPzogYm9vbGVhbjtcbiAgICAgICAgLyoq5piv5ZCmWmlw5Y6L57ypLOS9v+eUqHpsaWIgKi9cbiAgICAgICAgaXNaaXA/OiBib29sZWFuO1xuICAgICAgICAvKirmmK/lkKblsIbovpPlh7rnmoTlkIjlubZqc29u6L2s5Li6YmFzZTY077yM6buY6K6k5ZCmKi9cbiAgICAgICAgYnVuZGxlSnNvbklzRW5jb2RlMkJhc2U2ND86IGJvb2xlYW47XG4gICAgICAgIC8qKuWKoOWvhua3t+a3huWtl+espuS4suWJjee8gCAqL1xuICAgICAgICBwcmVCYXNlNjRVZ2x5U3RyaW5nPzogc3RyaW5nO1xuICAgICAgICAvKirliqDlr4bmt7fmt4blrZfnrKbkuLLlkI7nvIAgKi9cbiAgICAgICAgc3VmQmFzZTY0VWdseVN0cmluZz86IHN0cmluZztcbiAgICB9XG59XG4vKirnsbvlnovlrZfnrKbkuLLmmKDlsITlrZflhbggKi9cbmNvbnN0IHR5cGVTdHJNYXAgPSB7aW50OiBcIm51bWJlclwiLCBqc29uOiBcImFueVwiLCBcIltpbnRdXCI6IFwibnVtYmVyW11cIiwgXCJbc3RyaW5nXVwiOiBcInN0cmluZ1tdXCJ9O1xuZXhwb3J0IGNsYXNzIFRyYW5zMkpzb25BbmREdHNIYW5kbGVyIGltcGxlbWVudHMgSVRyYW5zUmVzdWx0MkFueUZpbGVIYW5kbGVyIHtcbiAgICB0cmFuczJGaWxlcyhcbiAgICAgICAgcGFyc2VDb25maWc6IElUYWJsZUNvbnZlcnRDb25maWcsXG4gICAgICAgIGNoYW5nZWRGaWxlSW5mb3M6IElGaWxlSW5mb1tdLFxuICAgICAgICBkZWxldGVGaWxlSW5mb3M6IElGaWxlSW5mb1tdLFxuICAgICAgICBwYXJzZVJlc3VsdE1hcDogVGFibGVQYXJzZVJlc3VsdE1hcFxuICAgICk6IE91dFB1dEZpbGVNYXAge1xuICAgICAgICBsZXQgb3V0cHV0Q29uZmlnOiBJT3V0cHV0Q29uZmlnID0gcGFyc2VDb25maWcub3V0cHV0Q29uZmlnO1xuICAgICAgICBpZiAoIW91dHB1dENvbmZpZykge1xuICAgICAgICAgICAgb3V0cHV0Q29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGNsaWVudFNpbmdsZVRhYmxlSnNvbkRpcjogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIFwiLi9leGNlbEpzb25PdXRcIilcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGFibGVPYmpNYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgICAgIGxldCBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwID0ge307XG4gICAgICAgIGxldCB0YWJsZVR5cGVNYXBEdHNTdHIgPSBcIlwiO1xuICAgICAgICBsZXQgdGFibGVUeXBlRHRzU3RycyA9IFwiXCI7XG4gICAgICAgIGxldCBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQ7XG4gICAgICAgIGxldCB0YWJsZU5hbWU6IHN0cmluZztcbiAgICAgICAgbGV0IHRhYmxlT2JqOiBhbnk7XG4gICAgICAgIGxldCBvYmpUeXBlVGFibGVNYXA6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHt9O1xuICAgICAgICBmb3IgKGxldCBmaWxlUGF0aCBpbiBwYXJzZVJlc3VsdE1hcCkge1xuICAgICAgICAgICAgcGFyc2VSZXN1bHQgPSBwYXJzZVJlc3VsdE1hcFtmaWxlUGF0aF07XG4gICAgICAgICAgICBpZiAoIXBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lKSBjb250aW51ZTtcbiAgICAgICAgICAgIHRhYmxlTmFtZSA9IHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlTmFtZTtcbiAgICAgICAgICAgIGlmIChwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICAgICAgdGFibGVUeXBlTWFwRHRzU3RyICs9IFwiXFx0cmVhZG9ubHkgXCIgKyB0YWJsZU5hbWUgKyBcIj86IFwiICsgYElUXyR7dGFibGVOYW1lfTtgICsgb3NFb2w7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhYmxlVHlwZU1hcER0c1N0ciArPSB0aGlzLl9nZXRPbmVUYWJsZVR5cGVTdHIodGFibGVOYW1lKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/lkIjlubblpJrkuKrlkIzlkI3ooahcbiAgICAgICAgICAgIHRhYmxlT2JqID0gdGFibGVPYmpNYXBbdGFibGVOYW1lXTtcbiAgICAgICAgICAgIGlmICh0YWJsZU9iaikge1xuICAgICAgICAgICAgICAgIHRhYmxlT2JqID0gT2JqZWN0LmFzc2lnbih0YWJsZU9iaiwgcGFyc2VSZXN1bHQudGFibGVPYmopO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YWJsZU9iaiA9IHBhcnNlUmVzdWx0LnRhYmxlT2JqO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFibGVPYmpNYXBbdGFibGVOYW1lXSA9IHRhYmxlT2JqO1xuICAgICAgICAgICAgb2JqVHlwZVRhYmxlTWFwW3RhYmxlTmFtZV0gPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsO1xuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0dlbkR0cykge1xuICAgICAgICAgICAgICAgIC8v6L6T5Ye65Y2V5Liq5paH5Lu2XG4gICAgICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0J1bmRsZUR0cyA9PT0gdW5kZWZpbmVkKSBvdXRwdXRDb25maWcuaXNCdW5kbGVEdHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICghb3V0cHV0Q29uZmlnLmlzQnVuZGxlRHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFNpbmdsZVRhYmxlRHRzT3V0cHV0RmlsZShvdXRwdXRDb25maWcsIHBhcnNlUmVzdWx0LCBvdXRwdXRGaWxlTWFwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YWJsZVR5cGVEdHNTdHJzICs9IHRoaXMuX2dldFNpbmdsZVRhYmxlRHRzKHBhcnNlUmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v55Sf5oiQ5Y2V5Liq6KGoanNvblxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5jbGllbnRTaW5nbGVUYWJsZUpzb25EaXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRTaW5nbGVUYWJsZUpzb25PdXRwdXRGaWxlKG91dHB1dENvbmZpZywgcGFyc2VSZXN1bHQsIG91dHB1dEZpbGVNYXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNHZW5EdHMpIHtcbiAgICAgICAgICAgIC8v6L6T5Ye65aOw5piO5paH5Lu2XG4gICAgICAgICAgICBsZXQgaXRCYXNlU3RyID0gXCJpbnRlcmZhY2UgSVRCYXNlPFQ+IHsgW2tleTpzdHJpbmddOlR9XCIgKyBvc0VvbDtcblxuICAgICAgICAgICAgdGFibGVUeXBlTWFwRHRzU3RyID0gaXRCYXNlU3RyICsgXCJpbnRlcmZhY2UgSVRfVGFibGVNYXAge1wiICsgb3NFb2wgKyB0YWJsZVR5cGVNYXBEdHNTdHIgKyBcIn1cIiArIG9zRW9sO1xuXG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzQnVuZGxlRHRzKSB7XG4gICAgICAgICAgICAgICAgLy/lkIjmiJDkuIDkuKrmlofku7ZcbiAgICAgICAgICAgICAgICBjb25zdCBkdHNGaWxlTmFtZSA9IG91dHB1dENvbmZpZy5idW5kbGVEdHNGaWxlTmFtZSA/IG91dHB1dENvbmZpZy5idW5kbGVEdHNGaWxlTmFtZSA6IFwidGFibGVNYXBcIjtcbiAgICAgICAgICAgICAgICBjb25zdCBidW5kbGVEdHNGaWxlUGF0aCA9IHBhdGguam9pbihvdXRwdXRDb25maWcuY2xpZW50RHRzT3V0RGlyLCBgJHtkdHNGaWxlTmFtZX0uZC50c2ApO1xuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbYnVuZGxlRHRzRmlsZVBhdGhdID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogYnVuZGxlRHRzRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhYmxlVHlwZU1hcER0c1N0ciArIHRhYmxlVHlwZUR0c1N0cnNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL+aLhuWIhuaWh+S7tui+k+WHulxuICAgICAgICAgICAgICAgIGNvbnN0IHRhYmxlVHlwZU1hcER0c0ZpbGVQYXRoID0gcGF0aC5qb2luKG91dHB1dENvbmZpZy5jbGllbnREdHNPdXREaXIsIFwidGFibGVNYXAuZC50c1wiKTtcbiAgICAgICAgICAgICAgICBvdXRwdXRGaWxlTWFwW3RhYmxlVHlwZU1hcER0c0ZpbGVQYXRoXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IHRhYmxlVHlwZU1hcER0c0ZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YWJsZVR5cGVNYXBEdHNTdHJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9qc29uQnVuZGxlRmlsZVxuICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmNsaWVudEJ1bmRsZUpzb25PdXRQYXRoKSB7XG4gICAgICAgICAgICBsZXQganNvbkJ1bmRsZUZpbGVQYXRoID0gb3V0cHV0Q29uZmlnLmNsaWVudEJ1bmRsZUpzb25PdXRQYXRoO1xuICAgICAgICAgICAgbGV0IG91dHB1dERhdGE6IGFueTtcbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNDb21wcmVzcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RhYmxlT2JqTWFwID0ge307XG4gICAgICAgICAgICAgICAgbGV0IHRhYmxlT2JqOiBhbnk7XG4gICAgICAgICAgICAgICAgbGV0IG5ld1RhYmxlT2JqOiBhbnk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdGFibGVOYW1lIGluIHRhYmxlT2JqTWFwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmpUeXBlVGFibGVNYXBbdGFibGVOYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VGFibGVPYmpNYXBbdGFibGVOYW1lXSA9IHRhYmxlT2JqTWFwW3RhYmxlTmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0YWJsZU9iaiA9IHRhYmxlT2JqTWFwW3RhYmxlTmFtZV07XG4gICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqID0ge2ZpZWxkVmFsdWVzTWFwOiB7fX07XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1haW5LZXkgaW4gdGFibGVPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmV3VGFibGVPYmouZmllbGROYW1lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqLmZpZWxkTmFtZXMgPSBPYmplY3Qua2V5cyh0YWJsZU9ialttYWluS2V5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iai5maWVsZFZhbHVlc01hcFttYWluS2V5XSA9IE9iamVjdC52YWx1ZXModGFibGVPYmpbbWFpbktleV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSBuZXdUYWJsZU9iajtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IEpTT04uc3RyaW5naWZ5KG5ld1RhYmxlT2JqTWFwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IEpTT04uc3RyaW5naWZ5KHRhYmxlT2JqTWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuYnVuZGxlSnNvbklzRW5jb2RlMkJhc2U2NCkge1xuICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBCYXNlNjQuZW5jb2RlKG91dHB1dERhdGEpO1xuICAgICAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcucHJlQmFzZTY0VWdseVN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXREYXRhID0gb3V0cHV0Q29uZmlnLnByZUJhc2U2NFVnbHlTdHJpbmcgKyBvdXRwdXREYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLnN1ZkJhc2U2NFVnbHlTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0RGF0YSArPSBvdXRwdXRDb25maWcuc3VmQmFzZTY0VWdseVN0cmluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzWmlwKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IGRlZmxhdGVTeW5jKG91dHB1dERhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0cHV0RmlsZU1hcFtqc29uQnVuZGxlRmlsZVBhdGhdID0ge1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBqc29uQnVuZGxlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgZW5jb2Rpbmc6IHR5cGVvZiBvdXRwdXREYXRhICE9PSBcInN0cmluZ1wiID8gXCJiaW5hcnlcIiA6IFwidXRmLThcIixcbiAgICAgICAgICAgICAgICBkYXRhOiBvdXRwdXREYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXRGaWxlTWFwO1xuICAgIH1cbiAgICBwcml2YXRlIF9hZGRTaW5nbGVUYWJsZUR0c091dHB1dEZpbGUoXG4gICAgICAgIGNvbmZpZzogSU91dHB1dENvbmZpZyxcbiAgICAgICAgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwXG4gICAgKTogdm9pZCB7XG4gICAgICAgIC8v5aaC5p6c5YC85rKh5pyJ5bCx5LiN6L6T5Ye657G75Z6L5L+h5oGv5LqGXG4gICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVPYmopIHJldHVybjtcbiAgICAgICAgbGV0IGR0c0ZpbGVQYXRoOiBzdHJpbmcgPSBwYXRoLmpvaW4oY29uZmlnLmNsaWVudER0c091dERpciwgYCR7cGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lfS5kLnRzYCk7XG5cbiAgICAgICAgaWYgKCFvdXRwdXRGaWxlTWFwW2R0c0ZpbGVQYXRoXSkge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIGNvbnN0IGR0c1N0ciA9IHRoaXMuX2dldFNpbmdsZVRhYmxlRHRzKHBhcnNlUmVzdWx0KTtcbiAgICAgICAgICAgIGlmIChkdHNTdHIpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRGaWxlTWFwW2R0c0ZpbGVQYXRoXSA9IHtmaWxlUGF0aDogZHRzRmlsZVBhdGgsIGRhdGE6IGR0c1N0cn0gYXMgYW55O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOWHuuWNleS4qumFjee9ruihqOexu+Wei+aVsOaNrlxuICAgICAqIEBwYXJhbSBwYXJzZVJlc3VsdFxuICAgICAqL1xuICAgIHByaXZhdGUgX2dldFNpbmdsZVRhYmxlRHRzKHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHRhYmxlTmFtZSA9IHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlTmFtZTtcblxuICAgICAgICBjb25zdCBjb2xLZXlUYWJsZUZpZWxkTWFwOiBDb2xLZXlUYWJsZUZpZWxkTWFwID0gcGFyc2VSZXN1bHQuZmlsZWRNYXA7XG4gICAgICAgIGxldCBpdGVtSW50ZXJmYWNlID0gXCJpbnRlcmZhY2UgSVRfXCIgKyB0YWJsZU5hbWUgKyBcIiB7XCIgKyBvc0VvbDtcbiAgICAgICAgbGV0IHRhYmxlRmllbGQ6IElUYWJsZUZpZWxkO1xuICAgICAgICBsZXQgdHlwZVN0cjogc3RyaW5nO1xuICAgICAgICBsZXQgb2JqVHlwZVN0ck1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcblxuICAgICAgICBmb3IgKGxldCBjb2xLZXkgaW4gY29sS2V5VGFibGVGaWVsZE1hcCkge1xuICAgICAgICAgICAgdGFibGVGaWVsZCA9IGNvbEtleVRhYmxlRmllbGRNYXBbY29sS2V5XTtcbiAgICAgICAgICAgIGlmICghdGFibGVGaWVsZCkgY29udGludWU7XG4gICAgICAgICAgICBpZiAoIXRhYmxlRmllbGQuaXNNdXRpQ29sT2JqKSB7XG4gICAgICAgICAgICAgICAgLy/ms6jph4rooYxcbiAgICAgICAgICAgICAgICBpdGVtSW50ZXJmYWNlICs9IFwiXFx0LyoqIFwiICsgdGFibGVGaWVsZC50ZXh0ICsgXCIgKi9cIiArIG9zRW9sO1xuICAgICAgICAgICAgICAgIC8v5a2X5q6157G75Z6L5aOw5piO6KGMXG4gICAgICAgICAgICAgICAgaXRlbUludGVyZmFjZSArPVxuICAgICAgICAgICAgICAgICAgICBcIlxcdHJlYWRvbmx5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVGaWVsZC5maWVsZE5hbWUgK1xuICAgICAgICAgICAgICAgICAgICBcIj86IFwiICtcbiAgICAgICAgICAgICAgICAgICAgKHR5cGVTdHJNYXBbdGFibGVGaWVsZC50eXBlXSA/IHR5cGVTdHJNYXBbdGFibGVGaWVsZC50eXBlXSA6IHRhYmxlRmllbGQudHlwZSkgK1xuICAgICAgICAgICAgICAgICAgICBcIjtcIiArXG4gICAgICAgICAgICAgICAgICAgIG9zRW9sO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvYmpGaWVsZEtleSA9IHRhYmxlRmllbGQuZmllbGROYW1lO1xuICAgICAgICAgICAgICAgIGlmICghb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0gPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8v5rOo6YeK6KGMXG4gICAgICAgICAgICAgICAgb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0gKz0gXCJcXHRcXHQvKiogXCIgKyB0YWJsZUZpZWxkLnRleHQgKyBcIiAqL1wiICsgb3NFb2w7XG5cbiAgICAgICAgICAgICAgICAvL+Wtl+auteexu+Wei+WjsOaYjuihjFxuICAgICAgICAgICAgICAgIG9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldICs9XG4gICAgICAgICAgICAgICAgICAgIFwiXFx0XFx0cmVhZG9ubHkgXCIgK1xuICAgICAgICAgICAgICAgICAgICB0YWJsZUZpZWxkLnN1YkZpZWxkTmFtZSArXG4gICAgICAgICAgICAgICAgICAgIFwiPzogXCIgK1xuICAgICAgICAgICAgICAgICAgICAodHlwZVN0ck1hcFt0YWJsZUZpZWxkLnN1YlR5cGVdID8gdHlwZVN0ck1hcFt0YWJsZUZpZWxkLnN1YlR5cGVdIDogdGFibGVGaWVsZC5zdWJUeXBlKSArXG4gICAgICAgICAgICAgICAgICAgIFwiO1wiICtcbiAgICAgICAgICAgICAgICAgICAgb3NFb2w7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy/nrKzkuozlsYLlr7nosaFcbiAgICAgICAgZm9yIChsZXQgb2JqRmllbGRLZXkgaW4gb2JqVHlwZVN0ck1hcCkge1xuICAgICAgICAgICAgLy/lrZfmrrXnsbvlnovlo7DmmI7ooYxcbiAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJcXHRyZWFkb25seSBcIiArIG9iakZpZWxkS2V5ICsgXCI/OiB7XCIgKyBvc0VvbCArIG9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldO1xuICAgICAgICAgICAgaXRlbUludGVyZmFjZSArPSBcIlxcdH1cIiArIG9zRW9sO1xuICAgICAgICB9XG4gICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJ9XCIgKyBvc0VvbDtcblxuICAgICAgICByZXR1cm4gaXRlbUludGVyZmFjZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5re75Yqg5Y2V54us5a+85Ye66YWN572u6KGoanNvbuaWh+S7tlxuICAgICAqIEBwYXJhbSBjb25maWdcbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gb3V0cHV0RmlsZU1hcFxuICAgICAqL1xuICAgIHByaXZhdGUgX2FkZFNpbmdsZVRhYmxlSnNvbk91dHB1dEZpbGUoXG4gICAgICAgIGNvbmZpZzogSU91dHB1dENvbmZpZyxcbiAgICAgICAgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHRhYmxlT2JqID0gcGFyc2VSZXN1bHQudGFibGVPYmo7XG4gICAgICAgIGlmICghdGFibGVPYmopIHJldHVybjtcbiAgICAgICAgY29uc3QgdGFibGVOYW1lID0gcGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lO1xuICAgICAgICBsZXQgc2luZ2xlSnNvbkZpbGVQYXRoID0gcGF0aC5qb2luKGNvbmZpZy5jbGllbnRTaW5nbGVUYWJsZUpzb25EaXIsIGAke3RhYmxlTmFtZX0uanNvbmApO1xuICAgICAgICBsZXQgc2luZ2xlSnNvbkRhdGEgPSBKU09OLnN0cmluZ2lmeSh0YWJsZU9iaiwgbnVsbCwgXCJcXHRcIik7XG5cbiAgICAgICAgbGV0IHNpbmdsZU91dHB1dEZpbGVJbmZvID0gb3V0cHV0RmlsZU1hcFtzaW5nbGVKc29uRmlsZVBhdGhdO1xuICAgICAgICBpZiAoc2luZ2xlT3V0cHV0RmlsZUluZm8pIHtcbiAgICAgICAgICAgIHNpbmdsZU91dHB1dEZpbGVJbmZvLmRhdGEgPSBzaW5nbGVKc29uRGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpbmdsZU91dHB1dEZpbGVJbmZvID0ge1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBzaW5nbGVKc29uRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YTogc2luZ2xlSnNvbkRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBvdXRwdXRGaWxlTWFwW3NpbmdsZUpzb25GaWxlUGF0aF0gPSBzaW5nbGVPdXRwdXRGaWxlSW5mbztcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcml2YXRlIF9nZXRPbmVUYWJsZVR5cGVTdHIodGFibGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJcXHRyZWFkb25seSBcIiArIHRhYmxlTmFtZSArIFwiPzogXCIgKyBcIklUQmFzZTxcIiArIFwiSVRfXCIgKyB0YWJsZU5hbWUgKyBcIj47XCIgKyBvc0VvbDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dlclwiO1xuXG5leHBvcnQgY29uc3QgdmFsdWVUcmFuc0Z1bmNNYXA6IHtcbiAgICBba2V5OiBzdHJpbmddOiBWYWx1ZVRyYW5zRnVuYztcbn0gPSB7fTtcbnZhbHVlVHJhbnNGdW5jTWFwW1wiaW50XCJdID0gc3RyVG9JbnQ7XG52YWx1ZVRyYW5zRnVuY01hcFtcInN0cmluZ1wiXSA9IGFueVRvU3RyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJbaW50XVwiXSA9IHN0clRvSW50QXJyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJbc3RyaW5nXVwiXSA9IHN0clRvU3RyQXJyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJqc29uXCJdID0gc3RyVG9Kc29uT2JqO1xuZnVuY3Rpb24gc3RyVG9JbnRBcnIoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgaW50QXJyOiBudW1iZXJbXTtcbiAgICBjb25zdCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge307XG4gICAgaWYgKGNlbGxWYWx1ZSAhPT0gXCJcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaW50QXJyID0gSlNPTi5wYXJzZShjZWxsVmFsdWUpO1xuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gaW50QXJyO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gc3RyVG9TdHJBcnIoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9O1xuICAgIGxldCBhcnI6IHN0cmluZ1tdO1xuICAgIGlmIChjZWxsVmFsdWUgIT09IFwiXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGFyciA9IEpTT04ucGFyc2UoY2VsbFZhbHVlKTtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGFycjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvciA9IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBzdHJUb0ludChmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9IGFzIGFueTtcbiAgICBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiBjZWxsVmFsdWUudHJpbSgpICE9PSBcIlwiKSB7XG4gICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZS5pbmNsdWRlcyhcIi5cIikgPyBwYXJzZUZsb2F0KGNlbGxWYWx1ZSkgOiAocGFyc2VJbnQoY2VsbFZhbHVlKSBhcyBhbnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBzdHJUb0pzb25PYmooZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgb2JqO1xuICAgIGxldCBlcnJvcjtcbiAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBvYmogPSBKU09OLnBhcnNlKGNlbGxWYWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICBvYmogPSBjZWxsVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgZXJyb3I6IGVycm9yLCB2YWx1ZTogb2JqIH07XG59XG5mdW5jdGlvbiBhbnlUb1N0cihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IGFueSk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9IGFzIGFueTtcbiAgICBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xuICAgICAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWUgKyBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGRvUGFyc2UoXG4gICAgcGFyc2VDb25maWc6IElUYWJsZUNvbnZlcnRDb25maWcsXG4gICAgZmlsZUluZm9zOiBJRmlsZUluZm9bXSxcbiAgICBwYXJzZVJlc3VsdE1hcDogVGFibGVQYXJzZVJlc3VsdE1hcCxcbiAgICBwYXJzZUhhbmRsZXI6IElUYWJsZVBhcnNlSGFuZGxlclxuKSB7XG4gICAgbGV0IHBhcnNlUmVzdWx0O1xuICAgIGZvciAobGV0IGkgPSBmaWxlSW5mb3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgcGFyc2VSZXN1bHQgPSBwYXJzZVJlc3VsdE1hcFtmaWxlSW5mb3NbaV0uZmlsZVBhdGhdO1xuICAgICAgICBpZiAoIXBhcnNlUmVzdWx0KSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHsgZmlsZVBhdGg6IGZpbGVJbmZvc1tpXS5maWxlUGF0aCB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVPYmopIHtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VIYW5kbGVyLnBhcnNlVGFibGVGaWxlKHBhcnNlQ29uZmlnLCBmaWxlSW5mb3NbaV0sIHBhcnNlUmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyc2VSZXN1bHQpIHtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwW2ZpbGVJbmZvc1tpXS5maWxlUGF0aF0gPSBwYXJzZVJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IG9zRW9sIH0gZnJvbSBcIi4vZ2V0LW9zLWVvbFwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuZW51bSBMb2dMZXZlbEVudW0ge1xuICAgIGluZm8sXG4gICAgd2FybixcbiAgICBlcnJvcixcbiAgICBub1xufVxuZXhwb3J0IGNsYXNzIExvZ2dlciB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2VuYWJsZU91dFB1dExvZ0ZpbGU6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2xvZ0xldmVsOiBMb2dMZXZlbEVudW07XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2xvZ1N0cjogc3RyaW5nID0gXCJcIjtcbiAgICBwdWJsaWMgc3RhdGljIGluaXQocGFyc2VDb25maWc6IElUYWJsZUNvbnZlcnRDb25maWcpIHtcbiAgICAgICAgY29uc3QgbGV2ZWw6IExvZ0xldmVsID0gcGFyc2VDb25maWcubG9nTGV2ZWwgPyBwYXJzZUNvbmZpZy5sb2dMZXZlbCA6IFwiaW5mb1wiO1xuICAgICAgICB0aGlzLl9sb2dMZXZlbCA9IExvZ0xldmVsRW51bVtsZXZlbF07XG4gICAgICAgIHRoaXMuX2VuYWJsZU91dFB1dExvZ0ZpbGUgPSBwYXJzZUNvbmZpZy5vdXRwdXRMb2dGaWxlID09PSB1bmRlZmluZWQgPyB0cnVlIDogcGFyc2VDb25maWcub3V0cHV0TG9nRmlsZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6L6T5Ye65pel5b+XXG4gICAgICogQHBhcmFtIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gbGV2ZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGxvZyhtZXNzYWdlOiBzdHJpbmcsIGxldmVsOiBMb2dMZXZlbCA9IFwiaW5mb1wiKSB7XG4gICAgICAgIGlmIChsZXZlbCA9PT0gXCJub1wiKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLl9sb2dMZXZlbCA8PSBMb2dMZXZlbEVudW1bbGV2ZWxdKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJpbmZvXCI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwid2FyblwiOlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fZW5hYmxlT3V0UHV0TG9nRmlsZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sb2dTdHIgKz0gbWVzc2FnZSArIG9zRW9sO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDov5Tlm57ml6Xlv5fmlbDmja7lubbmuIXnqbpcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldCBsb2dTdHIoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVPdXRQdXRMb2dGaWxlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgbG9nU3RyID0gdGhpcy5fbG9nU3RyO1xuICAgICAgICB0aGlzLl9sb2dTdHIgPSBcIlwiOyAvL+a4heepulxuICAgICAgICByZXR1cm4gbG9nU3RyO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2VyXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSU91dFB1dEZpbGVJbmZvIHtcbiAgICAgICAgZmlsZVBhdGg6IHN0cmluZztcbiAgICAgICAgLyoq5YaZ5YWl57yW56CB77yM5a2X56ym5Liy6buY6K6kdXRmOCAqL1xuICAgICAgICBlbmNvZGluZz86IEJ1ZmZlckVuY29kaW5nO1xuICAgICAgICAvKirmmK/lkKbliKDpmaQgKi9cbiAgICAgICAgaXNEZWxldGU/OiBib29sZWFuO1xuICAgICAgICBkYXRhPzogYW55O1xuICAgIH1cbn1cbi8qKlxuICog6YGN5Y6G5paH5Lu2XG4gKiBAcGFyYW0gZGlyUGF0aCDmlofku7blpLnot6/lvoRcbiAqIEBwYXJhbSBlYWNoQ2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChmaWxlUGF0aDogc3RyaW5nKSA9PiB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JFYWNoRmlsZShmaWxlT3JEaXJQYXRoOiBzdHJpbmcsIGVhY2hDYWxsYmFjaz86IChmaWxlUGF0aDogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgaWYgKGZzLnN0YXRTeW5jKGZpbGVPckRpclBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWVzID0gZnMucmVhZGRpclN5bmMoZmlsZU9yRGlyUGF0aCk7XG4gICAgICAgIGxldCBjaGlsZEZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjaGlsZEZpbGVQYXRoID0gcGF0aC5qb2luKGZpbGVPckRpclBhdGgsIGZpbGVOYW1lc1tpXSk7XG4gICAgICAgICAgICBmb3JFYWNoRmlsZShjaGlsZEZpbGVQYXRoLCBlYWNoQ2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZWFjaENhbGxiYWNrKGZpbGVPckRpclBhdGgpO1xuICAgIH1cbn1cbi8qKlxuICog5om56YeP5YaZ5YWl5ZKM5Yig6Zmk5paH5Lu2XG4gKiBAcGFyYW0gb3V0cHV0RmlsZUluZm9zIOmcgOimgeWGmeWFpeeahOaWh+S7tuS/oeaBr+aVsOe7hFxuICogQHBhcmFtIG9uUHJvZ3Jlc3Mg6L+b5bqm5Y+Y5YyW5Zue6LCDXG4gKiBAcGFyYW0gY29tcGxldGUg5a6M5oiQ5Zue6LCDXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMoXG4gICAgb3V0cHV0RmlsZUluZm9zOiBJT3V0UHV0RmlsZUluZm9bXSxcbiAgICBvblByb2dyZXNzPzogKGZpbGVQYXRoOiBzdHJpbmcsIHRvdGFsOiBudW1iZXIsIG5vdzogbnVtYmVyLCBpc09rOiBib29sZWFuKSA9PiB2b2lkLFxuICAgIGNvbXBsZXRlPzogKHRvdGFsOiBudW1iZXIpID0+IHZvaWRcbikge1xuICAgIGxldCBmaWxlSW5mbzogSU91dFB1dEZpbGVJbmZvO1xuICAgIGNvbnN0IHRvdGFsID0gb3V0cHV0RmlsZUluZm9zLmxlbmd0aDtcbiAgICBpZiAob3V0cHV0RmlsZUluZm9zICYmIHRvdGFsKSB7XG4gICAgICAgIGxldCBub3cgPSAwO1xuICAgICAgICBjb25zdCBvbldyaXRlRW5kID0gKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIExvZ2dlci5sb2coZXJyLCBcImVycm9yXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm93Kys7XG4gICAgICAgICAgICBvblByb2dyZXNzICYmIG9uUHJvZ3Jlc3Mob3V0cHV0RmlsZUluZm9zW25vdyAtIDFdLmZpbGVQYXRoLCB0b3RhbCwgbm93LCAhZXJyKTtcbiAgICAgICAgICAgIGlmIChub3cgPj0gdG90YWwpIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSAmJiBjb21wbGV0ZSh0b3RhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZvciAobGV0IGkgPSBvdXRwdXRGaWxlSW5mb3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGZpbGVJbmZvID0gb3V0cHV0RmlsZUluZm9zW2ldO1xuICAgICAgICAgICAgaWYgKGZpbGVJbmZvLmlzRGVsZXRlICYmIGZzLmV4aXN0c1N5bmMoZmlsZUluZm8uZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgZnMudW5saW5rU3luYyhmaWxlSW5mby5maWxlUGF0aCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghZmlsZUluZm8uZW5jb2RpbmcgJiYgdHlwZW9mIGZpbGVJbmZvLmRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZW5jb2RpbmcgPSBcInV0ZjhcIjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmcy5lbnN1cmVGaWxlU3luYyhmaWxlSW5mby5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlKFxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby5maWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZW5jb2RpbmcgPyB7IGVuY29kaW5nOiBmaWxlSW5mby5lbmNvZGluZyB9IDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBvbldyaXRlRW5kXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICog6I635Y+W5Y+Y5YyW6L+H55qE5paH5Lu25pWw57uEXG4gKiBAcGFyYW0gZGlyIOebruagh+ebruW9lVxuICogQHBhcmFtIGNhY2hlRmlsZVBhdGgg57yT5a2Y5paH5Lu257ud5a+56Lev5b6EXG4gKiBAcGFyYW0gZWFjaENhbGxiYWNrIOmBjeWOhuWbnuiwg1xuICogQHJldHVybnMg6L+U5Zue57yT5a2Y5paH5Lu26Lev5b6EXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JFYWNoQ2hhbmdlZEZpbGUoXG4gICAgZGlyOiBzdHJpbmcsXG4gICAgY2FjaGVGaWxlUGF0aD86IHN0cmluZyxcbiAgICBlYWNoQ2FsbGJhY2s/OiAoZmlsZVBhdGg6IHN0cmluZywgaXNEZWxldGU/OiBib29sZWFuKSA9PiB2b2lkXG4pIHtcbiAgICBjb25zdCBnY2ZDYWNoZSA9IGdldENhY2hlRGF0YShjYWNoZUZpbGVQYXRoKTtcbiAgICBjb25zdCBvbGRGaWxlUGF0aHMgPSBPYmplY3Qua2V5cyhnY2ZDYWNoZSk7XG4gICAgbGV0IG9sZEZpbGVQYXRoSW5kZXg6IG51bWJlcjtcbiAgICBmb3JFYWNoRmlsZShkaXIsIChmaWxlUGF0aCkgPT4ge1xuICAgICAgICB2YXIgbWQ1c3RyID0gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGgpO1xuICAgICAgICBpZiAoIWdjZkNhY2hlW2ZpbGVQYXRoXSB8fCAoZ2NmQ2FjaGVbZmlsZVBhdGhdICYmIGdjZkNhY2hlW2ZpbGVQYXRoXSAhPT0gbWQ1c3RyKSkge1xuICAgICAgICAgICAgZ2NmQ2FjaGVbZmlsZVBhdGhdID0gbWQ1c3RyO1xuICAgICAgICAgICAgZWFjaENhbGxiYWNrKGZpbGVQYXRoLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgb2xkRmlsZVBhdGhJbmRleCA9IG9sZEZpbGVQYXRocy5pbmRleE9mKGZpbGVQYXRoKTtcbiAgICAgICAgaWYgKG9sZEZpbGVQYXRoSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgY29uc3QgZW5kRmlsZVBhdGggPSBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRoSW5kZXhdID0gZW5kRmlsZVBhdGg7XG4gICAgICAgICAgICBvbGRGaWxlUGF0aHMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZEZpbGVQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZWxldGUgZ2NmQ2FjaGVbb2xkRmlsZVBhdGhzW2ldXTtcbiAgICAgICAgZWFjaENhbGxiYWNrKG9sZEZpbGVQYXRoc1tpXSwgdHJ1ZSk7XG4gICAgfVxuICAgIGZzLndyaXRlRmlsZVN5bmMoY2FjaGVGaWxlUGF0aCwgSlNPTi5zdHJpbmdpZnkoZ2NmQ2FjaGUpLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSk7XG59XG4vKipcbiAqIOWGmeWFpee8k+WtmOaVsOaNrlxuICogQHBhcmFtIGNhY2hlRmlsZVBhdGhcbiAqIEBwYXJhbSBjYWNoZURhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlQ2FjaGVEYXRhKGNhY2hlRmlsZVBhdGg6IHN0cmluZywgY2FjaGVEYXRhOiBhbnkpIHtcbiAgICBpZiAoIWNhY2hlRmlsZVBhdGgpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhgY2FjaGVGaWxlUGF0aCBpcyBudWxsYCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmcy53cml0ZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGNhY2hlRGF0YSksIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KTtcbn1cbi8qKlxuICog6K+75Y+W57yT5a2Y5pWw5o2uXG4gKiBAcGFyYW0gY2FjaGVGaWxlUGF0aFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FjaGVEYXRhKGNhY2hlRmlsZVBhdGg6IHN0cmluZyk6IGFueSB7XG4gICAgaWYgKCFjYWNoZUZpbGVQYXRoKSB7XG4gICAgICAgIExvZ2dlci5sb2coYGNhY2hlRmlsZVBhdGggaXMgbnVsbGAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGNhY2hlRmlsZVBhdGgpKSB7XG4gICAgICAgIGZzLmVuc3VyZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIFwie31cIiwgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0pO1xuICAgIH1cbiAgICBjb25zdCBnY2ZDYWNoZUZpbGUgPSBmcy5yZWFkRmlsZVN5bmMoY2FjaGVGaWxlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICBjb25zdCBnY2ZDYWNoZSA9IEpTT04ucGFyc2UoZ2NmQ2FjaGVGaWxlKTtcbiAgICByZXR1cm4gZ2NmQ2FjaGU7XG59XG4vKipcbiAqIOiOt+WPluaWh+S7tm1kNSAo5ZCM5q2lKVxuICogQHBhcmFtIGZpbGVQYXRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlTWQ1U3luYyhmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBmaWxlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCBcInV0Zi04XCIpO1xuICAgIHZhciBtZDV1bSA9IGNyeXB0by5jcmVhdGVIYXNoKFwibWQ1XCIpO1xuICAgIG1kNXVtLnVwZGF0ZShmaWxlKTtcbiAgICByZXR1cm4gbWQ1dW0uZGlnZXN0KFwiaGV4XCIpO1xufVxuLyoqXG4gKiDojrflj5bmlofku7YgbWQ1XG4gKiBAcGFyYW0gZmlsZVBhdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEZpbGVNZDUoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHJldHVybiBnZXRGaWxlTWQ1U3luYyhmaWxlUGF0aCk7XG59XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCAqIGFzIG1tYXRjaCBmcm9tIFwibWljcm9tYXRjaFwiO1xuaW1wb3J0IHtmb3JFYWNoRmlsZSwgZ2V0Q2FjaGVEYXRhLCBnZXRGaWxlTWQ1U3luYywgd3JpdGVDYWNoZURhdGEsIHdyaXRlT3JEZWxldGVPdXRQdXRGaWxlc30gZnJvbSBcIi4vZmlsZS11dGlsc1wiO1xuaW1wb3J0IHtXb3JrZXJ9IGZyb20gXCJ3b3JrZXJfdGhyZWFkc1wiO1xuaW1wb3J0IHtkb1BhcnNlfSBmcm9tIFwiLi9kby1wYXJzZVwiO1xuaW1wb3J0IHtEZWZhdWx0UGFyc2VIYW5kbGVyfSBmcm9tIFwiLi9kZWZhdWx0LXBhcnNlLWhhbmRsZXJcIjtcbmltcG9ydCB7TG9nZ2VyfSBmcm9tIFwiLi9sb2dlclwiO1xuaW1wb3J0IHtUcmFuczJKc29uQW5kRHRzSGFuZGxlcn0gZnJvbSAnLi9kZWZhdWx0LXRyYW5zMmZpbGUtaGFuZGxlcic7XG4vKipcbiAqIOi9rOaNolxuICogQHBhcmFtIGNvbnZlckNvbmZpZyDop6PmnpDphY3nva5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbnZlcnQoY29udmVyQ29uZmlnOiBJVGFibGVDb252ZXJ0Q29uZmlnKSB7XG4gICAgaWYgKCFjb252ZXJDb25maWcucHJvalJvb3QpIHtcbiAgICAgICAgY29udmVyQ29uZmlnLnByb2pSb290ID0gcHJvY2Vzcy5jd2QoKTtcbiAgICB9XG4gICAgbGV0IHRyYW5zMkZpbGVIYW5kbGVyOiBJVHJhbnNSZXN1bHQyQW55RmlsZUhhbmRsZXI7XG4gICAgaWYgKGNvbnZlckNvbmZpZy5jdXN0b21UcmFuczJGaWxlSGFuZGxlclBhdGgpIHtcbiAgICAgICAgdHJhbnMyRmlsZUhhbmRsZXIgPSByZXF1aXJlKGNvbnZlckNvbmZpZy5jdXN0b21UcmFuczJGaWxlSGFuZGxlclBhdGgpO1xuICAgICAgICBpZiAoIXRyYW5zMkZpbGVIYW5kbGVyIHx8IHR5cGVvZiB0cmFuczJGaWxlSGFuZGxlci50cmFuczJGaWxlcyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDoh6rlrprkuYnovazmjaLlrp7njrDplJnor686JHtjb252ZXJDb25maWcuY3VzdG9tVHJhbnMyRmlsZUhhbmRsZXJQYXRofWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdHJhbnMyRmlsZUhhbmRsZXIgPSBuZXcgVHJhbnMySnNvbkFuZER0c0hhbmRsZXIoKTtcbiAgICB9XG4gICAgY29uc3QgdGFibGVGaWxlRGlyID0gY29udmVyQ29uZmlnLnRhYmxlRmlsZURpcjtcbiAgICBpZiAoIXRhYmxlRmlsZURpcikge1xuICAgICAgICBMb2dnZXIubG9nKGDphY3nva7ooajnm67lvZXvvJp0YWJsZUZpbGVEaXLkuLrnqbpgLCBcImVycm9yXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghZnMuZXhpc3RzU3luYyh0YWJsZUZpbGVEaXIpKSB7XG4gICAgICAgIExvZ2dlci5sb2coYOmFjee9ruihqOaWh+S7tuWkueS4jeWtmOWcqO+8miR7dGFibGVGaWxlRGlyfWAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGVmYXVsdFBhdHRlcm4gPSBbXCIqKi8qLnt4bHN4LGNzdn1cIiwgXCIhKiovfiQqLipcIiwgXCIhKiovfi4qLipcIl07XG4gICAgaWYgKCFjb252ZXJDb25maWcucGF0dGVybikge1xuICAgICAgICBjb252ZXJDb25maWcucGF0dGVybiA9IGRlZmF1bHRQYXR0ZXJuO1xuICAgIH0gZWxzZSBpZiAoY29udmVyQ29uZmlnLnBhdHRlcm4gJiYgdHlwZW9mIGNvbnZlckNvbmZpZy5wYXR0ZXJuID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGVmYXVsdFBhdHRlcm4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghY29udmVyQ29uZmlnLnBhdHRlcm4uaW5jbHVkZXMoZGVmYXVsdFBhdHRlcm5baV0pKSB7XG4gICAgICAgICAgICAgICAgY29udmVyQ29uZmlnLnBhdHRlcm4ucHVzaChkZWZhdWx0UGF0dGVybltpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbnZlckNvbmZpZy51c2VNdWx0aVRocmVhZCAmJiBpc05hTihjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtKSkge1xuICAgICAgICBjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtID0gNTtcbiAgICB9XG4gICAgTG9nZ2VyLmluaXQoY29udmVyQ29uZmlnKTtcbiAgICBsZXQgZmlsZUluZm9zOiBJRmlsZUluZm9bXSA9IFtdO1xuICAgIGxldCBkZWxldGVGaWxlSW5mb3M6IElGaWxlSW5mb1tdID0gW107XG4gICAgY29uc3QgZ2V0RmlsZUluZm8gPSAoZmlsZVBhdGg6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aFBhcnNlID0gcGF0aC5wYXJzZShmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IGZpbGVJbmZvOiBJRmlsZUluZm8gPSB7XG4gICAgICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICBmaWxlTmFtZTogZmlsZVBhdGhQYXJzZS5uYW1lLFxuICAgICAgICAgICAgZmlsZUV4dE5hbWU6IGZpbGVQYXRoUGFyc2UuZXh0LFxuICAgICAgICAgICAgaXNEZWxldGU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBmaWxlSW5mbztcbiAgICB9O1xuICAgIGNvbnN0IG1hdGNoUGF0dGVybiA9IGNvbnZlckNvbmZpZy5wYXR0ZXJuO1xuICAgIGNvbnN0IGVhY2hGaWxlQ2FsbGJhY2sgPSAoZmlsZVBhdGg6IHN0cmluZywgaXNEZWxldGU/OiBib29sZWFuKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVJbmZvID0gZ2V0RmlsZUluZm8oZmlsZVBhdGgpO1xuICAgICAgICBsZXQgY2FuUmVhZDogYm9vbGVhbjtcbiAgICAgICAgaWYgKGlzRGVsZXRlKSB7XG4gICAgICAgICAgICBkZWxldGVGaWxlSW5mb3MucHVzaChmaWxlSW5mbyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW5SZWFkID0gbW1hdGNoLmFsbChmaWxlSW5mby5maWxlUGF0aCwgbWF0Y2hQYXR0ZXJuKTtcbiAgICAgICAgICAgIGlmIChjYW5SZWFkKSB7XG4gICAgICAgICAgICAgICAgZmlsZUluZm9zLnB1c2goZmlsZUluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7ZmlsZUluZm8sIGNhblJlYWR9O1xuICAgIH07XG4gICAgbGV0IHBhcnNlUmVzdWx0TWFwOiBUYWJsZVBhcnNlUmVzdWx0TWFwID0ge307XG5cbiAgICAvL+e8k+WtmOWkhOeQhlxuICAgIGxldCBjYWNoZUZpbGVEaXJQYXRoOiBzdHJpbmcgPSBjb252ZXJDb25maWcuY2FjaGVGaWxlRGlyUGF0aDtcbiAgICBsZXQgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoOiBzdHJpbmc7XG5cbiAgICBpZiAoIWNvbnZlckNvbmZpZy51c2VDYWNoZSkge1xuICAgICAgICBmb3JFYWNoRmlsZSh0YWJsZUZpbGVEaXIsIGVhY2hGaWxlQ2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghY2FjaGVGaWxlRGlyUGF0aCkgY2FjaGVGaWxlRGlyUGF0aCA9IFwiLmNhY2hlXCI7XG4gICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKGNhY2hlRmlsZURpclBhdGgpKSB7XG4gICAgICAgICAgICBjYWNoZUZpbGVEaXJQYXRoID0gcGF0aC5qb2luKGNvbnZlckNvbmZpZy5wcm9qUm9vdCwgY2FjaGVGaWxlRGlyUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoID0gcGF0aC5qb2luKGNhY2hlRmlsZURpclBhdGgsIFwiLmVnZnBybWNcIik7XG4gICAgICAgIHBhcnNlUmVzdWx0TWFwID0gZ2V0Q2FjaGVEYXRhKHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCk7XG4gICAgICAgIGlmICghcGFyc2VSZXN1bHRNYXApIHtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwID0ge307XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb2xkRmlsZVBhdGhzID0gT2JqZWN0LmtleXMocGFyc2VSZXN1bHRNYXApO1xuICAgICAgICBsZXQgb2xkRmlsZVBhdGhJbmRleDogbnVtYmVyO1xuICAgICAgICBsZXQgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0O1xuICAgICAgICBmb3JFYWNoRmlsZSh0YWJsZUZpbGVEaXIsIChmaWxlUGF0aCkgPT4ge1xuICAgICAgICAgICAgdmFyIG1kNXN0ciA9IGdldEZpbGVNZDVTeW5jKGZpbGVQYXRoKTtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VSZXN1bHRNYXBbZmlsZVBhdGhdO1xuICAgICAgICAgICAgaWYgKCFwYXJzZVJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXSA9IHBhcnNlUmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnNlUmVzdWx0ICYmIHBhcnNlUmVzdWx0Lm1kNWhhc2ggIT09IG1kNXN0cikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHtmaWxlSW5mbywgY2FuUmVhZH0gPSBlYWNoRmlsZUNhbGxiYWNrKGZpbGVQYXRoLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNhblJlYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VSZXN1bHQubWQ1aGFzaCA9IG1kNXN0cjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvbGRGaWxlUGF0aEluZGV4ID0gb2xkRmlsZVBhdGhzLmluZGV4T2YoZmlsZVBhdGgpO1xuICAgICAgICAgICAgaWYgKG9sZEZpbGVQYXRoSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZEZpbGVQYXRoID0gb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRocy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhJbmRleF0gPSBlbmRGaWxlUGF0aDtcbiAgICAgICAgICAgICAgICBvbGRGaWxlUGF0aHMucG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZEZpbGVQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGVsZXRlIHBhcnNlUmVzdWx0TWFwW29sZEZpbGVQYXRoc1tpXV07XG4gICAgICAgICAgICBlYWNoRmlsZUNhbGxiYWNrKG9sZEZpbGVQYXRoc1tpXSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IHBhcnNlSGFuZGxlcjogSVRhYmxlUGFyc2VIYW5kbGVyO1xuICAgIGlmIChjb252ZXJDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aCkge1xuICAgICAgICBwYXJzZUhhbmRsZXIgPSByZXF1aXJlKGNvbnZlckNvbmZpZy5jdXN0b21QYXJzZUhhbmRsZXJQYXRoKTtcbiAgICAgICAgaWYgKCFwYXJzZUhhbmRsZXIgfHwgdHlwZW9mIHBhcnNlSGFuZGxlci5wYXJzZVRhYmxlRmlsZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDoh6rlrprkuYnop6PmnpDlrp7njrDplJnor686JHtjb252ZXJDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aH1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlSGFuZGxlciA9IG5ldyBEZWZhdWx0UGFyc2VIYW5kbGVyKCk7XG4gICAgfVxuICAgIGlmIChmaWxlSW5mb3MubGVuZ3RoID4gY29udmVyQ29uZmlnLnRocmVhZFBhcnNlRmlsZU1heE51bSAmJiBjb252ZXJDb25maWcudXNlTXVsdGlUaHJlYWQpIHtcbiAgICAgICAgbGV0IGxvZ1N0cjogc3RyaW5nID0gXCJcIjtcbiAgICAgICAgY29uc3QgY291bnQgPSBNYXRoLmZsb29yKGZpbGVJbmZvcy5sZW5ndGggLyBjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtKSArIDE7XG4gICAgICAgIGxldCB3b3JrZXI6IFdvcmtlcjtcbiAgICAgICAgbGV0IHN1YkZpbGVJbmZvczogSUZpbGVJbmZvW107XG4gICAgICAgIGxldCB3b3JrZXJNYXA6IHtba2V5OiBudW1iZXJdOiBXb3JrZXJ9ID0ge307XG4gICAgICAgIGxldCBjb21wbGV0ZUNvdW50OiBudW1iZXIgPSAwO1xuICAgICAgICBjb25zdCB0MSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBjb25zdCBvbldvcmtlclBhcnNlRW5kID0gKGRhdGE6IElXb3JrRG9SZXN1bHQpID0+IHtcbiAgICAgICAgICAgIExvZ2dlci5sb2coYC0tLS0tLS0tLS0tLS0tLS3nur/nqIvnu5PmnZ86JHtkYXRhLnRocmVhZElkfS0tLS0tLS0tLS0tLS0tLS0tYCk7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRNYXAgPSBkYXRhLnBhcnNlUmVzdWx0TWFwO1xuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHBhcnNlZE1hcCkge1xuICAgICAgICAgICAgICAgIGlmICghcGFyc2VSZXN1bHRNYXBba2V5XS50YWJsZURlZmluZSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcFtrZXldID0gcGFyc2VkTWFwW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcGxldGVDb3VudCsrO1xuICAgICAgICAgICAgbG9nU3RyICs9IGRhdGEubG9nU3RyICsgTG9nZ2VyLmxvZ1N0cjtcbiAgICAgICAgICAgIGlmIChjb21wbGV0ZUNvdW50ID49IGNvdW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdDIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICBMb2dnZXIubG9nKGBb5aSa57q/56iL5a+86KGo5pe26Ze0XToke3QyIC0gdDF9YCk7XG4gICAgICAgICAgICAgICAgd3JpdGVGaWxlcyhcbiAgICAgICAgICAgICAgICAgICAgY29udmVyQ29uZmlnLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zMkZpbGVIYW5kbGVyLFxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mb3MsXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUZpbGVJbmZvcyxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXAsXG4gICAgICAgICAgICAgICAgICAgIGxvZ1N0clxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgc3ViRmlsZUluZm9zID0gZmlsZUluZm9zLnNwbGljZSgwLCBjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtKTtcbiAgICAgICAgICAgIExvZ2dlci5sb2coYC0tLS0tLS0tLS0tLS0tLS3nur/nqIvlvIDlp4s6JHtpfS0tLS0tLS0tLS0tLS0tLS0tYCk7XG4gICAgICAgICAgICB3b3JrZXIgPSBuZXcgV29ya2VyKHBhdGguam9pbihwYXRoLmRpcm5hbWUoX19maWxlbmFtZSksIFwiLi4vLi4vLi4vd29ya2VyX3NjcmlwdHMvd29ya2VyLmpzXCIpLCB7XG4gICAgICAgICAgICAgICAgd29ya2VyRGF0YToge1xuICAgICAgICAgICAgICAgICAgICB0aHJlYWRJZDogaSxcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm9zOiBzdWJGaWxlSW5mb3MsXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwOiBwYXJzZVJlc3VsdE1hcCxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VDb25maWc6IGNvbnZlckNvbmZpZ1xuICAgICAgICAgICAgICAgIH0gYXMgSVdvcmtlclNoYXJlRGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3b3JrZXJNYXBbaV0gPSB3b3JrZXI7XG4gICAgICAgICAgICB3b3JrZXIub24oXCJtZXNzYWdlXCIsIG9uV29ya2VyUGFyc2VFbmQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdDEgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICBkb1BhcnNlKGNvbnZlckNvbmZpZywgZmlsZUluZm9zLCBwYXJzZVJlc3VsdE1hcCwgcGFyc2VIYW5kbGVyKTtcbiAgICAgICAgY29uc3QgdDIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgTG9nZ2VyLmxvZyhgW+WNlee6v+eoi+WvvOihqOaXtumXtF06JHt0MiAtIHQxfWApO1xuICAgICAgICB3cml0ZUZpbGVzKFxuICAgICAgICAgICAgY29udmVyQ29uZmlnLFxuICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoLFxuICAgICAgICAgICAgdHJhbnMyRmlsZUhhbmRsZXIsXG4gICAgICAgICAgICBmaWxlSW5mb3MsXG4gICAgICAgICAgICBkZWxldGVGaWxlSW5mb3MsXG4gICAgICAgICAgICBwYXJzZVJlc3VsdE1hcCxcbiAgICAgICAgICAgIExvZ2dlci5sb2dTdHJcbiAgICAgICAgKTtcbiAgICB9XG59XG5mdW5jdGlvbiB3cml0ZUZpbGVzKFxuICAgIHBhcnNlQ29uZmlnOiBJVGFibGVDb252ZXJ0Q29uZmlnLFxuICAgIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aDogc3RyaW5nLFxuICAgIHRyYW5zMkZpbGVIYW5kbGVyOiBJVHJhbnNSZXN1bHQyQW55RmlsZUhhbmRsZXIsXG4gICAgZmlsZUluZm9zOiBJRmlsZUluZm9bXSxcbiAgICBkZWxldGVGaWxlSW5mb3M6IElGaWxlSW5mb1tdLFxuICAgIHBhcnNlUmVzdWx0TWFwOiBUYWJsZVBhcnNlUmVzdWx0TWFwLFxuICAgIGxvZ1N0cj86IHN0cmluZ1xuKSB7XG4gICAgLy/lhpnlhaXop6PmnpDnvJPlrZhcbiAgICBpZiAocGFyc2VDb25maWcudXNlQ2FjaGUpIHtcbiAgICAgICAgd3JpdGVDYWNoZURhdGEocGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoLCBwYXJzZVJlc3VsdE1hcCk7XG4gICAgfVxuXG4gICAgLy/op6PmnpDnu5PmnZ/vvIzlgZrlr7zlh7rlpITnkIZcbiAgICBsZXQgb3V0cHV0RmlsZU1hcDogT3V0UHV0RmlsZU1hcCA9IHRyYW5zMkZpbGVIYW5kbGVyLnRyYW5zMkZpbGVzKFxuICAgICAgICBwYXJzZUNvbmZpZyxcbiAgICAgICAgZmlsZUluZm9zLFxuICAgICAgICBkZWxldGVGaWxlSW5mb3MsXG4gICAgICAgIHBhcnNlUmVzdWx0TWFwXG4gICAgKTtcbiAgICBjb25zdCBvdXRwdXRGaWxlcyA9IE9iamVjdC52YWx1ZXMob3V0cHV0RmlsZU1hcCk7XG5cbiAgICAvL+WGmeWFpeWSjOWIoOmZpOaWh+S7tuWkhOeQhlxuICAgIExvZ2dlci5sb2coYOW8gOWni+WGmeWFpeaWh+S7tjowLyR7b3V0cHV0RmlsZXMubGVuZ3RofWApO1xuXG4gICAgd3JpdGVPckRlbGV0ZU91dFB1dEZpbGVzKFxuICAgICAgICBvdXRwdXRGaWxlcyxcbiAgICAgICAgKGZpbGVQYXRoLCB0b3RhbCwgbm93LCBpc09rKSA9PiB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGBb5YaZ5YWl5paH5Lu2XSDov5vluqY6KCR7bm93fS8ke3RvdGFsfSkg6Lev5b6EOiR7ZmlsZVBhdGh9YCk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIExvZ2dlci5sb2coYOWGmeWFpee7k+adn35gKTtcbiAgICAgICAgICAgIC8v5pel5b+X5paH5Lu2XG4gICAgICAgICAgICBpZiAoIWxvZ1N0cikge1xuICAgICAgICAgICAgICAgIGxvZ1N0ciA9IExvZ2dlci5sb2dTdHI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBvdXRwdXRMb2dGaWxlSW5mbzogSU91dFB1dEZpbGVJbmZvID0ge1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgXCJleGNlbDJhbGwubG9nXCIpLFxuICAgICAgICAgICAgICAgIGRhdGE6IGxvZ1N0clxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdyaXRlT3JEZWxldGVPdXRQdXRGaWxlcyhbb3V0cHV0TG9nRmlsZUluZm9dKTtcbiAgICAgICAgfVxuICAgICk7XG59XG4iLCJpbXBvcnQgKiBhcyB4bHN4IGZyb20gXCJ4bHN4XCI7XG4vKipcbiAqIOaYr+WQpuS4uuepuuihqOagvOagvOWtkFxuICogQHBhcmFtIGNlbGxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHlDZWxsKGNlbGw6IHhsc3guQ2VsbE9iamVjdCkge1xuICAgIGlmIChjZWxsICYmIGNlbGwudiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2VsbC52ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gY2VsbC52ID09PSBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZWxsLnYgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBpc05hTihjZWxsLnYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuLyoqXG4gKiDlrZfmr41a55qE57yW56CBXG4gKi9cbmV4cG9ydCBjb25zdCBaQ2hhckNvZGUgPSA5MDtcbi8qKlxuICog5a2X5q+NQeeahOe8lueggVxuICpcbiAqL1xuZXhwb3J0IGNvbnN0IEFDaGFyQ29kZSA9IDY1O1xuLyoqXG4gKiDmoLnmja7lvZPliY3liJfnmoRjaGFyQ29kZXPojrflj5bkuIvkuIDliJdLZXlcbiAqIEBwYXJhbSBjaGFyQ29kZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5leHRDb2xLZXkoY2hhckNvZGVzOiBudW1iZXJbXSk6IHN0cmluZyB7XG4gICAgbGV0IGlzQWRkOiBib29sZWFuO1xuICAgIGZvciAobGV0IGkgPSBjaGFyQ29kZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgaWYgKGNoYXJDb2Rlc1tpXSA8IFpDaGFyQ29kZSkge1xuICAgICAgICAgICAgY2hhckNvZGVzW2ldICs9IDE7XG4gICAgICAgICAgICBpc0FkZCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZXNbaV0gPT09IFpDaGFyQ29kZSkge1xuICAgICAgICAgICAgY2hhckNvZGVzW2ldID0gQUNoYXJDb2RlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghaXNBZGQpIHtcbiAgICAgICAgY2hhckNvZGVzLnB1c2goQUNoYXJDb2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hhckNvZGVzVG9TdHJpbmcoY2hhckNvZGVzKTtcbn1cblxuLyoqXG4gKiDliJfnmoTlrZfnrKbnvJbnoIHmlbDnu4TovazlrZfnrKbkuLJcbiAqIEBwYXJhbSBjaGFyQ29kZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoYXJDb2Rlc1RvU3RyaW5nKGNoYXJDb2RlczogbnVtYmVyW10pOiBzdHJpbmcge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmNoYXJDb2Rlcyk7XG59XG4vKipcbiAqIOWtl+espuS4sui9rOe8lueggeaVsOe7hFxuICogQHBhcmFtIGNvbEtleVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9DaGFyQ29kZXMoY29sS2V5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBjaGFyQ29kZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbEtleS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjaGFyQ29kZXMucHVzaChjb2xLZXkuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuICAgIHJldHVybiBjaGFyQ29kZXM7XG59XG4vKipcbiAqIOe6teWQkemBjeWOhuihqOagvFxuICogQHBhcmFtIHNoZWV0IHhsc3jooajmoLzlr7nosaFcbiAqIEBwYXJhbSBzdGFydFJvdyDlvIDlp4vooYwg5LuOMeW8gOWni1xuICogQHBhcmFtIHN0YXJ0Q29sIOWIl+Wtl+espiDmr5TlpoJBIEJcbiAqIEBwYXJhbSBjYWxsYmFjayDpgY3ljoblm57osIMgKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4gdm9pZFxuICogQHBhcmFtIGlzU2hlZXRSb3dFbmQg5piv5ZCm6KGM57uT5p2f5Yik5pat5pa55rOVXG4gKiBAcGFyYW0gaXNTaGVldENvbEVuZCDmmK/lkKbliJfnu5PmnZ/liKTmlq3mlrnms5VcbiAqIEBwYXJhbSBpc1NraXBTaGVldFJvdyDmmK/lkKbot7Pov4fooYxcbiAqIEBwYXJhbSBpc1NraXBTaGVldENvbCDmmK/lkKbot7Pov4fliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZlcnRpY2FsRm9yRWFjaFNoZWV0KFxuICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgIHN0YXJ0Um93OiBudW1iZXIsXG4gICAgc3RhcnRDb2w6IHN0cmluZyxcbiAgICBjYWxsYmFjazogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4gdm9pZCxcbiAgICBpc1NoZWV0Um93RW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxuICAgIGlzU2hlZXRDb2xFbmQ/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbGtleTogc3RyaW5nKSA9PiBib29sZWFuLFxuICAgIGlzU2tpcFNoZWV0Um93PzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxuICAgIGlzU2tpcFNoZWV0Q29sPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZykgPT4gYm9vbGVhblxuKSB7XG4gICAgY29uc3Qgc2hlZXRSZWY6IHN0cmluZyA9IHNoZWV0W1wiIXJlZlwiXTtcbiAgICBjb25zdCBtYXhSb3dOdW0gPSBwYXJzZUludChzaGVldFJlZi5tYXRjaCgvXFxkKyQvKVswXSk7XG5cbiAgICBjb25zdCBtYXhDb2xLZXkgPSBzaGVldFJlZi5zcGxpdChcIjpcIilbMV0ubWF0Y2goL15bQS1aYS16XSsvKVswXTtcbiAgICBsZXQgbWF4Q29sS2V5Q29kZVN1bSA9IGdldENoYXJDb2RlU3VtKG1heENvbEtleSk7XG5cbiAgICBsZXQgY29sQ2hhckNvZGVzOiBudW1iZXJbXTtcbiAgICBsZXQgY29sS2V5OiBzdHJpbmc7XG4gICAgbGV0IGN1ckNvbENvZGVTdW06IG51bWJlciA9IDA7XG4gICAgY29uc3Qgc3RhcnRDaGFyY29kZXMgPSBzdHJpbmdUb0NoYXJDb2RlcyhzdGFydENvbCk7XG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0Um93OyBpIDw9IG1heFJvd051bTsgaSsrKSB7XG4gICAgICAgIGlmIChpc1NoZWV0Um93RW5kID8gaXNTaGVldFJvd0VuZChzaGVldCwgaSkgOiBmYWxzZSkgYnJlYWs7XG4gICAgICAgIGlmIChpc1NraXBTaGVldFJvdyA/IGlzU2tpcFNoZWV0Um93KHNoZWV0LCBpKSA6IGZhbHNlKSBjb250aW51ZTtcbiAgICAgICAgY29sQ2hhckNvZGVzID0gc3RhcnRDaGFyY29kZXMuY29uY2F0KFtdKTtcblxuICAgICAgICBjb2xLZXkgPSBzdGFydENvbDtcblxuICAgICAgICBsZXQgaGFzTmV4dENvbCA9IGlzU2hlZXRDb2xFbmQgPyAhaXNTaGVldENvbEVuZChzaGVldCwgY29sS2V5KSA6IHRydWU7XG4gICAgICAgIHdoaWxlIChoYXNOZXh0Q29sKSB7XG4gICAgICAgICAgICBpZiAoIShpc1NraXBTaGVldENvbCA/IGlzU2tpcFNoZWV0Q29sKHNoZWV0LCBjb2xLZXkpIDogZmFsc2UpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soc2hlZXQsIGNvbEtleSwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb2xLZXkgPSBnZXROZXh0Q29sS2V5KGNvbENoYXJDb2Rlcyk7XG4gICAgICAgICAgICBjdXJDb2xDb2RlU3VtID0gZ2V0Q2hhckNvZGVTdW0oY29sS2V5KTtcbiAgICAgICAgICAgIGlmIChtYXhDb2xLZXlDb2RlU3VtID49IGN1ckNvbENvZGVTdW0pIHtcbiAgICAgICAgICAgICAgICBoYXNOZXh0Q29sID0gaXNTaGVldENvbEVuZCA/ICFpc1NoZWV0Q29sRW5kKHNoZWV0LCBjb2xLZXkpIDogdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFzTmV4dENvbCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIOaoquWQkemBjeWOhuihqOagvFxuICogQHBhcmFtIHNoZWV0IHhsc3jooajmoLzlr7nosaFcbiAqIEBwYXJhbSBzdGFydFJvdyDlvIDlp4vooYwg5LuOMeW8gOWni1xuICogQHBhcmFtIHN0YXJ0Q29sIOWIl+Wtl+espiDmr5TlpoJBIEJcbiAqIEBwYXJhbSBjYWxsYmFjayDpgY3ljoblm57osIMgKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4gdm9pZFxuICogQHBhcmFtIGlzU2hlZXRSb3dFbmQg5piv5ZCm6KGM57uT5p2f5Yik5pat5pa55rOVXG4gKiBAcGFyYW0gaXNTaGVldENvbEVuZCDmmK/lkKbliJfnu5PmnZ/liKTmlq3mlrnms5VcbiAqIEBwYXJhbSBpc1NraXBTaGVldFJvdyDmmK/lkKbot7Pov4fooYxcbiAqIEBwYXJhbSBpc1NraXBTaGVldENvbCDmmK/lkKbot7Pov4fliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhvcml6b250YWxGb3JFYWNoU2hlZXQoXG4gICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgc3RhcnRSb3c6IG51bWJlcixcbiAgICBzdGFydENvbDogc3RyaW5nLFxuICAgIGNhbGxiYWNrOiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB2b2lkLFxuICAgIGlzU2hlZXRSb3dFbmQ/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IGJvb2xlYW4sXG4gICAgaXNTaGVldENvbEVuZD86IChzaGVldDogeGxzeC5TaGVldCwgY29sa2V5OiBzdHJpbmcpID0+IGJvb2xlYW4sXG4gICAgaXNTa2lwU2hlZXRSb3c/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IGJvb2xlYW4sXG4gICAgaXNTa2lwU2hlZXRDb2w/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKSA9PiBib29sZWFuXG4pIHtcbiAgICBjb25zdCBzaGVldFJlZjogc3RyaW5nID0gc2hlZXRbXCIhcmVmXCJdO1xuICAgIGNvbnN0IG1heFJvd051bSA9IHBhcnNlSW50KHNoZWV0UmVmLm1hdGNoKC9cXGQrJC8pWzBdKTtcblxuICAgIGNvbnN0IG1heENvbEtleSA9IHNoZWV0UmVmLnNwbGl0KFwiOlwiKVsxXS5tYXRjaCgvXltBLVphLXpdKy8pWzBdO1xuICAgIGNvbnN0IG1heENvbEtleUNvZGVTdW0gPSBnZXRDaGFyQ29kZVN1bShtYXhDb2xLZXkpO1xuICAgIGxldCBjb2xDaGFyQ29kZXM6IG51bWJlcltdO1xuICAgIGxldCBjb2xLZXk6IHN0cmluZztcbiAgICBjb2xDaGFyQ29kZXMgPSBzdHJpbmdUb0NoYXJDb2RlcyhzdGFydENvbCk7XG4gICAgbGV0IGN1ckNvbENvZGVTdW06IG51bWJlciA9IDA7XG4gICAgY29sS2V5ID0gc3RhcnRDb2w7XG4gICAgbGV0IGhhc05leHRDb2wgPSBpc1NoZWV0Q29sRW5kID8gIWlzU2hlZXRDb2xFbmQoc2hlZXQsIGNvbEtleSkgOiB0cnVlO1xuICAgIHdoaWxlIChoYXNOZXh0Q29sKSB7XG4gICAgICAgIGlmICghKGlzU2tpcFNoZWV0Q29sID8gaXNTa2lwU2hlZXRDb2woc2hlZXQsIGNvbEtleSkgOiBmYWxzZSkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBzdGFydFJvdzsgaSA8PSBtYXhSb3dOdW07IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpc1NoZWV0Um93RW5kID8gaXNTaGVldFJvd0VuZChzaGVldCwgaSkgOiBmYWxzZSkgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKGlzU2tpcFNoZWV0Um93ID8gaXNTa2lwU2hlZXRSb3coc2hlZXQsIGkpIDogZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNoZWV0LCBjb2xLZXksIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29sS2V5ID0gZ2V0TmV4dENvbEtleShjb2xDaGFyQ29kZXMpO1xuICAgICAgICBjdXJDb2xDb2RlU3VtID0gZ2V0Q2hhckNvZGVTdW0oY29sS2V5KTtcbiAgICAgICAgaWYgKG1heENvbEtleUNvZGVTdW0gPj0gY3VyQ29sQ29kZVN1bSkge1xuICAgICAgICAgICAgaGFzTmV4dENvbCA9IGlzU2hlZXRDb2xFbmQgPyAhaXNTaGVldENvbEVuZChzaGVldCwgY29sS2V5KSA6IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYXNOZXh0Q29sID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG5sZXQgY29sS2V5U3VtTWFwID0ge307XG5mdW5jdGlvbiBnZXRDaGFyQ29kZVN1bShjb2xLZXk6IHN0cmluZyk6IG51bWJlciB7XG4gICAgbGV0IHN1bTogbnVtYmVyID0gY29sS2V5U3VtTWFwW2NvbEtleV07XG4gICAgaWYgKCFzdW0pIHtcbiAgICAgICAgc3VtID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xLZXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBjb2xLZXkuY2hhckNvZGVBdChpKTtcbiAgICAgICAgfVxuICAgICAgICBjb2xLZXlTdW1NYXBbY29sS2V5XSA9IHN1bTtcbiAgICB9XG4gICAgcmV0dXJuIHN1bTtcbn1cbi8qKlxuICog6K+75Y+W6YWN572u6KGo5paH5Lu2IOWQjOatpeeahFxuICogQHBhcmFtIGZpbGVJbmZvXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkVGFibGVGaWxlKGZpbGVJbmZvOiBJRmlsZUluZm8pOiB4bHN4LldvcmtCb29rIHtcbiAgICBjb25zdCB3b3JrQm9vayA9IHhsc3gucmVhZEZpbGUoZmlsZUluZm8uZmlsZVBhdGgsIHsgdHlwZTogaXNDU1YoZmlsZUluZm8uZmlsZUV4dE5hbWUpID8gXCJzdHJpbmdcIiA6IFwiZmlsZVwiIH0pO1xuICAgIHJldHVybiB3b3JrQm9vaztcbn1cbi8qKlxuICog5qC55o2u5paH5Lu25ZCN5ZCO57yA5Yik5pat5piv5ZCm5Li6Y3N25paH5Lu2XG4gKiBAcGFyYW0gZmlsZUV4dE5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ1NWKGZpbGVFeHROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmlsZUV4dE5hbWUgPT09IFwiY3N2XCI7XG59XG4iLCJpbXBvcnQgKiBhcyB4bHN4IGZyb20gXCJ4bHN4XCI7XG5pbXBvcnQgeyB2YWx1ZVRyYW5zRnVuY01hcCB9IGZyb20gXCIuXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dlclwiO1xuaW1wb3J0IHsgaG9yaXpvbnRhbEZvckVhY2hTaGVldCwgaXNFbXB0eUNlbGwsIHJlYWRUYWJsZUZpbGUsIHZlcnRpY2FsRm9yRWFjaFNoZWV0IH0gZnJvbSBcIi4vdGFibGUtdXRpbHNcIjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJVGFibGVGaWVsZCB7XG4gICAgICAgIC8qKumFjee9ruihqOS4reazqOmHiuWAvCAqL1xuICAgICAgICB0ZXh0OiBzdHJpbmc7XG4gICAgICAgIC8qKumFjee9ruihqOS4reexu+Wei+WAvCAqL1xuICAgICAgICBvcmlnaW5UeXBlOiBzdHJpbmc7XG4gICAgICAgIC8qKumFjee9ruihqOS4reWtl+auteWQjeWAvCAqL1xuICAgICAgICBvcmlnaW5GaWVsZE5hbWU6IHN0cmluZztcbiAgICAgICAgLyoq6Kej5p6Q5ZCO55qE57G75Z6L5YC8ICovXG4gICAgICAgIHR5cGU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuino+aekOWQjueahOWtkOexu+Wei+WAvCAqL1xuICAgICAgICBzdWJUeXBlPzogc3RyaW5nO1xuICAgICAgICAvKirop6PmnpDlkI7nmoTlrZfmrrXlkI3lgLwgKi9cbiAgICAgICAgZmllbGROYW1lPzogc3RyaW5nO1xuICAgICAgICAvKirlr7nosaHnmoTlrZDlrZfmrrXlkI0gKi9cbiAgICAgICAgc3ViRmllbGROYW1lPzogc3RyaW5nO1xuICAgICAgICAvKirlpJrliJflr7nosaEgKi9cbiAgICAgICAgaXNNdXRpQ29sT2JqPzogYm9vbGVhbjtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElUYWJsZURlZmluZSB7XG4gICAgICAgIC8qKumFjee9ruihqOWQjSAqL1xuICAgICAgICB0YWJsZU5hbWU6IHN0cmluZztcbiAgICAgICAgLyoq6YWN572u6KGo57G75Z6LIOm7mOiupOS4pOenjTogdmVydGljYWwg5ZKMIGhvcml6b250YWwqL1xuICAgICAgICB0YWJsZVR5cGU6IHN0cmluZztcblxuICAgICAgICAvKirlvIDlp4vooYzku44x5byA5aeLICovXG4gICAgICAgIHN0YXJ0Um93OiBudW1iZXI7XG4gICAgICAgIC8qKuW8gOWni+WIl+S7jkHlvIDlp4sgKi9cbiAgICAgICAgc3RhcnRDb2w6IHN0cmluZztcbiAgICAgICAgLyoq5Z6C55u06Kej5p6Q5a2X5q615a6a5LmJICovXG4gICAgICAgIHZlcnRpY2FsRmllbGREZWZpbmU6IElWZXJ0aWNhbEZpZWxkRGVmaW5lO1xuICAgICAgICAvKirmqKrlkJHop6PmnpDlrZfmrrXlrprkuYkgKi9cbiAgICAgICAgaG9yaXpvbnRhbEZpZWxkRGVmaW5lOiBJSG9yaXpvbnRhbEZpZWxkRGVmaW5lO1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSUhvcml6b250YWxGaWVsZERlZmluZSB7XG4gICAgICAgIC8qKuexu+Wei+ihjCAqL1xuICAgICAgICB0eXBlQ29sOiBzdHJpbmc7XG4gICAgICAgIC8qKuWtl+auteWQjeihjCAqL1xuICAgICAgICBmaWVsZENvbDogc3RyaW5nO1xuICAgICAgICAvKirms6jph4rooYwgKi9cbiAgICAgICAgdGV4dENvbDogc3RyaW5nO1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSVZlcnRpY2FsRmllbGREZWZpbmUge1xuICAgICAgICAvKirnsbvlnovooYwgKi9cbiAgICAgICAgdHlwZVJvdzogbnVtYmVyO1xuICAgICAgICAvKirlrZfmrrXlkI3ooYwgKi9cbiAgICAgICAgZmllbGRSb3c6IG51bWJlcjtcbiAgICAgICAgLyoq5rOo6YeK6KGMICovXG4gICAgICAgIHRleHRSb3c6IG51bWJlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5a2X5q615a2X5YW4XG4gICAgICoga2V55piv5YiXY29sS2V5XG4gICAgICogdmFsdWXmmK/lrZfmrrXlr7nosaFcbiAgICAgKi9cbiAgICB0eXBlIENvbEtleVRhYmxlRmllbGRNYXAgPSB7IFtrZXk6IHN0cmluZ106IElUYWJsZUZpZWxkIH07XG5cbiAgICAvKipcbiAgICAgKiDooajmoLznmoTkuIDooYzmiJbogIXkuIDliJdcbiAgICAgKiBrZXnkuLrlrZfmrrXlkI3lgLzvvIx2YWx1ZeS4uuihqOagvOeahOS4gOagvFxuICAgICAqL1xuICAgIHR5cGUgVGFibGVSb3dPckNvbCA9IHsgW2tleTogc3RyaW5nXTogSVRhYmxlQ2VsbCB9O1xuICAgIC8qKlxuICAgICAqIOihqOagvOeahOS4gOagvFxuICAgICAqL1xuICAgIGludGVyZmFjZSBJVGFibGVDZWxsIHtcbiAgICAgICAgLyoq5a2X5q615a+56LGhICovXG4gICAgICAgIGZpbGVkOiBJVGFibGVGaWVsZDtcbiAgICAgICAgLyoq5YC8ICovXG4gICAgICAgIHZhbHVlOiBhbnk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOihqOagvOihjOaIluWIl+eahOWtl+WFuFxuICAgICAqIGtleeS4uuihjOe0ouW8le+8jHZhbHVl5Li66KGo5qC855qE5LiA6KGMXG4gICAgICovXG4gICAgdHlwZSBUYWJsZVJvd09yQ29sTWFwID0geyBba2V5OiBzdHJpbmddOiBUYWJsZVJvd09yQ29sIH07XG4gICAgLyoqXG4gICAgICog6KGo5qC86KGM5oiW5YiX5YC85pWw57uEXG4gICAgICoga2V55Li76ZSu77yMdmFsdWXmmK/lgLzmlbDnu4RcbiAgICAgKi9cbiAgICB0eXBlIFJvd09yQ29sVmFsdWVzTWFwID0geyBba2V5OiBzdHJpbmddOiBhbnlbXSB9O1xuICAgIGludGVyZmFjZSBJVGFibGVWYWx1ZXMge1xuICAgICAgICAvKirlrZfmrrXlkI3mlbDnu4QgKi9cbiAgICAgICAgZmllbGRzOiBzdHJpbmdbXTtcbiAgICAgICAgLyoq6KGo5qC85YC85pWw57uEICovXG4gICAgICAgIHJvd09yQ29sVmFsdWVzTWFwOiBSb3dPckNvbFZhbHVlc01hcDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kej5p6Q57uT5p6cXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElUYWJsZVBhcnNlUmVzdWx0IHtcbiAgICAgICAgLyoq6YWN572u6KGo5a6a5LmJICovXG4gICAgICAgIHRhYmxlRGVmaW5lPzogSVRhYmxlRGVmaW5lO1xuICAgICAgICAvKirlvZPliY3liIbooajlkI0gKi9cbiAgICAgICAgY3VyU2hlZXROYW1lPzogc3RyaW5nO1xuICAgICAgICAvKirlrZfmrrXlrZflhbggKi9cbiAgICAgICAgZmlsZWRNYXA/OiBDb2xLZXlUYWJsZUZpZWxkTWFwO1xuICAgICAgICAvLyAvKirooajmoLzooYzmiJbliJfnmoTlrZflhbggKi9cbiAgICAgICAgLy8gcm93T3JDb2xNYXA6IFRhYmxlUm93T3JDb2xNYXBcbiAgICAgICAgLyoq5Y2V5Liq6KGo5qC85a+56LGhICovXG4gICAgICAgIC8qKmtleeaYr+S4u+mUruWAvO+8jHZhbHVl5piv5LiA6KGM5a+56LGhICovXG4gICAgICAgIHRhYmxlT2JqPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcbiAgICAgICAgLyoq5b2T5YmN6KGM5oiW5YiX5a+56LGhICovXG4gICAgICAgIGN1clJvd09yQ29sT2JqPzogYW55O1xuICAgICAgICAvKirkuLvplK7lgLwgKi9cbiAgICAgICAgbWFpbktleUZpZWxkTmFtZT86IHN0cmluZztcbiAgICB9XG5cbiAgICAvKirlgLzovazmjaLmlrnms5UgKi9cbiAgICBpbnRlcmZhY2UgSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgICAgICBlcnJvcj86IGFueTtcbiAgICAgICAgdmFsdWU/OiBhbnk7XG4gICAgfVxuICAgIHR5cGUgVmFsdWVUcmFuc0Z1bmMgPSAoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBhbnkpID0+IElUcmFuc1ZhbHVlUmVzdWx0O1xuICAgIC8qKlxuICAgICAqIOWAvOi9rOaNouaWueazleWtl+WFuFxuICAgICAqIGtleeaYr+exu+Wei2tleVxuICAgICAqIHZhbHVl5piv5pa55rOVXG4gICAgICovXG4gICAgdHlwZSBWYWx1ZVRyYW5zRnVuY01hcCA9IHsgW2tleTogc3RyaW5nXTogVmFsdWVUcmFuc0Z1bmMgfTtcbn1cbmV4cG9ydCBlbnVtIFRhYmxlVHlwZSB7XG4gICAgdmVydGljYWwgPSBcInZlcnRpY2FsXCIsXG4gICAgaG9yaXpvbnRhbCA9IFwiaG9yaXpvbnRhbFwiXG59XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0UGFyc2VIYW5kbGVyIGltcGxlbWVudHMgSVRhYmxlUGFyc2VIYW5kbGVyIHtcbiAgICBwcml2YXRlIF92YWx1ZVRyYW5zRnVuY01hcDogVmFsdWVUcmFuc0Z1bmNNYXA7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlVHJhbnNGdW5jTWFwID0gdmFsdWVUcmFuc0Z1bmNNYXA7XG4gICAgfVxuICAgIGdldFRhYmxlRGVmaW5lKGZpbGVJbmZvOiBJRmlsZUluZm8sIHdvcmtCb29rOiB4bHN4LldvcmtCb29rKTogSVRhYmxlRGVmaW5lIHtcbiAgICAgICAgLy/lj5booajmoLzmlofku7blkI3kuLrooajmoLzlkI1cbiAgICAgICAgY29uc3QgdGFibGVOYW1lID0gZmlsZUluZm8uZmlsZU5hbWU7XG5cbiAgICAgICAgY29uc3QgdGFibGVEZWZpbmU6IFBhcnRpYWw8SVRhYmxlRGVmaW5lPiA9IHtcbiAgICAgICAgICAgIHRhYmxlTmFtZTogdGFibGVOYW1lXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGNlbGxLZXk6IHN0cmluZztcbiAgICAgICAgbGV0IGNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdDtcbiAgICAgICAgLy/lj5bnrKzkuIDkuKrooahcbiAgICAgICAgY29uc3Qgc2hlZXROYW1lcyA9IHdvcmtCb29rLlNoZWV0TmFtZXM7XG4gICAgICAgIGxldCBzaGVldDogeGxzeC5TaGVldDtcbiAgICAgICAgbGV0IGZpcnN0Q2VsbFZhbHVlOiB7IHRhYmxlTmFtZUluU2hlZXQ6IHN0cmluZzsgdGFibGVUeXBlOiBzdHJpbmcgfTtcbiAgICAgICAgbGV0IGZpcnN0Q2VsbE9iajogeGxzeC5DZWxsT2JqZWN0O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNoZWV0ID0gd29ya0Jvb2suU2hlZXRzW3NoZWV0TmFtZXNbaV1dO1xuICAgICAgICAgICAgZmlyc3RDZWxsT2JqID0gc2hlZXRbXCJBXCIgKyAxXTtcbiAgICAgICAgICAgIGlmICghaXNFbXB0eUNlbGwoZmlyc3RDZWxsT2JqKSkge1xuICAgICAgICAgICAgICAgIGZpcnN0Q2VsbFZhbHVlID0gdGhpcy5fZ2V0Rmlyc3RDZWxsVmFsdWUoZmlyc3RDZWxsT2JqKTtcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RDZWxsVmFsdWUgJiYgZmlyc3RDZWxsVmFsdWUudGFibGVOYW1lSW5TaGVldCA9PT0gdGFibGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZpcnN0Q2VsbFZhbHVlIHx8IGZpcnN0Q2VsbFZhbHVlLnRhYmxlTmFtZUluU2hlZXQgIT09IHRhYmxlTmFtZSkge1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhg6KGo5qC85LiN6KeE6IyDLOi3s+i/h+ino+aekCzot6/lvoQ6JHtmaWxlSW5mby5maWxlUGF0aH1gLCBcImVycm9yXCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGFibGVEZWZpbmUudGFibGVUeXBlID0gZmlyc3RDZWxsVmFsdWUudGFibGVUeXBlO1xuICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLnZlcnRpY2FsRmllbGREZWZpbmUgPSB7fSBhcyBhbnk7XG4gICAgICAgICAgICBjb25zdCB2ZXJ0aWNhbEZpZWxkRGVmaW5lOiBJVmVydGljYWxGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLnZlcnRpY2FsRmllbGREZWZpbmU7XG4gICAgICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnRleHRSb3cgPSAxO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgICAgIGNlbGxLZXkgPSBcIkFcIiArIGk7XG4gICAgICAgICAgICAgICAgY2VsbE9iaiA9IHNoZWV0W2NlbGxLZXldO1xuICAgICAgICAgICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsT2JqKSB8fCBjZWxsT2JqLnYgPT09IFwiTk9cIiB8fCBjZWxsT2JqLnYgPT09IFwiRU5EXCIgfHwgY2VsbE9iai52ID09PSBcIlNUQVJUXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3cgPSBpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2VsbE9iai52ID09PSBcIkNMSUVOVFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3cgPSBpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2VsbE9iai52ID09PSBcIlRZUEVcIikge1xuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3cgPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGFibGVEZWZpbmUuc3RhcnRSb3cgJiYgdmVydGljYWxGaWVsZERlZmluZS5maWVsZFJvdyAmJiB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3cpIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydENvbCA9IFwiQlwiO1xuICAgICAgICB9IGVsc2UgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLmhvcml6b250YWxGaWVsZERlZmluZSA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgIGNvbnN0IGhvcml6b250YWxGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLmhvcml6b250YWxGaWVsZERlZmluZTtcbiAgICAgICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZS50ZXh0Q29sID0gXCJBXCI7XG4gICAgICAgICAgICBob3Jpem9udGFsRmllbGREZWZpbmUudHlwZUNvbCA9IFwiQlwiO1xuICAgICAgICAgICAgaG9yaXpvbnRhbEZpZWxkRGVmaW5lLmZpZWxkQ29sID0gXCJDXCI7XG4gICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydENvbCA9IFwiRVwiO1xuICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3cgPSAyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhYmxlRGVmaW5lIGFzIGFueTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfZ2V0Rmlyc3RDZWxsVmFsdWUoZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QpIHtcbiAgICAgICAgaWYgKCFmaXJzdENlbGxPYmopIHJldHVybjtcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlcyA9IChmaXJzdENlbGxPYmoudiBhcyBzdHJpbmcpLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgbGV0IHRhYmxlTmFtZUluU2hlZXQ6IHN0cmluZztcbiAgICAgICAgbGV0IHRhYmxlVHlwZTogc3RyaW5nO1xuICAgICAgICBpZiAoY2VsbFZhbHVlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB0YWJsZU5hbWVJblNoZWV0ID0gY2VsbFZhbHVlc1sxXTtcbiAgICAgICAgICAgIHRhYmxlVHlwZSA9IGNlbGxWYWx1ZXNbMF0gPT09IFwiSFwiID8gVGFibGVUeXBlLmhvcml6b250YWwgOiBUYWJsZVR5cGUudmVydGljYWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YWJsZU5hbWVJblNoZWV0ID0gY2VsbFZhbHVlc1swXTtcbiAgICAgICAgICAgIHRhYmxlVHlwZSA9IFRhYmxlVHlwZS52ZXJ0aWNhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB0YWJsZU5hbWVJblNoZWV0OiB0YWJsZU5hbWVJblNoZWV0LCB0YWJsZVR5cGU6IHRhYmxlVHlwZSB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDliKTmlq3ooajmoLzmmK/lkKbog73op6PmnpBcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKi9cbiAgICBjaGVja1NoZWV0Q2FuUGFyc2UodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIHNoZWV0TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8v5aaC5p6c6L+Z5Liq6KGo5Liq56ys5LiA5qC85YC85LiN562J5LqO6KGo5ZCN77yM5YiZ5LiN6Kej5p6QXG4gICAgICAgIGNvbnN0IGZpcnN0Q2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbXCJBXCIgKyAxXTtcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsVmFsdWUgPSB0aGlzLl9nZXRGaXJzdENlbGxWYWx1ZShmaXJzdENlbGxPYmopO1xuICAgICAgICBpZiAoZmlyc3RDZWxsT2JqICYmIHRhYmxlRGVmaW5lKSB7XG4gICAgICAgICAgICBpZiAoZmlyc3RDZWxsVmFsdWUudGFibGVOYW1lSW5TaGVldCAhPT0gdGFibGVEZWZpbmUudGFibGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6KGo6KGM57uT5p2f5Yik5patXG4gICAgICogQHBhcmFtIHRhYmxlRGVmaW5lXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIHJvd1xuICAgICAqL1xuICAgIGlzU2hlZXRSb3dFbmQodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIHJvdzogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xuXG4gICAgICAgIC8vIH0gZWxzZSBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuXG4gICAgICAgIC8vIH1cbiAgICAgICAgLy/liKTmlq3kuIrkuIDooYznmoTmoIflv5fmmK/lkKbkuLpFTkRcbiAgICAgICAgaWYgKHJvdyA+IDEpIHtcbiAgICAgICAgICAgIHJvdyA9IHJvdyAtIDE7XG4gICAgICAgICAgICBjb25zdCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtcIkFcIiArIHJvd107XG4gICAgICAgICAgICByZXR1cm4gY2VsbE9iaiAmJiBjZWxsT2JqLnYgPT09IFwiRU5EXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6KGo5YiX57uT5p2f5Yik5patXG4gICAgICogQHBhcmFtIHRhYmxlRGVmaW5lXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIGNvbEtleVxuICAgICAqL1xuICAgIGlzU2hlZXRDb2xFbmQodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8v5Yik5pat6L+Z5LiA5YiX56ys5LiA6KGM5piv5ZCm5Li656m6XG4gICAgICAgIGNvbnN0IGZpcnN0Q2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgMV07XG4gICAgICAgIC8vIGNvbnN0IHR5cGVDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyB0YWJsZUZpbGUudGFibGVEZWZpbmUudHlwZVJvd107XG4gICAgICAgIHJldHVybiBpc0VtcHR5Q2VsbChmaXJzdENlbGxPYmopO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmo4Dmn6XooYzmmK/lkKbpnIDopoHop6PmnpBcbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmVcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gcm93SW5kZXhcbiAgICAgKi9cbiAgICBjaGVja1Jvd05lZWRQYXJzZSh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtcIkFcIiArIHJvd0luZGV4XTtcbiAgICAgICAgaWYgKGNlbGxPYmogJiYgY2VsbE9iai52ID09PSBcIk5PXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kej5p6Q5Y2V5Liq5qC85a2QXG4gICAgICogQHBhcmFtIHRhYmxlUGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICogQHBhcmFtIHJvd0luZGV4XG4gICAgICogQHBhcmFtIGlzTmV3Um93T3JDb2wg5piv5ZCm5Li65paw55qE5LiA6KGM5oiW6ICF5LiA5YiXXG4gICAgICovXG4gICAgcGFyc2VWZXJ0aWNhbENlbGwoXG4gICAgICAgIHRhYmxlUGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICAgICAgY29sS2V5OiBzdHJpbmcsXG4gICAgICAgIHJvd0luZGV4OiBudW1iZXIsXG4gICAgICAgIGlzTmV3Um93T3JDb2w6IGJvb2xlYW5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmllbGRJbmZvID0gdGhpcy5nZXRWZXJ0aWNhbFRhYmxlRmllbGQodGFibGVQYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgpO1xuICAgICAgICBpZiAoIWZpZWxkSW5mbykgcmV0dXJuO1xuICAgICAgICBjb25zdCBjZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJhbnNSZXN1bHQgPSB0aGlzLnRyYW5zVmFsdWUodGFibGVQYXJzZVJlc3VsdCwgZmllbGRJbmZvLCBjZWxsLnYpO1xuICAgICAgICBpZiAodHJhbnNSZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgICAgIExvZ2dlci5sb2coXG4gICAgICAgICAgICAgICAgYOihqOagvDoke3RhYmxlUGFyc2VSZXN1bHQuZmlsZVBhdGh9LOWIhuihqDoke3RhYmxlUGFyc2VSZXN1bHQuY3VyU2hlZXROYW1lfSzooYw6JHtyb3dJbmRleH0s5YiX77yaJHtjb2xLZXl96Kej5p6Q5Ye66ZSZYCxcbiAgICAgICAgICAgICAgICBcImVycm9yXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBMb2dnZXIubG9nKHRyYW5zUmVzdWx0LmVycm9yLCBcImVycm9yXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyYW5zZWRWYWx1ZSA9IHRyYW5zUmVzdWx0LnZhbHVlO1xuICAgICAgICBsZXQgbWFpbktleUZpZWxkTmFtZTogc3RyaW5nID0gdGFibGVQYXJzZVJlc3VsdC5tYWluS2V5RmllbGROYW1lO1xuICAgICAgICBpZiAoIW1haW5LZXlGaWVsZE5hbWUpIHtcbiAgICAgICAgICAgIC8v56ys5LiA5Liq5a2X5q615bCx5piv5Li76ZSuXG4gICAgICAgICAgICBtYWluS2V5RmllbGROYW1lID0gZmllbGRJbmZvLmZpZWxkTmFtZTtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQubWFpbktleUZpZWxkTmFtZSA9IGZpZWxkSW5mby5maWVsZE5hbWU7XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqID0ge307XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJvd09yQ29sT2JqOiBhbnkgPSB0YWJsZVBhcnNlUmVzdWx0LmN1clJvd09yQ29sT2JqO1xuICAgICAgICBpZiAoaXNOZXdSb3dPckNvbCkge1xuICAgICAgICAgICAgLy/mlrDnmoTkuIDooYxcbiAgICAgICAgICAgIHJvd09yQ29sT2JqID0ge307XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LmN1clJvd09yQ29sT2JqID0gdGFibGVQYXJzZVJlc3VsdC50YWJsZU9ialt0cmFuc2VkVmFsdWVdID0gcm93T3JDb2xPYmo7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGRJbmZvLmlzTXV0aUNvbE9iaikge1xuICAgICAgICAgICAgbGV0IHN1Yk9iaiA9IHJvd09yQ29sT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdO1xuICAgICAgICAgICAgaWYgKCFzdWJPYmopIHtcbiAgICAgICAgICAgICAgICBzdWJPYmogPSB7fTtcbiAgICAgICAgICAgICAgICByb3dPckNvbE9ialtmaWVsZEluZm8uZmllbGROYW1lXSA9IHN1Yk9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1Yk9ialtmaWVsZEluZm8uc3ViRmllbGROYW1lXSA9IHRyYW5zZWRWYWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJvd09yQ29sT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdID0gdHJhbnNlZFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOaoquWQkeWNleS4quagvOWtkFxuICAgICAqIEBwYXJhbSB0YWJsZVBhcnNlUmVzdWx0XG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIGNvbEtleVxuICAgICAqIEBwYXJhbSByb3dJbmRleFxuICAgICAqIEBwYXJhbSBpc05ld1Jvd09yQ29sIOaYr+WQpuS4uuaWsOeahOS4gOihjOaIluiAheS4gOWIl1xuICAgICAqL1xuICAgIHBhcnNlSG9yaXpvbnRhbENlbGwoXG4gICAgICAgIHRhYmxlUGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICAgICAgY29sS2V5OiBzdHJpbmcsXG4gICAgICAgIHJvd0luZGV4OiBudW1iZXIsXG4gICAgICAgIGlzTmV3Um93T3JDb2w6IGJvb2xlYW5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmllbGRJbmZvID0gdGhpcy5nZXRIb3Jpem9udGFsVGFibGVGaWVsZCh0YWJsZVBhcnNlUmVzdWx0LCBzaGVldCwgY29sS2V5LCByb3dJbmRleCk7XG4gICAgICAgIGlmICghZmllbGRJbmZvKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGNlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHJvd0luZGV4XTtcbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKGNlbGwpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJhbnNSZXN1bHQgPSB0aGlzLnRyYW5zVmFsdWUodGFibGVQYXJzZVJlc3VsdCwgZmllbGRJbmZvLCBjZWxsLnYpO1xuICAgICAgICBpZiAodHJhbnNSZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgICAgIExvZ2dlci5sb2coXG4gICAgICAgICAgICAgICAgYOihqOagvDoke3RhYmxlUGFyc2VSZXN1bHQuZmlsZVBhdGh9LOWIhuihqDoke3RhYmxlUGFyc2VSZXN1bHQuY3VyU2hlZXROYW1lfSzooYw6JHtyb3dJbmRleH0s5YiX77yaJHtjb2xLZXl96Kej5p6Q5Ye66ZSZYCxcbiAgICAgICAgICAgICAgICBcImVycm9yXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBMb2dnZXIubG9nKHRyYW5zUmVzdWx0LmVycm9yLCBcImVycm9yXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyYW5zZWRWYWx1ZSA9IHRyYW5zUmVzdWx0LnZhbHVlO1xuICAgICAgICBpZiAoIXRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmopIHtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmogPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmllbGRJbmZvLmlzTXV0aUNvbE9iaikge1xuICAgICAgICAgICAgbGV0IHN1Yk9iaiA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV07XG4gICAgICAgICAgICBpZiAoIXN1Yk9iaikge1xuICAgICAgICAgICAgICAgIHN1Yk9iaiA9IHt9O1xuICAgICAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSBzdWJPYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJPYmpbZmllbGRJbmZvLnN1YkZpZWxkTmFtZV0gPSB0cmFuc2VkVmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdID0gdHJhbnNlZFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOWHuuWtl+auteWvueixoVxuICAgICAqIEBwYXJhbSB0YWJsZVBhcnNlUmVzdWx0XG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIGNvbEtleVxuICAgICAqIEBwYXJhbSByb3dJbmRleFxuICAgICAqL1xuICAgIGdldFZlcnRpY2FsVGFibGVGaWVsZChcbiAgICAgICAgdGFibGVQYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsXG4gICAgICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgICAgICBjb2xLZXk6IHN0cmluZyxcbiAgICAgICAgcm93SW5kZXg6IG51bWJlclxuICAgICk6IElUYWJsZUZpZWxkIHtcbiAgICAgICAgY29uc3QgdGFibGVEZWZpbmUgPSB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lO1xuICAgICAgICBsZXQgdGFibGVGaWxlZE1hcCA9IHRhYmxlUGFyc2VSZXN1bHQuZmlsZWRNYXA7XG4gICAgICAgIGlmICghdGFibGVGaWxlZE1hcCkge1xuICAgICAgICAgICAgdGFibGVGaWxlZE1hcCA9IHt9O1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5maWxlZE1hcCA9IHRhYmxlRmlsZWRNYXA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmVydGljYWxGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLnZlcnRpY2FsRmllbGREZWZpbmU7XG4gICAgICAgIGNvbnN0IGZpbGVkQ2VsbCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3ddO1xuICAgICAgICBsZXQgb3JpZ2luRmllbGROYW1lOiBzdHJpbmc7XG4gICAgICAgIGlmICghaXNFbXB0eUNlbGwoZmlsZWRDZWxsKSkge1xuICAgICAgICAgICAgb3JpZ2luRmllbGROYW1lID0gZmlsZWRDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGlmICghb3JpZ2luRmllbGROYW1lKSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IGZpZWxkOiBJVGFibGVGaWVsZCA9IHt9IGFzIGFueTtcbiAgICAgICAgLy/nvJPlrZhcbiAgICAgICAgaWYgKHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIC8v5rOo6YeKXG4gICAgICAgIGNvbnN0IHRleHRDZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnRleHRSb3ddO1xuICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKHRleHRDZWxsKSkge1xuICAgICAgICAgICAgZmllbGQudGV4dCA9IHRleHRDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIC8v57G75Z6LXG4gICAgICAgIGxldCBpc09ialR5cGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgY29uc3QgdHlwZUNlbGwgPSBzaGVldFtjb2xLZXkgKyB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3ddO1xuXG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbCh0eXBlQ2VsbCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmllbGQub3JpZ2luVHlwZSA9IHR5cGVDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICAgICAgaWYgKGZpZWxkLm9yaWdpblR5cGUuaW5jbHVkZXMoXCJtZjpcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlU3RycyA9IGZpZWxkLm9yaWdpblR5cGUuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlU3Rycy5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gdHlwZVN0cnNbMl07XG4gICAgICAgICAgICAgICAgaXNPYmpUeXBlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmllbGQudHlwZSA9IGZpZWxkLm9yaWdpblR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmllbGQuaXNNdXRpQ29sT2JqID0gaXNPYmpUeXBlO1xuICAgICAgICAvL+Wtl+auteWQjVxuICAgICAgICBmaWVsZC5vcmlnaW5GaWVsZE5hbWUgPSBvcmlnaW5GaWVsZE5hbWU7XG4gICAgICAgIGlmIChpc09ialR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkU3RycyA9IGZpZWxkLm9yaWdpbkZpZWxkTmFtZS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICBpZiAoZmllbGRTdHJzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkU3Ryc1swXTtcbiAgICAgICAgICAgIGZpZWxkLnN1YkZpZWxkTmFtZSA9IGZpZWxkU3Ryc1sxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkLm9yaWdpbkZpZWxkTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhYmxlRmlsZWRNYXBbY29sS2V5XSA9IGZpZWxkO1xuICAgICAgICByZXR1cm4gZmllbGQ7XG4gICAgfVxuICAgIGdldEhvcml6b250YWxUYWJsZUZpZWxkKFxuICAgICAgICB0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgICAgIGNvbEtleTogc3RyaW5nLFxuICAgICAgICByb3dJbmRleDogbnVtYmVyXG4gICAgKTogSVRhYmxlRmllbGQge1xuICAgICAgICBjb25zdCB0YWJsZURlZmluZSA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVEZWZpbmU7XG4gICAgICAgIGxldCB0YWJsZUZpbGVkTWFwID0gdGFibGVQYXJzZVJlc3VsdC5maWxlZE1hcDtcbiAgICAgICAgaWYgKCF0YWJsZUZpbGVkTWFwKSB7XG4gICAgICAgICAgICB0YWJsZUZpbGVkTWFwID0ge307XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LmZpbGVkTWFwID0gdGFibGVGaWxlZE1hcDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS5ob3Jpem9udGFsRmllbGREZWZpbmU7XG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZUNlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2hGaWVsZERlZmluZS5maWVsZENvbCArIHJvd0luZGV4XTtcbiAgICAgICAgbGV0IG9yaWdpbkZpZWxkTmFtZTogc3RyaW5nO1xuICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGZpZWxkTmFtZUNlbGwpKSB7XG4gICAgICAgICAgICBvcmlnaW5GaWVsZE5hbWUgPSBmaWVsZE5hbWVDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGlmICghb3JpZ2luRmllbGROYW1lKSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGxldCBmaWVsZDogSVRhYmxlRmllbGQgPSB7fSBhcyBhbnk7XG5cbiAgICAgICAgY29uc3QgdGV4dENlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2hGaWVsZERlZmluZS50ZXh0Q29sICsgcm93SW5kZXhdO1xuICAgICAgICAvL+azqOmHilxuICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKHRleHRDZWxsKSkge1xuICAgICAgICAgICAgZmllbGQudGV4dCA9IHRleHRDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGxldCBpc09ialR5cGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgLy/nsbvlnotcbiAgICAgICAgY29uc3QgdHlwZUNlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2hGaWVsZERlZmluZS50eXBlQ29sICsgcm93SW5kZXhdO1xuXG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbCh0eXBlQ2VsbCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/lpITnkIbnsbvlnotcbiAgICAgICAgICAgIGZpZWxkLm9yaWdpblR5cGUgPSB0eXBlQ2VsbC52IGFzIHN0cmluZztcbiAgICAgICAgICAgIGlmIChmaWVsZC5vcmlnaW5UeXBlLmluY2x1ZGVzKFwibWY6XCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZVN0cnMgPSBmaWVsZC5vcmlnaW5UeXBlLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZVN0cnMubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmllbGQudHlwZSA9IHR5cGVTdHJzWzJdO1xuICAgICAgICAgICAgICAgIGlzT2JqVHlwZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpZWxkLnR5cGUgPSBmaWVsZC5vcmlnaW5UeXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpZWxkLmlzTXV0aUNvbE9iaiA9IGlzT2JqVHlwZTtcbiAgICAgICAgZmllbGQub3JpZ2luRmllbGROYW1lID0gb3JpZ2luRmllbGROYW1lO1xuICAgICAgICBpZiAoaXNPYmpUeXBlKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZFN0cnMgPSBmaWVsZC5vcmlnaW5GaWVsZE5hbWUuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgaWYgKGZpZWxkU3Rycy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWVsZC5maWVsZE5hbWUgPSBmaWVsZFN0cnNbMF07XG4gICAgICAgICAgICBmaWVsZC5zdWJGaWVsZE5hbWUgPSBmaWVsZFN0cnNbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZC5maWVsZE5hbWUgPSBmaWVsZC5vcmlnaW5GaWVsZE5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgdGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdID0gZmllbGQ7XG4gICAgICAgIHJldHVybiBmaWVsZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qOA5p+l5YiX5piv5ZCm6ZyA6KaB6Kej5p6QXG4gICAgICogQHBhcmFtIHRhYmxlRGVmaW5lXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIGNvbEtleVxuICAgICAqL1xuICAgIGNoZWNrQ29sTmVlZFBhcnNlKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAvLyDlpoLmnpznsbvlnovmiJbogIXliJnkuI3pnIDopoHop6PmnpBcbiAgICAgICAgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLnZlcnRpY2FsKSB7XG4gICAgICAgICAgICBjb25zdCB2ZXJ0aWNhbEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUudmVydGljYWxGaWVsZERlZmluZTtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3ddO1xuICAgICAgICAgICAgY29uc3QgZmllbGRDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyB2ZXJ0aWNhbEZpZWxkRGVmaW5lLmZpZWxkUm93XTtcbiAgICAgICAgICAgIGlmIChpc0VtcHR5Q2VsbCh0eXBlQ2VsbE9iaikgfHwgaXNFbXB0eUNlbGwoZmllbGRDZWxsT2JqKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuICAgICAgICAgICAgY29uc3QgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgMV07XG4gICAgICAgICAgICBpZiAoaXNFbXB0eUNlbGwoY2VsbE9iaikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOi9rOaNouihqOagvOeahOWAvFxuICAgICAqIEBwYXJhbSBwYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBmaWxlZEl0ZW1cbiAgICAgKiBAcGFyYW0gY2VsbFZhbHVlXG4gICAgICovXG4gICAgcHVibGljIHRyYW5zVmFsdWUocGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LCBmaWxlZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IGFueSk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICAgICAgbGV0IHRyYW5zUmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdDtcblxuICAgICAgICBsZXQgdHJhbnNGdW5jID0gdGhpcy5fdmFsdWVUcmFuc0Z1bmNNYXBbZmlsZWRJdGVtLnR5cGVdO1xuICAgICAgICBpZiAoIXRyYW5zRnVuYykge1xuICAgICAgICAgICAgdHJhbnNGdW5jID0gdGhpcy5fdmFsdWVUcmFuc0Z1bmNNYXBbXCJqc29uXCJdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zUmVzdWx0ID0gdHJhbnNGdW5jKGZpbGVkSXRlbSwgY2VsbFZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRyYW5zUmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOino+aekOmFjee9ruihqOaWh+S7tlxuICAgICAqIEBwYXJhbSBwYXJzZUNvbmZpZyDop6PmnpDphY3nva5cbiAgICAgKiBAcGFyYW0gZmlsZUluZm8g5paH5Lu25L+h5oGvXG4gICAgICogQHBhcmFtIHBhcnNlUmVzdWx0IOino+aekOe7k+aenFxuICAgICAqL1xuICAgIHB1YmxpYyBwYXJzZVRhYmxlRmlsZShcbiAgICAgICAgcGFyc2VDb25maWc6IElUYWJsZUNvbnZlcnRDb25maWcsXG4gICAgICAgIGZpbGVJbmZvOiBJRmlsZUluZm8sXG4gICAgICAgIHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdFxuICAgICk6IElUYWJsZVBhcnNlUmVzdWx0IHtcbiAgICAgICAgY29uc3Qgd29ya2Jvb2sgPSByZWFkVGFibGVGaWxlKGZpbGVJbmZvKTtcbiAgICAgICAgaWYgKCF3b3JrYm9vay5TaGVldE5hbWVzLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNoZWV0TmFtZXMgPSB3b3JrYm9vay5TaGVldE5hbWVzO1xuICAgICAgICBjb25zdCB0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lID0gdGhpcy5nZXRUYWJsZURlZmluZShmaWxlSW5mbywgd29ya2Jvb2spO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHt9XG4gICAgICAgIGlmICghdGFibGVEZWZpbmUpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgc2hlZXROYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBzaGVldDogeGxzeC5TaGVldDtcbiAgICAgICAgY29uc3QgaXNTaGVldFJvd0VuZCA9IHRoaXMuaXNTaGVldFJvd0VuZC5iaW5kKG51bGwsIHRhYmxlRGVmaW5lKTtcbiAgICAgICAgY29uc3QgaXNTaGVldENvbEVuZCA9IHRoaXMuaXNTaGVldENvbEVuZC5iaW5kKG51bGwsIHRhYmxlRGVmaW5lKTtcbiAgICAgICAgY29uc3QgaXNTa2lwU2hlZXRSb3cgPSAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5jaGVja1Jvd05lZWRQYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIHJvd0luZGV4KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaXNTa2lwU2hlZXRDb2wgPSAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRoaXMuY2hlY2tDb2xOZWVkUGFyc2UodGFibGVEZWZpbmUsIHNoZWV0LCBjb2xLZXkpO1xuICAgICAgICB9O1xuICAgICAgICBsZXQgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0O1xuICAgICAgICBwYXJzZVJlc3VsdC50YWJsZURlZmluZSA9IHRhYmxlRGVmaW5lO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNoZWV0TmFtZSA9IHNoZWV0TmFtZXNbaV07XG4gICAgICAgICAgICBzaGVldCA9IHdvcmtib29rLlNoZWV0c1tzaGVldE5hbWVdO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNoZWNrU2hlZXRDYW5QYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIHNoZWV0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnNlUmVzdWx0LmN1clNoZWV0TmFtZSA9IHNoZWV0TmFtZTtcbiAgICAgICAgICAgIExvZ2dlci5sb2coYOino+aekDoke2ZpbGVJbmZvLmZpbGVQYXRofT0+IHNoZWV0OiR7c2hlZXROYW1lfSAuLi4uYCk7XG4gICAgICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcbiAgICAgICAgICAgICAgICBsZXQgbGFzdFJvd0luZGV4OiBudW1iZXI7XG5cbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbEZvckVhY2hTaGVldChcbiAgICAgICAgICAgICAgICAgICAgc2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Um93LFxuICAgICAgICAgICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydENvbCxcbiAgICAgICAgICAgICAgICAgICAgKHNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlzTmV3Um93T3JDb2wgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXN0Um93SW5kZXggIT09IHJvd0luZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFJvd0luZGV4ID0gcm93SW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNOZXdSb3dPckNvbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxsT2JqID0gc2hlZXRbY29sS2V5ICsgcm93SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChjZWxsT2JqKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyc2VWZXJ0aWNhbENlbGwocGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4LCBpc05ld1Jvd09yQ29sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldFJvd0VuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldENvbEVuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTa2lwU2hlZXRSb3csXG4gICAgICAgICAgICAgICAgICAgIGlzU2tpcFNoZWV0Q29sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuICAgICAgICAgICAgICAgIGxldCBsYXN0Q29sS2V5OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICBob3Jpem9udGFsRm9yRWFjaFNoZWV0KFxuICAgICAgICAgICAgICAgICAgICBzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3csXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Q29sLFxuICAgICAgICAgICAgICAgICAgICAoc2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNOZXdSb3dPckNvbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RDb2xLZXkgIT09IGNvbEtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb2xLZXkgPSBjb2xLZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNOZXdSb3dPckNvbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxPYmogPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGNlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJzZUhvcml6b250YWxDZWxsKHBhcnNlUmVzdWx0LCBzaGVldCwgY29sS2V5LCByb3dJbmRleCwgaXNOZXdSb3dPckNvbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGlzU2hlZXRSb3dFbmQsXG4gICAgICAgICAgICAgICAgICAgIGlzU2hlZXRDb2xFbmQsXG4gICAgICAgICAgICAgICAgICAgIGlzU2tpcFNoZWV0Um93LFxuICAgICAgICAgICAgICAgICAgICBpc1NraXBTaGVldENvbFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VSZXN1bHQgYXMgYW55O1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJvcy5wbGF0Zm9ybSIsInBhdGguam9pbiIsIlRhYmxlVHlwZSIsIkJhc2U2NCIsImRlZmxhdGVTeW5jIiwiZnMuc3RhdFN5bmMiLCJmcy5yZWFkZGlyU3luYyIsImZzLmV4aXN0c1N5bmMiLCJmcy51bmxpbmtTeW5jIiwiZnMuZW5zdXJlRmlsZVN5bmMiLCJmcy53cml0ZUZpbGUiLCJmcy53cml0ZUZpbGVTeW5jIiwiZnMucmVhZEZpbGVTeW5jIiwiY3J5cHRvLmNyZWF0ZUhhc2giLCJwYXRoLnBhcnNlIiwibW1hdGNoLmFsbCIsInBhdGguaXNBYnNvbHV0ZSIsIldvcmtlciIsInBhdGguZGlybmFtZSIsInhsc3gucmVhZEZpbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsTUFBTSxRQUFRLEdBQUdBLFdBQVcsRUFBRSxDQUFDO0FBQy9CO0FBQ08sTUFBTSxLQUFLLEdBQUcsUUFBUSxLQUFLLE9BQU8sR0FBRyxJQUFJLEdBQUcsTUFBTTs7QUNpQ3pEO0FBQ0EsTUFBTSxVQUFVLEdBQUcsRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFDLENBQUM7TUFDaEYsdUJBQXVCO0lBQ2hDLFdBQVcsQ0FDUCxXQUFnQyxFQUNoQyxnQkFBNkIsRUFDN0IsZUFBNEIsRUFDNUIsY0FBbUM7UUFFbkMsSUFBSSxZQUFZLEdBQWtCLFdBQVcsQ0FBQyxZQUFZLENBQUM7UUFDM0QsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLFlBQVksR0FBRztnQkFDWCx3QkFBd0IsRUFBRUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQzthQUN2RSxDQUFDO1NBQ0w7UUFFRCxJQUFJLFdBQVcsR0FBeUIsRUFBRSxDQUFDO1FBQzNDLElBQUksYUFBYSxHQUFrQixFQUFFLENBQUM7UUFDdEMsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxXQUE4QixDQUFDO1FBQ25DLElBQUksU0FBaUIsQ0FBQztRQUN0QixJQUFJLFFBQWEsQ0FBQztRQUNsQixJQUFJLGVBQWUsR0FBNkIsRUFBRSxDQUFDO1FBQ25ELEtBQUss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
