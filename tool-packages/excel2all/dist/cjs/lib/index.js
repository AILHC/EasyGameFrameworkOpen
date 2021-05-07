'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var os = require('os');
var xlsx = require('xlsx');
var path = require('path');
var zlib = require('zlib');
var fs = require('fs-extra');
var crypto = require('crypto');
var mmatch = require('micromatch');
var worker_threads = require('worker_threads');

const valueTransFuncMap = {};
valueTransFuncMap["int"] = strToInt;
valueTransFuncMap["string"] = anyToStr;
valueTransFuncMap["[int]"] = strToIntArr;
valueTransFuncMap["[string]"] = strToStrArr;
valueTransFuncMap["json"] = strToJsonObj;
function strToIntArr(fieldItem, cellValue) {
    cellValue = (cellValue + "").replace(/，/g, ",");
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
    cellValue = (cellValue + "").replace(/，/g, ",");
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
    cellValue = (cellValue + "").replace(/，/g, ",");
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

const platform = os.platform();
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
    static log(message, level = "info") {
        if (level !== "no") {
            if (message) {
                message = "++[--excel2all--]++" + message;
            }
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
    static systemLog(message) {
        console.log(message);
        if (!this._enableOutPutLogFile)
            return;
        this._logStr += message + osEol;
    }
    static get logStr() {
        if (!this._enableOutPutLogFile)
            return null;
        const logStr = this._logStr;
        this._logStr = "";
        return logStr;
    }
}
Logger._logStr = "";

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
const ZCharCode = 90;
const ACharCode = 65;
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
function charCodesToString(charCodes) {
    return String.fromCharCode(...charCodes);
}
function stringToCharCodes(colKey) {
    const charCodes = [];
    for (let i = 0; i < colKey.length; i++) {
        charCodes.push(colKey.charCodeAt(i));
    }
    return charCodes;
}
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
function readTableFile(fileInfo) {
    const workBook = xlsx.readFile(fileInfo.filePath, { type: isCSV(fileInfo.fileExtName) ? "string" : "file" });
    return workBook;
}
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
        const tableName = fileInfo.fileName;
        const tableDefine = {
            tableName: tableName
        };
        let cellKey;
        let cellObj;
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
    checkSheetCanParse(tableDefine, sheet, sheetName) {
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
    isSheetRowEnd(tableDefine, sheet, row) {
        if (row > 1) {
            row = row - 1;
            const cellObj = sheet["A" + row];
            return cellObj && cellObj.v === "END";
        }
        else {
            return false;
        }
    }
    isSheetColEnd(tableDefine, sheet, colKey) {
        const firstCellObj = sheet[colKey + 1];
        return isEmptyCell(firstCellObj);
    }
    checkRowNeedParse(tableDefine, sheet, rowIndex) {
        const cellObj = sheet["A" + rowIndex];
        if (cellObj && cellObj.v === "NO") {
            return false;
        }
        return true;
    }
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
            Logger.log(`!!!!!!!!!!!!!!!!!![-----解析错误-----]!!!!!!!!!!!!!!!!!!!!!!!!!\n` +
                `[sheetName|分表名]=> ${tableParseResult.curSheetName}\n` +
                `[row|行]=> ${rowIndex}\n` +
                `[col|列]=> ${colKey}\n` +
                `[field|字段]=> ${fieldInfo.originFieldName}\n` +
                `[type|类型]=> ${fieldInfo.originType}\n` +
                `[error|错误]=> ${typeof transResult.error === "string" ? transResult.error : transResult.error.message}\n`, "error");
        }
        const transedValue = transResult.value;
        let mainKeyFieldName = tableParseResult.mainKeyFieldName;
        if (!mainKeyFieldName) {
            mainKeyFieldName = fieldInfo.fieldName;
            tableParseResult.mainKeyFieldName = fieldInfo.fieldName;
            tableParseResult.tableObj = {};
        }
        let rowOrColObj = tableParseResult.curRowOrColObj;
        if (isNewRowOrCol) {
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
            Logger.log(`!!!!!!!!!!!!!!!!!![-----解析错误-----]!!!!!!!!!!!!!!!!!!!!!!!!!\n` +
                `[sheetName|分表名]=> ${tableParseResult.curSheetName}\n` +
                `[row|行]=> ${rowIndex}\n` +
                `[col|列]=> ${colKey}\n` +
                `[field|字段]=> ${fieldInfo.originFieldName}\n` +
                `[type|类型]=> ${fieldInfo.originType}\n` +
                `[error|错误]=> ${typeof transResult.error === "string" ? transResult.error : transResult.error.message}\n`, "error");
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
        if (tableFiledMap[originFieldName] !== undefined) {
            return tableFiledMap[originFieldName];
        }
        const textCell = sheet[colKey + verticalFieldDefine.textRow];
        if (!isEmptyCell(textCell)) {
            field.text = textCell.v;
        }
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
        if (!isEmptyCell(textCell)) {
            field.text = textCell.v;
        }
        let isObjType = false;
        const typeCell = sheet[hFieldDefine.typeCol + rowIndex];
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
    checkColNeedParse(tableDefine, sheet, colKey) {
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
    transValue(parseResult, filedItem, cellValue) {
        let transResult;
        let transFunc = this._valueTransFuncMap[filedItem.type];
        if (!transFunc) {
            transFunc = this._valueTransFuncMap["json"];
        }
        transResult = transFunc(filedItem, cellValue);
        return transResult;
    }
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
        Logger.log(`[parseTable|解析文件]=> ${fileInfo.filePath}`);
        for (let i = 0; i < sheetNames.length; i++) {
            sheetName = sheetNames[i];
            sheet = workbook.Sheets[sheetName];
            if (!this.checkSheetCanParse(tableDefine, sheet, sheetName)) {
                continue;
            }
            parseResult.curSheetName = sheetName;
            Logger.log(`|=[parseSheet|解析分表]=> ${sheetName}`);
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

class DefaultConvertHook {
    onStart(context, cb) {
        Logger.systemLog(`convert-hook onStart`);
        cb();
    }
    onParseBefore(context, cb) {
        Logger.systemLog(`convert-hook onParseBefore`);
        cb();
    }
    onParseAfter(context, cb) {
        let transformer = context.outputTransformer;
        transformer.transform(context, cb);
    }
    onWriteFileEnd(context) {
        Logger.systemLog(`convert-hook onWriteFileEnd 写入结束`);
    }
}

const typeStrMap = { int: "number", json: "any", "[int]": "number[]", "[string]": "string[]" };
class DefaultOutPutTransformer {
    transform(context, cb) {
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
                if (outputConfig.isBundleDts === undefined)
                    outputConfig.isBundleDts = true;
                if (!outputConfig.isBundleDts) {
                    this._addSingleTableDtsOutputFile(outputConfig, parseResult, outputFileMap);
                }
                else {
                    tableTypeDtsStrs += this._getSingleTableDts(parseResult);
                }
            }
            if (outputConfig.clientSingleTableJsonDir) {
                this._addSingleTableJsonOutputFile(outputConfig, parseResult, outputFileMap);
            }
        }
        if (outputConfig.isGenDts) {
            let itBaseStr = "interface ITBase<T> { [key:string]:T}" + osEol;
            tableTypeMapDtsStr = itBaseStr + "interface IT_TableMap {" + osEol + tableTypeMapDtsStr + "}" + osEol;
            if (outputConfig.isBundleDts) {
                const dtsFileName = outputConfig.bundleDtsFileName ? outputConfig.bundleDtsFileName : "tableMap";
                const bundleDtsFilePath = path.join(outputConfig.clientDtsOutDir, `${dtsFileName}.d.ts`);
                outputFileMap[bundleDtsFilePath] = {
                    filePath: bundleDtsFilePath,
                    data: tableTypeMapDtsStr + tableTypeDtsStrs
                };
            }
            else {
                const tableTypeMapDtsFilePath = path.join(outputConfig.clientDtsOutDir, "tableMap.d.ts");
                outputFileMap[tableTypeMapDtsFilePath] = {
                    filePath: tableTypeMapDtsFilePath,
                    data: tableTypeMapDtsStr
                };
            }
        }
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
            if (outputConfig.isZip) {
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
        cb();
    }
    _addSingleTableDtsOutputFile(config, parseResult, outputFileMap) {
        if (!parseResult.tableObj)
            return;
        let dtsFilePath = path.join(config.clientDtsOutDir, `${parseResult.tableDefine.tableName}.d.ts`);
        if (!outputFileMap[dtsFilePath]) {
            const dtsStr = this._getSingleTableDts(parseResult);
            if (dtsStr) {
                outputFileMap[dtsFilePath] = { filePath: dtsFilePath, data: dtsStr };
            }
        }
    }
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
                itemInterface += "\t/** " + tableField.text + " */" + osEol;
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
                objTypeStrMap[objFieldKey] += "\t\t/** " + tableField.text + " */" + osEol;
                objTypeStrMap[objFieldKey] +=
                    "\t\treadonly " +
                        tableField.subFieldName +
                        "?: " +
                        (typeStrMap[tableField.subType] ? typeStrMap[tableField.subType] : tableField.subType) +
                        ";" +
                        osEol;
            }
        }
        for (let objFieldKey in objTypeStrMap) {
            itemInterface += "\treadonly " + objFieldKey + "?: {" + osEol + objTypeStrMap[objFieldKey];
            itemInterface += "\t}" + osEol;
        }
        itemInterface += "}" + osEol;
        return itemInterface;
    }
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
function writeCacheData(cacheFilePath, cacheData) {
    if (!cacheFilePath) {
        Logger.log(`cacheFilePath is null`, "error");
        return;
    }
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData), { encoding: "utf-8" });
}
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
function getFileMd5Sync(filePath) {
    const file = fs.readFileSync(filePath, "utf-8");
    var md5um = crypto.createHash("md5");
    md5um.update(file);
    return md5um.digest("hex");
}
function getFileMd5(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return getFileMd5Sync(filePath);
    });
}

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
        let outputTransformer;
        if (converConfig.customOutPutTransformerPath) {
            outputTransformer = require(converConfig.customOutPutTransformerPath);
        }
        else {
            outputTransformer = new DefaultOutPutTransformer();
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
            outputTransformer: outputTransformer
        };
        yield new Promise((res) => {
            convertHook.onStart(context, res);
        });
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
        context.parseResultMap = parseResultMap;
        context.deleteFileInfos = deleteFileInfos;
        context.changedFileInfos = changedFileInfos;
        yield new Promise((res) => {
            convertHook.onParseBefore(context, res);
        });
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
function onParseEnd(context, parseResultMapCacheFilePath, convertHook, logStr) {
    return __awaiter(this, void 0, void 0, function* () {
        const convertConfig = context.convertConfig;
        const parseResultMap = context.parseResultMap;
        if (convertConfig.useCache) {
            writeCacheData(parseResultMapCacheFilePath, parseResultMap);
        }
        yield new Promise((res) => {
            convertHook.onParseAfter(context, res);
        });
        if (context.outPutFileMap) {
            const outputFileMap = context.outPutFileMap;
            const outputFiles = Object.values(outputFileMap);
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
        if (!logStr) {
            logStr = Logger.logStr;
        }
        const outputLogFileInfo = {
            filePath: path.join(process.cwd(), "excel2all.log"),
            data: logStr
        };
        writeOrDeleteOutPutFiles([outputLogFileInfo]);
        convertHook.onWriteFileEnd(context);
    });
}
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

exports.ACharCode = ACharCode;
exports.DefaultConvertHook = DefaultConvertHook;
exports.DefaultOutPutTransformer = DefaultOutPutTransformer;
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

    
//# sourceMappingURL=index.js.map
