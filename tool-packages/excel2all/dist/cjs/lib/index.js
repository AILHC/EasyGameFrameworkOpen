'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var os = require('os');
var path = require('path');
var jsBase64 = require('js-base64');
var zlib = require('zlib');
var fs = require('fs-extra');
var crypto = require('crypto');
var mmatch = require('micromatch');
var wt = require('worker_threads');
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
let enterChar = "\n";
if (platform === "win32") {
    enterChar = "\r\n";
}
/**类型字符串映射字典 */
const typeStrMap = { "int": "number", "json": "any", "[int]": "number[]", "[string]": "string[]" };
class Trans2JsonAndDtsHandler {
    constructor() {
    }
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
                tableTypeMapDtsStr += "\treadonly " + tableName + "?: " + `IT_${tableName};` + enterChar;
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
            let itBaseStr = "interface ITBase<T> { [key:string]:T}" + enterChar;
            tableTypeMapDtsStr = itBaseStr + "interface IT_TableMap {" + enterChar + tableTypeMapDtsStr + "}" + enterChar;
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
        let itemInterface = "interface IT_" + tableName + " {" + enterChar;
        let tableField;
        let objTypeStrMap = {};
        for (let colKey in colKeyTableFieldMap) {
            tableField = colKeyTableFieldMap[colKey];
            if (!tableField)
                continue;
            if (!tableField.isMutiColObj) {
                //注释行
                itemInterface += "\t/** " + tableField.text + " */" + enterChar;
                //字段类型声明行
                itemInterface += "\treadonly " + tableField.fieldName + "?: " + (typeStrMap[tableField.type] ? typeStrMap[tableField.type] : tableField.type) + ";" + enterChar;
            }
            else {
                const objFieldKey = tableField.fieldName;
                if (!objTypeStrMap[objFieldKey]) {
                    objTypeStrMap[objFieldKey] = "";
                }
                //注释行
                objTypeStrMap[objFieldKey] += "\t\t/** " + tableField.text + " */" + enterChar;
                //字段类型声明行
                objTypeStrMap[objFieldKey] += "\t\treadonly " + tableField.subFieldName + "?: " + (typeStrMap[tableField.subType] ? typeStrMap[tableField.subType] : tableField.subType) + ";" + enterChar;
            }
        }
        //第二层对象
        for (let objFieldKey in objTypeStrMap) {
            //字段类型声明行
            itemInterface += "\treadonly " + objFieldKey + "?: {" + enterChar + objTypeStrMap[objFieldKey];
            itemInterface += "\t}" + enterChar;
        }
        itemInterface += "}" + enterChar;
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
        return "\treadonly " + tableName + "?: " + "ITBase<" + "IT_" + tableName + ">;" + enterChar;
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
            // console.error(error);
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
            console.error(error);
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
            console.error(err);
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

var doParse$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    doParse: doParse
});

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
                console.error(err);
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
                fs.writeFile(fileInfo.filePath, fileInfo.data, (fileInfo.encoding ? { encoding: fileInfo.encoding } : undefined), onWriteEnd);
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
        console.error(`cacheFilePath is null`);
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
        console.error(`cacheFilePath is null`);
        return;
    }
    if (!fs.existsSync(cacheFilePath)) {
        fs.ensureFileSync(cacheFilePath);
        fs.writeFileSync(cacheFilePath, '{}', { encoding: "utf-8" });
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
    var md5um = crypto.createHash('md5');
    md5um.update(file);
    return md5um.digest('hex');
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
            const count = Math.floor(fileInfos.length / parseConfig.threadParseFileMaxNum) + 1;
            let worker;
            let subFileInfos;
            let completeCount = 0;
            const t1 = new Date().getTime();
            const onWorkerParseEnd = (data) => {
                console.log(`线程结束:${data.threadId}`);
                parseResultMap = Object.assign(parseResultMap, data.parseResultMap);
                completeCount++;
                if (completeCount >= count) {
                    writeFiles(parseConfig, parseResultMapCacheFilePath, trans2FileHandler, fileInfos, deleteFileInfos, parseResultMap);
                    const t2 = new Date().getTime();
                    console.log(`[多线程导表时间]:${t2 - t1}`);
                }
            };
            for (let i = 0; i < count; i++) {
                subFileInfos = fileInfos.splice(0, parseConfig.threadParseFileMaxNum);
                worker = new wt.Worker(path.join(path.dirname(__filename), "./worker.js"), { workerData: { threadId: i, fileInfos: subFileInfos, parseResultMap: parseResultMap } });
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
            writeFiles(parseConfig, parseResultMapCacheFilePath, trans2FileHandler, fileInfos, deleteFileInfos, parseResultMap);
            const t2 = new Date().getTime();
            console.log(`[单线程导表时间]:${t2 - t1}`);
        }
    });
}
function writeFiles(parseConfig, parseResultMapCacheFilePath, trans2FileHandler, fileInfos, deleteFileInfos, parseResultMap) {
    //写入解析缓存
    if (parseConfig.useCache) {
        writeCacheData(parseResultMapCacheFilePath, parseResultMap);
    }
    //解析结束，做导出处理
    let outputFileMap = trans2FileHandler.trans2Files(fileInfos, deleteFileInfos, parseResultMap);
    const outputFiles = Object.values(outputFileMap);
    //写入和删除文件处理
    console.log(`开始写入文件:0/${outputFiles.length}`);
    writeOrDeleteOutPutFiles(outputFiles, (filePath, total, now, isOk) => {
        console.log(`[写入文件] 进度:(${now}/${total}) 路径:${filePath}`);
    }, () => {
        console.log(`写入结束~`);
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
    const sheetRef = sheet['!ref'];
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
    const sheetRef = sheet['!ref'];
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

(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const workerData = wt.workerData;
        const fileInfos = workerData.fileInfos;
        const parseResultMap = workerData.parseResultMap;
        const parseConfig = workerData.parseConfig;
        let parseHandler;
        if (parseConfig.customParseHandlerPath) {
            if (!path.isAbsolute(parseConfig.customParseHandlerPath)) {
                parseConfig.customParseHandlerPath = path.resolve(__dirname, parseConfig.customParseHandlerPath);
            }
            parseHandler = (yield Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(parseConfig.customParseHandlerPath)); }));
        }
        if (parseHandler) {
            parseHandler = new DefaultParseHandler();
        }
        const doParse = (yield Promise.resolve().then(function () { return doParse$1; })).doParse;
        doParse(fileInfos, parseResultMap, parseHandler);
        wt.parentPort.postMessage({ threadId: workerData.threadId, parseResultMap: parseResultMap });
    });
})();

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
            console.error(`表格不规范,跳过解析,路径:${fileInfo.filePath}`);
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
            console.error(`表格:${tableParseResult.filePath},分表:${tableParseResult.curSheetName},行:${rowIndex},列：${colKey}解析出错`);
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
        const transedValue = this.transValue(tableParseResult, fieldInfo, cell.v);
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
        for (let i = 0; i < sheetNames.length; i++) {
        }
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
            console.log(`解析:${fileInfo.filePath}=> sheet:${sheetName} ....`);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXRyYW5zMmZpbGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXZhbHVlLWZ1bmMtbWFwLnRzIiwiLi4vLi4vLi4vc3JjL2RvLXBhcnNlLnRzIiwiLi4vLi4vLi4vc3JjL2ZpbGUtdXRpbHMudHMiLCIuLi8uLi8uLi9zcmMvZ2VuZXJhdGUudHMiLCIuLi8uLi8uLi9zcmMvdGFibGUtdXRpbHMudHMiLCIuLi8uLi8uLi9zcmMvd29ya2VyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtcGFyc2UtaGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBvcyBmcm9tIFwib3NcIlxyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7VGFibGVUeXBlfSBmcm9tIFwiLi9kZWZhdWx0LXBhcnNlLWhhbmRsZXJcIjtcclxuaW1wb3J0IHtCYXNlNjR9IGZyb20gJ2pzLWJhc2U2NCc7XHJcbmNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKVxyXG5sZXQgZW50ZXJDaGFyID0gXCJcXG5cIjtcclxuaWYgKHBsYXRmb3JtID09PSBcIndpbjMyXCIpIHtcclxuICAgIGVudGVyQ2hhciA9IFwiXFxyXFxuXCI7XHJcbn1cclxuaW1wb3J0IHtkZWZsYXRlU3luY30gZnJvbSBcInpsaWJcIjtcclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiDovpPlh7rphY3nva5cclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElPdXRwdXRDb25maWcge1xyXG4gICAgICAgIC8qKumFjee9ruihqOi+k+WHuuebruW9lei3r+W+hO+8jOm7mOiupOi+k+WHuuWIsOW9k+WJjeaJp+ihjOebruW9leS4i+eahC4vZXhjZWxKc29uT3V0ICovXHJcbiAgICAgICAgY2xpZW50U2luZ2xlVGFibGVKc29uRGlyOiBzdHJpbmcsXHJcbiAgICAgICAgLyoq5omA5pyJ6YWN572u6KGo5omT5YyF6L6T5Ye655uu5b2V77yM5aaC5p6c5LiN6YWN572u5YiZ5LiN5ZCI5bm2anNvbiAqL1xyXG4gICAgICAgIGNsaWVudEJ1bmRsZUpzb25PdXRQYXRoPzogc3RyaW5nLFxyXG4gICAgICAgIC8qKuaYr+WQpuagvOW8j+WMluWQiOW5tuWQjueahGpzb27vvIzpu5jorqTkuI0gKi9cclxuICAgICAgICBpc0Zvcm1hdEJ1bmRsZUpzb24/OiBib29sZWFuXHJcbiAgICAgICAgLyoq5piv5ZCm55Sf5oiQ5aOw5piO5paH5Lu277yM6buY6K6k5LiN6L6T5Ye6ICovXHJcbiAgICAgICAgaXNHZW5EdHM/OiBib29sZWFuXHJcbiAgICAgICAgLyoq5aOw5piO5paH5Lu26L6T5Ye655uu5b2VICovXHJcbiAgICAgICAgY2xpZW50RHRzT3V0RGlyPzogc3RyaW5nLFxyXG4gICAgICAgIC8qKuaYr+WQpuWQiOW5tuaJgOacieWjsOaYjuS4uuS4gOS4quaWh+S7tizpu5jorqR0cnVlICovXHJcbiAgICAgICAgaXNCdW5kbGVEdHM/OiBib29sZWFuLFxyXG4gICAgICAgIC8qKuaYr+WQpuWwhmpzb27moLzlvI/ljovnvKks6buY6K6k5ZCmLOWHj+WwkWpzb27lrZfmrrXlkI3lrZfnrKYs5pWI5p6c6L6D5bCPICovXHJcbiAgICAgICAgaXNDb21wcmVzcz86IGJvb2xlYW5cclxuICAgICAgICAvKirmmK/lkKZaaXDljovnvKks5L2/55SoemxpYiAqL1xyXG4gICAgICAgIGlzWmlwPzogYm9vbGVhbixcclxuICAgICAgICAvKirmmK/lkKblsIbovpPlh7rnmoTlkIjlubZqc29u6L2s5Li6YmFzZTY077yM6buY6K6k5ZCmKi9cclxuICAgICAgICBidW5kbGVKc29uSXNFbmNvZGUyQmFzZTY0PzogYm9vbGVhblxyXG4gICAgICAgIC8qKuWKoOWvhua3t+a3huWtl+espuS4suWJjee8gCAqL1xyXG4gICAgICAgIHByZUJhc2U2NFVnbHlTdHJpbmc/OiBzdHJpbmdcclxuICAgICAgICAvKirliqDlr4bmt7fmt4blrZfnrKbkuLLlkI7nvIAgKi9cclxuICAgICAgICBzdWZCYXNlNjRVZ2x5U3RyaW5nPzogc3RyaW5nXHJcbiAgICB9XHJcbn1cclxuLyoq57G75Z6L5a2X56ym5Liy5pig5bCE5a2X5YW4ICovXHJcbmNvbnN0IHR5cGVTdHJNYXAgPSB7XCJpbnRcIjogXCJudW1iZXJcIiwgXCJqc29uXCI6IFwiYW55XCIsIFwiW2ludF1cIjogXCJudW1iZXJbXVwiLCBcIltzdHJpbmddXCI6IFwic3RyaW5nW11cIn1cclxuZXhwb3J0IGNsYXNzIFRyYW5zMkpzb25BbmREdHNIYW5kbGVyIGltcGxlbWVudHMgSVRyYW5zUmVzdWx0MkFueUZpbGVIYW5kbGVyIHtcclxuICAgIHByaXZhdGUgX291dHB1dENvbmZpZzogSU91dHB1dENvbmZpZ1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgfVxyXG4gICAgaW5pdChvcHRpb24/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIW9wdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLl9vdXRwdXRDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICBjbGllbnRTaW5nbGVUYWJsZUpzb25EaXI6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBcIi4vZXhjZWxKc29uT3V0XCIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0Q29uZmlnID0gb3B0aW9uO1xyXG4gICAgfVxyXG4gICAgdHJhbnMyRmlsZXMoY2hhbmdlZEZpbGVJbmZvczogSUZpbGVJbmZvW10sIGRlbGV0ZUZpbGVJbmZvczogSUZpbGVJbmZvW10sIHBhcnNlUmVzdWx0TWFwOiBUYWJsZVBhcnNlUmVzdWx0TWFwKTogT3V0UHV0RmlsZU1hcCB7XHJcbiAgICAgICAgbGV0IHRhYmxlT2JqTWFwOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xyXG4gICAgICAgIGxldCBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwID0ge307XHJcbiAgICAgICAgY29uc3Qgb3V0cHV0Q29uZmlnID0gdGhpcy5fb3V0cHV0Q29uZmlnO1xyXG4gICAgICAgIGxldCB0YWJsZVR5cGVNYXBEdHNTdHIgPSBcIlwiO1xyXG4gICAgICAgIGxldCB0YWJsZVR5cGVEdHNTdHJzID0gXCJcIjtcclxuICAgICAgICBsZXQgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0O1xyXG4gICAgICAgIGxldCB0YWJsZU5hbWU6IHN0cmluZztcclxuICAgICAgICBsZXQgdGFibGVPYmo6IGFueTtcclxuICAgICAgICBsZXQgb2JqVHlwZVRhYmxlTWFwOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0gPSB7fTtcclxuICAgICAgICBmb3IgKGxldCBmaWxlUGF0aCBpbiBwYXJzZVJlc3VsdE1hcCkge1xyXG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXTtcclxuICAgICAgICAgICAgaWYgKCFwYXJzZVJlc3VsdC50YWJsZURlZmluZSkgY29udGludWU7XHJcbiAgICAgICAgICAgIHRhYmxlTmFtZSA9IHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlTmFtZTtcclxuICAgICAgICAgICAgaWYgKHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcclxuICAgICAgICAgICAgICAgIHRhYmxlVHlwZU1hcER0c1N0ciArPSBcIlxcdHJlYWRvbmx5IFwiICsgdGFibGVOYW1lICsgXCI/OiBcIiArIGBJVF8ke3RhYmxlTmFtZX07YCArIGVudGVyQ2hhcjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRhYmxlVHlwZU1hcER0c1N0ciArPSB0aGlzLl9nZXRPbmVUYWJsZVR5cGVTdHIodGFibGVOYW1lKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAvL+WQiOW5tuWkmuS4quWQjOWQjeihqFxyXG4gICAgICAgICAgICB0YWJsZU9iaiA9IHRhYmxlT2JqTWFwW3RhYmxlTmFtZV07XHJcbiAgICAgICAgICAgIGlmICh0YWJsZU9iaikge1xyXG4gICAgICAgICAgICAgICAgdGFibGVPYmogPSBPYmplY3QuYXNzaWduKHRhYmxlT2JqLCBwYXJzZVJlc3VsdC50YWJsZU9iaik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0YWJsZU9iaiA9IHBhcnNlUmVzdWx0LnRhYmxlT2JqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSB0YWJsZU9iajtcclxuICAgICAgICAgICAgb2JqVHlwZVRhYmxlTWFwW3RhYmxlTmFtZV0gPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsO1xyXG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzR2VuRHRzKSB7XHJcbiAgICAgICAgICAgICAgICAvL+i+k+WHuuWNleS4quaWh+S7tlxyXG4gICAgICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0J1bmRsZUR0cyA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dENvbmZpZy5pc0J1bmRsZUR0cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW91dHB1dENvbmZpZy5pc0J1bmRsZUR0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFNpbmdsZVRhYmxlRHRzT3V0cHV0RmlsZShvdXRwdXRDb25maWcsIHBhcnNlUmVzdWx0LCBvdXRwdXRGaWxlTWFwKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFibGVUeXBlRHRzU3RycyArPSB0aGlzLl9nZXRTaW5nbGVUYWJsZUR0cyhwYXJzZVJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAvL+eUn+aIkOWNleS4quihqGpzb25cclxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5jbGllbnRTaW5nbGVUYWJsZUpzb25EaXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFNpbmdsZVRhYmxlSnNvbk91dHB1dEZpbGUob3V0cHV0Q29uZmlnLCBwYXJzZVJlc3VsdCwgb3V0cHV0RmlsZU1hcCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzR2VuRHRzKSB7XHJcbiAgICAgICAgICAgIC8v6L6T5Ye65aOw5piO5paH5Lu2XHJcbiAgICAgICAgICAgIGxldCBpdEJhc2VTdHIgPSBcImludGVyZmFjZSBJVEJhc2U8VD4geyBba2V5OnN0cmluZ106VH1cIiArIGVudGVyQ2hhcjtcclxuXHJcbiAgICAgICAgICAgIHRhYmxlVHlwZU1hcER0c1N0ciA9IGl0QmFzZVN0ciArIFwiaW50ZXJmYWNlIElUX1RhYmxlTWFwIHtcIiArIGVudGVyQ2hhciArIHRhYmxlVHlwZU1hcER0c1N0ciArIFwifVwiICsgZW50ZXJDaGFyO1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0J1bmRsZUR0cykge1xyXG4gICAgICAgICAgICAgICAgLy/lkIjmiJDkuIDkuKrmlofku7ZcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZUR0c0ZpbGVQYXRoID0gcGF0aC5qb2luKG91dHB1dENvbmZpZy5jbGllbnREdHNPdXREaXIsIFwidGFibGVNYXAuZC50c1wiKTtcclxuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbYnVuZGxlRHRzRmlsZVBhdGhdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBidW5kbGVEdHNGaWxlUGF0aCxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YWJsZVR5cGVNYXBEdHNTdHIgKyB0YWJsZVR5cGVEdHNTdHJzXHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy/mi4bliIbmlofku7bovpPlh7pcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhYmxlVHlwZU1hcER0c0ZpbGVQYXRoID0gcGF0aC5qb2luKG91dHB1dENvbmZpZy5jbGllbnREdHNPdXREaXIsIFwidGFibGVNYXAuZC50c1wiKTtcclxuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbdGFibGVUeXBlTWFwRHRzRmlsZVBhdGhdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiB0YWJsZVR5cGVNYXBEdHNGaWxlUGF0aCxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YWJsZVR5cGVNYXBEdHNTdHJcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvL2pzb25CdW5kbGVGaWxlXHJcbiAgICAgICAgaWYgKG91dHB1dENvbmZpZy5jbGllbnRCdW5kbGVKc29uT3V0UGF0aCkge1xyXG4gICAgICAgICAgICBsZXQganNvbkJ1bmRsZUZpbGVQYXRoID0gb3V0cHV0Q29uZmlnLmNsaWVudEJ1bmRsZUpzb25PdXRQYXRoO1xyXG4gICAgICAgICAgICBsZXQgb3V0cHV0RGF0YTogYW55O1xyXG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzQ29tcHJlc3MpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RhYmxlT2JqTWFwID0ge307XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFibGVPYmo6IGFueTtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdUYWJsZU9iajogYW55O1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdGFibGVOYW1lIGluIHRhYmxlT2JqTWFwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9ialR5cGVUYWJsZU1hcFt0YWJsZU5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSB0YWJsZU9iak1hcFt0YWJsZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGFibGVPYmogPSB0YWJsZU9iak1hcFt0YWJsZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqID0ge2ZpZWxkVmFsdWVzTWFwOiB7fX07XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWFpbktleSBpbiB0YWJsZU9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5ld1RhYmxlT2JqLmZpZWxkTmFtZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqLmZpZWxkTmFtZXMgPSBPYmplY3Qua2V5cyh0YWJsZU9ialttYWluS2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VGFibGVPYmouZmllbGRWYWx1ZXNNYXBbbWFpbktleV0gPSBPYmplY3QudmFsdWVzKHRhYmxlT2JqW21haW5LZXldKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iak1hcFt0YWJsZU5hbWVdID0gbmV3VGFibGVPYmo7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IEpTT04uc3RyaW5naWZ5KG5ld1RhYmxlT2JqTWFwKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBKU09OLnN0cmluZ2lmeSh0YWJsZU9iak1hcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5idW5kbGVKc29uSXNFbmNvZGUyQmFzZTY0KSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXREYXRhID0gQmFzZTY0LmVuY29kZShvdXRwdXREYXRhKTtcclxuICAgICAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcucHJlQmFzZTY0VWdseVN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBvdXRwdXRDb25maWcucHJlQmFzZTY0VWdseVN0cmluZyArIG91dHB1dERhdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLnN1ZkJhc2U2NFVnbHlTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXREYXRhICs9IG91dHB1dENvbmZpZy5zdWZCYXNlNjRVZ2x5U3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNaaXApIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBkZWZsYXRlU3luYyhvdXRwdXREYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdXRwdXRGaWxlTWFwW2pzb25CdW5kbGVGaWxlUGF0aF0gPSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDoganNvbkJ1bmRsZUZpbGVQYXRoLFxyXG4gICAgICAgICAgICAgICAgZW5jb2Rpbmc6IHR5cGVvZiBvdXRwdXREYXRhICE9PSBcInN0cmluZ1wiID8gXCJiaW5hcnlcIiA6IFwidXRmLThcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IG91dHB1dERhdGFcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG91dHB1dEZpbGVNYXA7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF9hZGRTaW5nbGVUYWJsZUR0c091dHB1dEZpbGUoY29uZmlnOiBJT3V0cHV0Q29uZmlnLCBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsIG91dHB1dEZpbGVNYXA6IE91dFB1dEZpbGVNYXApOiB2b2lkIHtcclxuICAgICAgICAvL+WmguaenOWAvOayoeacieWwseS4jei+k+WHuuexu+Wei+S/oeaBr+S6hlxyXG4gICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVPYmopIHJldHVybjtcclxuICAgICAgICBsZXQgZHRzRmlsZVBhdGg6IHN0cmluZyA9IHBhdGguam9pbihjb25maWcuY2xpZW50RHRzT3V0RGlyLCBgJHtwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZU5hbWV9LmQudHNgKTtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRwdXRGaWxlTWFwW2R0c0ZpbGVQYXRoXSkge1xyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICBjb25zdCBkdHNTdHIgPSB0aGlzLl9nZXRTaW5nbGVUYWJsZUR0cyhwYXJzZVJlc3VsdCk7XHJcbiAgICAgICAgICAgIGlmIChkdHNTdHIpIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbZHRzRmlsZVBhdGhdID0ge2ZpbGVQYXRoOiBkdHNGaWxlUGF0aCwgZGF0YTogZHRzU3RyfSBhcyBhbnk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6Kej5p6Q5Ye65Y2V5Liq6YWN572u6KGo57G75Z6L5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHQgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2dldFNpbmdsZVRhYmxlRHRzKHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgdGFibGVOYW1lID0gcGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lO1xyXG5cclxuICAgICAgICBjb25zdCBjb2xLZXlUYWJsZUZpZWxkTWFwOiBDb2xLZXlUYWJsZUZpZWxkTWFwID0gcGFyc2VSZXN1bHQuZmlsZWRNYXA7XHJcbiAgICAgICAgbGV0IGl0ZW1JbnRlcmZhY2UgPSBcImludGVyZmFjZSBJVF9cIiArIHRhYmxlTmFtZSArIFwiIHtcIiArIGVudGVyQ2hhcjtcclxuICAgICAgICBsZXQgdGFibGVGaWVsZDogSVRhYmxlRmllbGRcclxuICAgICAgICBsZXQgdHlwZVN0cjogc3RyaW5nO1xyXG4gICAgICAgIGxldCBvYmpUeXBlU3RyTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBjb2xLZXkgaW4gY29sS2V5VGFibGVGaWVsZE1hcCkge1xyXG5cclxuICAgICAgICAgICAgdGFibGVGaWVsZCA9IGNvbEtleVRhYmxlRmllbGRNYXBbY29sS2V5XTtcclxuICAgICAgICAgICAgaWYgKCF0YWJsZUZpZWxkKSBjb250aW51ZTtcclxuICAgICAgICAgICAgaWYgKCF0YWJsZUZpZWxkLmlzTXV0aUNvbE9iaikge1xyXG4gICAgICAgICAgICAgICAgLy/ms6jph4rooYxcclxuICAgICAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJcXHQvKiogXCIgKyB0YWJsZUZpZWxkLnRleHQgKyBcIiAqL1wiICsgZW50ZXJDaGFyO1xyXG4gICAgICAgICAgICAgICAgLy/lrZfmrrXnsbvlnovlo7DmmI7ooYxcclxuICAgICAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJcXHRyZWFkb25seSBcIiArIHRhYmxlRmllbGQuZmllbGROYW1lICsgXCI/OiBcIiArICh0eXBlU3RyTWFwW3RhYmxlRmllbGQudHlwZV0gPyB0eXBlU3RyTWFwW3RhYmxlRmllbGQudHlwZV0gOiB0YWJsZUZpZWxkLnR5cGUpICsgXCI7XCIgKyBlbnRlckNoYXI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvYmpGaWVsZEtleSA9IHRhYmxlRmllbGQuZmllbGROYW1lO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL+azqOmHiuihjFxyXG4gICAgICAgICAgICAgICAgb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0gKz0gXCJcXHRcXHQvKiogXCIgKyB0YWJsZUZpZWxkLnRleHQgKyBcIiAqL1wiICsgZW50ZXJDaGFyO1xyXG5cclxuICAgICAgICAgICAgICAgIC8v5a2X5q6157G75Z6L5aOw5piO6KGMXHJcbiAgICAgICAgICAgICAgICBvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XSArPSBcIlxcdFxcdHJlYWRvbmx5IFwiICsgdGFibGVGaWVsZC5zdWJGaWVsZE5hbWUgKyBcIj86IFwiICsgKHR5cGVTdHJNYXBbdGFibGVGaWVsZC5zdWJUeXBlXSA/IHR5cGVTdHJNYXBbdGFibGVGaWVsZC5zdWJUeXBlXSA6IHRhYmxlRmllbGQuc3ViVHlwZSkgKyBcIjtcIiArIGVudGVyQ2hhcjtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy/nrKzkuozlsYLlr7nosaFcclxuICAgICAgICBmb3IgKGxldCBvYmpGaWVsZEtleSBpbiBvYmpUeXBlU3RyTWFwKSB7XHJcbiAgICAgICAgICAgIC8v5a2X5q6157G75Z6L5aOw5piO6KGMXHJcbiAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJcXHRyZWFkb25seSBcIiArIG9iakZpZWxkS2V5ICsgXCI/OiB7XCIgKyBlbnRlckNoYXIgKyBvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XTtcclxuICAgICAgICAgICAgaXRlbUludGVyZmFjZSArPSBcIlxcdH1cIiArIGVudGVyQ2hhcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaXRlbUludGVyZmFjZSArPSBcIn1cIiArIGVudGVyQ2hhcjtcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBpdGVtSW50ZXJmYWNlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDljZXni6zlr7zlh7rphY3nva7ooahqc29u5paH5Lu2XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnIFxyXG4gICAgICogQHBhcmFtIHBhcnNlUmVzdWx0IFxyXG4gICAgICogQHBhcmFtIG91dHB1dEZpbGVNYXAgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2FkZFNpbmdsZVRhYmxlSnNvbk91dHB1dEZpbGUoY29uZmlnOiBJT3V0cHV0Q29uZmlnLCBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsIG91dHB1dEZpbGVNYXA6IE91dFB1dEZpbGVNYXApIHtcclxuICAgICAgICBjb25zdCB0YWJsZU9iaiA9IHBhcnNlUmVzdWx0LnRhYmxlT2JqO1xyXG4gICAgICAgIGlmICghdGFibGVPYmopIHJldHVybjtcclxuICAgICAgICBjb25zdCB0YWJsZU5hbWUgPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZU5hbWU7XHJcbiAgICAgICAgbGV0IHNpbmdsZUpzb25GaWxlUGF0aCA9IHBhdGguam9pbihjb25maWcuY2xpZW50U2luZ2xlVGFibGVKc29uRGlyLCBgJHt0YWJsZU5hbWV9Lmpzb25gKTtcclxuICAgICAgICBsZXQgc2luZ2xlSnNvbkRhdGEgPSBKU09OLnN0cmluZ2lmeSh0YWJsZU9iaiwgbnVsbCwgXCJcXHRcIik7XHJcblxyXG4gICAgICAgIGxldCBzaW5nbGVPdXRwdXRGaWxlSW5mbyA9IG91dHB1dEZpbGVNYXBbc2luZ2xlSnNvbkZpbGVQYXRoXTtcclxuICAgICAgICBpZiAoc2luZ2xlT3V0cHV0RmlsZUluZm8pIHtcclxuICAgICAgICAgICAgc2luZ2xlT3V0cHV0RmlsZUluZm8uZGF0YSA9IHNpbmdsZUpzb25EYXRhO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNpbmdsZU91dHB1dEZpbGVJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgZmlsZVBhdGg6IHNpbmdsZUpzb25GaWxlUGF0aCxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHNpbmdsZUpzb25EYXRhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbc2luZ2xlSnNvbkZpbGVQYXRoXSA9IHNpbmdsZU91dHB1dEZpbGVJbmZvO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByaXZhdGUgX2dldE9uZVRhYmxlVHlwZVN0cih0YWJsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcblxyXG4gICAgICAgIHJldHVybiBcIlxcdHJlYWRvbmx5IFwiICsgdGFibGVOYW1lICsgXCI/OiBcIiArIFwiSVRCYXNlPFwiICsgXCJJVF9cIiArIHRhYmxlTmFtZSArIFwiPjtcIiArIGVudGVyQ2hhcjtcclxuICAgIH1cclxufSIsImV4cG9ydCBjb25zdCB2YWx1ZVRyYW5zRnVuY01hcDoge1xyXG4gICAgW2tleTogc3RyaW5nXTogVmFsdWVUcmFuc0Z1bmNcclxufSA9IHt9O1xyXG52YWx1ZVRyYW5zRnVuY01hcFtcImludFwiXSA9IHN0clRvSW50O1xyXG52YWx1ZVRyYW5zRnVuY01hcFtcInN0cmluZ1wiXSA9IGFueVRvU3RyO1xyXG52YWx1ZVRyYW5zRnVuY01hcFtcIltpbnRdXCJdID0gc3RyVG9JbnRBcnI7XHJcbnZhbHVlVHJhbnNGdW5jTWFwW1wiW3N0cmluZ11cIl0gPSBzdHJUb1N0ckFycjtcclxudmFsdWVUcmFuc0Z1bmNNYXBbXCJqc29uXCJdID0gc3RyVG9Kc29uT2JqO1xyXG5mdW5jdGlvbiBzdHJUb0ludEFycihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcclxuICAgIGNlbGxWYWx1ZSA9IChjZWxsVmFsdWUgKyBcIlwiKS5yZXBsYWNlKC/vvIwvZywgXCIsXCIpOy8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXHJcbiAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xyXG4gICAgbGV0IGludEFycjogbnVtYmVyW107XHJcbiAgICBjb25zdCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge307XHJcbiAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaW50QXJyID0gSlNPTi5wYXJzZShjZWxsVmFsdWUpO1xyXG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBpbnRBcnI7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmVycm9yID0gZXJyb3I7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmZ1bmN0aW9uIHN0clRvU3RyQXJyKGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogc3RyaW5nKTogSVRyYW5zVmFsdWVSZXN1bHQge1xyXG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7Ly/kuLrkuobpmLLmraLnrZbliJLor6/loavvvIzlhYjov5vooYzovazmjaJcclxuICAgIGNlbGxWYWx1ZSA9IGNlbGxWYWx1ZS50cmltKCk7XHJcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9O1xyXG4gICAgbGV0IGFycjogc3RyaW5nW11cclxuICAgIGlmIChjZWxsVmFsdWUgIT09IFwiXCIpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhcnIgPSBKU09OLnBhcnNlKGNlbGxWYWx1ZSk7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGFycjtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICByZXN1bHQuZXJyb3IgPSBlcnJvcjtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5mdW5jdGlvbiBzdHJUb0ludChmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcclxuICAgIGxldCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge30gYXMgYW55O1xyXG4gICAgaWYgKHR5cGVvZiBjZWxsVmFsdWUgPT09IFwic3RyaW5nXCIgJiYgY2VsbFZhbHVlLnRyaW0oKSAhPT0gXCJcIikge1xyXG4gICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZS5pbmNsdWRlcyhcIi5cIikgPyBwYXJzZUZsb2F0KGNlbGxWYWx1ZSkgOiBwYXJzZUludChjZWxsVmFsdWUpIGFzIGFueTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuZnVuY3Rpb24gc3RyVG9Kc29uT2JqKGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogc3RyaW5nKTogSVRyYW5zVmFsdWVSZXN1bHQge1xyXG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7Ly/kuLrkuobpmLLmraLnrZbliJLor6/loavvvIzlhYjov5vooYzovazmjaJcclxuICAgIGNlbGxWYWx1ZSA9IGNlbGxWYWx1ZS50cmltKCk7XHJcbiAgICBsZXQgb2JqO1xyXG4gICAgbGV0IGVycm9yO1xyXG4gICAgaWYgKGNlbGxWYWx1ZSAhPT0gXCJcIikge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIG9iaiA9IEpTT04ucGFyc2UoY2VsbFZhbHVlKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgZXJyb3IgPSBlcnI7XHJcbiAgICAgICAgICAgIG9iaiA9IGNlbGxWYWx1ZTtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB7ZXJyb3I6IGVycm9yLCB2YWx1ZTogb2JqfTtcclxufVxyXG5mdW5jdGlvbiBhbnlUb1N0cihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IGFueSk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcclxuICAgIGxldCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge30gYXMgYW55O1xyXG4gICAgaWYgKHR5cGVvZiBjZWxsVmFsdWUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xyXG4gICAgICAgIGlmIChjZWxsVmFsdWUgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gY2VsbFZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzdWx0LnZhbHVlID0gY2VsbFZhbHVlICsgXCJcIjtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn0iLCJcclxuZXhwb3J0IGZ1bmN0aW9uIGRvUGFyc2UoZmlsZUluZm9zOiBJRmlsZUluZm9bXSwgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXAsIHBhcnNlSGFuZGxlcjogSVRhYmxlUGFyc2VIYW5kbGVyKSB7XHJcbiAgICBsZXQgcGFyc2VSZXN1bHQ7XHJcbiAgICBmb3IgKGxldCBpID0gZmlsZUluZm9zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgcGFyc2VSZXN1bHQgPSBwYXJzZVJlc3VsdE1hcFtmaWxlSW5mb3NbaV0uZmlsZVBhdGhdO1xyXG4gICAgICAgIGlmICghcGFyc2VSZXN1bHQpIHtcclxuICAgICAgICAgICAgcGFyc2VSZXN1bHQgPSB7ZmlsZVBhdGg6IGZpbGVJbmZvc1tpXS5maWxlUGF0aH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVPYmopIHtcclxuXHJcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VIYW5kbGVyLnBhcnNlVGFibGVGaWxlKGZpbGVJbmZvc1tpXSwgcGFyc2VSZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGFyc2VSZXN1bHQpIHtcclxuICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXBbZmlsZUluZm9zW2ldLmZpbGVQYXRoXSA9IHBhcnNlUmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCAqIGFzIGZzIGZyb20gXCJmcy1leHRyYVwiO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tIFwiY3J5cHRvXCI7XHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIGludGVyZmFjZSBJT3V0UHV0RmlsZUluZm8ge1xyXG4gICAgICAgIGZpbGVQYXRoOiBzdHJpbmcsXHJcbiAgICAgICAgLyoq5YaZ5YWl57yW56CB77yM5a2X56ym5Liy6buY6K6kdXRmOCAqL1xyXG4gICAgICAgIGVuY29kaW5nPzogQnVmZmVyRW5jb2RpbmcsXHJcbiAgICAgICAgLyoq5piv5ZCm5Yig6ZmkICovXHJcbiAgICAgICAgaXNEZWxldGU/OiBib29sZWFuXHJcbiAgICAgICAgZGF0YT86IGFueVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4qIOmBjeWOhuaWh+S7tlxyXG4qIEBwYXJhbSBkaXJQYXRoIOaWh+S7tuWkuei3r+W+hFxyXG4qIEBwYXJhbSBlYWNoQ2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChmaWxlUGF0aDogc3RyaW5nKSA9PiB2b2lkXHJcbiovXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JFYWNoRmlsZShmaWxlT3JEaXJQYXRoOiBzdHJpbmcsIGVhY2hDYWxsYmFjaz86IChmaWxlUGF0aDogc3RyaW5nKSA9PiB2b2lkKSB7XHJcbiAgICBpZiAoZnMuc3RhdFN5bmMoZmlsZU9yRGlyUGF0aCkuaXNEaXJlY3RvcnkoKSkge1xyXG4gICAgICAgIGNvbnN0IGZpbGVOYW1lcyA9IGZzLnJlYWRkaXJTeW5jKGZpbGVPckRpclBhdGgpO1xyXG4gICAgICAgIGxldCBjaGlsZEZpbGVQYXRoOiBzdHJpbmc7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlTmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY2hpbGRGaWxlUGF0aCA9IHBhdGguam9pbihmaWxlT3JEaXJQYXRoLCBmaWxlTmFtZXNbaV0pO1xyXG4gICAgICAgICAgICBmb3JFYWNoRmlsZShjaGlsZEZpbGVQYXRoLCBlYWNoQ2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWFjaENhbGxiYWNrKGZpbGVPckRpclBhdGgpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiDmibnph4/lhpnlhaXlkozliKDpmaTmlofku7ZcclxuICogQHBhcmFtIG91dHB1dEZpbGVJbmZvcyDpnIDopoHlhpnlhaXnmoTmlofku7bkv6Hmga/mlbDnu4RcclxuICogQHBhcmFtIG9uUHJvZ3Jlc3Mg6L+b5bqm5Y+Y5YyW5Zue6LCDXHJcbiAqIEBwYXJhbSBjb21wbGV0ZSDlrozmiJDlm57osINcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMob3V0cHV0RmlsZUluZm9zOiBJT3V0UHV0RmlsZUluZm9bXSxcclxuICAgIG9uUHJvZ3Jlc3M/OiAoZmlsZVBhdGg6IHN0cmluZywgdG90YWw6IG51bWJlciwgbm93OiBudW1iZXIsIGlzT2s6IGJvb2xlYW4pID0+IHZvaWQsXHJcbiAgICBjb21wbGV0ZT86ICh0b3RhbDogbnVtYmVyKSA9PiB2b2lkKSB7XHJcbiAgICBsZXQgZmlsZUluZm86IElPdXRQdXRGaWxlSW5mbztcclxuICAgIGNvbnN0IHRvdGFsID0gb3V0cHV0RmlsZUluZm9zLmxlbmd0aDtcclxuICAgIGlmIChvdXRwdXRGaWxlSW5mb3MgJiYgdG90YWwpIHtcclxuICAgICAgICBsZXQgbm93ID0gMDtcclxuICAgICAgICBjb25zdCBvbldyaXRlRW5kID0gKGVycikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbm93Kys7XHJcbiAgICAgICAgICAgIG9uUHJvZ3Jlc3MgJiYgb25Qcm9ncmVzcyhvdXRwdXRGaWxlSW5mb3Nbbm93IC0gMV0uZmlsZVBhdGgsIHRvdGFsLCBub3csICFlcnIpO1xyXG4gICAgICAgICAgICBpZiAobm93ID49IHRvdGFsKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSAmJiBjb21wbGV0ZSh0b3RhbCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gb3V0cHV0RmlsZUluZm9zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGZpbGVJbmZvID0gb3V0cHV0RmlsZUluZm9zW2ldO1xyXG4gICAgICAgICAgICBpZiAoZmlsZUluZm8uaXNEZWxldGUgJiYgZnMuZXhpc3RzU3luYyhmaWxlSW5mby5maWxlUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGZzLnVubGlua1N5bmMoZmlsZUluZm8uZmlsZVBhdGgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlSW5mby5lbmNvZGluZyAmJiB0eXBlb2YgZmlsZUluZm8uZGF0YSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmVuY29kaW5nID0gXCJ1dGY4XCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnMuZW5zdXJlRmlsZVN5bmMoZmlsZUluZm8uZmlsZVBhdGgpO1xyXG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlKFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmZpbGVQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmRhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgKGZpbGVJbmZvLmVuY29kaW5nID8ge2VuY29kaW5nOiBmaWxlSW5mby5lbmNvZGluZ30gOiB1bmRlZmluZWQpLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uV3JpdGVFbmRcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiDojrflj5blj5jljJbov4fnmoTmlofku7bmlbDnu4RcclxuICogQHBhcmFtIGRpciDnm67moIfnm67lvZVcclxuICogQHBhcmFtIGNhY2hlRmlsZVBhdGgg57yT5a2Y5paH5Lu257ud5a+56Lev5b6EXHJcbiAqIEBwYXJhbSBlYWNoQ2FsbGJhY2sg6YGN5Y6G5Zue6LCDXHJcbiAqIEByZXR1cm5zIOi/lOWbnue8k+WtmOaWh+S7tui3r+W+hFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvckVhY2hDaGFuZ2VkRmlsZShkaXI6IHN0cmluZywgY2FjaGVGaWxlUGF0aD86IHN0cmluZywgZWFjaENhbGxiYWNrPzogKGZpbGVQYXRoOiBzdHJpbmcsIGlzRGVsZXRlPzogYm9vbGVhbikgPT4gdm9pZCkge1xyXG5cclxuICAgIGNvbnN0IGdjZkNhY2hlID0gZ2V0Q2FjaGVEYXRhKGNhY2hlRmlsZVBhdGgpO1xyXG4gICAgY29uc3Qgb2xkRmlsZVBhdGhzID0gT2JqZWN0LmtleXMoZ2NmQ2FjaGUpO1xyXG4gICAgbGV0IG9sZEZpbGVQYXRoSW5kZXg6IG51bWJlcjtcclxuICAgIGZvckVhY2hGaWxlKGRpciwgKGZpbGVQYXRoKSA9PiB7XHJcbiAgICAgICAgdmFyIG1kNXN0ciA9IGdldEZpbGVNZDVTeW5jKGZpbGVQYXRoKTtcclxuICAgICAgICBpZiAoIWdjZkNhY2hlW2ZpbGVQYXRoXSB8fCAoZ2NmQ2FjaGVbZmlsZVBhdGhdICYmIGdjZkNhY2hlW2ZpbGVQYXRoXSAhPT0gbWQ1c3RyKSkge1xyXG4gICAgICAgICAgICBnY2ZDYWNoZVtmaWxlUGF0aF0gPSBtZDVzdHI7XHJcbiAgICAgICAgICAgIGVhY2hDYWxsYmFjayhmaWxlUGF0aCwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvbGRGaWxlUGF0aEluZGV4ID0gb2xkRmlsZVBhdGhzLmluZGV4T2YoZmlsZVBhdGgpO1xyXG4gICAgICAgIGlmIChvbGRGaWxlUGF0aEluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgY29uc3QgZW5kRmlsZVBhdGggPSBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhJbmRleF0gPSBlbmRGaWxlUGF0aDtcclxuICAgICAgICAgICAgb2xkRmlsZVBhdGhzLnBvcCgpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfSk7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZEZpbGVQYXRocy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRlbGV0ZSBnY2ZDYWNoZVtvbGRGaWxlUGF0aHNbaV1dO1xyXG4gICAgICAgIGVhY2hDYWxsYmFjayhvbGRGaWxlUGF0aHNbaV0sIHRydWUpO1xyXG4gICAgfVxyXG4gICAgZnMud3JpdGVGaWxlU3luYyhjYWNoZUZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShnY2ZDYWNoZSksIHtlbmNvZGluZzogXCJ1dGYtOFwifSk7XHJcbn1cclxuLyoqXHJcbiAqIOWGmeWFpee8k+WtmOaVsOaNrlxyXG4gKiBAcGFyYW0gY2FjaGVGaWxlUGF0aCBcclxuICogQHBhcmFtIGNhY2hlRGF0YSBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3cml0ZUNhY2hlRGF0YShjYWNoZUZpbGVQYXRoOiBzdHJpbmcsIGNhY2hlRGF0YTogYW55KSB7XHJcbiAgICBpZiAoIWNhY2hlRmlsZVBhdGgpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBjYWNoZUZpbGVQYXRoIGlzIG51bGxgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmcy53cml0ZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGNhY2hlRGF0YSksIHtlbmNvZGluZzogXCJ1dGYtOFwifSk7XHJcbn1cclxuLyoqXHJcbiAqIOivu+WPlue8k+WtmOaVsOaNrlxyXG4gKiBAcGFyYW0gY2FjaGVGaWxlUGF0aCBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDYWNoZURhdGEoY2FjaGVGaWxlUGF0aDogc3RyaW5nKTogYW55IHtcclxuICAgIGlmICghY2FjaGVGaWxlUGF0aCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhY2hlRmlsZVBhdGggaXMgbnVsbGApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICghZnMuZXhpc3RzU3luYyhjYWNoZUZpbGVQYXRoKSkge1xyXG4gICAgICAgIGZzLmVuc3VyZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgpO1xyXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoY2FjaGVGaWxlUGF0aCwgJ3t9Jywge2VuY29kaW5nOiBcInV0Zi04XCJ9KTtcclxuICAgIH1cclxuICAgIGNvbnN0IGdjZkNhY2hlRmlsZSA9IGZzLnJlYWRGaWxlU3luYyhjYWNoZUZpbGVQYXRoLCBcInV0Zi04XCIpO1xyXG4gICAgY29uc3QgZ2NmQ2FjaGUgPSBKU09OLnBhcnNlKGdjZkNhY2hlRmlsZSk7XHJcbiAgICByZXR1cm4gZ2NmQ2FjaGU7XHJcbn1cclxuLyoqXHJcbiAqIOiOt+WPluaWh+S7tm1kNSAo5ZCM5q2lKVxyXG4gKiBAcGFyYW0gZmlsZVBhdGggXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBmaWxlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCBcInV0Zi04XCIpO1xyXG4gICAgdmFyIG1kNXVtID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpO1xyXG4gICAgbWQ1dW0udXBkYXRlKGZpbGUpO1xyXG4gICAgcmV0dXJuIG1kNXVtLmRpZ2VzdCgnaGV4Jyk7XHJcbn1cclxuLyoqXHJcbiAqIOiOt+WPluaWh+S7tiBtZDVcclxuICogQHBhcmFtIGZpbGVQYXRoIFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEZpbGVNZDUoZmlsZVBhdGg6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIGdldEZpbGVNZDVTeW5jKGZpbGVQYXRoKTtcclxufSIsImltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzLWV4dHJhXCI7XHJcbmltcG9ydCAqIGFzIG1tYXRjaCBmcm9tIFwibWljcm9tYXRjaFwiO1xyXG5pbXBvcnQge2ZvckVhY2hGaWxlLCBnZXRDYWNoZURhdGEsIGdldEZpbGVNZDVTeW5jLCB3cml0ZUNhY2hlRGF0YSwgd3JpdGVPckRlbGV0ZU91dFB1dEZpbGVzfSBmcm9tICcuL2ZpbGUtdXRpbHMnO1xyXG5pbXBvcnQge1dvcmtlcn0gZnJvbSBcIndvcmtlcl90aHJlYWRzXCJcclxuaW1wb3J0IHtkb1BhcnNlfSBmcm9tICcuL2RvLXBhcnNlJztcclxuaW1wb3J0IHtEZWZhdWx0UGFyc2VIYW5kbGVyfSBmcm9tICcuL2RlZmF1bHQtcGFyc2UtaGFuZGxlcic7XHJcbi8qKlxyXG4gKiDop6PmnpDphY3nva7ooajnlJ/miJDmjIflrprmlofku7ZcclxuICogQHBhcmFtIHBhcnNlQ29uZmlnIOino+aekOmFjee9rlxyXG4gKiBAcGFyYW0gdHJhbnMyRmlsZUhhbmRsZXIg6L2s5o2i6Kej5p6Q57uT5p6c5Li66L6T5Ye65paH5Lu2XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGUocGFyc2VDb25maWc6IElUYWJsZVBhcnNlQ29uZmlnLCB0cmFuczJGaWxlSGFuZGxlcjogSVRyYW5zUmVzdWx0MkFueUZpbGVIYW5kbGVyKSB7XHJcbiAgICBjb25zdCB0YWJsZUZpbGVEaXIgPSBwYXJzZUNvbmZpZy50YWJsZUZpbGVEaXI7XHJcbiAgICBpZiAoIXRhYmxlRmlsZURpcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOmFjee9ruihqOebruW9le+8mnRhYmxlRmlsZURpcuS4uuepumApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICghZnMuZXhpc3RzU3luYyh0YWJsZUZpbGVEaXIpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihg6YWN572u6KGo5paH5Lu25aS55LiN5a2Y5Zyo77yaJHt0YWJsZUZpbGVEaXJ9YCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZGVmYXVsdFBhdHRlcm4gPSBbXCIqKi8qLnt4bHN4LGNzdn1cIiwgXCIhKiovfiQqLipcIiwgXCIhKiovfi4qLipcIl07XHJcbiAgICBpZiAoIXBhcnNlQ29uZmlnLnBhdHRlcm4pIHtcclxuICAgICAgICBwYXJzZUNvbmZpZy5wYXR0ZXJuID0gZGVmYXVsdFBhdHRlcm47XHJcbiAgICB9IGVsc2UgaWYgKHBhcnNlQ29uZmlnLnBhdHRlcm4gJiYgdHlwZW9mIHBhcnNlQ29uZmlnLnBhdHRlcm4gPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZmF1bHRQYXR0ZXJuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyc2VDb25maWcucGF0dGVybi5pbmNsdWRlcyhkZWZhdWx0UGF0dGVybltpXSkpIHtcclxuICAgICAgICAgICAgICAgIHBhcnNlQ29uZmlnLnBhdHRlcm4ucHVzaChkZWZhdWx0UGF0dGVybltpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocGFyc2VDb25maWcudXNlTXVsdGlUaHJlYWQgJiYgaXNOYU4ocGFyc2VDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtKSkge1xyXG4gICAgICAgIHBhcnNlQ29uZmlnLnRocmVhZFBhcnNlRmlsZU1heE51bSA9IDU7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZpbGVJbmZvczogSUZpbGVJbmZvW10gPSBbXTtcclxuICAgIGxldCBkZWxldGVGaWxlSW5mb3M6IElGaWxlSW5mb1tdID0gW107XHJcbiAgICBjb25zdCBnZXRGaWxlSW5mbyA9IChmaWxlUGF0aDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZmlsZVBhdGhQYXJzZSA9IHBhdGgucGFyc2UoZmlsZVBhdGgpO1xyXG4gICAgICAgIGNvbnN0IGZpbGVJbmZvOiBJRmlsZUluZm8gPSB7XHJcbiAgICAgICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aCxcclxuICAgICAgICAgICAgZmlsZU5hbWU6IGZpbGVQYXRoUGFyc2UubmFtZSxcclxuICAgICAgICAgICAgZmlsZUV4dE5hbWU6IGZpbGVQYXRoUGFyc2UuZXh0LFxyXG4gICAgICAgICAgICBpc0RlbGV0ZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZpbGVJbmZvO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbWF0Y2hQYXR0ZXJuID0gcGFyc2VDb25maWcucGF0dGVybjtcclxuICAgIGNvbnN0IGVhY2hGaWxlQ2FsbGJhY2sgPSAoZmlsZVBhdGg6IHN0cmluZywgaXNEZWxldGU/OiBib29sZWFuKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbGVJbmZvID0gZ2V0RmlsZUluZm8oZmlsZVBhdGgpO1xyXG4gICAgICAgIGxldCBjYW5SZWFkOiBib29sZWFuO1xyXG4gICAgICAgIGlmIChpc0RlbGV0ZSkge1xyXG4gICAgICAgICAgICBkZWxldGVGaWxlSW5mb3MucHVzaChmaWxlSW5mbyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2FuUmVhZCA9IG1tYXRjaC5hbGwoZmlsZUluZm8uZmlsZVBhdGgsIG1hdGNoUGF0dGVybik7O1xyXG4gICAgICAgICAgICBpZiAoY2FuUmVhZCkge1xyXG4gICAgICAgICAgICAgICAgZmlsZUluZm9zLnB1c2goZmlsZUluZm8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7ZmlsZUluZm8sIGNhblJlYWR9XHJcbiAgICB9O1xyXG4gICAgbGV0IHBhcnNlUmVzdWx0TWFwOiBUYWJsZVBhcnNlUmVzdWx0TWFwID0ge307XHJcblxyXG4gICAgLy/nvJPlrZjlpITnkIZcclxuICAgIGxldCBjYWNoZUZpbGVEaXJQYXRoOiBzdHJpbmcgPSBwYXJzZUNvbmZpZy5jYWNoZUZpbGVEaXJQYXRoO1xyXG4gICAgbGV0IHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aDogc3RyaW5nO1xyXG5cclxuICAgIGlmICghcGFyc2VDb25maWcudXNlQ2FjaGUpIHtcclxuICAgICAgICBmb3JFYWNoRmlsZSh0YWJsZUZpbGVEaXIsIGVhY2hGaWxlQ2FsbGJhY2spO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoIWNhY2hlRmlsZURpclBhdGgpIGNhY2hlRmlsZURpclBhdGggPSBcIi5jYWNoZVwiO1xyXG4gICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKGNhY2hlRmlsZURpclBhdGgpKSB7XHJcbiAgICAgICAgICAgIGNhY2hlRmlsZURpclBhdGggPSBwYXRoLmpvaW4odGFibGVGaWxlRGlyLCBjYWNoZUZpbGVEaXJQYXRoKTtcclxuICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoID0gcGF0aC5qb2luKGNhY2hlRmlsZURpclBhdGgsIFwiLmVnZnBybWNcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBhcnNlUmVzdWx0TWFwID0gZ2V0Q2FjaGVEYXRhKHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCk7XHJcbiAgICAgICAgaWYgKCFwYXJzZVJlc3VsdE1hcCkge1xyXG4gICAgICAgICAgICBwYXJzZVJlc3VsdE1hcCA9IHt9O1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgb2xkRmlsZVBhdGhzID0gT2JqZWN0LmtleXMocGFyc2VSZXN1bHRNYXApO1xyXG4gICAgICAgIGxldCBvbGRGaWxlUGF0aEluZGV4OiBudW1iZXI7XHJcbiAgICAgICAgbGV0IHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdDtcclxuICAgICAgICBmb3JFYWNoRmlsZSh0YWJsZUZpbGVEaXIsIChmaWxlUGF0aCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgbWQ1c3RyID0gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGgpO1xyXG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXTtcclxuICAgICAgICAgICAgaWYgKCFwYXJzZVJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgcGFyc2VSZXN1bHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcFtmaWxlUGF0aF0gPSBwYXJzZVJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFyc2VSZXN1bHQgJiYgcGFyc2VSZXN1bHQubWQ1aGFzaCAhPT0gbWQ1c3RyKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7ZmlsZUluZm8sIGNhblJlYWR9ID0gZWFjaEZpbGVDYWxsYmFjayhmaWxlUGF0aCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhblJlYWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdC5tZDVoYXNoID0gbWQ1c3RyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9sZEZpbGVQYXRoSW5kZXggPSBvbGRGaWxlUGF0aHMuaW5kZXhPZihmaWxlUGF0aCk7XHJcbiAgICAgICAgICAgIGlmIChvbGRGaWxlUGF0aEluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGVuZEZpbGVQYXRoID0gb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRocy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgIG9sZEZpbGVQYXRoc1tvbGRGaWxlUGF0aEluZGV4XSA9IGVuZEZpbGVQYXRoO1xyXG4gICAgICAgICAgICAgICAgb2xkRmlsZVBhdGhzLnBvcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvbGRGaWxlUGF0aHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgZGVsZXRlIHBhcnNlUmVzdWx0TWFwW29sZEZpbGVQYXRoc1tpXV07XHJcbiAgICAgICAgICAgIGVhY2hGaWxlQ2FsbGJhY2sob2xkRmlsZVBhdGhzW2ldLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxuICAgIGlmIChmaWxlSW5mb3MubGVuZ3RoID4gcGFyc2VDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtICYmIHBhcnNlQ29uZmlnLnVzZU11bHRpVGhyZWFkKSB7XHJcbiAgICAgICAgY29uc3QgY291bnQgPSBNYXRoLmZsb29yKGZpbGVJbmZvcy5sZW5ndGggLyBwYXJzZUNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0pICsgMTtcclxuICAgICAgICBsZXQgd29ya2VyOiBXb3JrZXI7XHJcbiAgICAgICAgbGV0IHN1YkZpbGVJbmZvczogSUZpbGVJbmZvW107XHJcbiAgICAgICAgbGV0IHdvcmtlck1hcDoge1trZXk6IG51bWJlcl06IFdvcmtlcn0gPSB7fTtcclxuICAgICAgICBsZXQgY29tcGxldGVDb3VudDogbnVtYmVyID0gMDtcclxuICAgICAgICBjb25zdCB0MSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIGNvbnN0IG9uV29ya2VyUGFyc2VFbmQgPSAoZGF0YToge3RocmVhZElkOiBudW1iZXIsIHBhcnNlUmVzdWx0TWFwOiBUYWJsZVBhcnNlUmVzdWx0TWFwfSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg57q/56iL57uT5p2fOiR7ZGF0YS50aHJlYWRJZH1gKTtcclxuICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXAgPSBPYmplY3QuYXNzaWduKHBhcnNlUmVzdWx0TWFwLCBkYXRhLnBhcnNlUmVzdWx0TWFwKTtcclxuICAgICAgICAgICAgY29tcGxldGVDb3VudCsrO1xyXG4gICAgICAgICAgICBpZiAoY29tcGxldGVDb3VudCA+PSBjb3VudCkge1xyXG4gICAgICAgICAgICAgICAgd3JpdGVGaWxlcyhwYXJzZUNvbmZpZywgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoLCB0cmFuczJGaWxlSGFuZGxlciwgZmlsZUluZm9zLCBkZWxldGVGaWxlSW5mb3MsIHBhcnNlUmVzdWx0TWFwKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHQyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW+Wkmue6v+eoi+WvvOihqOaXtumXtF06JHt0MiAtIHQxfWApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgc3ViRmlsZUluZm9zID0gZmlsZUluZm9zLnNwbGljZSgwLCBwYXJzZUNvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0pO1xyXG4gICAgICAgICAgICB3b3JrZXIgPSBuZXcgV29ya2VyKHBhdGguam9pbihwYXRoLmRpcm5hbWUoX19maWxlbmFtZSksIFwiLi93b3JrZXIuanNcIiksIHt3b3JrZXJEYXRhOiB7dGhyZWFkSWQ6IGksIGZpbGVJbmZvczogc3ViRmlsZUluZm9zLCBwYXJzZVJlc3VsdE1hcDogcGFyc2VSZXN1bHRNYXB9IGFzIElXb3JrZXJTaGFyZURhdGF9KVxyXG4gICAgICAgICAgICB3b3JrZXJNYXBbaV0gPSB3b3JrZXI7XHJcbiAgICAgICAgICAgIHdvcmtlci5vbihcIm1lc3NhZ2VcIiwgb25Xb3JrZXJQYXJzZUVuZCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHQxID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgbGV0IHBhcnNlSGFuZGxlcjogSVRhYmxlUGFyc2VIYW5kbGVyO1xyXG4gICAgICAgIGlmIChwYXJzZUNvbmZpZy5jdXN0b21QYXJzZUhhbmRsZXJQYXRoKSB7XHJcbiAgICAgICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKHBhcnNlQ29uZmlnLmN1c3RvbVBhcnNlSGFuZGxlclBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZUNvbmZpZy5jdXN0b21QYXJzZUhhbmRsZXJQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgcGFyc2VDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyc2VIYW5kbGVyID0gYXdhaXQgaW1wb3J0KHBhcnNlQ29uZmlnLmN1c3RvbVBhcnNlSGFuZGxlclBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXBhcnNlSGFuZGxlcikge1xyXG4gICAgICAgICAgICBwYXJzZUhhbmRsZXIgPSBuZXcgRGVmYXVsdFBhcnNlSGFuZGxlcigpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvUGFyc2UoZmlsZUluZm9zLCBwYXJzZVJlc3VsdE1hcCwgcGFyc2VIYW5kbGVyKTtcclxuICAgICAgICB3cml0ZUZpbGVzKHBhcnNlQ29uZmlnLCBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgsIHRyYW5zMkZpbGVIYW5kbGVyLCBmaWxlSW5mb3MsIGRlbGV0ZUZpbGVJbmZvcywgcGFyc2VSZXN1bHRNYXApO1xyXG4gICAgICAgIGNvbnN0IHQyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFvljZXnur/nqIvlr7zooajml7bpl7RdOiR7dDIgLSB0MX1gKTtcclxuICAgIH1cclxuXHJcblxyXG59XHJcbmZ1bmN0aW9uIHdyaXRlRmlsZXMoXHJcbiAgICBwYXJzZUNvbmZpZzogSVRhYmxlUGFyc2VDb25maWdcclxuICAgICwgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoOiBzdHJpbmdcclxuICAgICwgdHJhbnMyRmlsZUhhbmRsZXI6IElUcmFuc1Jlc3VsdDJBbnlGaWxlSGFuZGxlclxyXG4gICAgLCBmaWxlSW5mb3M6IElGaWxlSW5mb1tdXHJcbiAgICAsIGRlbGV0ZUZpbGVJbmZvczogSUZpbGVJbmZvW11cclxuICAgICwgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXApIHtcclxuICAgIC8v5YaZ5YWl6Kej5p6Q57yT5a2YXHJcbiAgICBpZiAocGFyc2VDb25maWcudXNlQ2FjaGUpIHtcclxuICAgICAgICB3cml0ZUNhY2hlRGF0YShwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgsIHBhcnNlUmVzdWx0TWFwKTtcclxuICAgIH1cclxuXHJcbiAgICAvL+ino+aekOe7k+adn++8jOWBmuWvvOWHuuWkhOeQhlxyXG4gICAgbGV0IG91dHB1dEZpbGVNYXA6IE91dFB1dEZpbGVNYXAgPSB0cmFuczJGaWxlSGFuZGxlci50cmFuczJGaWxlcyhmaWxlSW5mb3MsIGRlbGV0ZUZpbGVJbmZvcywgcGFyc2VSZXN1bHRNYXApO1xyXG4gICAgY29uc3Qgb3V0cHV0RmlsZXMgPSBPYmplY3QudmFsdWVzKG91dHB1dEZpbGVNYXApO1xyXG4gICAgLy/lhpnlhaXlkozliKDpmaTmlofku7blpITnkIZcclxuICAgIGNvbnNvbGUubG9nKGDlvIDlp4vlhpnlhaXmlofku7Y6MC8ke291dHB1dEZpbGVzLmxlbmd0aH1gKTtcclxuXHJcbiAgICB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMob3V0cHV0RmlsZXMsXHJcbiAgICAgICAgKGZpbGVQYXRoLCB0b3RhbCwgbm93LCBpc09rKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBb5YaZ5YWl5paH5Lu2XSDov5vluqY6KCR7bm93fS8ke3RvdGFsfSkg6Lev5b6EOiR7ZmlsZVBhdGh9YCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlhpnlhaXnu5PmnZ9+YCk7XHJcbiAgICAgICAgfSk7XHJcbn1cclxuXHJcblxyXG4iLCJpbXBvcnQgKiBhcyB4bHN4IGZyb20gXCJ4bHN4XCI7XHJcbi8qKlxyXG4gKiDmmK/lkKbkuLrnqbrooajmoLzmoLzlrZBcclxuICogQHBhcmFtIGNlbGwgXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eUNlbGwoY2VsbDogeGxzeC5DZWxsT2JqZWN0KSB7XHJcbiAgICBpZiAoY2VsbCAmJiBjZWxsLnYgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY2VsbC52ID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsLnYgPT09IFwiXCJcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZWxsLnYgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKGNlbGwudik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIOWtl+avjVrnmoTnvJbnoIFcclxuICovXHJcbmV4cG9ydCBjb25zdCBaQ2hhckNvZGUgPSA5MDtcclxuLyoqXHJcbiAqIOWtl+avjUHnmoTnvJbnoIFcclxuICogXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgQUNoYXJDb2RlID0gNjU7XHJcbi8qKlxyXG4gKiDmoLnmja7lvZPliY3liJfnmoRjaGFyQ29kZXPojrflj5bkuIvkuIDliJdLZXlcclxuICogQHBhcmFtIGNoYXJDb2RlcyBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXROZXh0Q29sS2V5KGNoYXJDb2RlczogbnVtYmVyW10pOiBzdHJpbmcge1xyXG4gICAgbGV0IGlzQWRkOiBib29sZWFuO1xyXG4gICAgZm9yIChsZXQgaSA9IGNoYXJDb2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGlmIChjaGFyQ29kZXNbaV0gPCBaQ2hhckNvZGUpIHtcclxuICAgICAgICAgICAgY2hhckNvZGVzW2ldICs9IDE7XHJcbiAgICAgICAgICAgIGlzQWRkID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZXNbaV0gPT09IFpDaGFyQ29kZSkge1xyXG4gICAgICAgICAgICBjaGFyQ29kZXNbaV0gPSBBQ2hhckNvZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCFpc0FkZCkge1xyXG4gICAgICAgIGNoYXJDb2Rlcy5wdXNoKEFDaGFyQ29kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNoYXJDb2Rlc1RvU3RyaW5nKGNoYXJDb2Rlcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDliJfnmoTlrZfnrKbnvJbnoIHmlbDnu4TovazlrZfnrKbkuLJcclxuICogQHBhcmFtIGNoYXJDb2RlcyBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGFyQ29kZXNUb1N0cmluZyhjaGFyQ29kZXM6IG51bWJlcltdKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmNoYXJDb2Rlcyk7XHJcbn1cclxuLyoqXHJcbiAqIOWtl+espuS4sui9rOe8lueggeaVsOe7hFxyXG4gKiBAcGFyYW0gY29sS2V5IFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1RvQ2hhckNvZGVzKGNvbEtleTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBjaGFyQ29kZXMgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sS2V5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY2hhckNvZGVzLnB1c2goY29sS2V5LmNoYXJDb2RlQXQoaSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNoYXJDb2RlcztcclxufVxyXG4vKipcclxuICog57q15ZCR6YGN5Y6G6KGo5qC8XHJcbiAqIEBwYXJhbSBzaGVldCB4bHN46KGo5qC85a+56LGhXHJcbiAqIEBwYXJhbSBzdGFydFJvdyDlvIDlp4vooYwg5LuOMeW8gOWni1xyXG4gKiBAcGFyYW0gc3RhcnRDb2wg5YiX5a2X56ymIOavlOWmgkEgQlxyXG4gKiBAcGFyYW0gY2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWRcclxuICogQHBhcmFtIGlzU2hlZXRSb3dFbmQg5piv5ZCm6KGM57uT5p2f5Yik5pat5pa55rOVXHJcbiAqIEBwYXJhbSBpc1NoZWV0Q29sRW5kIOaYr+WQpuWIl+e7k+adn+WIpOaWreaWueazlVxyXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRSb3cg5piv5ZCm6Lez6L+H6KGMXHJcbiAqIEBwYXJhbSBpc1NraXBTaGVldENvbCDmmK/lkKbot7Pov4fliJdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2ZXJ0aWNhbEZvckVhY2hTaGVldChcclxuICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxyXG4gICAgc3RhcnRSb3c6IG51bWJlcixcclxuICAgIHN0YXJ0Q29sOiBzdHJpbmcsXHJcbiAgICBjYWxsYmFjazogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIGlzU2hlZXRSb3dFbmQ/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IGJvb2xlYW4sXHJcbiAgICBpc1NoZWV0Q29sRW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xrZXk6IHN0cmluZykgPT4gYm9vbGVhbixcclxuICAgIGlzU2tpcFNoZWV0Um93PzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxyXG4gICAgaXNTa2lwU2hlZXRDb2w/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKSA9PiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBzaGVldFJlZjogc3RyaW5nID0gc2hlZXRbJyFyZWYnXVxyXG4gICAgY29uc3QgbWF4Um93TnVtID0gcGFyc2VJbnQoc2hlZXRSZWYubWF0Y2goL1xcZCskLylbMF0pO1xyXG5cclxuICAgIGNvbnN0IG1heENvbEtleSA9IHNoZWV0UmVmLnNwbGl0KFwiOlwiKVsxXS5tYXRjaCgvXltBLVphLXpdKy8pWzBdO1xyXG4gICAgbGV0IG1heENvbEtleUNvZGVTdW0gPSBnZXRDaGFyQ29kZVN1bShtYXhDb2xLZXkpO1xyXG5cclxuICAgIGxldCBjb2xDaGFyQ29kZXM6IG51bWJlcltdO1xyXG4gICAgbGV0IGNvbEtleTogc3RyaW5nO1xyXG4gICAgbGV0IGN1ckNvbENvZGVTdW06IG51bWJlciA9IDA7XHJcbiAgICBjb25zdCBzdGFydENoYXJjb2RlcyA9IHN0cmluZ1RvQ2hhckNvZGVzKHN0YXJ0Q29sKVxyXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0Um93OyBpIDw9IG1heFJvd051bTsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGlzU2hlZXRSb3dFbmQgPyBpc1NoZWV0Um93RW5kKHNoZWV0LCBpKSA6IGZhbHNlKSBicmVhaztcclxuICAgICAgICBpZiAoaXNTa2lwU2hlZXRSb3cgPyBpc1NraXBTaGVldFJvdyhzaGVldCwgaSkgOiBmYWxzZSkgY29udGludWU7XHJcbiAgICAgICAgY29sQ2hhckNvZGVzID0gc3RhcnRDaGFyY29kZXMuY29uY2F0KFtdKTtcclxuXHJcbiAgICAgICAgY29sS2V5ID0gc3RhcnRDb2w7XHJcblxyXG4gICAgICAgIGxldCBoYXNOZXh0Q29sID0gaXNTaGVldENvbEVuZCA/ICFpc1NoZWV0Q29sRW5kKHNoZWV0LCBjb2xLZXkpIDogdHJ1ZTtcclxuICAgICAgICB3aGlsZSAoaGFzTmV4dENvbCkge1xyXG4gICAgICAgICAgICBpZiAoIShpc1NraXBTaGVldENvbCA/IGlzU2tpcFNoZWV0Q29sKHNoZWV0LCBjb2xLZXkpIDogZmFsc2UpKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhzaGVldCwgY29sS2V5LCBpKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29sS2V5ID0gZ2V0TmV4dENvbEtleShjb2xDaGFyQ29kZXMpO1xyXG4gICAgICAgICAgICBjdXJDb2xDb2RlU3VtID0gZ2V0Q2hhckNvZGVTdW0oY29sS2V5KTtcclxuICAgICAgICAgICAgaWYgKG1heENvbEtleUNvZGVTdW0gPj0gY3VyQ29sQ29kZVN1bSkge1xyXG4gICAgICAgICAgICAgICAgaGFzTmV4dENvbCA9IGlzU2hlZXRDb2xFbmQgPyAhaXNTaGVldENvbEVuZChzaGVldCwgY29sS2V5KSA6IHRydWU7O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGFzTmV4dENvbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmqKrlkJHpgY3ljobooajmoLxcclxuICogQHBhcmFtIHNoZWV0IHhsc3jooajmoLzlr7nosaFcclxuICogQHBhcmFtIHN0YXJ0Um93IOW8gOWni+ihjCDku44x5byA5aeLXHJcbiAqIEBwYXJhbSBzdGFydENvbCDliJflrZfnrKYg5q+U5aaCQSBCXHJcbiAqIEBwYXJhbSBjYWxsYmFjayDpgY3ljoblm57osIMgKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4gdm9pZFxyXG4gKiBAcGFyYW0gaXNTaGVldFJvd0VuZCDmmK/lkKbooYznu5PmnZ/liKTmlq3mlrnms5VcclxuICogQHBhcmFtIGlzU2hlZXRDb2xFbmQg5piv5ZCm5YiX57uT5p2f5Yik5pat5pa55rOVXHJcbiAqIEBwYXJhbSBpc1NraXBTaGVldFJvdyDmmK/lkKbot7Pov4fooYxcclxuICogQHBhcmFtIGlzU2tpcFNoZWV0Q29sIOaYr+WQpui3s+i/h+WIl1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGhvcml6b250YWxGb3JFYWNoU2hlZXQoXHJcbiAgICBzaGVldDogeGxzeC5TaGVldCxcclxuICAgIHN0YXJ0Um93OiBudW1iZXIsXHJcbiAgICBzdGFydENvbDogc3RyaW5nLFxyXG4gICAgY2FsbGJhY2s6IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWQsXHJcbiAgICBpc1NoZWV0Um93RW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxyXG4gICAgaXNTaGVldENvbEVuZD86IChzaGVldDogeGxzeC5TaGVldCwgY29sa2V5OiBzdHJpbmcpID0+IGJvb2xlYW4sXHJcbiAgICBpc1NraXBTaGVldFJvdz86IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbixcclxuICAgIGlzU2tpcFNoZWV0Q29sPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZykgPT4gYm9vbGVhbikge1xyXG4gICAgY29uc3Qgc2hlZXRSZWY6IHN0cmluZyA9IHNoZWV0WychcmVmJ11cclxuICAgIGNvbnN0IG1heFJvd051bSA9IHBhcnNlSW50KHNoZWV0UmVmLm1hdGNoKC9cXGQrJC8pWzBdKTtcclxuXHJcbiAgICBjb25zdCBtYXhDb2xLZXkgPSBzaGVldFJlZi5zcGxpdChcIjpcIilbMV0ubWF0Y2goL15bQS1aYS16XSsvKVswXTtcclxuICAgIGNvbnN0IG1heENvbEtleUNvZGVTdW0gPSBnZXRDaGFyQ29kZVN1bShtYXhDb2xLZXkpO1xyXG4gICAgbGV0IGNvbENoYXJDb2RlczogbnVtYmVyW107XHJcbiAgICBsZXQgY29sS2V5OiBzdHJpbmc7XHJcbiAgICBjb2xDaGFyQ29kZXMgPSBzdHJpbmdUb0NoYXJDb2RlcyhzdGFydENvbCk7XHJcbiAgICBsZXQgY3VyQ29sQ29kZVN1bTogbnVtYmVyID0gMDtcclxuICAgIGNvbEtleSA9IHN0YXJ0Q29sO1xyXG4gICAgbGV0IGhhc05leHRDb2wgPSBpc1NoZWV0Q29sRW5kID8gIWlzU2hlZXRDb2xFbmQoc2hlZXQsIGNvbEtleSkgOiB0cnVlO1xyXG4gICAgd2hpbGUgKGhhc05leHRDb2wpIHtcclxuICAgICAgICBpZiAoIShpc1NraXBTaGVldENvbCA/IGlzU2tpcFNoZWV0Q29sKHNoZWV0LCBjb2xLZXkpIDogZmFsc2UpKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBzdGFydFJvdzsgaSA8PSBtYXhSb3dOdW07IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2hlZXRSb3dFbmQgPyBpc1NoZWV0Um93RW5kKHNoZWV0LCBpKSA6IGZhbHNlKSBicmVhaztcclxuICAgICAgICAgICAgICAgIGlmIChpc1NraXBTaGVldFJvdyA/IGlzU2tpcFNoZWV0Um93KHNoZWV0LCBpKSA6IGZhbHNlKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNoZWV0LCBjb2xLZXksIGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb2xLZXkgPSBnZXROZXh0Q29sS2V5KGNvbENoYXJDb2Rlcyk7XHJcbiAgICAgICAgY3VyQ29sQ29kZVN1bSA9IGdldENoYXJDb2RlU3VtKGNvbEtleSk7XHJcbiAgICAgICAgaWYgKG1heENvbEtleUNvZGVTdW0gPj0gY3VyQ29sQ29kZVN1bSkge1xyXG4gICAgICAgICAgICBoYXNOZXh0Q29sID0gaXNTaGVldENvbEVuZCA/ICFpc1NoZWV0Q29sRW5kKHNoZWV0LCBjb2xLZXkpIDogdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYXNOZXh0Q29sID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn1cclxubGV0IGNvbEtleVN1bU1hcCA9IHt9O1xyXG5mdW5jdGlvbiBnZXRDaGFyQ29kZVN1bShjb2xLZXk6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICBsZXQgc3VtOiBudW1iZXIgPSBjb2xLZXlTdW1NYXBbY29sS2V5XTtcclxuICAgIGlmICghc3VtKSB7XHJcbiAgICAgICAgc3VtID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbEtleS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBzdW0gKz0gY29sS2V5LmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbEtleVN1bU1hcFtjb2xLZXldID0gc3VtO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN1bTtcclxufVxyXG4vKipcclxuICog6K+75Y+W6YWN572u6KGo5paH5Lu2IOWQjOatpeeahFxyXG4gKiBAcGFyYW0gZmlsZUluZm8gXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmVhZFRhYmxlRmlsZShmaWxlSW5mbzogSUZpbGVJbmZvKTogeGxzeC5Xb3JrQm9vayB7XHJcbiAgICBjb25zdCB3b3JrQm9vayA9IHhsc3gucmVhZEZpbGUoZmlsZUluZm8uZmlsZVBhdGgsIHt0eXBlOiBpc0NTVihmaWxlSW5mby5maWxlRXh0TmFtZSkgPyBcInN0cmluZ1wiIDogXCJmaWxlXCJ9KTtcclxuICAgIHJldHVybiB3b3JrQm9vaztcclxufVxyXG4vKipcclxuICog5qC55o2u5paH5Lu25ZCN5ZCO57yA5Yik5pat5piv5ZCm5Li6Y3N25paH5Lu2XHJcbiAqIEBwYXJhbSBmaWxlRXh0TmFtZSBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0NTVihmaWxlRXh0TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gZmlsZUV4dE5hbWUgPT09IFwiY3N2XCI7XHJcbn0iLCJpbXBvcnQge0RlZmF1bHRQYXJzZUhhbmRsZXJ9IGZyb20gJy4vZGVmYXVsdC1wYXJzZS1oYW5kbGVyJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgKiBhcyB3dCBmcm9tIFwid29ya2VyX3RocmVhZHNcIjtcclxuXHJcblxyXG4oYXN5bmMgZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc3Qgd29ya2VyRGF0YTogSVdvcmtlclNoYXJlRGF0YSA9IHd0LndvcmtlckRhdGE7XHJcbiAgICBjb25zdCBmaWxlSW5mb3MgPSB3b3JrZXJEYXRhLmZpbGVJbmZvcztcclxuICAgIGNvbnN0IHBhcnNlUmVzdWx0TWFwID0gd29ya2VyRGF0YS5wYXJzZVJlc3VsdE1hcDtcclxuICAgIGNvbnN0IHBhcnNlQ29uZmlnID0gd29ya2VyRGF0YS5wYXJzZUNvbmZpZztcclxuICAgIGxldCBwYXJzZUhhbmRsZXI6IElUYWJsZVBhcnNlSGFuZGxlcjtcclxuICAgIGlmIChwYXJzZUNvbmZpZy5jdXN0b21QYXJzZUhhbmRsZXJQYXRoKSB7XHJcbiAgICAgICAgaWYgKCFwYXRoLmlzQWJzb2x1dGUocGFyc2VDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aCkpIHtcclxuICAgICAgICAgICAgcGFyc2VDb25maWcuY3VzdG9tUGFyc2VIYW5kbGVyUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIHBhcnNlQ29uZmlnLmN1c3RvbVBhcnNlSGFuZGxlclBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXJzZUhhbmRsZXIgPSAoYXdhaXQgaW1wb3J0KHBhcnNlQ29uZmlnLmN1c3RvbVBhcnNlSGFuZGxlclBhdGgpKTtcclxuICAgIH1cclxuICAgIGlmIChwYXJzZUhhbmRsZXIpIHtcclxuICAgICAgICBwYXJzZUhhbmRsZXIgPSBuZXcgRGVmYXVsdFBhcnNlSGFuZGxlcigpXHJcbiAgICB9XHJcbiAgICBjb25zdCBkb1BhcnNlID0gKGF3YWl0IGltcG9ydChcIi4vZG8tcGFyc2VcIikpLmRvUGFyc2U7XHJcbiAgICBkb1BhcnNlKGZpbGVJbmZvcywgcGFyc2VSZXN1bHRNYXAsIHBhcnNlSGFuZGxlcik7XHJcbiAgICB3dC5wYXJlbnRQb3J0LnBvc3RNZXNzYWdlKHt0aHJlYWRJZDogd29ya2VyRGF0YS50aHJlYWRJZCwgcGFyc2VSZXN1bHRNYXA6IHBhcnNlUmVzdWx0TWFwfSk7XHJcbn0pKClcclxuXHJcbiIsIlxyXG5pbXBvcnQgKiBhcyB4bHN4IGZyb20gXCJ4bHN4XCI7XHJcbmltcG9ydCB7dmFsdWVUcmFuc0Z1bmNNYXB9IGZyb20gJy4nO1xyXG5pbXBvcnQge2hvcml6b250YWxGb3JFYWNoU2hlZXQsIGlzRW1wdHlDZWxsLCByZWFkVGFibGVGaWxlLCB2ZXJ0aWNhbEZvckVhY2hTaGVldH0gZnJvbSAnLi90YWJsZS11dGlscyc7XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBpbnRlcmZhY2UgSVRhYmxlRmllbGQge1xyXG4gICAgICAgIC8qKumFjee9ruihqOS4reazqOmHiuWAvCAqL1xyXG4gICAgICAgIHRleHQ6IHN0cmluZ1xyXG4gICAgICAgIC8qKumFjee9ruihqOS4reexu+Wei+WAvCAqL1xyXG4gICAgICAgIG9yaWdpblR5cGU6IHN0cmluZyxcclxuICAgICAgICAvKirphY3nva7ooajkuK3lrZfmrrXlkI3lgLwgKi9cclxuICAgICAgICBvcmlnaW5GaWVsZE5hbWU6IHN0cmluZ1xyXG4gICAgICAgIC8qKuino+aekOWQjueahOexu+Wei+WAvCAqL1xyXG4gICAgICAgIHR5cGU/OiBzdHJpbmcsXHJcbiAgICAgICAgLyoq6Kej5p6Q5ZCO55qE5a2Q57G75Z6L5YC8ICovXHJcbiAgICAgICAgc3ViVHlwZT86IHN0cmluZ1xyXG4gICAgICAgIC8qKuino+aekOWQjueahOWtl+auteWQjeWAvCAqL1xyXG4gICAgICAgIGZpZWxkTmFtZT86IHN0cmluZyxcclxuICAgICAgICAvKirlr7nosaHnmoTlrZDlrZfmrrXlkI0gKi9cclxuICAgICAgICBzdWJGaWVsZE5hbWU/OiBzdHJpbmcsXHJcbiAgICAgICAgLyoq5aSa5YiX5a+56LGhICovXHJcbiAgICAgICAgaXNNdXRpQ29sT2JqPzogYm9vbGVhbjtcclxuICAgIH1cclxuICAgIGludGVyZmFjZSBJVGFibGVEZWZpbmUge1xyXG4gICAgICAgIC8qKumFjee9ruihqOWQjSAqL1xyXG4gICAgICAgIHRhYmxlTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIC8qKumFjee9ruihqOexu+WeiyDpu5jorqTkuKTnp406IHZlcnRpY2FsIOWSjCBob3Jpem9udGFsKi9cclxuICAgICAgICB0YWJsZVR5cGU6IHN0cmluZ1xyXG5cclxuICAgICAgICAvKirlvIDlp4vooYzku44x5byA5aeLICovXHJcbiAgICAgICAgc3RhcnRSb3c6IG51bWJlcixcclxuICAgICAgICAvKirlvIDlp4vliJfku45B5byA5aeLICovXHJcbiAgICAgICAgc3RhcnRDb2w6IHN0cmluZyxcclxuICAgICAgICAvKirlnoLnm7Top6PmnpDlrZfmrrXlrprkuYkgKi9cclxuICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lOiBJVmVydGljYWxGaWVsZERlZmluZSxcclxuICAgICAgICAvKirmqKrlkJHop6PmnpDlrZfmrrXlrprkuYkgKi9cclxuICAgICAgICBob3Jpem9udGFsRmllbGREZWZpbmU6IElIb3Jpem9udGFsRmllbGREZWZpbmVcclxuXHJcbiAgICB9XHJcbiAgICBpbnRlcmZhY2UgSUhvcml6b250YWxGaWVsZERlZmluZSB7XHJcbiAgICAgICAgLyoq57G75Z6L6KGMICovXHJcbiAgICAgICAgdHlwZUNvbDogc3RyaW5nLFxyXG4gICAgICAgIC8qKuWtl+auteWQjeihjCAqL1xyXG4gICAgICAgIGZpZWxkQ29sOiBzdHJpbmcsXHJcbiAgICAgICAgLyoq5rOo6YeK6KGMICovXHJcbiAgICAgICAgdGV4dENvbDogc3RyaW5nLFxyXG4gICAgfVxyXG4gICAgaW50ZXJmYWNlIElWZXJ0aWNhbEZpZWxkRGVmaW5lIHtcclxuICAgICAgICAvKirnsbvlnovooYwgKi9cclxuICAgICAgICB0eXBlUm93OiBudW1iZXIsXHJcbiAgICAgICAgLyoq5a2X5q615ZCN6KGMICovXHJcbiAgICAgICAgZmllbGRSb3c6IG51bWJlcixcclxuICAgICAgICAvKirms6jph4rooYwgKi9cclxuICAgICAgICB0ZXh0Um93OiBudW1iZXIsXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWtl+auteWtl+WFuFxyXG4gICAgICoga2V55piv5YiXY29sS2V5XHJcbiAgICAgKiB2YWx1ZeaYr+Wtl+auteWvueixoVxyXG4gICAgICovXHJcbiAgICB0eXBlIENvbEtleVRhYmxlRmllbGRNYXAgPSB7W2tleTogc3RyaW5nXTogSVRhYmxlRmllbGR9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIOihqOagvOeahOS4gOihjOaIluiAheS4gOWIl1xyXG4gICAgICoga2V55Li65a2X5q615ZCN5YC877yMdmFsdWXkuLrooajmoLznmoTkuIDmoLxcclxuICAgICAqL1xyXG4gICAgdHlwZSBUYWJsZVJvd09yQ29sID0ge1trZXk6IHN0cmluZ106IElUYWJsZUNlbGx9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDooajmoLznmoTkuIDmoLxcclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElUYWJsZUNlbGwge1xyXG4gICAgICAgIC8qKuWtl+auteWvueixoSAqL1xyXG4gICAgICAgIGZpbGVkOiBJVGFibGVGaWVsZCxcclxuICAgICAgICAvKirlgLwgKi9cclxuICAgICAgICB2YWx1ZTogYW55XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOihqOagvOihjOaIluWIl+eahOWtl+WFuFxyXG4gICAgICoga2V55Li66KGM57Si5byV77yMdmFsdWXkuLrooajmoLznmoTkuIDooYxcclxuICAgICAqL1xyXG4gICAgdHlwZSBUYWJsZVJvd09yQ29sTWFwID0ge1trZXk6IHN0cmluZ106IFRhYmxlUm93T3JDb2x9XHJcbiAgICAvKipcclxuICAgICAqIOihqOagvOihjOaIluWIl+WAvOaVsOe7hFxyXG4gICAgICoga2V55Li76ZSu77yMdmFsdWXmmK/lgLzmlbDnu4RcclxuICAgICAqL1xyXG4gICAgdHlwZSBSb3dPckNvbFZhbHVlc01hcCA9IHtba2V5OiBzdHJpbmddOiBhbnlbXX07XHJcbiAgICBpbnRlcmZhY2UgSVRhYmxlVmFsdWVzIHtcclxuICAgICAgICAvKirlrZfmrrXlkI3mlbDnu4QgKi9cclxuICAgICAgICBmaWVsZHM6IHN0cmluZ1tdLFxyXG4gICAgICAgIC8qKuihqOagvOWAvOaVsOe7hCAqL1xyXG4gICAgICAgIHJvd09yQ29sVmFsdWVzTWFwOiBSb3dPckNvbFZhbHVlc01hcFxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDop6PmnpDnu5PmnpxcclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElUYWJsZVBhcnNlUmVzdWx0IHtcclxuICAgICAgICAvKirphY3nva7ooajlrprkuYkgKi9cclxuICAgICAgICB0YWJsZURlZmluZT86IElUYWJsZURlZmluZTtcclxuICAgICAgICAvKirlvZPliY3liIbooajlkI0gKi9cclxuICAgICAgICBjdXJTaGVldE5hbWU/OiBzdHJpbmcsXHJcbiAgICAgICAgLyoq5a2X5q615a2X5YW4ICovXHJcbiAgICAgICAgZmlsZWRNYXA/OiBDb2xLZXlUYWJsZUZpZWxkTWFwLFxyXG4gICAgICAgIC8vIC8qKuihqOagvOihjOaIluWIl+eahOWtl+WFuCAqL1xyXG4gICAgICAgIC8vIHJvd09yQ29sTWFwOiBUYWJsZVJvd09yQ29sTWFwXHJcbiAgICAgICAgLyoq5Y2V5Liq6KGo5qC85a+56LGhICovXHJcbiAgICAgICAgLyoqa2V55piv5Li76ZSu5YC877yMdmFsdWXmmK/kuIDooYzlr7nosaEgKi9cclxuICAgICAgICB0YWJsZU9iaj86IHtba2V5OiBzdHJpbmddOiBhbnl9O1xyXG4gICAgICAgIC8qKuW9k+WJjeihjOaIluWIl+WvueixoSAqL1xyXG4gICAgICAgIGN1clJvd09yQ29sT2JqPzogYW55XHJcbiAgICAgICAgLyoq5Li76ZSu5YC8ICovXHJcbiAgICAgICAgbWFpbktleUZpZWxkTmFtZT86IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICAvKirlgLzovazmjaLmlrnms5UgKi9cclxuICAgIGludGVyZmFjZSBJVHJhbnNWYWx1ZVJlc3VsdCB7ZXJyb3I/OiBhbnksIHZhbHVlPzogYW55fVxyXG4gICAgdHlwZSBWYWx1ZVRyYW5zRnVuYyA9IChmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IGFueSkgPT4gSVRyYW5zVmFsdWVSZXN1bHQ7XHJcbiAgICAvKipcclxuICAgICAqIOWAvOi9rOaNouaWueazleWtl+WFuFxyXG4gICAgICoga2V55piv57G75Z6La2V5XHJcbiAgICAgKiB2YWx1ZeaYr+aWueazlVxyXG4gICAgICovXHJcbiAgICB0eXBlIFZhbHVlVHJhbnNGdW5jTWFwID0ge1trZXk6IHN0cmluZ106IFZhbHVlVHJhbnNGdW5jfVxyXG59XHJcbmV4cG9ydCBlbnVtIFRhYmxlVHlwZSB7XHJcbiAgICB2ZXJ0aWNhbCA9IFwidmVydGljYWxcIixcclxuICAgIGhvcml6b250YWwgPSBcImhvcml6b250YWxcIlxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBhcnNlSGFuZGxlciBpbXBsZW1lbnRzIElUYWJsZVBhcnNlSGFuZGxlciB7XHJcbiAgICBwcml2YXRlIF92YWx1ZVRyYW5zRnVuY01hcDogVmFsdWVUcmFuc0Z1bmNNYXA7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl92YWx1ZVRyYW5zRnVuY01hcCA9IHZhbHVlVHJhbnNGdW5jTWFwO1xyXG4gICAgfVxyXG4gICAgZ2V0VGFibGVEZWZpbmUoZmlsZUluZm86IElGaWxlSW5mbywgd29ya0Jvb2s6IHhsc3guV29ya0Jvb2spOiBJVGFibGVEZWZpbmUge1xyXG4gICAgICAgIC8v5Y+W6KGo5qC85paH5Lu25ZCN5Li66KGo5qC85ZCNXHJcbiAgICAgICAgY29uc3QgdGFibGVOYW1lID0gZmlsZUluZm8uZmlsZU5hbWU7XHJcblxyXG4gICAgICAgIGNvbnN0IHRhYmxlRGVmaW5lOiBQYXJ0aWFsPElUYWJsZURlZmluZT4gPSB7XHJcbiAgICAgICAgICAgIHRhYmxlTmFtZTogdGFibGVOYW1lXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNlbGxLZXk6IHN0cmluZztcclxuICAgICAgICBsZXQgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0O1xyXG4gICAgICAgIC8v5Y+W56ys5LiA5Liq6KGoXHJcbiAgICAgICAgY29uc3Qgc2hlZXROYW1lcyA9IHdvcmtCb29rLlNoZWV0TmFtZXM7XHJcbiAgICAgICAgbGV0IHNoZWV0OiB4bHN4LlNoZWV0O1xyXG4gICAgICAgIGxldCBmaXJzdENlbGxWYWx1ZToge3RhYmxlTmFtZUluU2hlZXQ6IHN0cmluZywgdGFibGVUeXBlOiBzdHJpbmd9XHJcbiAgICAgICAgbGV0IGZpcnN0Q2VsbE9iajogeGxzeC5DZWxsT2JqZWN0O1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hlZXROYW1lcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBzaGVldCA9IHdvcmtCb29rLlNoZWV0c1tzaGVldE5hbWVzW2ldXTtcclxuICAgICAgICAgICAgZmlyc3RDZWxsT2JqID0gc2hlZXRbXCJBXCIgKyAxXTtcclxuICAgICAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChmaXJzdENlbGxPYmopKSB7XHJcbiAgICAgICAgICAgICAgICBmaXJzdENlbGxWYWx1ZSA9IHRoaXMuX2dldEZpcnN0Q2VsbFZhbHVlKGZpcnN0Q2VsbE9iaik7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RDZWxsVmFsdWUgJiYgZmlyc3RDZWxsVmFsdWUudGFibGVOYW1lSW5TaGVldCA9PT0gdGFibGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFmaXJzdENlbGxWYWx1ZSB8fCBmaXJzdENlbGxWYWx1ZS50YWJsZU5hbWVJblNoZWV0ICE9PSB0YWJsZU5hbWUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg6KGo5qC85LiN6KeE6IyDLOi3s+i/h+ino+aekCzot6/lvoQ6JHtmaWxlSW5mby5maWxlUGF0aH1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9IGZpcnN0Q2VsbFZhbHVlLnRhYmxlVHlwZTtcclxuICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcclxuICAgICAgICAgICAgdGFibGVEZWZpbmUudmVydGljYWxGaWVsZERlZmluZSA9IHt9IGFzIGFueTtcclxuICAgICAgICAgICAgY29uc3QgdmVydGljYWxGaWVsZERlZmluZTogSVZlcnRpY2FsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS52ZXJ0aWNhbEZpZWxkRGVmaW5lO1xyXG4gICAgICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnRleHRSb3cgPSAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IDEwMDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjZWxsS2V5ID0gXCJBXCIgKyBpO1xyXG4gICAgICAgICAgICAgICAgY2VsbE9iaiA9IHNoZWV0W2NlbGxLZXldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzRW1wdHlDZWxsKGNlbGxPYmopIHx8IGNlbGxPYmoudiA9PT0gXCJOT1wiIHx8IGNlbGxPYmoudiA9PT0gXCJFTkRcIiB8fCBjZWxsT2JqLnYgPT09IFwiU1RBUlRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Um93ID0gaTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2VsbE9iai52ID09PSBcIkNMSUVOVFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWxGaWVsZERlZmluZS5maWVsZFJvdyA9IGk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNlbGxPYmoudiA9PT0gXCJUWVBFXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3cgPSBpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRhYmxlRGVmaW5lLnN0YXJ0Um93ICYmIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3cgJiYgdmVydGljYWxGaWVsZERlZmluZS50eXBlUm93KSBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRDb2wgPSBcIkJcIjtcclxuICAgICAgICB9IGVsc2UgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcclxuICAgICAgICAgICAgdGFibGVEZWZpbmUuaG9yaXpvbnRhbEZpZWxkRGVmaW5lID0ge30gYXMgYW55O1xyXG4gICAgICAgICAgICBjb25zdCBob3Jpem9udGFsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS5ob3Jpem9udGFsRmllbGREZWZpbmU7XHJcbiAgICAgICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZS50ZXh0Q29sID0gXCJBXCI7XHJcbiAgICAgICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZS50eXBlQ29sID0gXCJCXCI7XHJcbiAgICAgICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZS5maWVsZENvbCA9IFwiQ1wiO1xyXG4gICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydENvbCA9IFwiRVwiO1xyXG4gICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydFJvdyA9IDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGFibGVEZWZpbmUgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfZ2V0Rmlyc3RDZWxsVmFsdWUoZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QpIHtcclxuICAgICAgICBpZiAoIWZpcnN0Q2VsbE9iaikgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZXMgPSAoZmlyc3RDZWxsT2JqLnYgYXMgc3RyaW5nKS5zcGxpdChcIjpcIik7XHJcbiAgICAgICAgbGV0IHRhYmxlTmFtZUluU2hlZXQ6IHN0cmluZztcclxuICAgICAgICBsZXQgdGFibGVUeXBlOiBzdHJpbmc7XHJcbiAgICAgICAgaWYgKGNlbGxWYWx1ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICB0YWJsZU5hbWVJblNoZWV0ID0gY2VsbFZhbHVlc1sxXTtcclxuICAgICAgICAgICAgdGFibGVUeXBlID0gY2VsbFZhbHVlc1swXSA9PT0gXCJIXCIgPyBUYWJsZVR5cGUuaG9yaXpvbnRhbCA6IFRhYmxlVHlwZS52ZXJ0aWNhbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0YWJsZU5hbWVJblNoZWV0ID0gY2VsbFZhbHVlc1swXTtcclxuICAgICAgICAgICAgdGFibGVUeXBlID0gVGFibGVUeXBlLnZlcnRpY2FsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge3RhYmxlTmFtZUluU2hlZXQ6IHRhYmxlTmFtZUluU2hlZXQsIHRhYmxlVHlwZTogdGFibGVUeXBlfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliKTmlq3ooajmoLzmmK/lkKbog73op6PmnpBcclxuICAgICAqIEBwYXJhbSBzaGVldCBcclxuICAgICAqL1xyXG4gICAgY2hlY2tTaGVldENhblBhcnNlKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCBzaGVldE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8v5aaC5p6c6L+Z5Liq6KGo5Liq56ys5LiA5qC85YC85LiN562J5LqO6KGo5ZCN77yM5YiZ5LiN6Kej5p6QXHJcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtcIkFcIiArIDFdO1xyXG4gICAgICAgIGNvbnN0IGZpcnN0Q2VsbFZhbHVlID0gdGhpcy5fZ2V0Rmlyc3RDZWxsVmFsdWUoZmlyc3RDZWxsT2JqKTtcclxuICAgICAgICBpZiAoZmlyc3RDZWxsT2JqICYmIHRhYmxlRGVmaW5lKSB7XHJcbiAgICAgICAgICAgIGlmIChmaXJzdENlbGxWYWx1ZS50YWJsZU5hbWVJblNoZWV0ICE9PSB0YWJsZURlZmluZS50YWJsZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6KGo6KGM57uT5p2f5Yik5patXHJcbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmUgXHJcbiAgICAgKiBAcGFyYW0gc2hlZXQgXHJcbiAgICAgKiBAcGFyYW0gcm93IFxyXG4gICAgICovXHJcbiAgICBpc1NoZWV0Um93RW5kKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCByb3c6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xyXG5cclxuICAgICAgICAvLyB9IGVsc2UgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcclxuXHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8v5Yik5pat5LiK5LiA6KGM55qE5qCH5b+X5piv5ZCm5Li6RU5EXHJcbiAgICAgICAgaWYgKHJvdyA+IDEpIHtcclxuICAgICAgICAgICAgcm93ID0gcm93IC0gMTtcclxuICAgICAgICAgICAgY29uc3QgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbXCJBXCIgKyByb3ddO1xyXG4gICAgICAgICAgICByZXR1cm4gY2VsbE9iaiAmJiBjZWxsT2JqLnYgPT09IFwiRU5EXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6KGo5YiX57uT5p2f5Yik5patXHJcbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmUgXHJcbiAgICAgKiBAcGFyYW0gc2hlZXQgXHJcbiAgICAgKiBAcGFyYW0gY29sS2V5IFxyXG4gICAgICovXHJcbiAgICBpc1NoZWV0Q29sRW5kKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8v5Yik5pat6L+Z5LiA5YiX56ys5LiA6KGM5piv5ZCm5Li656m6XHJcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyAxXTtcclxuICAgICAgICAvLyBjb25zdCB0eXBlQ2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgdGFibGVGaWxlLnRhYmxlRGVmaW5lLnR5cGVSb3ddO1xyXG4gICAgICAgIHJldHVybiBpc0VtcHR5Q2VsbChmaXJzdENlbGxPYmopO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6XooYzmmK/lkKbpnIDopoHop6PmnpBcclxuICAgICAqIEBwYXJhbSB0YWJsZURlZmluZSBcclxuICAgICAqIEBwYXJhbSBzaGVldCBcclxuICAgICAqIEBwYXJhbSByb3dJbmRleCBcclxuICAgICAqL1xyXG4gICAgY2hlY2tSb3dOZWVkUGFyc2UodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgY29uc3QgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbXCJBXCIgKyByb3dJbmRleF07XHJcbiAgICAgICAgaWYgKGNlbGxPYmogJiYgY2VsbE9iai52ID09PSBcIk5PXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6Kej5p6Q5Y2V5Liq5qC85a2QXHJcbiAgICAgKiBAcGFyYW0gdGFibGVQYXJzZVJlc3VsdCBcclxuICAgICAqIEBwYXJhbSBzaGVldCBcclxuICAgICAqIEBwYXJhbSBjb2xLZXkgXHJcbiAgICAgKiBAcGFyYW0gcm93SW5kZXggXHJcbiAgICAgKiBAcGFyYW0gaXNOZXdSb3dPckNvbCDmmK/lkKbkuLrmlrDnmoTkuIDooYzmiJbogIXkuIDliJdcclxuICAgICAqL1xyXG4gICAgcGFyc2VWZXJ0aWNhbENlbGwodGFibGVQYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsIHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlciwgaXNOZXdSb3dPckNvbDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGZpZWxkSW5mbyA9IHRoaXMuZ2V0VmVydGljYWxUYWJsZUZpZWxkKHRhYmxlUGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4KTtcclxuICAgICAgICBpZiAoIWZpZWxkSW5mbykgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGNlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHJvd0luZGV4XTtcclxuICAgICAgICBpZiAoaXNFbXB0eUNlbGwoY2VsbCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdHJhbnNSZXN1bHQgPSB0aGlzLnRyYW5zVmFsdWUodGFibGVQYXJzZVJlc3VsdCwgZmllbGRJbmZvLCBjZWxsLnYpO1xyXG4gICAgICAgIGlmICh0cmFuc1Jlc3VsdC5lcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDooajmoLw6JHt0YWJsZVBhcnNlUmVzdWx0LmZpbGVQYXRofSzliIbooag6JHt0YWJsZVBhcnNlUmVzdWx0LmN1clNoZWV0TmFtZX0s6KGMOiR7cm93SW5kZXh9LOWIl++8miR7Y29sS2V5feino+aekOWHuumUmWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0cmFuc2VkVmFsdWUgPSB0cmFuc1Jlc3VsdC52YWx1ZTtcclxuICAgICAgICBsZXQgbWFpbktleUZpZWxkTmFtZTogc3RyaW5nID0gdGFibGVQYXJzZVJlc3VsdC5tYWluS2V5RmllbGROYW1lO1xyXG4gICAgICAgIGlmICghbWFpbktleUZpZWxkTmFtZSkge1xyXG4gICAgICAgICAgICAvL+esrOS4gOS4quWtl+auteWwseaYr+S4u+mUrlxyXG4gICAgICAgICAgICBtYWluS2V5RmllbGROYW1lID0gZmllbGRJbmZvLmZpZWxkTmFtZTtcclxuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5tYWluS2V5RmllbGROYW1lID0gZmllbGRJbmZvLmZpZWxkTmFtZTtcclxuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9iaiA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcm93T3JDb2xPYmo6IGFueSA9IHRhYmxlUGFyc2VSZXN1bHQuY3VyUm93T3JDb2xPYmo7XHJcbiAgICAgICAgaWYgKGlzTmV3Um93T3JDb2wpIHtcclxuICAgICAgICAgICAgLy/mlrDnmoTkuIDooYxcclxuICAgICAgICAgICAgcm93T3JDb2xPYmogPSB7fTtcclxuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5jdXJSb3dPckNvbE9iaiA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbdHJhbnNlZFZhbHVlXSA9IHJvd09yQ29sT2JqO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgIGlmIChmaWVsZEluZm8uaXNNdXRpQ29sT2JqKSB7XHJcbiAgICAgICAgICAgIGxldCBzdWJPYmogPSByb3dPckNvbE9ialtmaWVsZEluZm8uZmllbGROYW1lXTtcclxuICAgICAgICAgICAgaWYgKCFzdWJPYmopIHtcclxuICAgICAgICAgICAgICAgIHN1Yk9iaiA9IHt9O1xyXG4gICAgICAgICAgICAgICAgcm93T3JDb2xPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSBzdWJPYmo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3ViT2JqW2ZpZWxkSW5mby5zdWJGaWVsZE5hbWVdID0gdHJhbnNlZFZhbHVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJvd09yQ29sT2JqW2ZpZWxkSW5mby5maWVsZE5hbWVdID0gdHJhbnNlZFZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOino+aekOaoquWQkeWNleS4quagvOWtkFxyXG4gICAgICogQHBhcmFtIHRhYmxlUGFyc2VSZXN1bHQgXHJcbiAgICAgKiBAcGFyYW0gc2hlZXQgXHJcbiAgICAgKiBAcGFyYW0gY29sS2V5IFxyXG4gICAgICogQHBhcmFtIHJvd0luZGV4IFxyXG4gICAgICogQHBhcmFtIGlzTmV3Um93T3JDb2wg5piv5ZCm5Li65paw55qE5LiA6KGM5oiW6ICF5LiA5YiXXHJcbiAgICAgKi9cclxuICAgIHBhcnNlSG9yaXpvbnRhbENlbGwodGFibGVQYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsIHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlciwgaXNOZXdSb3dPckNvbDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGZpZWxkSW5mbyA9IHRoaXMuZ2V0SG9yaXpvbnRhbFRhYmxlRmllbGQodGFibGVQYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgpO1xyXG4gICAgICAgIGlmICghZmllbGRJbmZvKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgY2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgcm93SW5kZXhdO1xyXG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRyYW5zZWRWYWx1ZSA9IHRoaXMudHJhbnNWYWx1ZSh0YWJsZVBhcnNlUmVzdWx0LCBmaWVsZEluZm8sIGNlbGwudik7XHJcbiAgICAgICAgaWYgKCF0YWJsZVBhcnNlUmVzdWx0LnRhYmxlT2JqKSB7XHJcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmogPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZpZWxkSW5mby5pc011dGlDb2xPYmopIHtcclxuICAgICAgICAgICAgbGV0IHN1Yk9iaiA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV07XHJcbiAgICAgICAgICAgIGlmICghc3ViT2JqKSB7XHJcbiAgICAgICAgICAgICAgICBzdWJPYmogPSB7fTtcclxuICAgICAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSBzdWJPYmo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3ViT2JqW2ZpZWxkSW5mby5zdWJGaWVsZE5hbWVdID0gdHJhbnNlZFZhbHVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSB0cmFuc2VkVmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6Kej5p6Q5Ye65a2X5q615a+56LGhXHJcbiAgICAgKiBAcGFyYW0gdGFibGVQYXJzZVJlc3VsdCBcclxuICAgICAqIEBwYXJhbSBzaGVldCBcclxuICAgICAqIEBwYXJhbSBjb2xLZXkgXHJcbiAgICAgKiBAcGFyYW0gcm93SW5kZXggXHJcbiAgICAgKi9cclxuICAgIGdldFZlcnRpY2FsVGFibGVGaWVsZCh0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCwgc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKTogSVRhYmxlRmllbGQge1xyXG4gICAgICAgIGNvbnN0IHRhYmxlRGVmaW5lID0gdGFibGVQYXJzZVJlc3VsdC50YWJsZURlZmluZTtcclxuICAgICAgICBsZXQgdGFibGVGaWxlZE1hcCA9IHRhYmxlUGFyc2VSZXN1bHQuZmlsZWRNYXA7XHJcbiAgICAgICAgaWYgKCF0YWJsZUZpbGVkTWFwKSB7XHJcbiAgICAgICAgICAgIHRhYmxlRmlsZWRNYXAgPSB7fTtcclxuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5maWxlZE1hcCA9IHRhYmxlRmlsZWRNYXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHZlcnRpY2FsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS52ZXJ0aWNhbEZpZWxkRGVmaW5lO1xyXG4gICAgICAgIGNvbnN0IGZpbGVkQ2VsbCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3ddO1xyXG4gICAgICAgIGxldCBvcmlnaW5GaWVsZE5hbWU6IHN0cmluZztcclxuICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGZpbGVkQ2VsbCkpIHtcclxuICAgICAgICAgICAgb3JpZ2luRmllbGROYW1lID0gZmlsZWRDZWxsLnYgYXMgc3RyaW5nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW9yaWdpbkZpZWxkTmFtZSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgbGV0IGZpZWxkOiBJVGFibGVGaWVsZCA9IHt9IGFzIGFueTtcclxuICAgICAgICAvL+e8k+WtmFxyXG4gICAgICAgIGlmICh0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV0gIT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/ms6jph4pcclxuICAgICAgICBjb25zdCB0ZXh0Q2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS50ZXh0Um93XTtcclxuICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKHRleHRDZWxsKSkge1xyXG4gICAgICAgICAgICBmaWVsZC50ZXh0ID0gdGV4dENlbGwudiBhcyBzdHJpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v57G75Z6LXHJcbiAgICAgICAgbGV0IGlzT2JqVHlwZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHR5cGVDZWxsID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS50eXBlUm93XTtcclxuXHJcbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKHR5cGVDZWxsKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWVsZC5vcmlnaW5UeXBlID0gdHlwZUNlbGwudiBhcyBzdHJpbmc7XHJcbiAgICAgICAgICAgIGlmIChmaWVsZC5vcmlnaW5UeXBlLmluY2x1ZGVzKFwibWY6XCIpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlU3RycyA9IGZpZWxkLm9yaWdpblR5cGUuc3BsaXQoXCI6XCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVTdHJzLmxlbmd0aCA8IDMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZpZWxkLnR5cGUgPSB0eXBlU3Ryc1syXTtcclxuICAgICAgICAgICAgICAgIGlzT2JqVHlwZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gZmllbGQub3JpZ2luVHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmaWVsZC5pc011dGlDb2xPYmogPSBpc09ialR5cGU7XHJcbiAgICAgICAgLy/lrZfmrrXlkI1cclxuICAgICAgICBmaWVsZC5vcmlnaW5GaWVsZE5hbWUgPSBvcmlnaW5GaWVsZE5hbWU7XHJcbiAgICAgICAgaWYgKGlzT2JqVHlwZSkge1xyXG4gICAgICAgICAgICBjb25zdCBmaWVsZFN0cnMgPSBmaWVsZC5vcmlnaW5GaWVsZE5hbWUuc3BsaXQoXCI6XCIpO1xyXG4gICAgICAgICAgICBpZiAoZmllbGRTdHJzLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkU3Ryc1swXTtcclxuICAgICAgICAgICAgZmllbGQuc3ViRmllbGROYW1lID0gZmllbGRTdHJzWzFdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkLm9yaWdpbkZpZWxkTmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRhYmxlRmlsZWRNYXBbY29sS2V5XSA9IGZpZWxkO1xyXG4gICAgICAgIHJldHVybiBmaWVsZDtcclxuICAgIH1cclxuICAgIGdldEhvcml6b250YWxUYWJsZUZpZWxkKHRhYmxlUGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LCBzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpOiBJVGFibGVGaWVsZCB7XHJcbiAgICAgICAgY29uc3QgdGFibGVEZWZpbmUgPSB0YWJsZVBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lO1xyXG4gICAgICAgIGxldCB0YWJsZUZpbGVkTWFwID0gdGFibGVQYXJzZVJlc3VsdC5maWxlZE1hcDtcclxuICAgICAgICBpZiAoIXRhYmxlRmlsZWRNYXApIHtcclxuICAgICAgICAgICAgdGFibGVGaWxlZE1hcCA9IHt9O1xyXG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LmZpbGVkTWFwID0gdGFibGVGaWxlZE1hcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUuaG9yaXpvbnRhbEZpZWxkRGVmaW5lO1xyXG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZUNlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2hGaWVsZERlZmluZS5maWVsZENvbCArIHJvd0luZGV4XTtcclxuICAgICAgICBsZXQgb3JpZ2luRmllbGROYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChmaWVsZE5hbWVDZWxsKSkge1xyXG4gICAgICAgICAgICBvcmlnaW5GaWVsZE5hbWUgPSBmaWVsZE5hbWVDZWxsLnYgYXMgc3RyaW5nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW9yaWdpbkZpZWxkTmFtZSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgaWYgKHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXSAhPT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZmllbGQ6IElUYWJsZUZpZWxkID0ge30gYXMgYW55O1xyXG5cclxuICAgICAgICBjb25zdCB0ZXh0Q2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbaEZpZWxkRGVmaW5lLnRleHRDb2wgKyByb3dJbmRleF07XHJcbiAgICAgICAgLy/ms6jph4pcclxuICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKHRleHRDZWxsKSkge1xyXG4gICAgICAgICAgICBmaWVsZC50ZXh0ID0gdGV4dENlbGwudiBhcyBzdHJpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpc09ialR5cGU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICAvL+exu+Wei1xyXG4gICAgICAgIGNvbnN0IHR5cGVDZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtoRmllbGREZWZpbmUudHlwZUNvbCArIHJvd0luZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKHR5cGVDZWxsKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL+WkhOeQhuexu+Wei1xyXG4gICAgICAgICAgICBmaWVsZC5vcmlnaW5UeXBlID0gdHlwZUNlbGwudiBhcyBzdHJpbmc7XHJcbiAgICAgICAgICAgIGlmIChmaWVsZC5vcmlnaW5UeXBlLmluY2x1ZGVzKFwibWY6XCIpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlU3RycyA9IGZpZWxkLm9yaWdpblR5cGUuc3BsaXQoXCI6XCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVTdHJzLmxlbmd0aCA8IDMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZpZWxkLnR5cGUgPSB0eXBlU3Ryc1syXTtcclxuICAgICAgICAgICAgICAgIGlzT2JqVHlwZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gZmllbGQub3JpZ2luVHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmaWVsZC5pc011dGlDb2xPYmogPSBpc09ialR5cGU7XHJcbiAgICAgICAgZmllbGQub3JpZ2luRmllbGROYW1lID0gb3JpZ2luRmllbGROYW1lO1xyXG4gICAgICAgIGlmIChpc09ialR5cGUpIHtcclxuICAgICAgICAgICAgY29uc3QgZmllbGRTdHJzID0gZmllbGQub3JpZ2luRmllbGROYW1lLnNwbGl0KFwiOlwiKTtcclxuICAgICAgICAgICAgaWYgKGZpZWxkU3Rycy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmaWVsZC5maWVsZE5hbWUgPSBmaWVsZFN0cnNbMF07XHJcbiAgICAgICAgICAgIGZpZWxkLnN1YkZpZWxkTmFtZSA9IGZpZWxkU3Ryc1sxXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWVsZC5maWVsZE5hbWUgPSBmaWVsZC5vcmlnaW5GaWVsZE5hbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRhYmxlRmlsZWRNYXBbb3JpZ2luRmllbGROYW1lXSA9IGZpZWxkO1xyXG4gICAgICAgIHJldHVybiBmaWVsZDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qOA5p+l5YiX5piv5ZCm6ZyA6KaB6Kej5p6QXHJcbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmUgXHJcbiAgICAgKiBAcGFyYW0gc2hlZXQgXHJcbiAgICAgKiBAcGFyYW0gY29sS2V5IFxyXG4gICAgICovXHJcbiAgICBjaGVja0NvbE5lZWRQYXJzZSh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAvLyDlpoLmnpznsbvlnovmiJbogIXliJnkuI3pnIDopoHop6PmnpBcclxuICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcclxuICAgICAgICAgICAgY29uc3QgdmVydGljYWxGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLnZlcnRpY2FsRmllbGREZWZpbmU7XHJcbiAgICAgICAgICAgIGNvbnN0IHR5cGVDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3ddO1xyXG4gICAgICAgICAgICBjb25zdCBmaWVsZENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3ddO1xyXG4gICAgICAgICAgICBpZiAoaXNFbXB0eUNlbGwodHlwZUNlbGxPYmopIHx8IGlzRW1wdHlDZWxsKGZpZWxkQ2VsbE9iaikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIDFdO1xyXG4gICAgICAgICAgICBpZiAoaXNFbXB0eUNlbGwoY2VsbE9iaikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDovazmjaLooajmoLznmoTlgLxcclxuICAgICAqIEBwYXJhbSBwYXJzZVJlc3VsdCBcclxuICAgICAqIEBwYXJhbSBmaWxlZEl0ZW0gXHJcbiAgICAgKiBAcGFyYW0gY2VsbFZhbHVlIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdHJhbnNWYWx1ZShwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsIGZpbGVkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogYW55KTogSVRyYW5zVmFsdWVSZXN1bHQge1xyXG4gICAgICAgIGxldCB0cmFuc1Jlc3VsdDogSVRyYW5zVmFsdWVSZXN1bHQ7XHJcblxyXG4gICAgICAgIGxldCB0cmFuc0Z1bmMgPSB0aGlzLl92YWx1ZVRyYW5zRnVuY01hcFtmaWxlZEl0ZW0udHlwZV07XHJcbiAgICAgICAgaWYgKCF0cmFuc0Z1bmMpIHtcclxuICAgICAgICAgICAgdHJhbnNGdW5jID0gdGhpcy5fdmFsdWVUcmFuc0Z1bmNNYXBbXCJqc29uXCJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cmFuc1Jlc3VsdCA9IHRyYW5zRnVuYyhmaWxlZEl0ZW0sIGNlbGxWYWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRyYW5zUmVzdWx0O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIOino+aekOmFjee9ruihqOaWh+S7tlxyXG4gICAgICogQHBhcmFtIGZpbGVJbmZvIFxyXG4gICAgICogQHBhcmFtIHBhcnNlUmVzdWx0IOino+aekOe7k+aenFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcGFyc2VUYWJsZUZpbGUoZmlsZUluZm86IElGaWxlSW5mbywgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0KTogSVRhYmxlUGFyc2VSZXN1bHQge1xyXG5cclxuICAgICAgICBjb25zdCB3b3JrYm9vayA9IHJlYWRUYWJsZUZpbGUoZmlsZUluZm8pO1xyXG4gICAgICAgIGlmICghd29ya2Jvb2suU2hlZXROYW1lcy5sZW5ndGgpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgc2hlZXROYW1lcyA9IHdvcmtib29rLlNoZWV0TmFtZXM7XHJcbiAgICAgICAgY29uc3QgdGFibGVEZWZpbmU6IElUYWJsZURlZmluZSA9IHRoaXMuZ2V0VGFibGVEZWZpbmUoZmlsZUluZm8sIHdvcmtib29rKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGFibGVEZWZpbmUpIHJldHVybiBudWxsO1xyXG4gICAgICAgIGxldCBzaGVldE5hbWU6IHN0cmluZztcclxuICAgICAgICBsZXQgc2hlZXQ6IHhsc3guU2hlZXQ7XHJcbiAgICAgICAgY29uc3QgaXNTaGVldFJvd0VuZCA9IHRoaXMuaXNTaGVldFJvd0VuZC5iaW5kKG51bGwsIHRhYmxlRGVmaW5lKTtcclxuICAgICAgICBjb25zdCBpc1NoZWV0Q29sRW5kID0gdGhpcy5pc1NoZWV0Q29sRW5kLmJpbmQobnVsbCwgdGFibGVEZWZpbmUpO1xyXG4gICAgICAgIGNvbnN0IGlzU2tpcFNoZWV0Um93ID0gKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5jaGVja1Jvd05lZWRQYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIHJvd0luZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaXNTa2lwU2hlZXRDb2wgPSAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5jaGVja0NvbE5lZWRQYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIGNvbEtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3Q7XHJcbiAgICAgICAgcGFyc2VSZXN1bHQudGFibGVEZWZpbmUgPSB0YWJsZURlZmluZTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgc2hlZXROYW1lID0gc2hlZXROYW1lc1tpXTtcclxuICAgICAgICAgICAgc2hlZXQgPSB3b3JrYm9vay5TaGVldHNbc2hlZXROYW1lXTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNoZWNrU2hlZXRDYW5QYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIHNoZWV0TmFtZSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXJzZVJlc3VsdC5jdXJTaGVldE5hbWUgPSBzaGVldE5hbWU7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDop6PmnpA6JHtmaWxlSW5mby5maWxlUGF0aH09PiBzaGVldDoke3NoZWV0TmFtZX0gLi4uLmApO1xyXG4gICAgICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBsYXN0Um93SW5kZXg6IG51bWJlcjtcclxuXHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbEZvckVhY2hTaGVldChzaGVldCwgdGFibGVEZWZpbmUuc3RhcnRSb3csIHRhYmxlRGVmaW5lLnN0YXJ0Q29sLFxyXG4gICAgICAgICAgICAgICAgICAgIChzaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlzTmV3Um93T3JDb2wgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RSb3dJbmRleCAhPT0gcm93SW5kZXgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Um93SW5kZXggPSByb3dJbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTmV3Um93T3JDb2wgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxPYmogPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNFbXB0eUNlbGwoY2VsbE9iaikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyc2VWZXJ0aWNhbENlbGwocGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4LCBpc05ld1Jvd09yQ29sKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sIGlzU2hlZXRSb3dFbmQsIGlzU2hlZXRDb2xFbmQsIGlzU2tpcFNoZWV0Um93LCBpc1NraXBTaGVldENvbClcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGFzdENvbEtleTogc3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgIGhvcml6b250YWxGb3JFYWNoU2hlZXQoc2hlZXQsIHRhYmxlRGVmaW5lLnN0YXJ0Um93LCB0YWJsZURlZmluZS5zdGFydENvbCxcclxuICAgICAgICAgICAgICAgICAgICAoc2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc05ld1Jvd09yQ29sID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXN0Q29sS2V5ICE9PSBjb2xLZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb2xLZXkgPSBjb2xLZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05ld1Jvd09yQ29sID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VsbE9iaiA9IHNoZWV0W2NvbEtleSArIHJvd0luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChjZWxsT2JqKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJzZUhvcml6b250YWxDZWxsKHBhcnNlUmVzdWx0LCBzaGVldCwgY29sS2V5LCByb3dJbmRleCwgaXNOZXdSb3dPckNvbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LCBpc1NoZWV0Um93RW5kLCBpc1NoZWV0Q29sRW5kLCBpc1NraXBTaGVldFJvdywgaXNTa2lwU2hlZXRDb2wpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJzZVJlc3VsdCBhcyBhbnk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5cclxuXHJcbiJdLCJuYW1lcyI6WyJvcy5wbGF0Zm9ybSIsInBhdGguam9pbiIsIlRhYmxlVHlwZSIsIkJhc2U2NCIsImRlZmxhdGVTeW5jIiwiZnMuc3RhdFN5bmMiLCJmcy5yZWFkZGlyU3luYyIsImZzLmV4aXN0c1N5bmMiLCJmcy51bmxpbmtTeW5jIiwiZnMuZW5zdXJlRmlsZVN5bmMiLCJmcy53cml0ZUZpbGUiLCJmcy53cml0ZUZpbGVTeW5jIiwiZnMucmVhZEZpbGVTeW5jIiwiY3J5cHRvLmNyZWF0ZUhhc2giLCJwYXRoLnBhcnNlIiwibW1hdGNoLmFsbCIsInBhdGguaXNBYnNvbHV0ZSIsIldvcmtlciIsInBhdGguZGlybmFtZSIsInBhdGgucmVzb2x2ZSIsInhsc3gucmVhZEZpbGUiLCJ3dC53b3JrZXJEYXRhIiwid3QucGFyZW50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
