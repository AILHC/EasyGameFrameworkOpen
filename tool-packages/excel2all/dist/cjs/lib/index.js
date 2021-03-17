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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9nZXQtb3MtZW9sLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdHJhbnMyZmlsZS1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdmFsdWUtZnVuYy1tYXAudHMiLCIuLi8uLi8uLi9zcmMvZG8tcGFyc2UudHMiLCIuLi8uLi8uLi9zcmMvbG9nZXIudHMiLCIuLi8uLi8uLi9zcmMvZmlsZS11dGlscy50cyIsIi4uLy4uLy4uL3NyYy9jb252ZXJ0LnRzIiwiLi4vLi4vLi4vc3JjL3RhYmxlLXV0aWxzLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtcGFyc2UtaGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBvcyBmcm9tIFwib3NcIjtcbmNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbi8qKuW9k+WJjeezu+e7n+ihjOWwviAgcGxhdGZvcm0gPT09IFwid2luMzJcIiA/IFwiXFxuXCIgOiBcIlxcclxcblwiOyovXG5leHBvcnQgY29uc3Qgb3NFb2wgPSBwbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiID8gXCJcXG5cIiA6IFwiXFxyXFxuXCI7XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBUYWJsZVR5cGUgfSBmcm9tIFwiLi9kZWZhdWx0LXBhcnNlLWhhbmRsZXJcIjtcbmltcG9ydCB7IEJhc2U2NCB9IGZyb20gXCJqcy1iYXNlNjRcIjtcbmltcG9ydCB7IGRlZmxhdGVTeW5jIH0gZnJvbSBcInpsaWJcIjtcbmltcG9ydCB7IG9zRW9sIH0gZnJvbSBcIi4vZ2V0LW9zLWVvbFwiO1xuZGVjbGFyZSBnbG9iYWwge1xuICAgIC8qKlxuICAgICAqIOi+k+WHuumFjee9rlxuICAgICAqL1xuICAgIGludGVyZmFjZSBJT3V0cHV0Q29uZmlnIHtcbiAgICAgICAgLyoq5Y2V5Liq6YWN572u6KGoanNvbui+k+WHuuebruW9lei3r+W+hO+8jOm7mOiupOi+k+WHuuWIsOW9k+WJjeaJp+ihjOebruW9leS4i+eahC4vZXhjZWxKc29uT3V0ICovXG4gICAgICAgIGNsaWVudFNpbmdsZVRhYmxlSnNvbkRpcjogc3RyaW5nO1xuICAgICAgICAvKirlkIjlubbphY3nva7ooahqc29u6L6T5Ye66Lev5b6EKOWMheWQq+aWh+S7tuWQjSnvvIzlpoLmnpzkuI3phY3nva7liJnkuI3lkIjlubZqc29uICovXG4gICAgICAgIGNsaWVudEJ1bmRsZUpzb25PdXRQYXRoPzogc3RyaW5nO1xuICAgICAgICAvKirmmK/lkKbmoLzlvI/ljJblkIjlubblkI7nmoRqc29u77yM6buY6K6k5LiNICovXG4gICAgICAgIGlzRm9ybWF0QnVuZGxlSnNvbj86IGJvb2xlYW47XG4gICAgICAgIC8qKuaYr+WQpueUn+aIkOWjsOaYjuaWh+S7tu+8jOm7mOiupOS4jei+k+WHuiAqL1xuICAgICAgICBpc0dlbkR0cz86IGJvb2xlYW47XG4gICAgICAgIC8qKuWjsOaYjuaWh+S7tui+k+WHuuebruW9lSjmr4/kuKrphY3nva7ooajkuIDkuKrlo7DmmI4p77yM6buY6K6k5LiN6L6T5Ye6ICovXG4gICAgICAgIGNsaWVudER0c091dERpcj86IHN0cmluZztcbiAgICAgICAgLyoq5piv5ZCm5ZCI5bm25omA5pyJ5aOw5piO5Li65LiA5Liq5paH5Lu2LOm7mOiupHRydWUgKi9cbiAgICAgICAgaXNCdW5kbGVEdHM/OiBib29sZWFuO1xuICAgICAgICAvKirlkIjlubblkI7nmoTlo7DmmI7mlofku7blkI0gKi9cbiAgICAgICAgYnVuZGxlRHRzRmlsZU5hbWU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuaYr+WQpuWwhmpzb27moLzlvI/ljovnvKks6buY6K6k5ZCmLOWHj+WwkWpzb27lrZfmrrXlkI3lrZfnrKYs5pWI5p6c6L6D5bCPICovXG4gICAgICAgIGlzQ29tcHJlc3M/OiBib29sZWFuO1xuICAgICAgICAvKirmmK/lkKZaaXDljovnvKks5L2/55SoemxpYiAqL1xuICAgICAgICBpc1ppcD86IGJvb2xlYW47XG4gICAgICAgIC8qKuaYr+WQpuWwhui+k+WHuueahOWQiOW5tmpzb27ovazkuLpiYXNlNjTvvIzpu5jorqTlkKYqL1xuICAgICAgICBidW5kbGVKc29uSXNFbmNvZGUyQmFzZTY0PzogYm9vbGVhbjtcbiAgICAgICAgLyoq5Yqg5a+G5re35reG5a2X56ym5Liy5YmN57yAICovXG4gICAgICAgIHByZUJhc2U2NFVnbHlTdHJpbmc/OiBzdHJpbmc7XG4gICAgICAgIC8qKuWKoOWvhua3t+a3huWtl+espuS4suWQjue8gCAqL1xuICAgICAgICBzdWZCYXNlNjRVZ2x5U3RyaW5nPzogc3RyaW5nO1xuICAgIH1cbn1cbi8qKuexu+Wei+Wtl+espuS4suaYoOWwhOWtl+WFuCAqL1xuY29uc3QgdHlwZVN0ck1hcCA9IHsgaW50OiBcIm51bWJlclwiLCBqc29uOiBcImFueVwiLCBcIltpbnRdXCI6IFwibnVtYmVyW11cIiwgXCJbc3RyaW5nXVwiOiBcInN0cmluZ1tdXCIgfTtcbmV4cG9ydCBjbGFzcyBUcmFuczJKc29uQW5kRHRzSGFuZGxlciBpbXBsZW1lbnRzIElUcmFuc1Jlc3VsdDJBbnlGaWxlSGFuZGxlciB7XG4gICAgdHJhbnMyRmlsZXMoXG4gICAgICAgIHBhcnNlQ29uZmlnOiBJVGFibGVDb252ZXJ0Q29uZmlnLFxuICAgICAgICBjaGFuZ2VkRmlsZUluZm9zOiBJRmlsZUluZm9bXSxcbiAgICAgICAgZGVsZXRlRmlsZUluZm9zOiBJRmlsZUluZm9bXSxcbiAgICAgICAgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXBcbiAgICApOiBPdXRQdXRGaWxlTWFwIHtcbiAgICAgICAgbGV0IG91dHB1dENvbmZpZzogSU91dHB1dENvbmZpZyA9IHBhcnNlQ29uZmlnLm91dHB1dENvbmZpZztcbiAgICAgICAgaWYgKCFvdXRwdXRDb25maWcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHBhcnNlQ29uZmlnLm91dHB1dENvbmZpZyBpcyB1bmRlZmluZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRhYmxlT2JqTWFwOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gICAgICAgIGxldCBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwID0ge307XG4gICAgICAgIGxldCB0YWJsZVR5cGVNYXBEdHNTdHIgPSBcIlwiO1xuICAgICAgICBsZXQgdGFibGVUeXBlRHRzU3RycyA9IFwiXCI7XG4gICAgICAgIGxldCBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQ7XG4gICAgICAgIGxldCB0YWJsZU5hbWU6IHN0cmluZztcbiAgICAgICAgbGV0IHRhYmxlT2JqOiBhbnk7XG4gICAgICAgIGxldCBvYmpUeXBlVGFibGVNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgICAgIGZvciAobGV0IGZpbGVQYXRoIGluIHBhcnNlUmVzdWx0TWFwKSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXTtcbiAgICAgICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVEZWZpbmUpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICB0YWJsZU5hbWUgPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZU5hbWU7XG5cbiAgICAgICAgICAgIC8v5ZCI5bm25aSa5Liq5ZCM5ZCN6KGoXG4gICAgICAgICAgICB0YWJsZU9iaiA9IHRhYmxlT2JqTWFwW3RhYmxlTmFtZV07XG4gICAgICAgICAgICBpZiAodGFibGVPYmopIHtcbiAgICAgICAgICAgICAgICB0YWJsZU9iaiA9IE9iamVjdC5hc3NpZ24odGFibGVPYmosIHBhcnNlUmVzdWx0LnRhYmxlT2JqKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFibGVPYmogPSBwYXJzZVJlc3VsdC50YWJsZU9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSB0YWJsZU9iajtcblxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0dlbkR0cyAmJiBvYmpUeXBlVGFibGVNYXBbdGFibGVOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb2JqVHlwZVRhYmxlTWFwW3RhYmxlTmFtZV0gPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsO1xuICAgICAgICAgICAgICAgIGlmIChwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlVHlwZU1hcER0c1N0ciArPSBcIlxcdHJlYWRvbmx5IFwiICsgdGFibGVOYW1lICsgXCI/OiBcIiArIGBJVF8ke3RhYmxlTmFtZX07YCArIG9zRW9sO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlVHlwZU1hcER0c1N0ciArPSB0aGlzLl9nZXRPbmVUYWJsZVR5cGVTdHIodGFibGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy/ovpPlh7rljZXkuKrmlofku7ZcbiAgICAgICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzQnVuZGxlRHRzID09PSB1bmRlZmluZWQpIG91dHB1dENvbmZpZy5pc0J1bmRsZUR0cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKCFvdXRwdXRDb25maWcuaXNCdW5kbGVEdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkU2luZ2xlVGFibGVEdHNPdXRwdXRGaWxlKG91dHB1dENvbmZpZywgcGFyc2VSZXN1bHQsIG91dHB1dEZpbGVNYXApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlVHlwZUR0c1N0cnMgKz0gdGhpcy5fZ2V0U2luZ2xlVGFibGVEdHMocGFyc2VSZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/nlJ/miJDljZXkuKrooahqc29uXG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmNsaWVudFNpbmdsZVRhYmxlSnNvbkRpcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFNpbmdsZVRhYmxlSnNvbk91dHB1dEZpbGUob3V0cHV0Q29uZmlnLCBwYXJzZVJlc3VsdCwgb3V0cHV0RmlsZU1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0dlbkR0cykge1xuICAgICAgICAgICAgLy/ovpPlh7rlo7DmmI7mlofku7ZcbiAgICAgICAgICAgIGxldCBpdEJhc2VTdHIgPSBcImludGVyZmFjZSBJVEJhc2U8VD4geyBba2V5OnN0cmluZ106VH1cIiArIG9zRW9sO1xuXG4gICAgICAgICAgICB0YWJsZVR5cGVNYXBEdHNTdHIgPSBpdEJhc2VTdHIgKyBcImludGVyZmFjZSBJVF9UYWJsZU1hcCB7XCIgKyBvc0VvbCArIHRhYmxlVHlwZU1hcER0c1N0ciArIFwifVwiICsgb3NFb2w7XG5cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNCdW5kbGVEdHMpIHtcbiAgICAgICAgICAgICAgICAvL+WQiOaIkOS4gOS4quaWh+S7tlxuICAgICAgICAgICAgICAgIGNvbnN0IGR0c0ZpbGVOYW1lID0gb3V0cHV0Q29uZmlnLmJ1bmRsZUR0c0ZpbGVOYW1lID8gb3V0cHV0Q29uZmlnLmJ1bmRsZUR0c0ZpbGVOYW1lIDogXCJ0YWJsZU1hcFwiO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZUR0c0ZpbGVQYXRoID0gcGF0aC5qb2luKG91dHB1dENvbmZpZy5jbGllbnREdHNPdXREaXIsIGAke2R0c0ZpbGVOYW1lfS5kLnRzYCk7XG4gICAgICAgICAgICAgICAgb3V0cHV0RmlsZU1hcFtidW5kbGVEdHNGaWxlUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBidW5kbGVEdHNGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFibGVUeXBlTWFwRHRzU3RyICsgdGFibGVUeXBlRHRzU3Ryc1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8v5ouG5YiG5paH5Lu26L6T5Ye6XG4gICAgICAgICAgICAgICAgY29uc3QgdGFibGVUeXBlTWFwRHRzRmlsZVBhdGggPSBwYXRoLmpvaW4ob3V0cHV0Q29uZmlnLmNsaWVudER0c091dERpciwgXCJ0YWJsZU1hcC5kLnRzXCIpO1xuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbdGFibGVUeXBlTWFwRHRzRmlsZVBhdGhdID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogdGFibGVUeXBlTWFwRHRzRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhYmxlVHlwZU1hcER0c1N0clxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL2pzb25CdW5kbGVGaWxlXG4gICAgICAgIGlmIChvdXRwdXRDb25maWcuY2xpZW50QnVuZGxlSnNvbk91dFBhdGgpIHtcbiAgICAgICAgICAgIGxldCBqc29uQnVuZGxlRmlsZVBhdGggPSBvdXRwdXRDb25maWcuY2xpZW50QnVuZGxlSnNvbk91dFBhdGg7XG4gICAgICAgICAgICBsZXQgb3V0cHV0RGF0YTogYW55O1xuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0NvbXByZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VGFibGVPYmpNYXAgPSB7fTtcbiAgICAgICAgICAgICAgICBsZXQgdGFibGVPYmo6IGFueTtcbiAgICAgICAgICAgICAgICBsZXQgbmV3VGFibGVPYmo6IGFueTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0YWJsZU5hbWUgaW4gdGFibGVPYmpNYXApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9ialR5cGVUYWJsZU1hcFt0YWJsZU5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iak1hcFt0YWJsZU5hbWVdID0gdGFibGVPYmpNYXBbdGFibGVOYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlT2JqID0gdGFibGVPYmpNYXBbdGFibGVOYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgbmV3VGFibGVPYmogPSB7IGZpZWxkVmFsdWVzTWFwOiB7fSB9O1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBtYWluS2V5IGluIHRhYmxlT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5ld1RhYmxlT2JqLmZpZWxkTmFtZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iai5maWVsZE5hbWVzID0gT2JqZWN0LmtleXModGFibGVPYmpbbWFpbktleV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VGFibGVPYmouZmllbGRWYWx1ZXNNYXBbbWFpbktleV0gPSBPYmplY3QudmFsdWVzKHRhYmxlT2JqW21haW5LZXldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iak1hcFt0YWJsZU5hbWVdID0gbmV3VGFibGVPYmo7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBKU09OLnN0cmluZ2lmeShuZXdUYWJsZU9iak1hcCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBKU09OLnN0cmluZ2lmeSh0YWJsZU9iak1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmJ1bmRsZUpzb25Jc0VuY29kZTJCYXNlNjQpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXREYXRhID0gQmFzZTY0LmVuY29kZShvdXRwdXREYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLnByZUJhc2U2NFVnbHlTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IG91dHB1dENvbmZpZy5wcmVCYXNlNjRVZ2x5U3RyaW5nICsgb3V0cHV0RGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5zdWZCYXNlNjRVZ2x5U3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dERhdGEgKz0gb3V0cHV0Q29uZmlnLnN1ZkJhc2U2NFVnbHlTdHJpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc1ppcCkge1xuICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBkZWZsYXRlU3luYyhvdXRwdXREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbanNvbkJ1bmRsZUZpbGVQYXRoXSA9IHtcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDoganNvbkJ1bmRsZUZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIGVuY29kaW5nOiB0eXBlb2Ygb3V0cHV0RGF0YSAhPT0gXCJzdHJpbmdcIiA/IFwiYmluYXJ5XCIgOiBcInV0Zi04XCIsXG4gICAgICAgICAgICAgICAgZGF0YTogb3V0cHV0RGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0RmlsZU1hcDtcbiAgICB9XG4gICAgcHJpdmF0ZSBfYWRkU2luZ2xlVGFibGVEdHNPdXRwdXRGaWxlKFxuICAgICAgICBjb25maWc6IElPdXRwdXRDb25maWcsXG4gICAgICAgIHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgb3V0cHV0RmlsZU1hcDogT3V0UHV0RmlsZU1hcFxuICAgICk6IHZvaWQge1xuICAgICAgICAvL+WmguaenOWAvOayoeacieWwseS4jei+k+WHuuexu+Wei+S/oeaBr+S6hlxuICAgICAgICBpZiAoIXBhcnNlUmVzdWx0LnRhYmxlT2JqKSByZXR1cm47XG4gICAgICAgIGxldCBkdHNGaWxlUGF0aDogc3RyaW5nID0gcGF0aC5qb2luKGNvbmZpZy5jbGllbnREdHNPdXREaXIsIGAke3BhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlTmFtZX0uZC50c2ApO1xuXG4gICAgICAgIGlmICghb3V0cHV0RmlsZU1hcFtkdHNGaWxlUGF0aF0pIHtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBjb25zdCBkdHNTdHIgPSB0aGlzLl9nZXRTaW5nbGVUYWJsZUR0cyhwYXJzZVJlc3VsdCk7XG4gICAgICAgICAgICBpZiAoZHRzU3RyKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0RmlsZU1hcFtkdHNGaWxlUGF0aF0gPSB7IGZpbGVQYXRoOiBkdHNGaWxlUGF0aCwgZGF0YTogZHRzU3RyIH0gYXMgYW55O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOWHuuWNleS4qumFjee9ruihqOexu+Wei+aVsOaNrlxuICAgICAqIEBwYXJhbSBwYXJzZVJlc3VsdFxuICAgICAqL1xuICAgIHByaXZhdGUgX2dldFNpbmdsZVRhYmxlRHRzKHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHRhYmxlTmFtZSA9IHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlTmFtZTtcblxuICAgICAgICBjb25zdCBjb2xLZXlUYWJsZUZpZWxkTWFwOiBDb2xLZXlUYWJsZUZpZWxkTWFwID0gcGFyc2VSZXN1bHQuZmlsZWRNYXA7XG4gICAgICAgIGxldCBpdGVtSW50ZXJmYWNlID0gXCJpbnRlcmZhY2UgSVRfXCIgKyB0YWJsZU5hbWUgKyBcIiB7XCIgKyBvc0VvbDtcbiAgICAgICAgbGV0IHRhYmxlRmllbGQ6IElUYWJsZUZpZWxkO1xuICAgICAgICBsZXQgdHlwZVN0cjogc3RyaW5nO1xuICAgICAgICBsZXQgb2JqVHlwZVN0ck1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuXG4gICAgICAgIGZvciAobGV0IGNvbEtleSBpbiBjb2xLZXlUYWJsZUZpZWxkTWFwKSB7XG4gICAgICAgICAgICB0YWJsZUZpZWxkID0gY29sS2V5VGFibGVGaWVsZE1hcFtjb2xLZXldO1xuICAgICAgICAgICAgaWYgKCF0YWJsZUZpZWxkKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmICghdGFibGVGaWVsZC5pc011dGlDb2xPYmopIHtcbiAgICAgICAgICAgICAgICAvL+azqOmHiuihjFxuICAgICAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJcXHQvKiogXCIgKyB0YWJsZUZpZWxkLnRleHQgKyBcIiAqL1wiICsgb3NFb2w7XG4gICAgICAgICAgICAgICAgLy/lrZfmrrXnsbvlnovlo7DmmI7ooYxcbiAgICAgICAgICAgICAgICBpdGVtSW50ZXJmYWNlICs9XG4gICAgICAgICAgICAgICAgICAgIFwiXFx0cmVhZG9ubHkgXCIgK1xuICAgICAgICAgICAgICAgICAgICB0YWJsZUZpZWxkLmZpZWxkTmFtZSArXG4gICAgICAgICAgICAgICAgICAgIFwiPzogXCIgK1xuICAgICAgICAgICAgICAgICAgICAodHlwZVN0ck1hcFt0YWJsZUZpZWxkLnR5cGVdID8gdHlwZVN0ck1hcFt0YWJsZUZpZWxkLnR5cGVdIDogdGFibGVGaWVsZC50eXBlKSArXG4gICAgICAgICAgICAgICAgICAgIFwiO1wiICtcbiAgICAgICAgICAgICAgICAgICAgb3NFb2w7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9iakZpZWxkS2V5ID0gdGFibGVGaWVsZC5maWVsZE5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy/ms6jph4rooYxcbiAgICAgICAgICAgICAgICBvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XSArPSBcIlxcdFxcdC8qKiBcIiArIHRhYmxlRmllbGQudGV4dCArIFwiICovXCIgKyBvc0VvbDtcblxuICAgICAgICAgICAgICAgIC8v5a2X5q6157G75Z6L5aOw5piO6KGMXG4gICAgICAgICAgICAgICAgb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0gKz1cbiAgICAgICAgICAgICAgICAgICAgXCJcXHRcXHRyZWFkb25seSBcIiArXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRmllbGQuc3ViRmllbGROYW1lICtcbiAgICAgICAgICAgICAgICAgICAgXCI/OiBcIiArXG4gICAgICAgICAgICAgICAgICAgICh0eXBlU3RyTWFwW3RhYmxlRmllbGQuc3ViVHlwZV0gPyB0eXBlU3RyTWFwW3RhYmxlRmllbGQuc3ViVHlwZV0gOiB0YWJsZUZpZWxkLnN1YlR5cGUpICtcbiAgICAgICAgICAgICAgICAgICAgXCI7XCIgK1xuICAgICAgICAgICAgICAgICAgICBvc0VvbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL+esrOS6jOWxguWvueixoVxuICAgICAgICBmb3IgKGxldCBvYmpGaWVsZEtleSBpbiBvYmpUeXBlU3RyTWFwKSB7XG4gICAgICAgICAgICAvL+Wtl+auteexu+Wei+WjsOaYjuihjFxuICAgICAgICAgICAgaXRlbUludGVyZmFjZSArPSBcIlxcdHJlYWRvbmx5IFwiICsgb2JqRmllbGRLZXkgKyBcIj86IHtcIiArIG9zRW9sICsgb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV07XG4gICAgICAgICAgICBpdGVtSW50ZXJmYWNlICs9IFwiXFx0fVwiICsgb3NFb2w7XG4gICAgICAgIH1cbiAgICAgICAgaXRlbUludGVyZmFjZSArPSBcIn1cIiArIG9zRW9sO1xuXG4gICAgICAgIHJldHVybiBpdGVtSW50ZXJmYWNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmt7vliqDljZXni6zlr7zlh7rphY3nva7ooahqc29u5paH5Lu2XG4gICAgICogQHBhcmFtIGNvbmZpZ1xuICAgICAqIEBwYXJhbSBwYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBvdXRwdXRGaWxlTWFwXG4gICAgICovXG4gICAgcHJpdmF0ZSBfYWRkU2luZ2xlVGFibGVKc29uT3V0cHV0RmlsZShcbiAgICAgICAgY29uZmlnOiBJT3V0cHV0Q29uZmlnLFxuICAgICAgICBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsXG4gICAgICAgIG91dHB1dEZpbGVNYXA6IE91dFB1dEZpbGVNYXBcbiAgICApIHtcbiAgICAgICAgY29uc3QgdGFibGVPYmogPSBwYXJzZVJlc3VsdC50YWJsZU9iajtcbiAgICAgICAgaWYgKCF0YWJsZU9iaikgcmV0dXJuO1xuICAgICAgICBjb25zdCB0YWJsZU5hbWUgPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZU5hbWU7XG4gICAgICAgIGxldCBzaW5nbGVKc29uRmlsZVBhdGggPSBwYXRoLmpvaW4oY29uZmlnLmNsaWVudFNpbmdsZVRhYmxlSnNvbkRpciwgYCR7dGFibGVOYW1lfS5qc29uYCk7XG4gICAgICAgIGxldCBzaW5nbGVKc29uRGF0YSA9IEpTT04uc3RyaW5naWZ5KHRhYmxlT2JqLCBudWxsLCBcIlxcdFwiKTtcblxuICAgICAgICBsZXQgc2luZ2xlT3V0cHV0RmlsZUluZm8gPSBvdXRwdXRGaWxlTWFwW3NpbmdsZUpzb25GaWxlUGF0aF07XG4gICAgICAgIGlmIChzaW5nbGVPdXRwdXRGaWxlSW5mbykge1xuICAgICAgICAgICAgc2luZ2xlT3V0cHV0RmlsZUluZm8uZGF0YSA9IHNpbmdsZUpzb25EYXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2luZ2xlT3V0cHV0RmlsZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgZmlsZVBhdGg6IHNpbmdsZUpzb25GaWxlUGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhOiBzaW5nbGVKc29uRGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbc2luZ2xlSnNvbkZpbGVQYXRoXSA9IHNpbmdsZU91dHB1dEZpbGVJbmZvO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgX2dldE9uZVRhYmxlVHlwZVN0cih0YWJsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIlxcdHJlYWRvbmx5IFwiICsgdGFibGVOYW1lICsgXCI/OiBcIiArIFwiSVRCYXNlPFwiICsgXCJJVF9cIiArIHRhYmxlTmFtZSArIFwiPjtcIiArIG9zRW9sO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2VyXCI7XG5cbmV4cG9ydCBjb25zdCB2YWx1ZVRyYW5zRnVuY01hcDoge1xuICAgIFtrZXk6IHN0cmluZ106IFZhbHVlVHJhbnNGdW5jO1xufSA9IHt9O1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJpbnRcIl0gPSBzdHJUb0ludDtcbnZhbHVlVHJhbnNGdW5jTWFwW1wic3RyaW5nXCJdID0gYW55VG9TdHI7XG52YWx1ZVRyYW5zRnVuY01hcFtcIltpbnRdXCJdID0gc3RyVG9JbnRBcnI7XG52YWx1ZVRyYW5zRnVuY01hcFtcIltzdHJpbmddXCJdID0gc3RyVG9TdHJBcnI7XG52YWx1ZVRyYW5zRnVuY01hcFtcImpzb25cIl0gPSBzdHJUb0pzb25PYmo7XG5mdW5jdGlvbiBzdHJUb0ludEFycihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBjZWxsVmFsdWUgPSAoY2VsbFZhbHVlICsgXCJcIikucmVwbGFjZSgv77yML2csIFwiLFwiKTsgLy/kuLrkuobpmLLmraLnrZbliJLor6/loavvvIzlhYjov5vooYzovazmjaJcbiAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xuICAgIGxldCBpbnRBcnI6IG51bWJlcltdO1xuICAgIGNvbnN0IHJlc3VsdDogSVRyYW5zVmFsdWVSZXN1bHQgPSB7fTtcbiAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpbnRBcnIgPSBKU09OLnBhcnNlKGNlbGxWYWx1ZSk7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBpbnRBcnI7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXN1bHQuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBzdHJUb1N0ckFycihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBjZWxsVmFsdWUgPSAoY2VsbFZhbHVlICsgXCJcIikucmVwbGFjZSgv77yML2csIFwiLFwiKTsgLy/kuLrkuobpmLLmraLnrZbliJLor6/loavvvIzlhYjov5vooYzovazmjaJcbiAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xuICAgIGxldCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge307XG4gICAgbGV0IGFycjogc3RyaW5nW107XG4gICAgaWYgKGNlbGxWYWx1ZSAhPT0gXCJcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXJyID0gSlNPTi5wYXJzZShjZWxsVmFsdWUpO1xuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gYXJyO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIHN0clRvSW50KGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogc3RyaW5nKTogSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgIGxldCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge30gYXMgYW55O1xuICAgIGlmICh0eXBlb2YgY2VsbFZhbHVlID09PSBcInN0cmluZ1wiICYmIGNlbGxWYWx1ZS50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgcmVzdWx0LnZhbHVlID0gY2VsbFZhbHVlLmluY2x1ZGVzKFwiLlwiKSA/IHBhcnNlRmxvYXQoY2VsbFZhbHVlKSA6IChwYXJzZUludChjZWxsVmFsdWUpIGFzIGFueSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbFZhbHVlID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIHN0clRvSnNvbk9iaihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBjZWxsVmFsdWUgPSAoY2VsbFZhbHVlICsgXCJcIikucmVwbGFjZSgv77yML2csIFwiLFwiKTsgLy/kuLrkuobpmLLmraLnrZbliJLor6/loavvvIzlhYjov5vooYzovazmjaJcbiAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xuICAgIGxldCBvYmo7XG4gICAgbGV0IGVycm9yO1xuICAgIGlmIChjZWxsVmFsdWUgIT09IFwiXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG9iaiA9IEpTT04ucGFyc2UoY2VsbFZhbHVlKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBlcnJvciA9IGVycjtcbiAgICAgICAgICAgIG9iaiA9IGNlbGxWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBlcnJvcjogZXJyb3IsIHZhbHVlOiBvYmogfTtcbn1cbmZ1bmN0aW9uIGFueVRvU3RyKGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogYW55KTogSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgIGxldCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge30gYXMgYW55O1xuICAgIGlmICh0eXBlb2YgY2VsbFZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGNlbGxWYWx1ZSA9IGNlbGxWYWx1ZS50cmltKCk7XG4gICAgICAgIGlmIChjZWxsVmFsdWUgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZSArIFwiXCI7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZG9QYXJzZShcbiAgICBwYXJzZUNvbmZpZzogSVRhYmxlQ29udmVydENvbmZpZyxcbiAgICBmaWxlSW5mb3M6IElGaWxlSW5mb1tdLFxuICAgIHBhcnNlUmVzdWx0TWFwOiBUYWJsZVBhcnNlUmVzdWx0TWFwLFxuICAgIHBhcnNlSGFuZGxlcjogSVRhYmxlUGFyc2VIYW5kbGVyXG4pIHtcbiAgICBsZXQgcGFyc2VSZXN1bHQ7XG4gICAgZm9yIChsZXQgaSA9IGZpbGVJbmZvcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBwYXJzZVJlc3VsdCA9IHBhcnNlUmVzdWx0TWFwW2ZpbGVJbmZvc1tpXS5maWxlUGF0aF07XG4gICAgICAgIGlmICghcGFyc2VSZXN1bHQpIHtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0geyBmaWxlUGF0aDogZmlsZUluZm9zW2ldLmZpbGVQYXRoIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwYXJzZVJlc3VsdC50YWJsZU9iaikge1xuICAgICAgICAgICAgcGFyc2VSZXN1bHQgPSBwYXJzZUhhbmRsZXIucGFyc2VUYWJsZUZpbGUocGFyc2VDb25maWcsIGZpbGVJbmZvc1tpXSwgcGFyc2VSZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJzZVJlc3VsdCkge1xuICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXBbZmlsZUluZm9zW2ldLmZpbGVQYXRoXSA9IHBhcnNlUmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgb3NFb2wgfSBmcm9tIFwiLi9nZXQtb3MtZW9sXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5lbnVtIExvZ0xldmVsRW51bSB7XG4gICAgaW5mbyxcbiAgICB3YXJuLFxuICAgIGVycm9yLFxuICAgIG5vXG59XG5leHBvcnQgY2xhc3MgTG9nZ2VyIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfZW5hYmxlT3V0UHV0TG9nRmlsZTogYm9vbGVhbjtcbiAgICBwcml2YXRlIHN0YXRpYyBfbG9nTGV2ZWw6IExvZ0xldmVsRW51bTtcbiAgICBwcml2YXRlIHN0YXRpYyBfbG9nU3RyOiBzdHJpbmcgPSBcIlwiO1xuICAgIHB1YmxpYyBzdGF0aWMgaW5pdChwYXJzZUNvbmZpZzogSVRhYmxlQ29udmVydENvbmZpZykge1xuICAgICAgICBjb25zdCBsZXZlbDogTG9nTGV2ZWwgPSBwYXJzZUNvbmZpZy5sb2dMZXZlbCA/IHBhcnNlQ29uZmlnLmxvZ0xldmVsIDogXCJpbmZvXCI7XG4gICAgICAgIHRoaXMuX2xvZ0xldmVsID0gTG9nTGV2ZWxFbnVtW2xldmVsXTtcbiAgICAgICAgdGhpcy5fZW5hYmxlT3V0UHV0TG9nRmlsZSA9IHBhcnNlQ29uZmlnLm91dHB1dExvZ0ZpbGUgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBwYXJzZUNvbmZpZy5vdXRwdXRMb2dGaWxlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDovpPlh7rml6Xlv5dcbiAgICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgICAqIEBwYXJhbSBsZXZlbFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbG9nKG1lc3NhZ2U6IHN0cmluZywgbGV2ZWw6IExvZ0xldmVsID0gXCJpbmZvXCIpIHtcbiAgICAgICAgaWYgKGxldmVsID09PSBcIm5vXCIpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMuX2xvZ0xldmVsIDw9IExvZ0xldmVsRW51bVtsZXZlbF0pIHtcbiAgICAgICAgICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcImluZm9cIjpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJ3YXJuXCI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVPdXRQdXRMb2dGaWxlKSByZXR1cm47XG4gICAgICAgIHRoaXMuX2xvZ1N0ciArPSBtZXNzYWdlICsgb3NFb2w7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOi/lOWbnuaXpeW/l+aVsOaNruW5tua4heepulxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGxvZ1N0cigpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXRoaXMuX2VuYWJsZU91dFB1dExvZ0ZpbGUpIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBsb2dTdHIgPSB0aGlzLl9sb2dTdHI7XG4gICAgICAgIHRoaXMuX2xvZ1N0ciA9IFwiXCI7IC8v5riF56m6XG4gICAgICAgIHJldHVybiBsb2dTdHI7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSBcImNyeXB0b1wiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZXJcIjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJT3V0UHV0RmlsZUluZm8ge1xuICAgICAgICBmaWxlUGF0aDogc3RyaW5nO1xuICAgICAgICAvKirlhpnlhaXnvJbnoIHvvIzlrZfnrKbkuLLpu5jorqR1dGY4ICovXG4gICAgICAgIGVuY29kaW5nPzogQnVmZmVyRW5jb2Rpbmc7XG4gICAgICAgIC8qKuaYr+WQpuWIoOmZpCAqL1xuICAgICAgICBpc0RlbGV0ZT86IGJvb2xlYW47XG4gICAgICAgIGRhdGE/OiBhbnk7XG4gICAgfVxufVxuLyoqXG4gKiDpgY3ljobmlofku7ZcbiAqIEBwYXJhbSBkaXJQYXRoIOaWh+S7tuWkuei3r+W+hFxuICogQHBhcmFtIGVhY2hDYWxsYmFjayDpgY3ljoblm57osIMgKGZpbGVQYXRoOiBzdHJpbmcpID0+IHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvckVhY2hGaWxlKGZpbGVPckRpclBhdGg6IHN0cmluZywgZWFjaENhbGxiYWNrPzogKGZpbGVQYXRoOiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgICBpZiAoZnMuc3RhdFN5bmMoZmlsZU9yRGlyUGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICBjb25zdCBmaWxlTmFtZXMgPSBmcy5yZWFkZGlyU3luYyhmaWxlT3JEaXJQYXRoKTtcbiAgICAgICAgbGV0IGNoaWxkRmlsZVBhdGg6IHN0cmluZztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlTmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNoaWxkRmlsZVBhdGggPSBwYXRoLmpvaW4oZmlsZU9yRGlyUGF0aCwgZmlsZU5hbWVzW2ldKTtcbiAgICAgICAgICAgIGZvckVhY2hGaWxlKGNoaWxkRmlsZVBhdGgsIGVhY2hDYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBlYWNoQ2FsbGJhY2soZmlsZU9yRGlyUGF0aCk7XG4gICAgfVxufVxuLyoqXG4gKiDmibnph4/lhpnlhaXlkozliKDpmaTmlofku7ZcbiAqIEBwYXJhbSBvdXRwdXRGaWxlSW5mb3Mg6ZyA6KaB5YaZ5YWl55qE5paH5Lu25L+h5oGv5pWw57uEXG4gKiBAcGFyYW0gb25Qcm9ncmVzcyDov5vluqblj5jljJblm57osINcbiAqIEBwYXJhbSBjb21wbGV0ZSDlrozmiJDlm57osINcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlT3JEZWxldGVPdXRQdXRGaWxlcyhcbiAgICBvdXRwdXRGaWxlSW5mb3M6IElPdXRQdXRGaWxlSW5mb1tdLFxuICAgIG9uUHJvZ3Jlc3M/OiAoZmlsZVBhdGg6IHN0cmluZywgdG90YWw6IG51bWJlciwgbm93OiBudW1iZXIsIGlzT2s6IGJvb2xlYW4pID0+IHZvaWQsXG4gICAgY29tcGxldGU/OiAodG90YWw6IG51bWJlcikgPT4gdm9pZFxuKSB7XG4gICAgbGV0IGZpbGVJbmZvOiBJT3V0UHV0RmlsZUluZm87XG4gICAgY29uc3QgdG90YWwgPSBvdXRwdXRGaWxlSW5mb3MubGVuZ3RoO1xuICAgIGlmIChvdXRwdXRGaWxlSW5mb3MgJiYgdG90YWwpIHtcbiAgICAgICAgbGV0IG5vdyA9IDA7XG4gICAgICAgIGNvbnN0IG9uV3JpdGVFbmQgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmxvZyhlcnIsIFwiZXJyb3JcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub3crKztcbiAgICAgICAgICAgIG9uUHJvZ3Jlc3MgJiYgb25Qcm9ncmVzcyhvdXRwdXRGaWxlSW5mb3Nbbm93IC0gMV0uZmlsZVBhdGgsIHRvdGFsLCBub3csICFlcnIpO1xuICAgICAgICAgICAgaWYgKG5vdyA+PSB0b3RhbCkge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlICYmIGNvbXBsZXRlKHRvdGFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChsZXQgaSA9IG91dHB1dEZpbGVJbmZvcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgZmlsZUluZm8gPSBvdXRwdXRGaWxlSW5mb3NbaV07XG5cbiAgICAgICAgICAgIGlmIChmaWxlSW5mby5pc0RlbGV0ZSAmJiBmcy5leGlzdHNTeW5jKGZpbGVJbmZvLmZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgIGZzLnVubGlua1N5bmMoZmlsZUluZm8uZmlsZVBhdGgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhmaWxlSW5mby5maWxlUGF0aCkgJiYgZnMuc3RhdFN5bmMoZmlsZUluZm8uZmlsZVBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgTG9nZ2VyLmxvZyhg6Lev5b6E5Li65paH5Lu25aS5OiR7ZmlsZUluZm8uZmlsZVBhdGh9YCwgXCJlcnJvclwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlSW5mby5lbmNvZGluZyAmJiB0eXBlb2YgZmlsZUluZm8uZGF0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby5lbmNvZGluZyA9IFwidXRmOFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmcy5lbnN1cmVGaWxlU3luYyhmaWxlSW5mby5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlKFxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby5maWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZW5jb2RpbmcgPyB7IGVuY29kaW5nOiBmaWxlSW5mby5lbmNvZGluZyB9IDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBvbldyaXRlRW5kXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICog6I635Y+W5Y+Y5YyW6L+H55qE5paH5Lu25pWw57uEXG4gKiBAcGFyYW0gZGlyIOebruagh+ebruW9lVxuICogQHBhcmFtIGNhY2hlRmlsZVBhdGgg57yT5a2Y5paH5Lu257ud5a+56Lev5b6EXG4gKiBAcGFyYW0gZWFjaENhbGxiYWNrIOmBjeWOhuWbnuiwg1xuICogQHJldHVybnMg6L+U5Zue57yT5a2Y5paH5Lu26Lev5b6EXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JFYWNoQ2hhbmdlZEZpbGUoXG4gICAgZGlyOiBzdHJpbmcsXG4gICAgY2FjaGVGaWxlUGF0aD86IHN0cmluZyxcbiAgICBlYWNoQ2FsbGJhY2s/OiAoZmlsZVBhdGg6IHN0cmluZywgaXNEZWxldGU/OiBib29sZWFuKSA9PiB2b2lkXG4pIHtcbiAgICBjb25zdCBnY2ZDYWNoZSA9IGdldENhY2hlRGF0YShjYWNoZUZpbGVQYXRoKTtcbiAgICBjb25zdCBvbGRGaWxlUGF0aHMgPSBPYmplY3Qua2V5cyhnY2ZDYWNoZSk7XG4gICAgbGV0IG9sZEZpbGVQYXRoSW5kZXg6IG51bWJlcjtcbiAgICBmb3JFYWNoRmlsZShkaXIsIChmaWxlUGF0aCkgPT4ge1xuICAgICAgICB2YXIgbWQ1c3RyID0gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGgpO1xuICAgICAgICBpZiAoIWdjZkNhY2hlW2ZpbGVQYXRoXSB8fCAoZ2NmQ2FjaGVbZmlsZVBhdGhdICYmIGdjZkNhY2hlW2ZpbGVQYXRoXSAhPT0gbWQ1c3RyKSkge1xuICAgICAgICAgICAgZ2NmQ2FjaGVbZmlsZVBhdGhdID0gbWQ1c3RyO1xuICAgICAgICAgICAgZWFjaENhbGxiYWNrKGZpbGVQYXRoLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgb2xkRmlsZVBhdGhJbmRleCA9IG9sZEZpbGVQYXRocy5pbmRleE9mKGZpbGVQYXRoKTtcbiAgICAgICAgaWYgKG9sZEZpbGVQYXRoSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgY29uc3QgZW5kRmlsZVBhdGggPSBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRoSW5kZXhdID0gZW5kRmlsZVBhdGg7XG4gICAgICAgICAgICBvbGRGaWxlUGF0aHMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZEZpbGVQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZWxldGUgZ2NmQ2FjaGVbb2xkRmlsZVBhdGhzW2ldXTtcbiAgICAgICAgZWFjaENhbGxiYWNrKG9sZEZpbGVQYXRoc1tpXSwgdHJ1ZSk7XG4gICAgfVxuICAgIGZzLndyaXRlRmlsZVN5bmMoY2FjaGVGaWxlUGF0aCwgSlNPTi5zdHJpbmdpZnkoZ2NmQ2FjaGUpLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSk7XG59XG4vKipcbiAqIOWGmeWFpee8k+WtmOaVsOaNrlxuICogQHBhcmFtIGNhY2hlRmlsZVBhdGhcbiAqIEBwYXJhbSBjYWNoZURhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlQ2FjaGVEYXRhKGNhY2hlRmlsZVBhdGg6IHN0cmluZywgY2FjaGVEYXRhOiBhbnkpIHtcbiAgICBpZiAoIWNhY2hlRmlsZVBhdGgpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhgY2FjaGVGaWxlUGF0aCBpcyBudWxsYCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmcy53cml0ZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGNhY2hlRGF0YSksIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KTtcbn1cbi8qKlxuICog6K+75Y+W57yT5a2Y5pWw5o2uXG4gKiBAcGFyYW0gY2FjaGVGaWxlUGF0aFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FjaGVEYXRhKGNhY2hlRmlsZVBhdGg6IHN0cmluZyk6IGFueSB7XG4gICAgaWYgKCFjYWNoZUZpbGVQYXRoKSB7XG4gICAgICAgIExvZ2dlci5sb2coYGNhY2hlRmlsZVBhdGggaXMgbnVsbGAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGNhY2hlRmlsZVBhdGgpKSB7XG4gICAgICAgIGZzLmVuc3VyZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIFwie31cIiwgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0pO1xuICAgIH1cbiAgICBjb25zdCBnY2ZDYWNoZUZpbGUgPSBmcy5yZWFkRmlsZVN5bmMoY2FjaGVGaWxlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICBjb25zdCBnY2ZDYWNoZSA9IEpTT04ucGFyc2UoZ2NmQ2FjaGVGaWxlKTtcbiAgICByZXR1cm4gZ2NmQ2FjaGU7XG59XG4vKipcbiAqIOiOt+WPluaWh+S7tm1kNSAo5ZCM5q2lKVxuICogQHBhcmFtIGZpbGVQYXRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlTWQ1U3luYyhmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBmaWxlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCBcInV0Zi04XCIpO1xuICAgIHZhciBtZDV1bSA9IGNyeXB0by5jcmVhdGVIYXNoKFwibWQ1XCIpO1xuICAgIG1kNXVtLnVwZGF0ZShmaWxlKTtcbiAgICByZXR1cm4gbWQ1dW0uZGlnZXN0KFwiaGV4XCIpO1xufVxuLyoqXG4gKiDojrflj5bmlofku7YgbWQ1XG4gKiBAcGFyYW0gZmlsZVBhdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEZpbGVNZDUoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHJldHVybiBnZXRGaWxlTWQ1U3luYyhmaWxlUGF0aCk7XG59XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCAqIGFzIG1tYXRjaCBmcm9tIFwibWljcm9tYXRjaFwiO1xuaW1wb3J0IHsgZm9yRWFjaEZpbGUsIGdldENhY2hlRGF0YSwgZ2V0RmlsZU1kNVN5bmMsIHdyaXRlQ2FjaGVEYXRhLCB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMgfSBmcm9tIFwiLi9maWxlLXV0aWxzXCI7XG5pbXBvcnQgeyBXb3JrZXIgfSBmcm9tIFwid29ya2VyX3RocmVhZHNcIjtcbmltcG9ydCB7IGRvUGFyc2UgfSBmcm9tIFwiLi9kby1wYXJzZVwiO1xuaW1wb3J0IHsgRGVmYXVsdFBhcnNlSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtcGFyc2UtaGFuZGxlclwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZXJcIjtcbmltcG9ydCB7IFRyYW5zMkpzb25BbmREdHNIYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC10cmFuczJmaWxlLWhhbmRsZXJcIjtcbi8qKlxuICog6L2s5o2iXG4gKiBAcGFyYW0gY29udmVyQ29uZmlnIOino+aekOmFjee9rlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29udmVydChjb252ZXJDb25maWc6IElUYWJsZUNvbnZlcnRDb25maWcpIHtcbiAgICBpZiAoIWNvbnZlckNvbmZpZy5wcm9qUm9vdCkge1xuICAgICAgICBjb252ZXJDb25maWcucHJvalJvb3QgPSBwcm9jZXNzLmN3ZCgpO1xuICAgIH1cbiAgICBsZXQgdHJhbnMyRmlsZUhhbmRsZXI6IElUcmFuc1Jlc3VsdDJBbnlGaWxlSGFuZGxlcjtcbiAgICBpZiAoY29udmVyQ29uZmlnLmN1c3RvbVRyYW5zMkZpbGVIYW5kbGVyUGF0aCkge1xuICAgICAgICB0cmFuczJGaWxlSGFuZGxlciA9IHJlcXVpcmUoY29udmVyQ29uZmlnLmN1c3RvbVRyYW5zMkZpbGVIYW5kbGVyUGF0aCk7XG4gICAgICAgIGlmICghdHJhbnMyRmlsZUhhbmRsZXIgfHwgdHlwZW9mIHRyYW5zMkZpbGVIYW5kbGVyLnRyYW5zMkZpbGVzICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOiHquWumuS5iei9rOaNouWunueOsOmUmeivrzoke2NvbnZlckNvbmZpZy5jdXN0b21UcmFuczJGaWxlSGFuZGxlclBhdGh9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0cmFuczJGaWxlSGFuZGxlciA9IG5ldyBUcmFuczJKc29uQW5kRHRzSGFuZGxlcigpO1xuICAgIH1cbiAgICBjb25zdCB0YWJsZUZpbGVEaXIgPSBjb252ZXJDb25maWcudGFibGVGaWxlRGlyO1xuICAgIGlmICghdGFibGVGaWxlRGlyKSB7XG4gICAgICAgIExvZ2dlci5sb2coYOmFjee9ruihqOebruW9le+8mnRhYmxlRmlsZURpcuS4uuepumAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHRhYmxlRmlsZURpcikpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhg6YWN572u6KGo5paH5Lu25aS55LiN5a2Y5Zyo77yaJHt0YWJsZUZpbGVEaXJ9YCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkZWZhdWx0UGF0dGVybiA9IFtcIioqLyoue3hsc3gsY3N2fVwiLCBcIiEqKi9+JCouKlwiLCBcIiEqKi9+LiouKlwiXTtcbiAgICBpZiAoIWNvbnZlckNvbmZpZy5wYXR0ZXJuKSB7XG4gICAgICAgIGNvbnZlckNvbmZpZy5wYXR0ZXJuID0gZGVmYXVsdFBhdHRlcm47XG4gICAgfSBlbHNlIGlmIChjb252ZXJDb25maWcucGF0dGVybiAmJiB0eXBlb2YgY29udmVyQ29uZmlnLnBhdHRlcm4gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWZhdWx0UGF0dGVybi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKCFjb252ZXJDb25maWcucGF0dGVybi5pbmNsdWRlcyhkZWZhdWx0UGF0dGVybltpXSkpIHtcbiAgICAgICAgICAgICAgICBjb252ZXJDb25maWcucGF0dGVybi5wdXNoKGRlZmF1bHRQYXR0ZXJuW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29udmVyQ29uZmlnLnVzZU11bHRpVGhyZWFkICYmIGlzTmFOKGNvbnZlckNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0pKSB7XG4gICAgICAgIGNvbnZlckNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0gPSA1O1xuICAgIH1cbiAgICBMb2dnZXIuaW5pdChjb252ZXJDb25maWcpO1xuICAgIGxldCBmaWxlSW5mb3M6IElGaWxlSW5mb1tdID0gW107XG4gICAgbGV0IGRlbGV0ZUZpbGVJbmZvczogSUZpbGVJbmZvW10gPSBbXTtcbiAgICBjb25zdCBnZXRGaWxlSW5mbyA9IChmaWxlUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoUGFyc2UgPSBwYXRoLnBhcnNlKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgZmlsZUluZm86IElGaWxlSW5mbyA9IHtcbiAgICAgICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICAgIGZpbGVOYW1lOiBmaWxlUGF0aFBhcnNlLm5hbWUsXG4gICAgICAgICAgICBmaWxlRXh0TmFtZTogZmlsZVBhdGhQYXJzZS5leHQsXG4gICAgICAgICAgICBpc0RlbGV0ZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZpbGVJbmZvO1xuICAgIH07XG4gICAgY29uc3QgbWF0Y2hQYXR0ZXJuID0gY29udmVyQ29uZmlnLnBhdHRlcm47XG4gICAgY29uc3QgZWFjaEZpbGVDYWxsYmFjayA9IChmaWxlUGF0aDogc3RyaW5nLCBpc0RlbGV0ZT86IGJvb2xlYW4pID0+IHtcbiAgICAgICAgY29uc3QgZmlsZUluZm8gPSBnZXRGaWxlSW5mbyhmaWxlUGF0aCk7XG4gICAgICAgIGxldCBjYW5SZWFkOiBib29sZWFuO1xuICAgICAgICBpZiAoaXNEZWxldGUpIHtcbiAgICAgICAgICAgIGRlbGV0ZUZpbGVJbmZvcy5wdXNoKGZpbGVJbmZvKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhblJlYWQgPSBtbWF0Y2guYWxsKGZpbGVJbmZvLmZpbGVQYXRoLCBtYXRjaFBhdHRlcm4pO1xuICAgICAgICAgICAgaWYgKGNhblJlYWQpIHtcbiAgICAgICAgICAgICAgICBmaWxlSW5mb3MucHVzaChmaWxlSW5mbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgZmlsZUluZm8sIGNhblJlYWQgfTtcbiAgICB9O1xuICAgIGxldCBwYXJzZVJlc3VsdE1hcDogVGFibGVQYXJzZVJlc3VsdE1hcCA9IHt9O1xuXG4gICAgLy/nvJPlrZjlpITnkIZcbiAgICBsZXQgY2FjaGVGaWxlRGlyUGF0aDogc3RyaW5nID0gY29udmVyQ29uZmlnLmNhY2hlRmlsZURpclBhdGg7XG4gICAgbGV0IHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aDogc3RyaW5nO1xuXG4gICAgaWYgKCFjb252ZXJDb25maWcudXNlQ2FjaGUpIHtcbiAgICAgICAgZm9yRWFjaEZpbGUodGFibGVGaWxlRGlyLCBlYWNoRmlsZUNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIWNhY2hlRmlsZURpclBhdGgpIGNhY2hlRmlsZURpclBhdGggPSBcIi5jYWNoZVwiO1xuICAgICAgICBpZiAoIXBhdGguaXNBYnNvbHV0ZShjYWNoZUZpbGVEaXJQYXRoKSkge1xuICAgICAgICAgICAgY2FjaGVGaWxlRGlyUGF0aCA9IHBhdGguam9pbihjb252ZXJDb25maWcucHJvalJvb3QsIGNhY2hlRmlsZURpclBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCA9IHBhdGguam9pbihjYWNoZUZpbGVEaXJQYXRoLCBcIi5lZ2Zwcm1jXCIpO1xuICAgICAgICBwYXJzZVJlc3VsdE1hcCA9IGdldENhY2hlRGF0YShwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgpO1xuICAgICAgICBpZiAoIXBhcnNlUmVzdWx0TWFwKSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdE1hcCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9sZEZpbGVQYXRocyA9IE9iamVjdC5rZXlzKHBhcnNlUmVzdWx0TWFwKTtcbiAgICAgICAgbGV0IG9sZEZpbGVQYXRoSW5kZXg6IG51bWJlcjtcbiAgICAgICAgbGV0IHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdDtcbiAgICAgICAgZm9yRWFjaEZpbGUodGFibGVGaWxlRGlyLCAoZmlsZVBhdGgpID0+IHtcbiAgICAgICAgICAgIHZhciBtZDVzdHIgPSBnZXRGaWxlTWQ1U3luYyhmaWxlUGF0aCk7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXTtcbiAgICAgICAgICAgIGlmICghcGFyc2VSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcFtmaWxlUGF0aF0gPSBwYXJzZVJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJzZVJlc3VsdCAmJiBwYXJzZVJlc3VsdC5tZDVoYXNoICE9PSBtZDVzdHIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGZpbGVJbmZvLCBjYW5SZWFkIH0gPSBlYWNoRmlsZUNhbGxiYWNrKGZpbGVQYXRoLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNhblJlYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VSZXN1bHQubWQ1aGFzaCA9IG1kNXN0cjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvbGRGaWxlUGF0aEluZGV4ID0gb2xkRmlsZVBhdGhzLmluZGV4T2YoZmlsZVBhdGgpO1xuICAgICAgICAgICAgaWYgKG9sZEZpbGVQYXRoSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZEZpbGVQYXRoID0gb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRocy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhJbmRleF0gPSBlbmRGaWxlUGF0aDtcbiAgICAgICAgICAgICAgICBvbGRGaWxlUGF0aHMucG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZEZpbGVQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGVsZXRlIHBhcnNlUmVzdWx0TWFwW29sZEZpbGVQYXRoc1tpXV07XG4gICAgICAgICAgICBlYWNoRmlsZUNhbGxiYWNrKG9sZEZpbGVQYXRoc1tpXSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IHBhcnNlSGFuZGxlcjogSVRhYmxlUGFyc2VIYW5kbGVyO1xuICAgIGlmIChjb252ZXJDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aCkge1xuICAgICAgICBwYXJzZUhhbmRsZXIgPSByZXF1aXJlKGNvbnZlckNvbmZpZy5jdXN0b21QYXJzZUhhbmRsZXJQYXRoKTtcbiAgICAgICAgaWYgKCFwYXJzZUhhbmRsZXIgfHwgdHlwZW9mIHBhcnNlSGFuZGxlci5wYXJzZVRhYmxlRmlsZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDoh6rlrprkuYnop6PmnpDlrp7njrDplJnor686JHtjb252ZXJDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aH1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlSGFuZGxlciA9IG5ldyBEZWZhdWx0UGFyc2VIYW5kbGVyKCk7XG4gICAgfVxuICAgIGlmIChmaWxlSW5mb3MubGVuZ3RoID4gY29udmVyQ29uZmlnLnRocmVhZFBhcnNlRmlsZU1heE51bSAmJiBjb252ZXJDb25maWcudXNlTXVsdGlUaHJlYWQpIHtcbiAgICAgICAgbGV0IGxvZ1N0cjogc3RyaW5nID0gXCJcIjtcbiAgICAgICAgY29uc3QgY291bnQgPSBNYXRoLmZsb29yKGZpbGVJbmZvcy5sZW5ndGggLyBjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtKSArIDE7XG4gICAgICAgIGxldCB3b3JrZXI6IFdvcmtlcjtcbiAgICAgICAgbGV0IHN1YkZpbGVJbmZvczogSUZpbGVJbmZvW107XG4gICAgICAgIGxldCB3b3JrZXJNYXA6IHsgW2tleTogbnVtYmVyXTogV29ya2VyIH0gPSB7fTtcbiAgICAgICAgbGV0IGNvbXBsZXRlQ291bnQ6IG51bWJlciA9IDA7XG4gICAgICAgIGNvbnN0IHQxID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGNvbnN0IG9uV29ya2VyUGFyc2VFbmQgPSAoZGF0YTogSVdvcmtEb1Jlc3VsdCkgPT4ge1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhgLS0tLS0tLS0tLS0tLS0tLee6v+eoi+e7k+adnzoke2RhdGEudGhyZWFkSWR9LS0tLS0tLS0tLS0tLS0tLS1gKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZE1hcCA9IGRhdGEucGFyc2VSZXN1bHRNYXA7XG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gcGFyc2VkTWFwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJzZVJlc3VsdE1hcFtrZXldLnRhYmxlRGVmaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwW2tleV0gPSBwYXJzZWRNYXBba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wbGV0ZUNvdW50Kys7XG4gICAgICAgICAgICBsb2dTdHIgKz0gZGF0YS5sb2dTdHIgKyBMb2dnZXIubG9nU3RyO1xuICAgICAgICAgICAgaWYgKGNvbXBsZXRlQ291bnQgPj0gY291bnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0MiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgIExvZ2dlci5sb2coYFvlpJrnur/nqIvlr7zooajml7bpl7RdOiR7dDIgLSB0MX1gKTtcbiAgICAgICAgICAgICAgICB3cml0ZUZpbGVzKFxuICAgICAgICAgICAgICAgICAgICBjb252ZXJDb25maWcsXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnMyRmlsZUhhbmRsZXIsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvcyxcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlRmlsZUluZm9zLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcCxcbiAgICAgICAgICAgICAgICAgICAgbG9nU3RyXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBzdWJGaWxlSW5mb3MgPSBmaWxlSW5mb3Muc3BsaWNlKDAsIGNvbnZlckNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0pO1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhgLS0tLS0tLS0tLS0tLS0tLee6v+eoi+W8gOWnizoke2l9LS0tLS0tLS0tLS0tLS0tLS1gKTtcbiAgICAgICAgICAgIHdvcmtlciA9IG5ldyBXb3JrZXIocGF0aC5qb2luKHBhdGguZGlybmFtZShfX2ZpbGVuYW1lKSwgXCIuLi8uLi8uLi93b3JrZXJfc2NyaXB0cy93b3JrZXIuanNcIiksIHtcbiAgICAgICAgICAgICAgICB3b3JrZXJEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHRocmVhZElkOiBpLFxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mb3M6IHN1YkZpbGVJbmZvcyxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXA6IHBhcnNlUmVzdWx0TWFwLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUNvbmZpZzogY29udmVyQ29uZmlnXG4gICAgICAgICAgICAgICAgfSBhcyBJV29ya2VyU2hhcmVEYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHdvcmtlck1hcFtpXSA9IHdvcmtlcjtcbiAgICAgICAgICAgIHdvcmtlci5vbihcIm1lc3NhZ2VcIiwgb25Xb3JrZXJQYXJzZUVuZCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB0MSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICAgIGRvUGFyc2UoY29udmVyQ29uZmlnLCBmaWxlSW5mb3MsIHBhcnNlUmVzdWx0TWFwLCBwYXJzZUhhbmRsZXIpO1xuICAgICAgICBjb25zdCB0MiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBMb2dnZXIubG9nKGBb5Y2V57q/56iL5a+86KGo5pe26Ze0XToke3QyIC0gdDF9YCk7XG4gICAgICAgIHdyaXRlRmlsZXMoXG4gICAgICAgICAgICBjb252ZXJDb25maWcsXG4gICAgICAgICAgICBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgsXG4gICAgICAgICAgICB0cmFuczJGaWxlSGFuZGxlcixcbiAgICAgICAgICAgIGZpbGVJbmZvcyxcbiAgICAgICAgICAgIGRlbGV0ZUZpbGVJbmZvcyxcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwLFxuICAgICAgICAgICAgTG9nZ2VyLmxvZ1N0clxuICAgICAgICApO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHdyaXRlRmlsZXMoXG4gICAgcGFyc2VDb25maWc6IElUYWJsZUNvbnZlcnRDb25maWcsXG4gICAgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoOiBzdHJpbmcsXG4gICAgdHJhbnMyRmlsZUhhbmRsZXI6IElUcmFuc1Jlc3VsdDJBbnlGaWxlSGFuZGxlcixcbiAgICBmaWxlSW5mb3M6IElGaWxlSW5mb1tdLFxuICAgIGRlbGV0ZUZpbGVJbmZvczogSUZpbGVJbmZvW10sXG4gICAgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXAsXG4gICAgbG9nU3RyPzogc3RyaW5nXG4pIHtcbiAgICAvL+WGmeWFpeino+aekOe8k+WtmFxuICAgIGlmIChwYXJzZUNvbmZpZy51c2VDYWNoZSkge1xuICAgICAgICB3cml0ZUNhY2hlRGF0YShwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgsIHBhcnNlUmVzdWx0TWFwKTtcbiAgICB9XG5cbiAgICAvL+ino+aekOe7k+adn++8jOWBmuWvvOWHuuWkhOeQhlxuICAgIGxldCBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwID0gdHJhbnMyRmlsZUhhbmRsZXIudHJhbnMyRmlsZXMoXG4gICAgICAgIHBhcnNlQ29uZmlnLFxuICAgICAgICBmaWxlSW5mb3MsXG4gICAgICAgIGRlbGV0ZUZpbGVJbmZvcyxcbiAgICAgICAgcGFyc2VSZXN1bHRNYXBcbiAgICApO1xuICAgIGNvbnN0IG91dHB1dEZpbGVzID0gT2JqZWN0LnZhbHVlcyhvdXRwdXRGaWxlTWFwKTtcblxuICAgIC8v5YaZ5YWl5ZKM5Yig6Zmk5paH5Lu25aSE55CGXG4gICAgTG9nZ2VyLmxvZyhg5byA5aeL5YaZ5YWl5paH5Lu2OjAvJHtvdXRwdXRGaWxlcy5sZW5ndGh9YCk7XG5cbiAgICB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMoXG4gICAgICAgIG91dHB1dEZpbGVzLFxuICAgICAgICAoZmlsZVBhdGgsIHRvdGFsLCBub3csIGlzT2spID0+IHtcbiAgICAgICAgICAgIExvZ2dlci5sb2coYFvlhpnlhaXmlofku7ZdIOi/m+W6pjooJHtub3d9LyR7dG90YWx9KSDot6/lvoQ6JHtmaWxlUGF0aH1gKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhg5YaZ5YWl57uT5p2ffmApO1xuICAgICAgICAgICAgLy/ml6Xlv5fmlofku7ZcbiAgICAgICAgICAgIGlmICghbG9nU3RyKSB7XG4gICAgICAgICAgICAgICAgbG9nU3RyID0gTG9nZ2VyLmxvZ1N0cjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG91dHB1dExvZ0ZpbGVJbmZvOiBJT3V0UHV0RmlsZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgZmlsZVBhdGg6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBcImV4Y2VsMmFsbC5sb2dcIiksXG4gICAgICAgICAgICAgICAgZGF0YTogbG9nU3RyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd3JpdGVPckRlbGV0ZU91dFB1dEZpbGVzKFtvdXRwdXRMb2dGaWxlSW5mb10pO1xuICAgICAgICB9XG4gICAgKTtcbn1cbiIsImltcG9ydCAqIGFzIHhsc3ggZnJvbSBcInhsc3hcIjtcbi8qKlxuICog5piv5ZCm5Li656m66KGo5qC85qC85a2QXG4gKiBAcGFyYW0gY2VsbFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eUNlbGwoY2VsbDogeGxzeC5DZWxsT2JqZWN0KSB7XG4gICAgaWYgKGNlbGwgJiYgY2VsbC52ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjZWxsLnYgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBjZWxsLnYgPT09IFwiXCI7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGwudiA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKGNlbGwudik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4vKipcbiAqIOWtl+avjVrnmoTnvJbnoIFcbiAqL1xuZXhwb3J0IGNvbnN0IFpDaGFyQ29kZSA9IDkwO1xuLyoqXG4gKiDlrZfmr41B55qE57yW56CBXG4gKlxuICovXG5leHBvcnQgY29uc3QgQUNoYXJDb2RlID0gNjU7XG4vKipcbiAqIOagueaNruW9k+WJjeWIl+eahGNoYXJDb2Rlc+iOt+WPluS4i+S4gOWIl0tleVxuICogQHBhcmFtIGNoYXJDb2Rlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmV4dENvbEtleShjaGFyQ29kZXM6IG51bWJlcltdKTogc3RyaW5nIHtcbiAgICBsZXQgaXNBZGQ6IGJvb2xlYW47XG4gICAgZm9yIChsZXQgaSA9IGNoYXJDb2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAoY2hhckNvZGVzW2ldIDwgWkNoYXJDb2RlKSB7XG4gICAgICAgICAgICBjaGFyQ29kZXNbaV0gKz0gMTtcbiAgICAgICAgICAgIGlzQWRkID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2UgaWYgKGNoYXJDb2Rlc1tpXSA9PT0gWkNoYXJDb2RlKSB7XG4gICAgICAgICAgICBjaGFyQ29kZXNbaV0gPSBBQ2hhckNvZGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFpc0FkZCkge1xuICAgICAgICBjaGFyQ29kZXMucHVzaChBQ2hhckNvZGUpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGFyQ29kZXNUb1N0cmluZyhjaGFyQ29kZXMpO1xufVxuXG4vKipcbiAqIOWIl+eahOWtl+espue8lueggeaVsOe7hOi9rOWtl+espuS4slxuICogQHBhcmFtIGNoYXJDb2Rlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2hhckNvZGVzVG9TdHJpbmcoY2hhckNvZGVzOiBudW1iZXJbXSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoLi4uY2hhckNvZGVzKTtcbn1cbi8qKlxuICog5a2X56ym5Liy6L2s57yW56CB5pWw57uEXG4gKiBAcGFyYW0gY29sS2V5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdUb0NoYXJDb2Rlcyhjb2xLZXk6IHN0cmluZykge1xuICAgIGNvbnN0IGNoYXJDb2RlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sS2V5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNoYXJDb2Rlcy5wdXNoKGNvbEtleS5jaGFyQ29kZUF0KGkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJDb2Rlcztcbn1cbi8qKlxuICog57q15ZCR6YGN5Y6G6KGo5qC8XG4gKiBAcGFyYW0gc2hlZXQgeGxzeOihqOagvOWvueixoVxuICogQHBhcmFtIHN0YXJ0Um93IOW8gOWni+ihjCDku44x5byA5aeLXG4gKiBAcGFyYW0gc3RhcnRDb2wg5YiX5a2X56ymIOavlOWmgkEgQlxuICogQHBhcmFtIGNhbGxiYWNrIOmBjeWOhuWbnuiwgyAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB2b2lkXG4gKiBAcGFyYW0gaXNTaGVldFJvd0VuZCDmmK/lkKbooYznu5PmnZ/liKTmlq3mlrnms5VcbiAqIEBwYXJhbSBpc1NoZWV0Q29sRW5kIOaYr+WQpuWIl+e7k+adn+WIpOaWreaWueazlVxuICogQHBhcmFtIGlzU2tpcFNoZWV0Um93IOaYr+WQpui3s+i/h+ihjFxuICogQHBhcmFtIGlzU2tpcFNoZWV0Q29sIOaYr+WQpui3s+i/h+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gdmVydGljYWxGb3JFYWNoU2hlZXQoXG4gICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgc3RhcnRSb3c6IG51bWJlcixcbiAgICBzdGFydENvbDogc3RyaW5nLFxuICAgIGNhbGxiYWNrOiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB2b2lkLFxuICAgIGlzU2hlZXRSb3dFbmQ/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IGJvb2xlYW4sXG4gICAgaXNTaGVldENvbEVuZD86IChzaGVldDogeGxzeC5TaGVldCwgY29sa2V5OiBzdHJpbmcpID0+IGJvb2xlYW4sXG4gICAgaXNTa2lwU2hlZXRSb3c/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IGJvb2xlYW4sXG4gICAgaXNTa2lwU2hlZXRDb2w/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKSA9PiBib29sZWFuXG4pIHtcbiAgICBjb25zdCBzaGVldFJlZjogc3RyaW5nID0gc2hlZXRbXCIhcmVmXCJdO1xuICAgIGNvbnN0IG1heFJvd051bSA9IHBhcnNlSW50KHNoZWV0UmVmLm1hdGNoKC9cXGQrJC8pWzBdKTtcblxuICAgIGNvbnN0IG1heENvbEtleSA9IHNoZWV0UmVmLnNwbGl0KFwiOlwiKVsxXS5tYXRjaCgvXltBLVphLXpdKy8pWzBdO1xuICAgIGxldCBtYXhDb2xLZXlDb2RlU3VtID0gZ2V0Q2hhckNvZGVTdW0obWF4Q29sS2V5KTtcblxuICAgIGxldCBjb2xDaGFyQ29kZXM6IG51bWJlcltdO1xuICAgIGxldCBjb2xLZXk6IHN0cmluZztcbiAgICBsZXQgY3VyQ29sQ29kZVN1bTogbnVtYmVyID0gMDtcbiAgICBjb25zdCBzdGFydENoYXJjb2RlcyA9IHN0cmluZ1RvQ2hhckNvZGVzKHN0YXJ0Q29sKTtcbiAgICBmb3IgKGxldCBpID0gc3RhcnRSb3c7IGkgPD0gbWF4Um93TnVtOyBpKyspIHtcbiAgICAgICAgaWYgKGlzU2hlZXRSb3dFbmQgPyBpc1NoZWV0Um93RW5kKHNoZWV0LCBpKSA6IGZhbHNlKSBicmVhaztcbiAgICAgICAgaWYgKGlzU2tpcFNoZWV0Um93ID8gaXNTa2lwU2hlZXRSb3coc2hlZXQsIGkpIDogZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgICBjb2xDaGFyQ29kZXMgPSBzdGFydENoYXJjb2Rlcy5jb25jYXQoW10pO1xuXG4gICAgICAgIGNvbEtleSA9IHN0YXJ0Q29sO1xuXG4gICAgICAgIGxldCBoYXNOZXh0Q29sID0gaXNTaGVldENvbEVuZCA/ICFpc1NoZWV0Q29sRW5kKHNoZWV0LCBjb2xLZXkpIDogdHJ1ZTtcbiAgICAgICAgd2hpbGUgKGhhc05leHRDb2wpIHtcbiAgICAgICAgICAgIGlmICghKGlzU2tpcFNoZWV0Q29sID8gaXNTa2lwU2hlZXRDb2woc2hlZXQsIGNvbEtleSkgOiBmYWxzZSkpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhzaGVldCwgY29sS2V5LCBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbEtleSA9IGdldE5leHRDb2xLZXkoY29sQ2hhckNvZGVzKTtcbiAgICAgICAgICAgIGN1ckNvbENvZGVTdW0gPSBnZXRDaGFyQ29kZVN1bShjb2xLZXkpO1xuICAgICAgICAgICAgaWYgKG1heENvbEtleUNvZGVTdW0gPj0gY3VyQ29sQ29kZVN1bSkge1xuICAgICAgICAgICAgICAgIGhhc05leHRDb2wgPSBpc1NoZWV0Q29sRW5kID8gIWlzU2hlZXRDb2xFbmQoc2hlZXQsIGNvbEtleSkgOiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoYXNOZXh0Q29sID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICog5qiq5ZCR6YGN5Y6G6KGo5qC8XG4gKiBAcGFyYW0gc2hlZXQgeGxzeOihqOagvOWvueixoVxuICogQHBhcmFtIHN0YXJ0Um93IOW8gOWni+ihjCDku44x5byA5aeLXG4gKiBAcGFyYW0gc3RhcnRDb2wg5YiX5a2X56ymIOavlOWmgkEgQlxuICogQHBhcmFtIGNhbGxiYWNrIOmBjeWOhuWbnuiwgyAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB2b2lkXG4gKiBAcGFyYW0gaXNTaGVldFJvd0VuZCDmmK/lkKbooYznu5PmnZ/liKTmlq3mlrnms5VcbiAqIEBwYXJhbSBpc1NoZWV0Q29sRW5kIOaYr+WQpuWIl+e7k+adn+WIpOaWreaWueazlVxuICogQHBhcmFtIGlzU2tpcFNoZWV0Um93IOaYr+WQpui3s+i/h+ihjFxuICogQHBhcmFtIGlzU2tpcFNoZWV0Q29sIOaYr+WQpui3s+i/h+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gaG9yaXpvbnRhbEZvckVhY2hTaGVldChcbiAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICBzdGFydFJvdzogbnVtYmVyLFxuICAgIHN0YXJ0Q29sOiBzdHJpbmcsXG4gICAgY2FsbGJhY2s6IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWQsXG4gICAgaXNTaGVldFJvd0VuZD86IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbixcbiAgICBpc1NoZWV0Q29sRW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xrZXk6IHN0cmluZykgPT4gYm9vbGVhbixcbiAgICBpc1NraXBTaGVldFJvdz86IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbixcbiAgICBpc1NraXBTaGVldENvbD86IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpID0+IGJvb2xlYW5cbikge1xuICAgIGNvbnN0IHNoZWV0UmVmOiBzdHJpbmcgPSBzaGVldFtcIiFyZWZcIl07XG4gICAgY29uc3QgbWF4Um93TnVtID0gcGFyc2VJbnQoc2hlZXRSZWYubWF0Y2goL1xcZCskLylbMF0pO1xuXG4gICAgY29uc3QgbWF4Q29sS2V5ID0gc2hlZXRSZWYuc3BsaXQoXCI6XCIpWzFdLm1hdGNoKC9eW0EtWmEtel0rLylbMF07XG4gICAgY29uc3QgbWF4Q29sS2V5Q29kZVN1bSA9IGdldENoYXJDb2RlU3VtKG1heENvbEtleSk7XG4gICAgbGV0IGNvbENoYXJDb2RlczogbnVtYmVyW107XG4gICAgbGV0IGNvbEtleTogc3RyaW5nO1xuICAgIGNvbENoYXJDb2RlcyA9IHN0cmluZ1RvQ2hhckNvZGVzKHN0YXJ0Q29sKTtcbiAgICBsZXQgY3VyQ29sQ29kZVN1bTogbnVtYmVyID0gMDtcbiAgICBjb2xLZXkgPSBzdGFydENvbDtcbiAgICBsZXQgaGFzTmV4dENvbCA9IGlzU2hlZXRDb2xFbmQgPyAhaXNTaGVldENvbEVuZChzaGVldCwgY29sS2V5KSA6IHRydWU7XG4gICAgd2hpbGUgKGhhc05leHRDb2wpIHtcbiAgICAgICAgaWYgKCEoaXNTa2lwU2hlZXRDb2wgPyBpc1NraXBTaGVldENvbChzaGVldCwgY29sS2V5KSA6IGZhbHNlKSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0Um93OyBpIDw9IG1heFJvd051bTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzU2hlZXRSb3dFbmQgPyBpc1NoZWV0Um93RW5kKHNoZWV0LCBpKSA6IGZhbHNlKSBicmVhaztcbiAgICAgICAgICAgICAgICBpZiAoaXNTa2lwU2hlZXRSb3cgPyBpc1NraXBTaGVldFJvdyhzaGVldCwgaSkgOiBmYWxzZSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soc2hlZXQsIGNvbEtleSwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb2xLZXkgPSBnZXROZXh0Q29sS2V5KGNvbENoYXJDb2Rlcyk7XG4gICAgICAgIGN1ckNvbENvZGVTdW0gPSBnZXRDaGFyQ29kZVN1bShjb2xLZXkpO1xuICAgICAgICBpZiAobWF4Q29sS2V5Q29kZVN1bSA+PSBjdXJDb2xDb2RlU3VtKSB7XG4gICAgICAgICAgICBoYXNOZXh0Q29sID0gaXNTaGVldENvbEVuZCA/ICFpc1NoZWV0Q29sRW5kKHNoZWV0LCBjb2xLZXkpIDogdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhc05leHRDb2wgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmxldCBjb2xLZXlTdW1NYXAgPSB7fTtcbmZ1bmN0aW9uIGdldENoYXJDb2RlU3VtKGNvbEtleTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBsZXQgc3VtOiBudW1iZXIgPSBjb2xLZXlTdW1NYXBbY29sS2V5XTtcbiAgICBpZiAoIXN1bSkge1xuICAgICAgICBzdW0gPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbEtleS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc3VtICs9IGNvbEtleS5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbEtleVN1bU1hcFtjb2xLZXldID0gc3VtO1xuICAgIH1cbiAgICByZXR1cm4gc3VtO1xufVxuLyoqXG4gKiDor7vlj5bphY3nva7ooajmlofku7Yg5ZCM5q2l55qEXG4gKiBAcGFyYW0gZmlsZUluZm9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlYWRUYWJsZUZpbGUoZmlsZUluZm86IElGaWxlSW5mbyk6IHhsc3guV29ya0Jvb2sge1xuICAgIGNvbnN0IHdvcmtCb29rID0geGxzeC5yZWFkRmlsZShmaWxlSW5mby5maWxlUGF0aCwgeyB0eXBlOiBpc0NTVihmaWxlSW5mby5maWxlRXh0TmFtZSkgPyBcInN0cmluZ1wiIDogXCJmaWxlXCIgfSk7XG4gICAgcmV0dXJuIHdvcmtCb29rO1xufVxuLyoqXG4gKiDmoLnmja7mlofku7blkI3lkI7nvIDliKTmlq3mmK/lkKbkuLpjc3bmlofku7ZcbiAqIEBwYXJhbSBmaWxlRXh0TmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDU1YoZmlsZUV4dE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmaWxlRXh0TmFtZSA9PT0gXCJjc3ZcIjtcbn1cbiIsImltcG9ydCAqIGFzIHhsc3ggZnJvbSBcInhsc3hcIjtcbmltcG9ydCB7IHZhbHVlVHJhbnNGdW5jTWFwIH0gZnJvbSBcIi5cIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2VyXCI7XG5pbXBvcnQgeyBob3Jpem9udGFsRm9yRWFjaFNoZWV0LCBpc0VtcHR5Q2VsbCwgcmVhZFRhYmxlRmlsZSwgdmVydGljYWxGb3JFYWNoU2hlZXQgfSBmcm9tIFwiLi90YWJsZS11dGlsc1wiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElUYWJsZUZpZWxkIHtcbiAgICAgICAgLyoq6YWN572u6KGo5Lit5rOo6YeK5YC8ICovXG4gICAgICAgIHRleHQ6IHN0cmluZztcbiAgICAgICAgLyoq6YWN572u6KGo5Lit57G75Z6L5YC8ICovXG4gICAgICAgIG9yaWdpblR5cGU6IHN0cmluZztcbiAgICAgICAgLyoq6YWN572u6KGo5Lit5a2X5q615ZCN5YC8ICovXG4gICAgICAgIG9yaWdpbkZpZWxkTmFtZTogc3RyaW5nO1xuICAgICAgICAvKirop6PmnpDlkI7nmoTnsbvlnovlgLwgKi9cbiAgICAgICAgdHlwZT86IHN0cmluZztcbiAgICAgICAgLyoq6Kej5p6Q5ZCO55qE5a2Q57G75Z6L5YC8ICovXG4gICAgICAgIHN1YlR5cGU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuino+aekOWQjueahOWtl+auteWQjeWAvCAqL1xuICAgICAgICBmaWVsZE5hbWU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuWvueixoeeahOWtkOWtl+auteWQjSAqL1xuICAgICAgICBzdWJGaWVsZE5hbWU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuWkmuWIl+WvueixoSAqL1xuICAgICAgICBpc011dGlDb2xPYmo/OiBib29sZWFuO1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSVRhYmxlRGVmaW5lIHtcbiAgICAgICAgLyoq6YWN572u6KGo5ZCNICovXG4gICAgICAgIHRhYmxlTmFtZTogc3RyaW5nO1xuICAgICAgICAvKirphY3nva7ooajnsbvlnosg6buY6K6k5Lik56eNOiB2ZXJ0aWNhbCDlkowgaG9yaXpvbnRhbCovXG4gICAgICAgIHRhYmxlVHlwZTogc3RyaW5nO1xuXG4gICAgICAgIC8qKuW8gOWni+ihjOS7jjHlvIDlp4sgKi9cbiAgICAgICAgc3RhcnRSb3c6IG51bWJlcjtcbiAgICAgICAgLyoq5byA5aeL5YiX5LuOQeW8gOWniyAqL1xuICAgICAgICBzdGFydENvbDogc3RyaW5nO1xuICAgICAgICAvKirlnoLnm7Top6PmnpDlrZfmrrXlrprkuYkgKi9cbiAgICAgICAgdmVydGljYWxGaWVsZERlZmluZTogSVZlcnRpY2FsRmllbGREZWZpbmU7XG4gICAgICAgIC8qKuaoquWQkeino+aekOWtl+auteWumuS5iSAqL1xuICAgICAgICBob3Jpem9udGFsRmllbGREZWZpbmU6IElIb3Jpem9udGFsRmllbGREZWZpbmU7XG4gICAgfVxuICAgIGludGVyZmFjZSBJSG9yaXpvbnRhbEZpZWxkRGVmaW5lIHtcbiAgICAgICAgLyoq57G75Z6L6KGMICovXG4gICAgICAgIHR5cGVDb2w6IHN0cmluZztcbiAgICAgICAgLyoq5a2X5q615ZCN6KGMICovXG4gICAgICAgIGZpZWxkQ29sOiBzdHJpbmc7XG4gICAgICAgIC8qKuazqOmHiuihjCAqL1xuICAgICAgICB0ZXh0Q29sOiBzdHJpbmc7XG4gICAgfVxuICAgIGludGVyZmFjZSBJVmVydGljYWxGaWVsZERlZmluZSB7XG4gICAgICAgIC8qKuexu+Wei+ihjCAqL1xuICAgICAgICB0eXBlUm93OiBudW1iZXI7XG4gICAgICAgIC8qKuWtl+auteWQjeihjCAqL1xuICAgICAgICBmaWVsZFJvdzogbnVtYmVyO1xuICAgICAgICAvKirms6jph4rooYwgKi9cbiAgICAgICAgdGV4dFJvdzogbnVtYmVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlrZfmrrXlrZflhbhcbiAgICAgKiBrZXnmmK/liJdjb2xLZXlcbiAgICAgKiB2YWx1ZeaYr+Wtl+auteWvueixoVxuICAgICAqL1xuICAgIHR5cGUgQ29sS2V5VGFibGVGaWVsZE1hcCA9IHsgW2tleTogc3RyaW5nXTogSVRhYmxlRmllbGQgfTtcblxuICAgIC8qKlxuICAgICAqIOihqOagvOeahOS4gOihjOaIluiAheS4gOWIl1xuICAgICAqIGtleeS4uuWtl+auteWQjeWAvO+8jHZhbHVl5Li66KGo5qC855qE5LiA5qC8XG4gICAgICovXG4gICAgdHlwZSBUYWJsZVJvd09yQ29sID0geyBba2V5OiBzdHJpbmddOiBJVGFibGVDZWxsIH07XG4gICAgLyoqXG4gICAgICog6KGo5qC855qE5LiA5qC8XG4gICAgICovXG4gICAgaW50ZXJmYWNlIElUYWJsZUNlbGwge1xuICAgICAgICAvKirlrZfmrrXlr7nosaEgKi9cbiAgICAgICAgZmlsZWQ6IElUYWJsZUZpZWxkO1xuICAgICAgICAvKirlgLwgKi9cbiAgICAgICAgdmFsdWU6IGFueTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6KGo5qC86KGM5oiW5YiX55qE5a2X5YW4XG4gICAgICoga2V55Li66KGM57Si5byV77yMdmFsdWXkuLrooajmoLznmoTkuIDooYxcbiAgICAgKi9cbiAgICB0eXBlIFRhYmxlUm93T3JDb2xNYXAgPSB7IFtrZXk6IHN0cmluZ106IFRhYmxlUm93T3JDb2wgfTtcbiAgICAvKipcbiAgICAgKiDooajmoLzooYzmiJbliJflgLzmlbDnu4RcbiAgICAgKiBrZXnkuLvplK7vvIx2YWx1ZeaYr+WAvOaVsOe7hFxuICAgICAqL1xuICAgIHR5cGUgUm93T3JDb2xWYWx1ZXNNYXAgPSB7IFtrZXk6IHN0cmluZ106IGFueVtdIH07XG4gICAgaW50ZXJmYWNlIElUYWJsZVZhbHVlcyB7XG4gICAgICAgIC8qKuWtl+auteWQjeaVsOe7hCAqL1xuICAgICAgICBmaWVsZHM6IHN0cmluZ1tdO1xuICAgICAgICAvKirooajmoLzlgLzmlbDnu4QgKi9cbiAgICAgICAgcm93T3JDb2xWYWx1ZXNNYXA6IFJvd09yQ29sVmFsdWVzTWFwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDnu5PmnpxcbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSVRhYmxlUGFyc2VSZXN1bHQge1xuICAgICAgICAvKirphY3nva7ooajlrprkuYkgKi9cbiAgICAgICAgdGFibGVEZWZpbmU/OiBJVGFibGVEZWZpbmU7XG4gICAgICAgIC8qKuW9k+WJjeWIhuihqOWQjSAqL1xuICAgICAgICBjdXJTaGVldE5hbWU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuWtl+auteWtl+WFuCAqL1xuICAgICAgICBmaWxlZE1hcD86IENvbEtleVRhYmxlRmllbGRNYXA7XG4gICAgICAgIC8vIC8qKuihqOagvOihjOaIluWIl+eahOWtl+WFuCAqL1xuICAgICAgICAvLyByb3dPckNvbE1hcDogVGFibGVSb3dPckNvbE1hcFxuICAgICAgICAvKirljZXkuKrooajmoLzlr7nosaEgKi9cbiAgICAgICAgLyoqa2V55piv5Li76ZSu5YC877yMdmFsdWXmmK/kuIDooYzlr7nosaEgKi9cbiAgICAgICAgdGFibGVPYmo/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xuICAgICAgICAvKirlvZPliY3ooYzmiJbliJflr7nosaEgKi9cbiAgICAgICAgY3VyUm93T3JDb2xPYmo/OiBhbnk7XG4gICAgICAgIC8qKuS4u+mUruWAvCAqL1xuICAgICAgICBtYWluS2V5RmllbGROYW1lPzogc3RyaW5nO1xuICAgIH1cblxuICAgIC8qKuWAvOi9rOaNouaWueazlSAqL1xuICAgIGludGVyZmFjZSBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgICAgIGVycm9yPzogYW55O1xuICAgICAgICB2YWx1ZT86IGFueTtcbiAgICB9XG4gICAgdHlwZSBWYWx1ZVRyYW5zRnVuYyA9IChmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IGFueSkgPT4gSVRyYW5zVmFsdWVSZXN1bHQ7XG4gICAgLyoqXG4gICAgICog5YC86L2s5o2i5pa55rOV5a2X5YW4XG4gICAgICoga2V55piv57G75Z6La2V5XG4gICAgICogdmFsdWXmmK/mlrnms5VcbiAgICAgKi9cbiAgICB0eXBlIFZhbHVlVHJhbnNGdW5jTWFwID0geyBba2V5OiBzdHJpbmddOiBWYWx1ZVRyYW5zRnVuYyB9O1xufVxuZXhwb3J0IGVudW0gVGFibGVUeXBlIHtcbiAgICB2ZXJ0aWNhbCA9IFwidmVydGljYWxcIixcbiAgICBob3Jpem9udGFsID0gXCJob3Jpem9udGFsXCJcbn1cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRQYXJzZUhhbmRsZXIgaW1wbGVtZW50cyBJVGFibGVQYXJzZUhhbmRsZXIge1xuICAgIHByaXZhdGUgX3ZhbHVlVHJhbnNGdW5jTWFwOiBWYWx1ZVRyYW5zRnVuY01hcDtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fdmFsdWVUcmFuc0Z1bmNNYXAgPSB2YWx1ZVRyYW5zRnVuY01hcDtcbiAgICB9XG4gICAgZ2V0VGFibGVEZWZpbmUoZmlsZUluZm86IElGaWxlSW5mbywgd29ya0Jvb2s6IHhsc3guV29ya0Jvb2spOiBJVGFibGVEZWZpbmUge1xuICAgICAgICAvL+WPluihqOagvOaWh+S7tuWQjeS4uuihqOagvOWQjVxuICAgICAgICBjb25zdCB0YWJsZU5hbWUgPSBmaWxlSW5mby5maWxlTmFtZTtcblxuICAgICAgICBjb25zdCB0YWJsZURlZmluZTogUGFydGlhbDxJVGFibGVEZWZpbmU+ID0ge1xuICAgICAgICAgICAgdGFibGVOYW1lOiB0YWJsZU5hbWVcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgY2VsbEtleTogc3RyaW5nO1xuICAgICAgICBsZXQgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0O1xuICAgICAgICAvL+WPluesrOS4gOS4quihqFxuICAgICAgICBjb25zdCBzaGVldE5hbWVzID0gd29ya0Jvb2suU2hlZXROYW1lcztcbiAgICAgICAgbGV0IHNoZWV0OiB4bHN4LlNoZWV0O1xuICAgICAgICBsZXQgZmlyc3RDZWxsVmFsdWU6IHsgdGFibGVOYW1lSW5TaGVldDogc3RyaW5nOyB0YWJsZVR5cGU6IHN0cmluZyB9O1xuICAgICAgICBsZXQgZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3Q7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hlZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2hlZXQgPSB3b3JrQm9vay5TaGVldHNbc2hlZXROYW1lc1tpXV07XG4gICAgICAgICAgICBmaXJzdENlbGxPYmogPSBzaGVldFtcIkFcIiArIDFdO1xuICAgICAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChmaXJzdENlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgZmlyc3RDZWxsVmFsdWUgPSB0aGlzLl9nZXRGaXJzdENlbGxWYWx1ZShmaXJzdENlbGxPYmopO1xuICAgICAgICAgICAgICAgIGlmIChmaXJzdENlbGxWYWx1ZSAmJiBmaXJzdENlbGxWYWx1ZS50YWJsZU5hbWVJblNoZWV0ID09PSB0YWJsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZmlyc3RDZWxsVmFsdWUgfHwgZmlyc3RDZWxsVmFsdWUudGFibGVOYW1lSW5TaGVldCAhPT0gdGFibGVOYW1lKSB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGDooajmoLzkuI3op4TojIMs6Lez6L+H6Kej5p6QLOi3r+W+hDoke2ZpbGVJbmZvLmZpbGVQYXRofWAsIFwiZXJyb3JcIik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0YWJsZURlZmluZS50YWJsZVR5cGUgPSBmaXJzdENlbGxWYWx1ZS50YWJsZVR5cGU7XG4gICAgICAgIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGFibGVEZWZpbmUudmVydGljYWxGaWVsZERlZmluZSA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgIGNvbnN0IHZlcnRpY2FsRmllbGREZWZpbmU6IElWZXJ0aWNhbEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUudmVydGljYWxGaWVsZERlZmluZTtcbiAgICAgICAgICAgIHZlcnRpY2FsRmllbGREZWZpbmUudGV4dFJvdyA9IDE7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY2VsbEtleSA9IFwiQVwiICsgaTtcbiAgICAgICAgICAgICAgICBjZWxsT2JqID0gc2hlZXRbY2VsbEtleV07XG4gICAgICAgICAgICAgICAgaWYgKGlzRW1wdHlDZWxsKGNlbGxPYmopIHx8IGNlbGxPYmoudiA9PT0gXCJOT1wiIHx8IGNlbGxPYmoudiA9PT0gXCJFTkRcIiB8fCBjZWxsT2JqLnYgPT09IFwiU1RBUlRcIikge1xuICAgICAgICAgICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydFJvdyA9IGk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjZWxsT2JqLnYgPT09IFwiQ0xJRU5UXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWxGaWVsZERlZmluZS5maWVsZFJvdyA9IGk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjZWxsT2JqLnYgPT09IFwiVFlQRVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsRmllbGREZWZpbmUudHlwZVJvdyA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0YWJsZURlZmluZS5zdGFydFJvdyAmJiB2ZXJ0aWNhbEZpZWxkRGVmaW5lLmZpZWxkUm93ICYmIHZlcnRpY2FsRmllbGREZWZpbmUudHlwZVJvdykgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Q29sID0gXCJCXCI7XG4gICAgICAgIH0gZWxzZSBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuICAgICAgICAgICAgdGFibGVEZWZpbmUuaG9yaXpvbnRhbEZpZWxkRGVmaW5lID0ge30gYXMgYW55O1xuICAgICAgICAgICAgY29uc3QgaG9yaXpvbnRhbEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUuaG9yaXpvbnRhbEZpZWxkRGVmaW5lO1xuICAgICAgICAgICAgaG9yaXpvbnRhbEZpZWxkRGVmaW5lLnRleHRDb2wgPSBcIkFcIjtcbiAgICAgICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZS50eXBlQ29sID0gXCJCXCI7XG4gICAgICAgICAgICBob3Jpem9udGFsRmllbGREZWZpbmUuZmllbGRDb2wgPSBcIkNcIjtcbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Q29sID0gXCJFXCI7XG4gICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydFJvdyA9IDI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFibGVEZWZpbmUgYXMgYW55O1xuICAgIH1cbiAgICBwcml2YXRlIF9nZXRGaXJzdENlbGxWYWx1ZShmaXJzdENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCkge1xuICAgICAgICBpZiAoIWZpcnN0Q2VsbE9iaikgcmV0dXJuO1xuICAgICAgICBjb25zdCBjZWxsVmFsdWVzID0gKGZpcnN0Q2VsbE9iai52IGFzIHN0cmluZykuc3BsaXQoXCI6XCIpO1xuICAgICAgICBsZXQgdGFibGVOYW1lSW5TaGVldDogc3RyaW5nO1xuICAgICAgICBsZXQgdGFibGVUeXBlOiBzdHJpbmc7XG4gICAgICAgIGlmIChjZWxsVmFsdWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHRhYmxlTmFtZUluU2hlZXQgPSBjZWxsVmFsdWVzWzFdO1xuICAgICAgICAgICAgdGFibGVUeXBlID0gY2VsbFZhbHVlc1swXSA9PT0gXCJIXCIgPyBUYWJsZVR5cGUuaG9yaXpvbnRhbCA6IFRhYmxlVHlwZS52ZXJ0aWNhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhYmxlTmFtZUluU2hlZXQgPSBjZWxsVmFsdWVzWzBdO1xuICAgICAgICAgICAgdGFibGVUeXBlID0gVGFibGVUeXBlLnZlcnRpY2FsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHRhYmxlTmFtZUluU2hlZXQ6IHRhYmxlTmFtZUluU2hlZXQsIHRhYmxlVHlwZTogdGFibGVUeXBlIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWIpOaWreihqOagvOaYr+WQpuiDveino+aekFxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqL1xuICAgIGNoZWNrU2hlZXRDYW5QYXJzZSh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgc2hlZXROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgLy/lpoLmnpzov5nkuKrooajkuKrnrKzkuIDmoLzlgLzkuI3nrYnkuo7ooajlkI3vvIzliJnkuI3op6PmnpBcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtcIkFcIiArIDFdO1xuICAgICAgICBjb25zdCBmaXJzdENlbGxWYWx1ZSA9IHRoaXMuX2dldEZpcnN0Q2VsbFZhbHVlKGZpcnN0Q2VsbE9iaik7XG4gICAgICAgIGlmIChmaXJzdENlbGxPYmogJiYgdGFibGVEZWZpbmUpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdENlbGxWYWx1ZS50YWJsZU5hbWVJblNoZWV0ICE9PSB0YWJsZURlZmluZS50YWJsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDooajooYznu5PmnZ/liKTmlq1cbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmVcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gcm93XG4gICAgICovXG4gICAgaXNTaGVldFJvd0VuZCh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgcm93OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLy8gaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLnZlcnRpY2FsKSB7XG5cbiAgICAgICAgLy8gfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG5cbiAgICAgICAgLy8gfVxuICAgICAgICAvL+WIpOaWreS4iuS4gOihjOeahOagh+W/l+aYr+WQpuS4ukVORFxuICAgICAgICBpZiAocm93ID4gMSkge1xuICAgICAgICAgICAgcm93ID0gcm93IC0gMTtcbiAgICAgICAgICAgIGNvbnN0IGNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W1wiQVwiICsgcm93XTtcbiAgICAgICAgICAgIHJldHVybiBjZWxsT2JqICYmIGNlbGxPYmoudiA9PT0gXCJFTkRcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDooajliJfnu5PmnZ/liKTmlq1cbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmVcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICovXG4gICAgaXNTaGVldENvbEVuZCh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgLy/liKTmlq3ov5nkuIDliJfnrKzkuIDooYzmmK/lkKbkuLrnqbpcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyAxXTtcbiAgICAgICAgLy8gY29uc3QgdHlwZUNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHRhYmxlRmlsZS50YWJsZURlZmluZS50eXBlUm93XTtcbiAgICAgICAgcmV0dXJuIGlzRW1wdHlDZWxsKGZpcnN0Q2VsbE9iaik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOajgOafpeihjOaYr+WQpumcgOimgeino+aekFxuICAgICAqIEBwYXJhbSB0YWJsZURlZmluZVxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSByb3dJbmRleFxuICAgICAqL1xuICAgIGNoZWNrUm93TmVlZFBhcnNlKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W1wiQVwiICsgcm93SW5kZXhdO1xuICAgICAgICBpZiAoY2VsbE9iaiAmJiBjZWxsT2JqLnYgPT09IFwiTk9cIikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDljZXkuKrmoLzlrZBcbiAgICAgKiBAcGFyYW0gdGFibGVQYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKiBAcGFyYW0gcm93SW5kZXhcbiAgICAgKiBAcGFyYW0gaXNOZXdSb3dPckNvbCDmmK/lkKbkuLrmlrDnmoTkuIDooYzmiJbogIXkuIDliJdcbiAgICAgKi9cbiAgICBwYXJzZVZlcnRpY2FsQ2VsbChcbiAgICAgICAgdGFibGVQYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsXG4gICAgICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgICAgICBjb2xLZXk6IHN0cmluZyxcbiAgICAgICAgcm93SW5kZXg6IG51bWJlcixcbiAgICAgICAgaXNOZXdSb3dPckNvbDogYm9vbGVhblxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBmaWVsZEluZm8gPSB0aGlzLmdldFZlcnRpY2FsVGFibGVGaWVsZCh0YWJsZVBhcnNlUmVzdWx0LCBzaGVldCwgY29sS2V5LCByb3dJbmRleCk7XG4gICAgICAgIGlmICghZmllbGRJbmZvKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGNlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHJvd0luZGV4XTtcbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKGNlbGwpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0cmFuc1Jlc3VsdCA9IHRoaXMudHJhbnNWYWx1ZSh0YWJsZVBhcnNlUmVzdWx0LCBmaWVsZEluZm8sIGNlbGwudik7XG4gICAgICAgIGlmICh0cmFuc1Jlc3VsdC5lcnJvcikge1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhcbiAgICAgICAgICAgICAgICBg6KGo5qC8OiR7dGFibGVQYXJzZVJlc3VsdC5maWxlUGF0aH0s5YiG6KGoOiR7dGFibGVQYXJzZVJlc3VsdC5jdXJTaGVldE5hbWV9LOihjDoke3Jvd0luZGV4fSzliJfvvJoke2NvbEtleX3op6PmnpDlh7rplJlgLFxuICAgICAgICAgICAgICAgIFwiZXJyb3JcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIExvZ2dlci5sb2codHJhbnNSZXN1bHQuZXJyb3IsIFwiZXJyb3JcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJhbnNlZFZhbHVlID0gdHJhbnNSZXN1bHQudmFsdWU7XG4gICAgICAgIGxldCBtYWluS2V5RmllbGROYW1lOiBzdHJpbmcgPSB0YWJsZVBhcnNlUmVzdWx0Lm1haW5LZXlGaWVsZE5hbWU7XG4gICAgICAgIGlmICghbWFpbktleUZpZWxkTmFtZSkge1xuICAgICAgICAgICAgLy/nrKzkuIDkuKrlrZfmrrXlsLHmmK/kuLvplK5cbiAgICAgICAgICAgIG1haW5LZXlGaWVsZE5hbWUgPSBmaWVsZEluZm8uZmllbGROYW1lO1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5tYWluS2V5RmllbGROYW1lID0gZmllbGRJbmZvLmZpZWxkTmFtZTtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmogPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcm93T3JDb2xPYmo6IGFueSA9IHRhYmxlUGFyc2VSZXN1bHQuY3VyUm93T3JDb2xPYmo7XG4gICAgICAgIGlmIChpc05ld1Jvd09yQ29sKSB7XG4gICAgICAgICAgICAvL+aWsOeahOS4gOihjFxuICAgICAgICAgICAgcm93T3JDb2xPYmogPSB7fTtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQuY3VyUm93T3JDb2xPYmogPSB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqW3RyYW5zZWRWYWx1ZV0gPSByb3dPckNvbE9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWVsZEluZm8uaXNNdXRpQ29sT2JqKSB7XG4gICAgICAgICAgICBsZXQgc3ViT2JqID0gcm93T3JDb2xPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV07XG4gICAgICAgICAgICBpZiAoIXN1Yk9iaikge1xuICAgICAgICAgICAgICAgIHN1Yk9iaiA9IHt9O1xuICAgICAgICAgICAgICAgIHJvd09yQ29sT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdID0gc3ViT2JqO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3ViT2JqW2ZpZWxkSW5mby5zdWJGaWVsZE5hbWVdID0gdHJhbnNlZFZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcm93T3JDb2xPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSB0cmFuc2VkVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kej5p6Q5qiq5ZCR5Y2V5Liq5qC85a2QXG4gICAgICogQHBhcmFtIHRhYmxlUGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICogQHBhcmFtIHJvd0luZGV4XG4gICAgICogQHBhcmFtIGlzTmV3Um93T3JDb2wg5piv5ZCm5Li65paw55qE5LiA6KGM5oiW6ICF5LiA5YiXXG4gICAgICovXG4gICAgcGFyc2VIb3Jpem9udGFsQ2VsbChcbiAgICAgICAgdGFibGVQYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsXG4gICAgICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgICAgICBjb2xLZXk6IHN0cmluZyxcbiAgICAgICAgcm93SW5kZXg6IG51bWJlcixcbiAgICAgICAgaXNOZXdSb3dPckNvbDogYm9vbGVhblxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBmaWVsZEluZm8gPSB0aGlzLmdldEhvcml6b250YWxUYWJsZUZpZWxkKHRhYmxlUGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4KTtcbiAgICAgICAgaWYgKCFmaWVsZEluZm8pIHJldHVybjtcbiAgICAgICAgY29uc3QgY2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgcm93SW5kZXhdO1xuICAgICAgICBpZiAoaXNFbXB0eUNlbGwoY2VsbCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0cmFuc1Jlc3VsdCA9IHRoaXMudHJhbnNWYWx1ZSh0YWJsZVBhcnNlUmVzdWx0LCBmaWVsZEluZm8sIGNlbGwudik7XG4gICAgICAgIGlmICh0cmFuc1Jlc3VsdC5lcnJvcikge1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhcbiAgICAgICAgICAgICAgICBg6KGo5qC8OiR7dGFibGVQYXJzZVJlc3VsdC5maWxlUGF0aH0s5YiG6KGoOiR7dGFibGVQYXJzZVJlc3VsdC5jdXJTaGVldE5hbWV9LOihjDoke3Jvd0luZGV4fSzliJfvvJoke2NvbEtleX3op6PmnpDlh7rplJlgLFxuICAgICAgICAgICAgICAgIFwiZXJyb3JcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIExvZ2dlci5sb2codHJhbnNSZXN1bHQuZXJyb3IsIFwiZXJyb3JcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJhbnNlZFZhbHVlID0gdHJhbnNSZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICghdGFibGVQYXJzZVJlc3VsdC50YWJsZU9iaikge1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9iaiA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWVsZEluZm8uaXNNdXRpQ29sT2JqKSB7XG4gICAgICAgICAgICBsZXQgc3ViT2JqID0gdGFibGVQYXJzZVJlc3VsdC50YWJsZU9ialtmaWVsZEluZm8uZmllbGROYW1lXTtcbiAgICAgICAgICAgIGlmICghc3ViT2JqKSB7XG4gICAgICAgICAgICAgICAgc3ViT2JqID0ge307XG4gICAgICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9ialtmaWVsZEluZm8uZmllbGROYW1lXSA9IHN1Yk9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1Yk9ialtmaWVsZEluZm8uc3ViRmllbGROYW1lXSA9IHRyYW5zZWRWYWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSB0cmFuc2VkVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kej5p6Q5Ye65a2X5q615a+56LGhXG4gICAgICogQHBhcmFtIHRhYmxlUGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICogQHBhcmFtIHJvd0luZGV4XG4gICAgICovXG4gICAgZ2V0VmVydGljYWxUYWJsZUZpZWxkKFxuICAgICAgICB0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgICAgIGNvbEtleTogc3RyaW5nLFxuICAgICAgICByb3dJbmRleDogbnVtYmVyXG4gICAgKTogSVRhYmxlRmllbGQge1xuICAgICAgICBjb25zdCB0YWJsZURlZmluZSA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVEZWZpbmU7XG4gICAgICAgIGxldCB0YWJsZUZpbGVkTWFwID0gdGFibGVQYXJzZVJlc3VsdC5maWxlZE1hcDtcbiAgICAgICAgaWYgKCF0YWJsZUZpbGVkTWFwKSB7XG4gICAgICAgICAgICB0YWJsZUZpbGVkTWFwID0ge307XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LmZpbGVkTWFwID0gdGFibGVGaWxlZE1hcDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2ZXJ0aWNhbEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUudmVydGljYWxGaWVsZERlZmluZTtcbiAgICAgICAgY29uc3QgZmlsZWRDZWxsID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS5maWVsZFJvd107XG4gICAgICAgIGxldCBvcmlnaW5GaWVsZE5hbWU6IHN0cmluZztcbiAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChmaWxlZENlbGwpKSB7XG4gICAgICAgICAgICBvcmlnaW5GaWVsZE5hbWUgPSBmaWxlZENlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvcmlnaW5GaWVsZE5hbWUpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgZmllbGQ6IElUYWJsZUZpZWxkID0ge30gYXMgYW55O1xuICAgICAgICAvL+e8k+WtmFxuICAgICAgICBpZiAodGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgLy/ms6jph4pcbiAgICAgICAgY29uc3QgdGV4dENlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUudGV4dFJvd107XG4gICAgICAgIGlmICghaXNFbXB0eUNlbGwodGV4dENlbGwpKSB7XG4gICAgICAgICAgICBmaWVsZC50ZXh0ID0gdGV4dENlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgLy/nsbvlnotcbiAgICAgICAgbGV0IGlzT2JqVHlwZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBjb25zdCB0eXBlQ2VsbCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUudHlwZVJvd107XG5cbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKHR5cGVDZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZC5vcmlnaW5UeXBlID0gdHlwZUNlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgICAgICBpZiAoZmllbGQub3JpZ2luVHlwZS5pbmNsdWRlcyhcIm1mOlwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVTdHJzID0gZmllbGQub3JpZ2luVHlwZS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVTdHJzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpZWxkLnR5cGUgPSB0eXBlU3Ryc1syXTtcbiAgICAgICAgICAgICAgICBpc09ialR5cGUgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gZmllbGQub3JpZ2luVHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWVsZC5pc011dGlDb2xPYmogPSBpc09ialR5cGU7XG4gICAgICAgIC8v5a2X5q615ZCNXG4gICAgICAgIGZpZWxkLm9yaWdpbkZpZWxkTmFtZSA9IG9yaWdpbkZpZWxkTmFtZTtcbiAgICAgICAgaWYgKGlzT2JqVHlwZSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTdHJzID0gZmllbGQub3JpZ2luRmllbGROYW1lLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgIGlmIChmaWVsZFN0cnMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmllbGQuZmllbGROYW1lID0gZmllbGRTdHJzWzBdO1xuICAgICAgICAgICAgZmllbGQuc3ViRmllbGROYW1lID0gZmllbGRTdHJzWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmllbGQuZmllbGROYW1lID0gZmllbGQub3JpZ2luRmllbGROYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFibGVGaWxlZE1hcFtjb2xLZXldID0gZmllbGQ7XG4gICAgICAgIHJldHVybiBmaWVsZDtcbiAgICB9XG4gICAgZ2V0SG9yaXpvbnRhbFRhYmxlRmllbGQoXG4gICAgICAgIHRhYmxlUGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICAgICAgY29sS2V5OiBzdHJpbmcsXG4gICAgICAgIHJvd0luZGV4OiBudW1iZXJcbiAgICApOiBJVGFibGVGaWVsZCB7XG4gICAgICAgIGNvbnN0IHRhYmxlRGVmaW5lID0gdGFibGVQYXJzZVJlc3VsdC50YWJsZURlZmluZTtcbiAgICAgICAgbGV0IHRhYmxlRmlsZWRNYXAgPSB0YWJsZVBhcnNlUmVzdWx0LmZpbGVkTWFwO1xuICAgICAgICBpZiAoIXRhYmxlRmlsZWRNYXApIHtcbiAgICAgICAgICAgIHRhYmxlRmlsZWRNYXAgPSB7fTtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQuZmlsZWRNYXAgPSB0YWJsZUZpbGVkTWFwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLmhvcml6b250YWxGaWVsZERlZmluZTtcbiAgICAgICAgY29uc3QgZmllbGROYW1lQ2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbaEZpZWxkRGVmaW5lLmZpZWxkQ29sICsgcm93SW5kZXhdO1xuICAgICAgICBsZXQgb3JpZ2luRmllbGROYW1lOiBzdHJpbmc7XG4gICAgICAgIGlmICghaXNFbXB0eUNlbGwoZmllbGROYW1lQ2VsbCkpIHtcbiAgICAgICAgICAgIG9yaWdpbkZpZWxkTmFtZSA9IGZpZWxkTmFtZUNlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvcmlnaW5GaWVsZE5hbWUpIHJldHVybiBudWxsO1xuICAgICAgICBpZiAodGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpZWxkOiBJVGFibGVGaWVsZCA9IHt9IGFzIGFueTtcblxuICAgICAgICBjb25zdCB0ZXh0Q2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbaEZpZWxkRGVmaW5lLnRleHRDb2wgKyByb3dJbmRleF07XG4gICAgICAgIC8v5rOo6YeKXG4gICAgICAgIGlmICghaXNFbXB0eUNlbGwodGV4dENlbGwpKSB7XG4gICAgICAgICAgICBmaWVsZC50ZXh0ID0gdGV4dENlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGlzT2JqVHlwZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAvL+exu+Wei1xuICAgICAgICBjb25zdCB0eXBlQ2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbaEZpZWxkRGVmaW5lLnR5cGVDb2wgKyByb3dJbmRleF07XG5cbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKHR5cGVDZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL+WkhOeQhuexu+Wei1xuICAgICAgICAgICAgZmllbGQub3JpZ2luVHlwZSA9IHR5cGVDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICAgICAgaWYgKGZpZWxkLm9yaWdpblR5cGUuaW5jbHVkZXMoXCJtZjpcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlU3RycyA9IGZpZWxkLm9yaWdpblR5cGUuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlU3Rycy5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gdHlwZVN0cnNbMl07XG4gICAgICAgICAgICAgICAgaXNPYmpUeXBlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmllbGQudHlwZSA9IGZpZWxkLm9yaWdpblR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmllbGQuaXNNdXRpQ29sT2JqID0gaXNPYmpUeXBlO1xuICAgICAgICBmaWVsZC5vcmlnaW5GaWVsZE5hbWUgPSBvcmlnaW5GaWVsZE5hbWU7XG4gICAgICAgIGlmIChpc09ialR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkU3RycyA9IGZpZWxkLm9yaWdpbkZpZWxkTmFtZS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICBpZiAoZmllbGRTdHJzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkU3Ryc1swXTtcbiAgICAgICAgICAgIGZpZWxkLnN1YkZpZWxkTmFtZSA9IGZpZWxkU3Ryc1sxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkLm9yaWdpbkZpZWxkTmFtZTtcbiAgICAgICAgfVxuICAgICAgICB0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV0gPSBmaWVsZDtcbiAgICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmo4Dmn6XliJfmmK/lkKbpnIDopoHop6PmnpBcbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmVcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICovXG4gICAgY2hlY2tDb2xOZWVkUGFyc2UodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIOWmguaenOexu+Wei+aIluiAheWImeS4jemcgOimgeino+aekFxuICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcbiAgICAgICAgICAgIGNvbnN0IHZlcnRpY2FsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS52ZXJ0aWNhbEZpZWxkRGVmaW5lO1xuICAgICAgICAgICAgY29uc3QgdHlwZUNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUudHlwZVJvd107XG4gICAgICAgICAgICBjb25zdCBmaWVsZENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3ddO1xuICAgICAgICAgICAgaWYgKGlzRW1wdHlDZWxsKHR5cGVDZWxsT2JqKSB8fCBpc0VtcHR5Q2VsbChmaWVsZENlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICBjb25zdCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyAxXTtcbiAgICAgICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsT2JqKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6L2s5o2i6KGo5qC855qE5YC8XG4gICAgICogQHBhcmFtIHBhcnNlUmVzdWx0XG4gICAgICogQHBhcmFtIGZpbGVkSXRlbVxuICAgICAqIEBwYXJhbSBjZWxsVmFsdWVcbiAgICAgKi9cbiAgICBwdWJsaWMgdHJhbnNWYWx1ZShwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsIGZpbGVkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogYW55KTogSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgICAgICBsZXQgdHJhbnNSZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0O1xuXG4gICAgICAgIGxldCB0cmFuc0Z1bmMgPSB0aGlzLl92YWx1ZVRyYW5zRnVuY01hcFtmaWxlZEl0ZW0udHlwZV07XG4gICAgICAgIGlmICghdHJhbnNGdW5jKSB7XG4gICAgICAgICAgICB0cmFuc0Z1bmMgPSB0aGlzLl92YWx1ZVRyYW5zRnVuY01hcFtcImpzb25cIl07XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNSZXN1bHQgPSB0cmFuc0Z1bmMoZmlsZWRJdGVtLCBjZWxsVmFsdWUpO1xuICAgICAgICByZXR1cm4gdHJhbnNSZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6Kej5p6Q6YWN572u6KGo5paH5Lu2XG4gICAgICogQHBhcmFtIHBhcnNlQ29uZmlnIOino+aekOmFjee9rlxuICAgICAqIEBwYXJhbSBmaWxlSW5mbyDmlofku7bkv6Hmga9cbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHQg6Kej5p6Q57uT5p6cXG4gICAgICovXG4gICAgcHVibGljIHBhcnNlVGFibGVGaWxlKFxuICAgICAgICBwYXJzZUNvbmZpZzogSVRhYmxlQ29udmVydENvbmZpZyxcbiAgICAgICAgZmlsZUluZm86IElGaWxlSW5mbyxcbiAgICAgICAgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0XG4gICAgKTogSVRhYmxlUGFyc2VSZXN1bHQge1xuICAgICAgICBjb25zdCB3b3JrYm9vayA9IHJlYWRUYWJsZUZpbGUoZmlsZUluZm8pO1xuICAgICAgICBpZiAoIXdvcmtib29rLlNoZWV0TmFtZXMubGVuZ3RoKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc2hlZXROYW1lcyA9IHdvcmtib29rLlNoZWV0TmFtZXM7XG4gICAgICAgIGNvbnN0IHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUgPSB0aGlzLmdldFRhYmxlRGVmaW5lKGZpbGVJbmZvLCB3b3JrYm9vayk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hlZXROYW1lcy5sZW5ndGg7IGkrKykge31cbiAgICAgICAgaWYgKCF0YWJsZURlZmluZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBzaGVldE5hbWU6IHN0cmluZztcbiAgICAgICAgbGV0IHNoZWV0OiB4bHN4LlNoZWV0O1xuICAgICAgICBjb25zdCBpc1NoZWV0Um93RW5kID0gdGhpcy5pc1NoZWV0Um93RW5kLmJpbmQobnVsbCwgdGFibGVEZWZpbmUpO1xuICAgICAgICBjb25zdCBpc1NoZWV0Q29sRW5kID0gdGhpcy5pc1NoZWV0Q29sRW5kLmJpbmQobnVsbCwgdGFibGVEZWZpbmUpO1xuICAgICAgICBjb25zdCBpc1NraXBTaGVldFJvdyA9IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICF0aGlzLmNoZWNrUm93TmVlZFBhcnNlKHRhYmxlRGVmaW5lLCBzaGVldCwgcm93SW5kZXgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBpc1NraXBTaGVldENvbCA9IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5jaGVja0NvbE5lZWRQYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIGNvbEtleSk7XG4gICAgICAgIH07XG4gICAgICAgIGxldCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3Q7XG4gICAgICAgIHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lID0gdGFibGVEZWZpbmU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hlZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2hlZXROYW1lID0gc2hlZXROYW1lc1tpXTtcbiAgICAgICAgICAgIHNoZWV0ID0gd29ya2Jvb2suU2hlZXRzW3NoZWV0TmFtZV07XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2hlY2tTaGVldENhblBhcnNlKHRhYmxlRGVmaW5lLCBzaGVldCwgc2hlZXROYW1lKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyc2VSZXN1bHQuY3VyU2hlZXROYW1lID0gc2hlZXROYW1lO1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhg6Kej5p6QOiR7ZmlsZUluZm8uZmlsZVBhdGh9PT4gc2hlZXQ6JHtzaGVldE5hbWV9IC4uLi5gKTtcbiAgICAgICAgICAgIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xuICAgICAgICAgICAgICAgIGxldCBsYXN0Um93SW5kZXg6IG51bWJlcjtcblxuICAgICAgICAgICAgICAgIHZlcnRpY2FsRm9yRWFjaFNoZWV0KFxuICAgICAgICAgICAgICAgICAgICBzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3csXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Q29sLFxuICAgICAgICAgICAgICAgICAgICAoc2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNOZXdSb3dPckNvbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RSb3dJbmRleCAhPT0gcm93SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Um93SW5kZXggPSByb3dJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05ld1Jvd09yQ29sID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxPYmogPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGNlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJzZVZlcnRpY2FsQ2VsbChwYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgsIGlzTmV3Um93T3JDb2wpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBpc1NoZWV0Um93RW5kLFxuICAgICAgICAgICAgICAgICAgICBpc1NoZWV0Q29sRW5kLFxuICAgICAgICAgICAgICAgICAgICBpc1NraXBTaGVldFJvdyxcbiAgICAgICAgICAgICAgICAgICAgaXNTa2lwU2hlZXRDb2xcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGxhc3RDb2xLZXk6IHN0cmluZztcblxuICAgICAgICAgICAgICAgIGhvcml6b250YWxGb3JFYWNoU2hlZXQoXG4gICAgICAgICAgICAgICAgICAgIHNoZWV0LFxuICAgICAgICAgICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydFJvdyxcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRDb2wsXG4gICAgICAgICAgICAgICAgICAgIChzaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc05ld1Jvd09yQ29sID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFzdENvbEtleSAhPT0gY29sS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbEtleSA9IGNvbEtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05ld1Jvd09yQ29sID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY2VsbE9iaiA9IHNoZWV0W2NvbEtleSArIHJvd0luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNFbXB0eUNlbGwoY2VsbE9iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnNlSG9yaXpvbnRhbENlbGwocGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4LCBpc05ld1Jvd09yQ29sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldFJvd0VuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldENvbEVuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTa2lwU2hlZXRSb3csXG4gICAgICAgICAgICAgICAgICAgIGlzU2tpcFNoZWV0Q29sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZVJlc3VsdCBhcyBhbnk7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbIm9zLnBsYXRmb3JtIiwiVGFibGVUeXBlIiwicGF0aC5qb2luIiwiQmFzZTY0IiwiZGVmbGF0ZVN5bmMiLCJmcy5zdGF0U3luYyIsImZzLnJlYWRkaXJTeW5jIiwiZnMuZXhpc3RzU3luYyIsImZzLnVubGlua1N5bmMiLCJmcy5lbnN1cmVGaWxlU3luYyIsImZzLndyaXRlRmlsZSIsImZzLndyaXRlRmlsZVN5bmMiLCJmcy5yZWFkRmlsZVN5bmMiLCJjcnlwdG8uY3JlYXRlSGFzaCIsInBhdGgucGFyc2UiLCJtbWF0Y2guYWxsIiwicGF0aC5pc0Fic29sdXRlIiwiV29ya2VyIiwicGF0aC5kaXJuYW1lIiwieGxzeC5yZWFkRmlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFDQSxNQUFNLFFBQVEsR0FBR0EsV0FBVyxFQUFFLENBQUM7QUFDL0I7QUFDTyxNQUFNLEtBQUssR0FBRyxRQUFRLEtBQUssT0FBTyxHQUFHLElBQUksR0FBRyxNQUFNOztBQ2lDekQ7QUFDQSxNQUFNLFVBQVUsR0FBRyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQztNQUNsRix1QkFBdUI7SUFDaEMsV0FBVyxDQUNQLFdBQWdDLEVBQ2hDLGdCQUE2QixFQUM3QixlQUE0QixFQUM1QixjQUFtQztRQUVuQyxJQUFJLFlBQVksR0FBa0IsV0FBVyxDQUFDLFlBQVksQ0FBQztRQUMzRCxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FB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
