'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var os = require('os');
var xlsx = require('xlsx');
var path = require('path');
var zlib = require('zlib');
var fs = require('fs-extra');
var crypto = require('crypto');
require('util');
var fg = require('fast-glob');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fg__default = /*#__PURE__*/_interopDefaultLegacy(fg);

const valueTransFuncMap = {};
valueTransFuncMap["int"] = strToInt;
valueTransFuncMap["string"] = anyToStr;
valueTransFuncMap["[int]"] = strToIntArr;
valueTransFuncMap["[string]"] = strToStrArr;
valueTransFuncMap["json"] = strToJsonObj;
valueTransFuncMap["json"] = anyToAny;
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
function anyToAny(fieldItem, cellValue) {
    cellValue = (cellValue + "").replace(/，/g, ",");
    cellValue = cellValue.trim();
    let obj;
    let error;
    if (cellValue !== "") {
        try {
            obj = JSON.parse(cellValue);
        }
        catch (err) {
            obj = cellValue;
        }
    }
    return { error: error, value: obj };
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
    static init(convertConfig) {
        const level = convertConfig.logLevel ? convertConfig.logLevel : "info";
        this._logLevel = LogLevelEnum[level];
        this._enableOutPutLogFile = convertConfig.outputLogDirPath === false ? false : true;
    }
    static log(message, level = "info") {
        if (level !== "no") {
            if (this._logLevel <= LogLevelEnum[level]) {
                switch (level) {
                    case "error":
                        console.error(message);
                        if (!this.hasError)
                            this.hasError = true;
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
Logger.hasError = false;

function isEmptyCell(cell) {
    if (cell && cell.v !== undefined) {
        if (typeof cell.v === "string") {
            return cell.v === "";
        }
        else if (typeof cell.v === "number") {
            return isNaN(cell.v);
        }
        else {
            return true;
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
    const workBook = xlsx.readFile(fileInfo.filePath, { type: getTableFileType(fileInfo) });
    return workBook;
}
function readTableData(fileInfo) {
    const workBook = xlsx.read(fileInfo.fileData);
    return workBook;
}
function getTableFileType(fileInfo) {
    return isCSV(fileInfo.fileExtName) ? "string" : "file";
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
        let cellKey;
        let cellObj;
        const sheetNames = workBook.SheetNames;
        let sheet;
        let firstCellValue;
        let firstCellObj;
        const tableDefine = {};
        for (let i = 0; i < sheetNames.length; i++) {
            sheet = workBook.Sheets[sheetNames[i]];
            firstCellObj = sheet["A" + 1];
            if (!isEmptyCell(firstCellObj)) {
                firstCellValue = this._getFirstCellValue(firstCellObj);
                if (!tableDefine.tableName) {
                    tableDefine.tableName = firstCellValue.tableNameInSheet;
                    tableDefine.tableType = firstCellValue.tableType;
                }
                if (firstCellValue && firstCellValue.tableNameInSheet === tableDefine.tableName) {
                    break;
                }
            }
        }
        if (!tableDefine.tableName || !tableDefine.tableType) {
            Logger.log(`表格不规范,跳过解析,路径:${fileInfo.filePath}`, "warn");
            return null;
        }
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
            Logger.log(`!!!!!!!!!!!!!!!!!![-----ParseError|解析错误-----]!!!!!!!!!!!!!!!!!!!!!!!!!\n` +
                `[sheetName|分表名]=> ${tableParseResult.curSheetName}\n` +
                `[row|行]=> ${rowIndex}\n` +
                `[col|列]=> ${colKey}\n` +
                `[field|字段]=> ${fieldInfo.originFieldName}\n` +
                `[type|类型]=> ${fieldInfo.originType}\n` +
                `[error|错误]=> ${typeof transResult.error === "string" ? transResult.error : transResult.error.message}\n` +
                `!!!!!!!!!!!!!!!!!![-----ParseError|解析错误-----]!!!!!!!!!!!!!!!!!!!!!!!!!\n`, "error");
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
        const workbook = fileInfo.fileData ? readTableData(fileInfo) : readTableFile(fileInfo);
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
        Logger.systemLog(`[excel2all] convert-hook onStart`);
        Logger.systemLog(`[excel2all] 开始表转换`);
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
        Logger.log(`[outputTransform |转换解析结果]请稍等...`);
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
                        (typeStrMap[tableField.type] ? typeStrMap[tableField.type] : tableField.type) +
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
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function forEachFile(fileOrDirPath, eachCallback) {
    if (fs.statSync(fileOrDirPath).isDirectory() && fileOrDirPath !== ".git" && fileOrDirPath !== ".svn") {
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
function getFileMd5Sync(filePath, encoding) {
    const file = fs.readFileSync(filePath, encoding);
    var md5um = crypto.createHash("md5");
    md5um.update(file);
    return md5um.digest("hex");
}
function getFileMd5Async(filePath, cb, encoding) {
    fs.readFile(filePath, encoding, (err, file) => {
        var md5um = crypto.createHash("md5");
        md5um.update(file);
        const md5Str = md5um.digest("hex");
        cb(md5Str);
    });
}
function getFileMd5(file) {
    const md5um = crypto.createHash("md5");
    md5um.update(file);
    return md5um.digest("hex");
}
function getFileMd5ByPath(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return getFileMd5Sync(filePath);
    });
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var utils = createCommonjsModule(function (module, exports) {

exports.isInteger = num => {
  if (typeof num === 'number') {
    return Number.isInteger(num);
  }
  if (typeof num === 'string' && num.trim() !== '') {
    return Number.isInteger(Number(num));
  }
  return false;
};

/**
 * Find a node of the given type
 */

exports.find = (node, type) => node.nodes.find(node => node.type === type);

/**
 * Find a node of the given type
 */

exports.exceedsLimit = (min, max, step = 1, limit) => {
  if (limit === false) return false;
  if (!exports.isInteger(min) || !exports.isInteger(max)) return false;
  return ((Number(max) - Number(min)) / Number(step)) >= limit;
};

/**
 * Escape the given node with '\\' before node.value
 */

exports.escapeNode = (block, n = 0, type) => {
  let node = block.nodes[n];
  if (!node) return;

  if ((type && node.type === type) || node.type === 'open' || node.type === 'close') {
    if (node.escaped !== true) {
      node.value = '\\' + node.value;
      node.escaped = true;
    }
  }
};

/**
 * Returns true if the given brace node should be enclosed in literal braces
 */

exports.encloseBrace = node => {
  if (node.type !== 'brace') return false;
  if ((node.commas >> 0 + node.ranges >> 0) === 0) {
    node.invalid = true;
    return true;
  }
  return false;
};

/**
 * Returns true if a brace node is invalid.
 */

exports.isInvalidBrace = block => {
  if (block.type !== 'brace') return false;
  if (block.invalid === true || block.dollar) return true;
  if ((block.commas >> 0 + block.ranges >> 0) === 0) {
    block.invalid = true;
    return true;
  }
  if (block.open !== true || block.close !== true) {
    block.invalid = true;
    return true;
  }
  return false;
};

/**
 * Returns true if a node is an open or close node
 */

exports.isOpenOrClose = node => {
  if (node.type === 'open' || node.type === 'close') {
    return true;
  }
  return node.open === true || node.close === true;
};

/**
 * Reduce an array of text nodes.
 */

exports.reduce = nodes => nodes.reduce((acc, node) => {
  if (node.type === 'text') acc.push(node.value);
  if (node.type === 'range') node.type = 'text';
  return acc;
}, []);

/**
 * Flatten an array
 */

exports.flatten = (...args) => {
  const result = [];
  const flat = arr => {
    for (let i = 0; i < arr.length; i++) {
      let ele = arr[i];
      Array.isArray(ele) ? flat(ele) : ele !== void 0 && result.push(ele);
    }
    return result;
  };
  flat(args);
  return result;
};
});
var utils_1 = utils.isInteger;
var utils_2 = utils.find;
var utils_3 = utils.exceedsLimit;
var utils_4 = utils.escapeNode;
var utils_5 = utils.encloseBrace;
var utils_6 = utils.isInvalidBrace;
var utils_7 = utils.isOpenOrClose;
var utils_8 = utils.reduce;
var utils_9 = utils.flatten;

const WIN_SLASH = '\\\\/';
const WIN_NO_SLASH = `[^${WIN_SLASH}]`;

/**
 * Posix glob regex
 */

const DOT_LITERAL = '\\.';
const PLUS_LITERAL = '\\+';
const QMARK_LITERAL = '\\?';
const SLASH_LITERAL = '\\/';
const ONE_CHAR = '(?=.)';
const QMARK = '[^/]';
const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
const NO_DOT = `(?!${DOT_LITERAL})`;
const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
const STAR = `${QMARK}*?`;

const POSIX_CHARS = {
  DOT_LITERAL,
  PLUS_LITERAL,
  QMARK_LITERAL,
  SLASH_LITERAL,
  ONE_CHAR,
  QMARK,
  END_ANCHOR,
  DOTS_SLASH,
  NO_DOT,
  NO_DOTS,
  NO_DOT_SLASH,
  NO_DOTS_SLASH,
  QMARK_NO_DOT,
  STAR,
  START_ANCHOR
};

/**
 * Windows glob regex
 */

const WINDOWS_CHARS = {
  ...POSIX_CHARS,

  SLASH_LITERAL: `[${WIN_SLASH}]`,
  QMARK: WIN_NO_SLASH,
  STAR: `${WIN_NO_SLASH}*?`,
  DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
  NO_DOT: `(?!${DOT_LITERAL})`,
  NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
  NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
  START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
  END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
};

/**
 * POSIX Bracket Regex
 */

const POSIX_REGEX_SOURCE = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  ascii: '\\x00-\\x7F',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E ',
  punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word: 'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9'
};

var constants = {
  MAX_LENGTH: 1024 * 64,
  POSIX_REGEX_SOURCE,

  // regular expressions
  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,

  // Replace globs with equivalent patterns to reduce parsing time.
  REPLACEMENTS: {
    '***': '*',
    '**/**': '**',
    '**/**/**': '**'
  },

  // Digits
  CHAR_0: 48, /* 0 */
  CHAR_9: 57, /* 9 */

  // Alphabet chars.
  CHAR_UPPERCASE_A: 65, /* A */
  CHAR_LOWERCASE_A: 97, /* a */
  CHAR_UPPERCASE_Z: 90, /* Z */
  CHAR_LOWERCASE_Z: 122, /* z */

  CHAR_LEFT_PARENTHESES: 40, /* ( */
  CHAR_RIGHT_PARENTHESES: 41, /* ) */

  CHAR_ASTERISK: 42, /* * */

  // Non-alphabetic chars.
  CHAR_AMPERSAND: 38, /* & */
  CHAR_AT: 64, /* @ */
  CHAR_BACKWARD_SLASH: 92, /* \ */
  CHAR_CARRIAGE_RETURN: 13, /* \r */
  CHAR_CIRCUMFLEX_ACCENT: 94, /* ^ */
  CHAR_COLON: 58, /* : */
  CHAR_COMMA: 44, /* , */
  CHAR_DOT: 46, /* . */
  CHAR_DOUBLE_QUOTE: 34, /* " */
  CHAR_EQUAL: 61, /* = */
  CHAR_EXCLAMATION_MARK: 33, /* ! */
  CHAR_FORM_FEED: 12, /* \f */
  CHAR_FORWARD_SLASH: 47, /* / */
  CHAR_GRAVE_ACCENT: 96, /* ` */
  CHAR_HASH: 35, /* # */
  CHAR_HYPHEN_MINUS: 45, /* - */
  CHAR_LEFT_ANGLE_BRACKET: 60, /* < */
  CHAR_LEFT_CURLY_BRACE: 123, /* { */
  CHAR_LEFT_SQUARE_BRACKET: 91, /* [ */
  CHAR_LINE_FEED: 10, /* \n */
  CHAR_NO_BREAK_SPACE: 160, /* \u00A0 */
  CHAR_PERCENT: 37, /* % */
  CHAR_PLUS: 43, /* + */
  CHAR_QUESTION_MARK: 63, /* ? */
  CHAR_RIGHT_ANGLE_BRACKET: 62, /* > */
  CHAR_RIGHT_CURLY_BRACE: 125, /* } */
  CHAR_RIGHT_SQUARE_BRACKET: 93, /* ] */
  CHAR_SEMICOLON: 59, /* ; */
  CHAR_SINGLE_QUOTE: 39, /* ' */
  CHAR_SPACE: 32, /*   */
  CHAR_TAB: 9, /* \t */
  CHAR_UNDERSCORE: 95, /* _ */
  CHAR_VERTICAL_LINE: 124, /* | */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279, /* \uFEFF */

  SEP: path__default['default'].sep,

  /**
   * Create EXTGLOB_CHARS
   */

  extglobChars(chars) {
    return {
      '!': { type: 'negate', open: '(?:(?!(?:', close: `))${chars.STAR})` },
      '?': { type: 'qmark', open: '(?:', close: ')?' },
      '+': { type: 'plus', open: '(?:', close: ')+' },
      '*': { type: 'star', open: '(?:', close: ')*' },
      '@': { type: 'at', open: '(?:', close: ')' }
    };
  },

  /**
   * Create GLOB_CHARS
   */

  globChars(win32) {
    return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
  }
};

var utils$1 = createCommonjsModule(function (module, exports) {


const win32 = process.platform === 'win32';
const {
  REGEX_BACKSLASH,
  REGEX_REMOVE_BACKSLASH,
  REGEX_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_GLOBAL
} = constants;

exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

exports.removeBackslashes = str => {
  return str.replace(REGEX_REMOVE_BACKSLASH, match => {
    return match === '\\' ? '' : match;
  });
};

exports.supportsLookbehinds = () => {
  const segs = process.version.slice(1).split('.').map(Number);
  if (segs.length === 3 && segs[0] >= 9 || (segs[0] === 8 && segs[1] >= 10)) {
    return true;
  }
  return false;
};

exports.isWindows = options => {
  if (options && typeof options.windows === 'boolean') {
    return options.windows;
  }
  return win32 === true || path__default['default'].sep === '\\';
};

exports.escapeLast = (input, char, lastIdx) => {
  const idx = input.lastIndexOf(char, lastIdx);
  if (idx === -1) return input;
  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
};

exports.removePrefix = (input, state = {}) => {
  let output = input;
  if (output.startsWith('./')) {
    output = output.slice(2);
    state.prefix = './';
  }
  return output;
};

exports.wrapOutput = (input, state = {}, options = {}) => {
  const prepend = options.contains ? '' : '^';
  const append = options.contains ? '' : '$';

  let output = `${prepend}(?:${input})${append}`;
  if (state.negated === true) {
    output = `(?:^(?!${output}).*$)`;
  }
  return output;
};
});
var utils_1$1 = utils$1.isObject;
var utils_2$1 = utils$1.hasRegexChars;
var utils_3$1 = utils$1.isRegexChar;
var utils_4$1 = utils$1.escapeRegex;
var utils_5$1 = utils$1.toPosixSlashes;
var utils_6$1 = utils$1.removeBackslashes;
var utils_7$1 = utils$1.supportsLookbehinds;
var utils_8$1 = utils$1.isWindows;
var utils_9$1 = utils$1.escapeLast;
var utils_10 = utils$1.removePrefix;
var utils_11 = utils$1.wrapOutput;

const defaultDir = ".excel2all";
const cacheFileName = ".e2aprmc";
const logFileName = "excel2all.log";
let startTime = 0;
const defaultPattern = ["./**/*.xlsx", "./**/*.csv", "!**/~$*.*", "!**/~.*.*", "!.git/**/*", "!.svn/**/*"];
function convert(converConfig) {
    return __awaiter(this, void 0, void 0, function* () {
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
        if (converConfig.useMultiThread && isNaN(converConfig.threadParseFileMaxNum)) {
            converConfig.threadParseFileMaxNum = 5;
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
        const context = {
            convertConfig: converConfig,
            outputTransformer: outputTransformer
        };
        yield new Promise((res) => {
            convertHook.onStart(context, res);
        });
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
        const predoT1 = new Date().getTime();
        getFileInfos(context);
        const { parseResultMap, parseResultMapCacheFilePath, changedFileInfos } = context;
        const predoT2 = new Date().getTime();
        Logger.systemLog(`[预处理数据时间:${predoT2 - predoT1}ms,${(predoT2 - predoT1) / 1000}]`);
        yield new Promise((res) => {
            convertHook.onParseBefore(context, res);
        });
        Logger.systemLog(`[开始解析]:数量[${changedFileInfos.length}]`);
        let WorkerClass;
        try {
            WorkerClass = require("worker_threads");
        }
        catch (error) {
            converConfig.useMultiThread && Logger.systemLog(`node版本不支持Worker多线程，切换为单线程模式`);
            converConfig.useMultiThread = false;
        }
        if (changedFileInfos.length > converConfig.threadParseFileMaxNum && converConfig.useMultiThread) {
            Logger.systemLog(`[多线程解析]`);
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
                if (!context.hasError) {
                    context.hasError = Logger.hasError;
                }
                if (completeCount >= count) {
                    const t2 = new Date().getTime();
                    Logger.log(`[多线程解析时间]:${t2 - t1}`);
                    onParseEnd(context, parseResultMapCacheFilePath, convertHook, logStr);
                }
            };
            for (let i = 0; i < count; i++) {
                subFileInfos = changedFileInfos.splice(0, converConfig.threadParseFileMaxNum);
                Logger.log(`----------------线程开始:${i}-----------------`);
                worker = new WorkerClass(path.join(path.dirname(__filename), "../../../worker_scripts/worker.js"), {
                    workerData: {
                        threadId: i,
                        fileInfos: subFileInfos,
                        parseResultMap: parseResultMap,
                        convertConfig: converConfig
                    }
                });
                worker.on("message", onWorkerParseEnd);
            }
        }
        else {
            Logger.systemLog(`[单线程解析]`);
            if (changedFileInfos.length > 0) {
                const t1 = new Date().getTime();
                doParse(converConfig, changedFileInfos, parseResultMap, parseHandler);
                const t2 = new Date().getTime();
                Logger.systemLog(`[单线程解析时间]:${t2 - t1}`);
            }
            context.hasError = Logger.hasError;
            onParseEnd(context, parseResultMapCacheFilePath, convertHook);
        }
    });
}
function getFileInfos(context) {
    const converConfig = context.convertConfig;
    let changedFileInfos = [];
    let deleteFileInfos = [];
    const tableFileDir = converConfig.tableFileDir;
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
    const filePaths = fg__default['default'].sync(matchPattern, {
        absolute: true,
        onlyFiles: true,
        caseSensitiveMatch: false,
        cwd: tableFileDir
    });
    let parseResultMap = {};
    let cacheFileDirPath = converConfig.cacheFileDirPath;
    let parseResultMapCacheFilePath;
    if (!converConfig.useCache) {
        for (let i = 0; i < filePaths.length; i++) {
            changedFileInfos.push(getFileInfo(filePaths[i]));
        }
    }
    else {
        let t1 = new Date().getTime();
        if (!cacheFileDirPath)
            cacheFileDirPath = defaultDir;
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
        let oldFilePathIndex;
        let parseResult;
        let filePath;
        for (let i = 0; i < filePaths.length; i++) {
            filePath = filePaths[i];
            const fileInfo = getFileInfo(filePath);
            const fileData = fs.readFileSync(filePath);
            fileInfo.fileData = fileData;
            parseResult = parseResultMap[filePath];
            var md5str = getFileMd5(fileData);
            if (!parseResult || (parseResult && parseResult.md5hash !== md5str)) {
                parseResult = {
                    filePath: filePath
                };
                parseResultMap[filePath] = parseResult;
                parseResult.md5hash = md5str;
                changedFileInfos.push(fileInfo);
            }
            oldFilePathIndex = oldFilePaths.indexOf(filePath);
            if (oldFilePathIndex > -1) {
                const endFilePath = oldFilePaths[oldFilePaths.length - 1];
                oldFilePaths[oldFilePathIndex] = endFilePath;
                oldFilePaths.pop();
            }
        }
        for (let i = 0; i < oldFilePaths.length; i++) {
            delete parseResultMap[oldFilePaths[i]];
            let deleteFileInfo = getFileInfo(oldFilePaths[i]);
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
function onParseEnd(context, parseResultMapCacheFilePath, convertHook, logStr) {
    return __awaiter(this, void 0, void 0, function* () {
        const convertConfig = context.convertConfig;
        const parseResultMap = context.parseResultMap;
        if (convertConfig.useCache && !context.hasError) {
            writeCacheData(parseResultMapCacheFilePath, parseResultMap);
        }
        Logger.systemLog(`开始进行转换解析结果`);
        const parseAfterT1 = new Date().getTime();
        yield new Promise((res) => {
            convertHook.onParseAfter(context, res);
        });
        const parseAfterT2 = new Date().getTime();
        Logger.systemLog(`转换解析结果结束:${parseAfterT2 - parseAfterT1}ms,${(parseAfterT2 - parseAfterT1) / 1000}s`);
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
        if (logStr.trim() !== "") {
            let logFileDirPath = context.convertConfig.outputLogDirPath;
            if (!logFileDirPath)
                logFileDirPath = defaultDir;
            if (!path.isAbsolute(logFileDirPath)) {
                logFileDirPath = path.join(context.convertConfig.projRoot, logFileDirPath);
            }
            const outputLogFileInfo = {
                filePath: path.join(logFileDirPath, logFileName),
                data: logStr
            };
            writeOrDeleteOutPutFiles([outputLogFileInfo]);
        }
        convertHook.onWriteFileEnd(context);
        const endTime = new Date().getTime();
        const useTime = endTime - startTime;
        Logger.log(`导表总时间:[${useTime}ms],[${useTime / 1000}s]`);
    });
}
function testFileMatch(convertConfig) {
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
    if (convertConfig.useMultiThread && isNaN(convertConfig.threadParseFileMaxNum)) {
        convertConfig.threadParseFileMaxNum = 5;
    }
    const context = { convertConfig: convertConfig };
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
exports.getFileMd5Async = getFileMd5Async;
exports.getFileMd5ByPath = getFileMd5ByPath;
exports.getFileMd5Sync = getFileMd5Sync;
exports.getNextColKey = getNextColKey;
exports.getTableFileType = getTableFileType;
exports.horizontalForEachSheet = horizontalForEachSheet;
exports.isCSV = isCSV;
exports.isEmptyCell = isEmptyCell;
exports.readTableData = readTableData;
exports.readTableFile = readTableFile;
exports.stringToCharCodes = stringToCharCodes;
exports.testFileMatch = testFileMatch;
exports.valueTransFuncMap = valueTransFuncMap;
exports.verticalForEachSheet = verticalForEachSheet;
exports.writeCacheData = writeCacheData;
exports.writeOrDeleteOutPutFiles = writeOrDeleteOutPutFiles;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9leGNlbDJhbGwvc3JjL2RlZmF1bHQtdmFsdWUtZnVuYy1tYXAudHMiLCJAYWlsaGMvZXhjZWwyYWxsL3NyYy9nZXQtb3MtZW9sLnRzIiwiQGFpbGhjL2V4Y2VsMmFsbC9zcmMvbG9nZXIudHMiLCJAYWlsaGMvZXhjZWwyYWxsL3NyYy90YWJsZS11dGlscy50cyIsIkBhaWxoYy9leGNlbDJhbGwvc3JjL2RlZmF1bHQtcGFyc2UtaGFuZGxlci50cyIsIkBhaWxoYy9leGNlbDJhbGwvc3JjL2RlZmF1bHQtY29udmVydC1ob29rLnRzIiwiQGFpbGhjL2V4Y2VsMmFsbC9zcmMvZGVmYXVsdC1vdXRwdXQtdHJhbnNmb3JtZXIudHMiLCJAYWlsaGMvZXhjZWwyYWxsL3NyYy9kby1wYXJzZS50cyIsIkBhaWxoYy9leGNlbDJhbGwvc3JjL2ZpbGUtdXRpbHMudHMiLCJFOi9GcmFtZVdvcmtTcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL2JyYWNlcy9saWIvdXRpbHMuanMiLCJFOi9GcmFtZVdvcmtTcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3BpY29tYXRjaC9saWIvY29uc3RhbnRzLmpzIiwiRTovRnJhbWVXb3JrU3BhY2UvRWFzeUdhbWVGcmFtZXdvcmtPcGVuL25vZGVfbW9kdWxlcy9waWNvbWF0Y2gvbGliL3V0aWxzLmpzIiwiQGFpbGhjL2V4Y2VsMmFsbC9zcmMvY29udmVydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dlclwiO1xuXG5leHBvcnQgY29uc3QgdmFsdWVUcmFuc0Z1bmNNYXA6IHtcbiAgICBba2V5OiBzdHJpbmddOiBWYWx1ZVRyYW5zRnVuYztcbn0gPSB7fTtcbnZhbHVlVHJhbnNGdW5jTWFwW1wiaW50XCJdID0gc3RyVG9JbnQ7XG52YWx1ZVRyYW5zRnVuY01hcFtcInN0cmluZ1wiXSA9IGFueVRvU3RyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJbaW50XVwiXSA9IHN0clRvSW50QXJyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJbc3RyaW5nXVwiXSA9IHN0clRvU3RyQXJyO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJqc29uXCJdID0gc3RyVG9Kc29uT2JqO1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJqc29uXCJdID0gYW55VG9Bbnk7XG5mdW5jdGlvbiBzdHJUb0ludEFycihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBjZWxsVmFsdWUgPSAoY2VsbFZhbHVlICsgXCJcIikucmVwbGFjZSgv77yML2csIFwiLFwiKTsgLy/kuLrkuobpmLLmraLnrZbliJLor6/loavvvIzlhYjov5vooYzovazmjaJcbiAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xuICAgIGxldCBpbnRBcnI6IG51bWJlcltdO1xuICAgIGNvbnN0IHJlc3VsdDogSVRyYW5zVmFsdWVSZXN1bHQgPSB7fTtcbiAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpbnRBcnIgPSBKU09OLnBhcnNlKGNlbGxWYWx1ZSk7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBpbnRBcnI7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXN1bHQuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBzdHJUb1N0ckFycihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBjZWxsVmFsdWUgPSAoY2VsbFZhbHVlICsgXCJcIikucmVwbGFjZSgv77yML2csIFwiLFwiKTsgLy/kuLrkuobpmLLmraLnrZbliJLor6/loavvvIzlhYjov5vooYzovazmjaJcbiAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xuICAgIGxldCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge307XG4gICAgbGV0IGFycjogc3RyaW5nW107XG4gICAgaWYgKGNlbGxWYWx1ZSAhPT0gXCJcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXJyID0gSlNPTi5wYXJzZShjZWxsVmFsdWUpO1xuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gYXJyO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIHN0clRvSW50KGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogc3RyaW5nKTogSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgIGxldCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge30gYXMgYW55O1xuICAgIGlmICh0eXBlb2YgY2VsbFZhbHVlID09PSBcInN0cmluZ1wiICYmIGNlbGxWYWx1ZS50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgcmVzdWx0LnZhbHVlID0gY2VsbFZhbHVlLmluY2x1ZGVzKFwiLlwiKSA/IHBhcnNlRmxvYXQoY2VsbFZhbHVlKSA6IChwYXJzZUludChjZWxsVmFsdWUpIGFzIGFueSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbFZhbHVlID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIHN0clRvSnNvbk9iaihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBjZWxsVmFsdWUgPSAoY2VsbFZhbHVlICsgXCJcIikucmVwbGFjZSgv77yML2csIFwiLFwiKTsgLy/kuLrkuobpmLLmraLnrZbliJLor6/loavvvIzlhYjov5vooYzovazmjaJcbiAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xuICAgIGxldCBvYmo7XG4gICAgbGV0IGVycm9yO1xuICAgIGlmIChjZWxsVmFsdWUgIT09IFwiXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG9iaiA9IEpTT04ucGFyc2UoY2VsbFZhbHVlKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBlcnJvciA9IGVycjtcbiAgICAgICAgICAgIG9iaiA9IGNlbGxWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBlcnJvcjogZXJyb3IsIHZhbHVlOiBvYmogfTtcbn1cbmZ1bmN0aW9uIGFueVRvU3RyKGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogYW55KTogSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgIGxldCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge30gYXMgYW55O1xuICAgIGlmICh0eXBlb2YgY2VsbFZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGNlbGxWYWx1ZSA9IGNlbGxWYWx1ZS50cmltKCk7XG4gICAgICAgIGlmIChjZWxsVmFsdWUgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZSArIFwiXCI7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG4vKipcbiAqIOWFiOWwneivlei9rOaNouacquWvueixoe+8jOS4jeihjOWGjeS9v+eUqOWOn+WAvFxuICogQHBhcmFtIGZpZWxkSXRlbVxuICogQHBhcmFtIGNlbGxWYWx1ZVxuICogQHJldHVybnNcbiAqL1xuZnVuY3Rpb24gYW55VG9BbnkoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgb2JqO1xuICAgIGxldCBlcnJvcjtcbiAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBvYmogPSBKU09OLnBhcnNlKGNlbGxWYWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgb2JqID0gY2VsbFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IGVycm9yOiBlcnJvciwgdmFsdWU6IG9iaiB9O1xufVxuIiwiaW1wb3J0ICogYXMgb3MgZnJvbSBcIm9zXCI7XG5jb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4vKirlvZPliY3ns7vnu5/ooYzlsL4gIHBsYXRmb3JtID09PSBcIndpbjMyXCIgPyBcIlxcblwiIDogXCJcXHJcXG5cIjsqL1xuZXhwb3J0IGNvbnN0IG9zRW9sID0gcGxhdGZvcm0gPT09IFwid2luMzJcIiA/IFwiXFxuXCIgOiBcIlxcclxcblwiO1xuIiwiaW1wb3J0IHsgb3NFb2wgfSBmcm9tIFwiLi9nZXQtb3MtZW9sXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5lbnVtIExvZ0xldmVsRW51bSB7XG4gICAgaW5mbyxcbiAgICB3YXJuLFxuICAgIGVycm9yLFxuICAgIG5vXG59XG5leHBvcnQgY2xhc3MgTG9nZ2VyIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfZW5hYmxlT3V0UHV0TG9nRmlsZTogYm9vbGVhbjtcbiAgICBwcml2YXRlIHN0YXRpYyBfbG9nTGV2ZWw6IExvZ0xldmVsRW51bTtcbiAgICBwcml2YXRlIHN0YXRpYyBfbG9nU3RyOiBzdHJpbmcgPSBcIlwiO1xuICAgIC8qKlxuICAgICAqIOWmguaenOaciei+k+WHuui/h+mUmeivr+S/oeaBr+WImeS4unRydWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGhhc0Vycm9yOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHVibGljIHN0YXRpYyBpbml0KGNvbnZlcnRDb25maWc6IElUYWJsZUNvbnZlcnRDb25maWcpIHtcbiAgICAgICAgY29uc3QgbGV2ZWw6IExvZ0xldmVsID0gY29udmVydENvbmZpZy5sb2dMZXZlbCA/IGNvbnZlcnRDb25maWcubG9nTGV2ZWwgOiBcImluZm9cIjtcbiAgICAgICAgdGhpcy5fbG9nTGV2ZWwgPSBMb2dMZXZlbEVudW1bbGV2ZWxdO1xuICAgICAgICB0aGlzLl9lbmFibGVPdXRQdXRMb2dGaWxlID0gY29udmVydENvbmZpZy5vdXRwdXRMb2dEaXJQYXRoID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6L6T5Ye65pel5b+XLOaXpeW/l+etiee6p+WPquaYr+mZkOWItuS6huaOp+WItuWPsOi+k+WHuu+8jOS9huS4jemZkOWItuaXpeW/l+iusOW9lVxuICAgICAqIEBwYXJhbSBtZXNzYWdlXG4gICAgICogQHBhcmFtIGxldmVsXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBsb2cobWVzc2FnZTogc3RyaW5nLCBsZXZlbDogTG9nTGV2ZWwgPSBcImluZm9cIikge1xuICAgICAgICBpZiAobGV2ZWwgIT09IFwibm9cIikge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2xvZ0xldmVsIDw9IExvZ0xldmVsRW51bVtsZXZlbF0pIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5oYXNFcnJvcikgdGhpcy5oYXNFcnJvciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImluZm9cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3YXJuXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2VuYWJsZU91dFB1dExvZ0ZpbGUpIHJldHVybjtcbiAgICAgICAgdGhpcy5fbG9nU3RyICs9IG1lc3NhZ2UgKyBvc0VvbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog57O757uf5pel5b+X6L6T5Ye6XG4gICAgICogQHBhcmFtIGFyZ3NcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHN5c3RlbUxvZyhtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICAgIGlmICghdGhpcy5fZW5hYmxlT3V0UHV0TG9nRmlsZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sb2dTdHIgKz0gbWVzc2FnZSArIG9zRW9sO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDov5Tlm57ml6Xlv5fmlbDmja7lubbmuIXnqbpcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldCBsb2dTdHIoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVPdXRQdXRMb2dGaWxlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgbG9nU3RyID0gdGhpcy5fbG9nU3RyO1xuICAgICAgICB0aGlzLl9sb2dTdHIgPSBcIlwiOyAvL+a4heepulxuICAgICAgICByZXR1cm4gbG9nU3RyO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIHhsc3ggZnJvbSBcInhsc3hcIjtcbi8qKlxuICog5piv5ZCm5Li656m66KGo5qC85qC85a2QXG4gKiBAcGFyYW0gY2VsbFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eUNlbGwoY2VsbDogeGxzeC5DZWxsT2JqZWN0KSB7XG4gICAgaWYgKGNlbGwgJiYgY2VsbC52ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjZWxsLnYgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBjZWxsLnYgPT09IFwiXCI7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGwudiA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKGNlbGwudik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbi8qKlxuICog5a2X5q+NWueahOe8lueggVxuICovXG5leHBvcnQgY29uc3QgWkNoYXJDb2RlID0gOTA7XG4vKipcbiAqIOWtl+avjUHnmoTnvJbnoIFcbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBBQ2hhckNvZGUgPSA2NTtcbi8qKlxuICog5qC55o2u5b2T5YmN5YiX55qEY2hhckNvZGVz6I635Y+W5LiL5LiA5YiXS2V5XG4gKiBAcGFyYW0gY2hhckNvZGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROZXh0Q29sS2V5KGNoYXJDb2RlczogbnVtYmVyW10pOiBzdHJpbmcge1xuICAgIGxldCBpc0FkZDogYm9vbGVhbjtcbiAgICBmb3IgKGxldCBpID0gY2hhckNvZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmIChjaGFyQ29kZXNbaV0gPCBaQ2hhckNvZGUpIHtcbiAgICAgICAgICAgIGNoYXJDb2Rlc1tpXSArPSAxO1xuICAgICAgICAgICAgaXNBZGQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hhckNvZGVzW2ldID09PSBaQ2hhckNvZGUpIHtcbiAgICAgICAgICAgIGNoYXJDb2Rlc1tpXSA9IEFDaGFyQ29kZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzQWRkKSB7XG4gICAgICAgIGNoYXJDb2Rlcy5wdXNoKEFDaGFyQ29kZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYXJDb2Rlc1RvU3RyaW5nKGNoYXJDb2Rlcyk7XG59XG5cbi8qKlxuICog5YiX55qE5a2X56ym57yW56CB5pWw57uE6L2s5a2X56ym5LiyXG4gKiBAcGFyYW0gY2hhckNvZGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGFyQ29kZXNUb1N0cmluZyhjaGFyQ29kZXM6IG51bWJlcltdKTogc3RyaW5nIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSguLi5jaGFyQ29kZXMpO1xufVxuLyoqXG4gKiDlrZfnrKbkuLLovaznvJbnoIHmlbDnu4RcbiAqIEBwYXJhbSBjb2xLZXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1RvQ2hhckNvZGVzKGNvbEtleTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2hhckNvZGVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xLZXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2hhckNvZGVzLnB1c2goY29sS2V5LmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cbiAgICByZXR1cm4gY2hhckNvZGVzO1xufVxuLyoqXG4gKiDnurXlkJHpgY3ljobooajmoLxcbiAqIEBwYXJhbSBzaGVldCB4bHN46KGo5qC85a+56LGhXG4gKiBAcGFyYW0gc3RhcnRSb3cg5byA5aeL6KGMIOS7jjHlvIDlp4tcbiAqIEBwYXJhbSBzdGFydENvbCDliJflrZfnrKYg5q+U5aaCQSBCXG4gKiBAcGFyYW0gY2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWRcbiAqIEBwYXJhbSBpc1NoZWV0Um93RW5kIOaYr+WQpuihjOe7k+adn+WIpOaWreaWueazlVxuICogQHBhcmFtIGlzU2hlZXRDb2xFbmQg5piv5ZCm5YiX57uT5p2f5Yik5pat5pa55rOVXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRSb3cg5piv5ZCm6Lez6L+H6KGMXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRDb2wg5piv5ZCm6Lez6L+H5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJ0aWNhbEZvckVhY2hTaGVldChcbiAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICBzdGFydFJvdzogbnVtYmVyLFxuICAgIHN0YXJ0Q29sOiBzdHJpbmcsXG4gICAgY2FsbGJhY2s6IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWQsXG4gICAgaXNTaGVldFJvd0VuZD86IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbixcbiAgICBpc1NoZWV0Q29sRW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xrZXk6IHN0cmluZykgPT4gYm9vbGVhbixcbiAgICBpc1NraXBTaGVldFJvdz86IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbixcbiAgICBpc1NraXBTaGVldENvbD86IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpID0+IGJvb2xlYW5cbikge1xuICAgIGNvbnN0IHNoZWV0UmVmOiBzdHJpbmcgPSBzaGVldFtcIiFyZWZcIl07XG4gICAgY29uc3QgbWF4Um93TnVtID0gcGFyc2VJbnQoc2hlZXRSZWYubWF0Y2goL1xcZCskLylbMF0pO1xuXG4gICAgY29uc3QgbWF4Q29sS2V5ID0gc2hlZXRSZWYuc3BsaXQoXCI6XCIpWzFdLm1hdGNoKC9eW0EtWmEtel0rLylbMF07XG4gICAgbGV0IG1heENvbEtleUNvZGVTdW0gPSBnZXRDaGFyQ29kZVN1bShtYXhDb2xLZXkpO1xuXG4gICAgbGV0IGNvbENoYXJDb2RlczogbnVtYmVyW107XG4gICAgbGV0IGNvbEtleTogc3RyaW5nO1xuICAgIGxldCBjdXJDb2xDb2RlU3VtOiBudW1iZXIgPSAwO1xuICAgIGNvbnN0IHN0YXJ0Q2hhcmNvZGVzID0gc3RyaW5nVG9DaGFyQ29kZXMoc3RhcnRDb2wpO1xuICAgIGZvciAobGV0IGkgPSBzdGFydFJvdzsgaSA8PSBtYXhSb3dOdW07IGkrKykge1xuICAgICAgICBpZiAoaXNTaGVldFJvd0VuZCA/IGlzU2hlZXRSb3dFbmQoc2hlZXQsIGkpIDogZmFsc2UpIGJyZWFrO1xuICAgICAgICBpZiAoaXNTa2lwU2hlZXRSb3cgPyBpc1NraXBTaGVldFJvdyhzaGVldCwgaSkgOiBmYWxzZSkgY29udGludWU7XG4gICAgICAgIGNvbENoYXJDb2RlcyA9IHN0YXJ0Q2hhcmNvZGVzLmNvbmNhdChbXSk7XG5cbiAgICAgICAgY29sS2V5ID0gc3RhcnRDb2w7XG5cbiAgICAgICAgbGV0IGhhc05leHRDb2wgPSBpc1NoZWV0Q29sRW5kID8gIWlzU2hlZXRDb2xFbmQoc2hlZXQsIGNvbEtleSkgOiB0cnVlO1xuICAgICAgICB3aGlsZSAoaGFzTmV4dENvbCkge1xuICAgICAgICAgICAgaWYgKCEoaXNTa2lwU2hlZXRDb2wgPyBpc1NraXBTaGVldENvbChzaGVldCwgY29sS2V5KSA6IGZhbHNlKSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNoZWV0LCBjb2xLZXksIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29sS2V5ID0gZ2V0TmV4dENvbEtleShjb2xDaGFyQ29kZXMpO1xuICAgICAgICAgICAgY3VyQ29sQ29kZVN1bSA9IGdldENoYXJDb2RlU3VtKGNvbEtleSk7XG4gICAgICAgICAgICBpZiAobWF4Q29sS2V5Q29kZVN1bSA+PSBjdXJDb2xDb2RlU3VtKSB7XG4gICAgICAgICAgICAgICAgaGFzTmV4dENvbCA9IGlzU2hlZXRDb2xFbmQgPyAhaXNTaGVldENvbEVuZChzaGVldCwgY29sS2V5KSA6IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhc05leHRDb2wgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiDmqKrlkJHpgY3ljobooajmoLxcbiAqIEBwYXJhbSBzaGVldCB4bHN46KGo5qC85a+56LGhXG4gKiBAcGFyYW0gc3RhcnRSb3cg5byA5aeL6KGMIOS7jjHlvIDlp4tcbiAqIEBwYXJhbSBzdGFydENvbCDliJflrZfnrKYg5q+U5aaCQSBCXG4gKiBAcGFyYW0gY2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWRcbiAqIEBwYXJhbSBpc1NoZWV0Um93RW5kIOaYr+WQpuihjOe7k+adn+WIpOaWreaWueazlVxuICogQHBhcmFtIGlzU2hlZXRDb2xFbmQg5piv5ZCm5YiX57uT5p2f5Yik5pat5pa55rOVXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRSb3cg5piv5ZCm6Lez6L+H6KGMXG4gKiBAcGFyYW0gaXNTa2lwU2hlZXRDb2wg5piv5ZCm6Lez6L+H5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBob3Jpem9udGFsRm9yRWFjaFNoZWV0KFxuICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgIHN0YXJ0Um93OiBudW1iZXIsXG4gICAgc3RhcnRDb2w6IHN0cmluZyxcbiAgICBjYWxsYmFjazogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZywgcm93SW5kZXg6IG51bWJlcikgPT4gdm9pZCxcbiAgICBpc1NoZWV0Um93RW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxuICAgIGlzU2hlZXRDb2xFbmQ/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbGtleTogc3RyaW5nKSA9PiBib29sZWFuLFxuICAgIGlzU2tpcFNoZWV0Um93PzogKHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKSA9PiBib29sZWFuLFxuICAgIGlzU2tpcFNoZWV0Q29sPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xLZXk6IHN0cmluZykgPT4gYm9vbGVhblxuKSB7XG4gICAgY29uc3Qgc2hlZXRSZWY6IHN0cmluZyA9IHNoZWV0W1wiIXJlZlwiXTtcbiAgICBjb25zdCBtYXhSb3dOdW0gPSBwYXJzZUludChzaGVldFJlZi5tYXRjaCgvXFxkKyQvKVswXSk7XG5cbiAgICBjb25zdCBtYXhDb2xLZXkgPSBzaGVldFJlZi5zcGxpdChcIjpcIilbMV0ubWF0Y2goL15bQS1aYS16XSsvKVswXTtcbiAgICBjb25zdCBtYXhDb2xLZXlDb2RlU3VtID0gZ2V0Q2hhckNvZGVTdW0obWF4Q29sS2V5KTtcbiAgICBsZXQgY29sQ2hhckNvZGVzOiBudW1iZXJbXTtcbiAgICBsZXQgY29sS2V5OiBzdHJpbmc7XG4gICAgY29sQ2hhckNvZGVzID0gc3RyaW5nVG9DaGFyQ29kZXMoc3RhcnRDb2wpO1xuICAgIGxldCBjdXJDb2xDb2RlU3VtOiBudW1iZXIgPSAwO1xuICAgIGNvbEtleSA9IHN0YXJ0Q29sO1xuICAgIGxldCBoYXNOZXh0Q29sID0gaXNTaGVldENvbEVuZCA/ICFpc1NoZWV0Q29sRW5kKHNoZWV0LCBjb2xLZXkpIDogdHJ1ZTtcbiAgICB3aGlsZSAoaGFzTmV4dENvbCkge1xuICAgICAgICBpZiAoIShpc1NraXBTaGVldENvbCA/IGlzU2tpcFNoZWV0Q29sKHNoZWV0LCBjb2xLZXkpIDogZmFsc2UpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gc3RhcnRSb3c7IGkgPD0gbWF4Um93TnVtOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNTaGVldFJvd0VuZCA/IGlzU2hlZXRSb3dFbmQoc2hlZXQsIGkpIDogZmFsc2UpIGJyZWFrO1xuICAgICAgICAgICAgICAgIGlmIChpc1NraXBTaGVldFJvdyA/IGlzU2tpcFNoZWV0Um93KHNoZWV0LCBpKSA6IGZhbHNlKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhzaGVldCwgY29sS2V5LCBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbEtleSA9IGdldE5leHRDb2xLZXkoY29sQ2hhckNvZGVzKTtcbiAgICAgICAgY3VyQ29sQ29kZVN1bSA9IGdldENoYXJDb2RlU3VtKGNvbEtleSk7XG4gICAgICAgIGlmIChtYXhDb2xLZXlDb2RlU3VtID49IGN1ckNvbENvZGVTdW0pIHtcbiAgICAgICAgICAgIGhhc05leHRDb2wgPSBpc1NoZWV0Q29sRW5kID8gIWlzU2hlZXRDb2xFbmQoc2hlZXQsIGNvbEtleSkgOiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFzTmV4dENvbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxubGV0IGNvbEtleVN1bU1hcCA9IHt9O1xuZnVuY3Rpb24gZ2V0Q2hhckNvZGVTdW0oY29sS2V5OiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGxldCBzdW06IG51bWJlciA9IGNvbEtleVN1bU1hcFtjb2xLZXldO1xuICAgIGlmICghc3VtKSB7XG4gICAgICAgIHN1bSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sS2V5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzdW0gKz0gY29sS2V5LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgY29sS2V5U3VtTWFwW2NvbEtleV0gPSBzdW07XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59XG4vKipcbiAqIOivu+WPlumFjee9ruihqOaWh+S7tiDlkIzmraXnmoRcbiAqIEBwYXJhbSBmaWxlSW5mb1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZFRhYmxlRmlsZShmaWxlSW5mbzogSUZpbGVJbmZvKTogeGxzeC5Xb3JrQm9vayB7XG4gICAgY29uc3Qgd29ya0Jvb2sgPSB4bHN4LnJlYWRGaWxlKGZpbGVJbmZvLmZpbGVQYXRoLCB7IHR5cGU6IGdldFRhYmxlRmlsZVR5cGUoZmlsZUluZm8pIH0pO1xuICAgIHJldHVybiB3b3JrQm9vaztcbn1cbi8qKlxuICog6K+75Y+W6YWN572u6KGo5paH5Lu2IOWQjOatpeeahFxuICogQHBhcmFtIGZpbGVJbmZvXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkVGFibGVEYXRhKGZpbGVJbmZvOiBJRmlsZUluZm8pOiB4bHN4LldvcmtCb29rIHtcbiAgICBjb25zdCB3b3JrQm9vayA9IHhsc3gucmVhZChmaWxlSW5mby5maWxlRGF0YSk7XG4gICAgcmV0dXJuIHdvcmtCb29rO1xufVxuLyoqXG4gKiDojrflj5bphY3nva7mlofku7bnsbvlnotcbiAqIEBwYXJhbSBmaWxlSW5mb1xuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYmxlRmlsZVR5cGUoZmlsZUluZm86IElGaWxlSW5mbykge1xuICAgIHJldHVybiBpc0NTVihmaWxlSW5mby5maWxlRXh0TmFtZSkgPyBcInN0cmluZ1wiIDogXCJmaWxlXCI7XG59XG4vKipcbiAqIOagueaNruaWh+S7tuWQjeWQjue8gOWIpOaWreaYr+WQpuS4umNzduaWh+S7tlxuICogQHBhcmFtIGZpbGVFeHROYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NTVihmaWxlRXh0TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZpbGVFeHROYW1lID09PSBcImNzdlwiO1xufVxuIiwiaW1wb3J0ICogYXMgeGxzeCBmcm9tIFwieGxzeFwiO1xuaW1wb3J0IHsgdmFsdWVUcmFuc0Z1bmNNYXAgfSBmcm9tIFwiLi9kZWZhdWx0LXZhbHVlLWZ1bmMtbWFwXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dlclwiO1xuaW1wb3J0IHsgaG9yaXpvbnRhbEZvckVhY2hTaGVldCwgaXNFbXB0eUNlbGwsIHJlYWRUYWJsZURhdGEsIHJlYWRUYWJsZUZpbGUsIHZlcnRpY2FsRm9yRWFjaFNoZWV0IH0gZnJvbSBcIi4vdGFibGUtdXRpbHNcIjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJVGFibGVGaWVsZCB7XG4gICAgICAgIC8qKumFjee9ruihqOS4reazqOmHiuWAvCAqL1xuICAgICAgICB0ZXh0OiBzdHJpbmc7XG4gICAgICAgIC8qKumFjee9ruihqOS4reexu+Wei+WAvCAqL1xuICAgICAgICBvcmlnaW5UeXBlOiBzdHJpbmc7XG4gICAgICAgIC8qKumFjee9ruihqOS4reWtl+auteWQjeWAvCAqL1xuICAgICAgICBvcmlnaW5GaWVsZE5hbWU6IHN0cmluZztcbiAgICAgICAgLyoq6Kej5p6Q5ZCO55qE57G75Z6L5YC8ICovXG4gICAgICAgIHR5cGU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuino+aekOWQjueahOWtl+auteWQjeWAvCAqL1xuICAgICAgICBmaWVsZE5hbWU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuWvueixoeeahOWtkOWtl+auteWQjSAqL1xuICAgICAgICBzdWJGaWVsZE5hbWU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuWkmuWIl+WvueixoSAqL1xuICAgICAgICBpc011dGlDb2xPYmo/OiBib29sZWFuO1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSVRhYmxlRGVmaW5lIHtcbiAgICAgICAgLyoq6YWN572u6KGo5ZCNICovXG4gICAgICAgIHRhYmxlTmFtZTogc3RyaW5nO1xuICAgICAgICAvKirphY3nva7ooajnsbvlnosg6buY6K6k5Lik56eNOiB2ZXJ0aWNhbCDlkowgaG9yaXpvbnRhbCovXG4gICAgICAgIHRhYmxlVHlwZTogc3RyaW5nO1xuXG4gICAgICAgIC8qKuW8gOWni+ihjOS7jjHlvIDlp4sgKi9cbiAgICAgICAgc3RhcnRSb3c6IG51bWJlcjtcbiAgICAgICAgLyoq5byA5aeL5YiX5LuOQeW8gOWniyAqL1xuICAgICAgICBzdGFydENvbDogc3RyaW5nO1xuICAgICAgICAvKirlnoLnm7Top6PmnpDlrZfmrrXlrprkuYkgKi9cbiAgICAgICAgdmVydGljYWxGaWVsZERlZmluZTogSVZlcnRpY2FsRmllbGREZWZpbmU7XG4gICAgICAgIC8qKuaoquWQkeino+aekOWtl+auteWumuS5iSAqL1xuICAgICAgICBob3Jpem9udGFsRmllbGREZWZpbmU6IElIb3Jpem9udGFsRmllbGREZWZpbmU7XG4gICAgfVxuICAgIGludGVyZmFjZSBJSG9yaXpvbnRhbEZpZWxkRGVmaW5lIHtcbiAgICAgICAgLyoq57G75Z6L6KGMICovXG4gICAgICAgIHR5cGVDb2w6IHN0cmluZztcbiAgICAgICAgLyoq5a2X5q615ZCN6KGMICovXG4gICAgICAgIGZpZWxkQ29sOiBzdHJpbmc7XG4gICAgICAgIC8qKuazqOmHiuihjCAqL1xuICAgICAgICB0ZXh0Q29sOiBzdHJpbmc7XG4gICAgfVxuICAgIGludGVyZmFjZSBJVmVydGljYWxGaWVsZERlZmluZSB7XG4gICAgICAgIC8qKuexu+Wei+ihjCAqL1xuICAgICAgICB0eXBlUm93OiBudW1iZXI7XG4gICAgICAgIC8qKuWtl+auteWQjeihjCAqL1xuICAgICAgICBmaWVsZFJvdzogbnVtYmVyO1xuICAgICAgICAvKirms6jph4rooYwgKi9cbiAgICAgICAgdGV4dFJvdzogbnVtYmVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlrZfmrrXlrZflhbhcbiAgICAgKiBrZXnmmK/liJdjb2xLZXlcbiAgICAgKiB2YWx1ZeaYr+Wtl+auteWvueixoVxuICAgICAqL1xuICAgIHR5cGUgQ29sS2V5VGFibGVGaWVsZE1hcCA9IHsgW2tleTogc3RyaW5nXTogSVRhYmxlRmllbGQgfTtcblxuICAgIC8qKlxuICAgICAqIOihqOagvOeahOS4gOihjOaIluiAheS4gOWIl1xuICAgICAqIGtleeS4uuWtl+auteWQjeWAvO+8jHZhbHVl5Li66KGo5qC855qE5LiA5qC8XG4gICAgICovXG4gICAgdHlwZSBUYWJsZVJvd09yQ29sID0geyBba2V5OiBzdHJpbmddOiBJVGFibGVDZWxsIH07XG4gICAgLyoqXG4gICAgICog6KGo5qC855qE5LiA5qC8XG4gICAgICovXG4gICAgaW50ZXJmYWNlIElUYWJsZUNlbGwge1xuICAgICAgICAvKirlrZfmrrXlr7nosaEgKi9cbiAgICAgICAgZmlsZWQ6IElUYWJsZUZpZWxkO1xuICAgICAgICAvKirlgLwgKi9cbiAgICAgICAgdmFsdWU6IGFueTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6KGo5qC86KGM5oiW5YiX55qE5a2X5YW4XG4gICAgICoga2V55Li66KGM57Si5byV77yMdmFsdWXkuLrooajmoLznmoTkuIDooYxcbiAgICAgKi9cbiAgICB0eXBlIFRhYmxlUm93T3JDb2xNYXAgPSB7IFtrZXk6IHN0cmluZ106IFRhYmxlUm93T3JDb2wgfTtcbiAgICAvKipcbiAgICAgKiDooajmoLzooYzmiJbliJflgLzmlbDnu4RcbiAgICAgKiBrZXnkuLvplK7vvIx2YWx1ZeaYr+WAvOaVsOe7hFxuICAgICAqL1xuICAgIHR5cGUgUm93T3JDb2xWYWx1ZXNNYXAgPSB7IFtrZXk6IHN0cmluZ106IGFueVtdIH07XG4gICAgaW50ZXJmYWNlIElUYWJsZVZhbHVlcyB7XG4gICAgICAgIC8qKuWtl+auteWQjeaVsOe7hCAqL1xuICAgICAgICBmaWVsZHM6IHN0cmluZ1tdO1xuICAgICAgICAvKirooajmoLzlgLzmlbDnu4QgKi9cbiAgICAgICAgcm93T3JDb2xWYWx1ZXNNYXA6IFJvd09yQ29sVmFsdWVzTWFwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDnu5PmnpxcbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSVRhYmxlUGFyc2VSZXN1bHQge1xuICAgICAgICAvKirphY3nva7ooajlrprkuYkgKi9cbiAgICAgICAgdGFibGVEZWZpbmU/OiBJVGFibGVEZWZpbmU7XG4gICAgICAgIC8qKuW9k+WJjeWIhuihqOWQjSAqL1xuICAgICAgICBjdXJTaGVldE5hbWU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuWtl+auteWtl+WFuCAqL1xuICAgICAgICBmaWxlZE1hcD86IENvbEtleVRhYmxlRmllbGRNYXA7XG4gICAgICAgIC8vIC8qKuihqOagvOihjOaIluWIl+eahOWtl+WFuCAqL1xuICAgICAgICAvLyByb3dPckNvbE1hcDogVGFibGVSb3dPckNvbE1hcFxuICAgICAgICAvKirljZXkuKrooajmoLzlr7nosaEgKi9cbiAgICAgICAgLyoqa2V55piv5Li76ZSu5YC877yMdmFsdWXmmK/kuIDooYzlr7nosaEgKi9cbiAgICAgICAgdGFibGVPYmo/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xuICAgICAgICAvKirlvZPliY3ooYzmiJbliJflr7nosaEgKi9cbiAgICAgICAgY3VyUm93T3JDb2xPYmo/OiBhbnk7XG4gICAgICAgIC8qKuS4u+mUruWAvCAqL1xuICAgICAgICBtYWluS2V5RmllbGROYW1lPzogc3RyaW5nO1xuICAgIH1cblxuICAgIC8qKuWAvOi9rOaNouaWueazlSAqL1xuICAgIGludGVyZmFjZSBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgICAgIGVycm9yPzogYW55O1xuICAgICAgICB2YWx1ZT86IGFueTtcbiAgICB9XG4gICAgdHlwZSBWYWx1ZVRyYW5zRnVuYyA9IChmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IGFueSkgPT4gSVRyYW5zVmFsdWVSZXN1bHQ7XG4gICAgLyoqXG4gICAgICog5YC86L2s5o2i5pa55rOV5a2X5YW4XG4gICAgICoga2V55piv57G75Z6La2V5XG4gICAgICogdmFsdWXmmK/mlrnms5VcbiAgICAgKi9cbiAgICB0eXBlIFZhbHVlVHJhbnNGdW5jTWFwID0geyBba2V5OiBzdHJpbmddOiBWYWx1ZVRyYW5zRnVuYyB9O1xufVxuZXhwb3J0IGVudW0gVGFibGVUeXBlIHtcbiAgICB2ZXJ0aWNhbCA9IFwidmVydGljYWxcIixcbiAgICBob3Jpem9udGFsID0gXCJob3Jpem9udGFsXCJcbn1cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRQYXJzZUhhbmRsZXIgaW1wbGVtZW50cyBJVGFibGVQYXJzZUhhbmRsZXIge1xuICAgIHByaXZhdGUgX3ZhbHVlVHJhbnNGdW5jTWFwOiBWYWx1ZVRyYW5zRnVuY01hcDtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fdmFsdWVUcmFuc0Z1bmNNYXAgPSB2YWx1ZVRyYW5zRnVuY01hcDtcbiAgICB9XG4gICAgZ2V0VGFibGVEZWZpbmUoZmlsZUluZm86IElGaWxlSW5mbywgd29ya0Jvb2s6IHhsc3guV29ya0Jvb2spOiBJVGFibGVEZWZpbmUge1xuICAgICAgICBsZXQgY2VsbEtleTogc3RyaW5nO1xuICAgICAgICBsZXQgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0O1xuXG4gICAgICAgIGNvbnN0IHNoZWV0TmFtZXMgPSB3b3JrQm9vay5TaGVldE5hbWVzO1xuICAgICAgICBsZXQgc2hlZXQ6IHhsc3guU2hlZXQ7XG4gICAgICAgIGxldCBmaXJzdENlbGxWYWx1ZTogeyB0YWJsZU5hbWVJblNoZWV0OiBzdHJpbmc7IHRhYmxlVHlwZTogc3RyaW5nIH07XG4gICAgICAgIGxldCBmaXJzdENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdDtcblxuICAgICAgICBjb25zdCB0YWJsZURlZmluZTogUGFydGlhbDxJVGFibGVEZWZpbmU+ID0ge307XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGVldE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzaGVldCA9IHdvcmtCb29rLlNoZWV0c1tzaGVldE5hbWVzW2ldXTtcbiAgICAgICAgICAgIGZpcnN0Q2VsbE9iaiA9IHNoZWV0W1wiQVwiICsgMV07XG4gICAgICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGZpcnN0Q2VsbE9iaikpIHtcbiAgICAgICAgICAgICAgICBmaXJzdENlbGxWYWx1ZSA9IHRoaXMuX2dldEZpcnN0Q2VsbFZhbHVlKGZpcnN0Q2VsbE9iaik7XG4gICAgICAgICAgICAgICAgaWYgKCF0YWJsZURlZmluZS50YWJsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUudGFibGVOYW1lID0gZmlyc3RDZWxsVmFsdWUudGFibGVOYW1lSW5TaGVldDtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUudGFibGVUeXBlID0gZmlyc3RDZWxsVmFsdWUudGFibGVUeXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RDZWxsVmFsdWUgJiYgZmlyc3RDZWxsVmFsdWUudGFibGVOYW1lSW5TaGVldCA9PT0gdGFibGVEZWZpbmUudGFibGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhYmxlRGVmaW5lLnRhYmxlTmFtZSB8fCAhdGFibGVEZWZpbmUudGFibGVUeXBlKSB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGDooajmoLzkuI3op4TojIMs6Lez6L+H6Kej5p6QLOi3r+W+hDoke2ZpbGVJbmZvLmZpbGVQYXRofWAsIFwid2FyblwiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGFibGVEZWZpbmUudmVydGljYWxGaWVsZERlZmluZSA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgIGNvbnN0IHZlcnRpY2FsRmllbGREZWZpbmU6IElWZXJ0aWNhbEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUudmVydGljYWxGaWVsZERlZmluZTtcbiAgICAgICAgICAgIHZlcnRpY2FsRmllbGREZWZpbmUudGV4dFJvdyA9IDE7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY2VsbEtleSA9IFwiQVwiICsgaTtcbiAgICAgICAgICAgICAgICBjZWxsT2JqID0gc2hlZXRbY2VsbEtleV07XG4gICAgICAgICAgICAgICAgaWYgKGlzRW1wdHlDZWxsKGNlbGxPYmopIHx8IGNlbGxPYmoudiA9PT0gXCJOT1wiIHx8IGNlbGxPYmoudiA9PT0gXCJFTkRcIiB8fCBjZWxsT2JqLnYgPT09IFwiU1RBUlRcIikge1xuICAgICAgICAgICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydFJvdyA9IGk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjZWxsT2JqLnYgPT09IFwiQ0xJRU5UXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWxGaWVsZERlZmluZS5maWVsZFJvdyA9IGk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjZWxsT2JqLnYgPT09IFwiVFlQRVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsRmllbGREZWZpbmUudHlwZVJvdyA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0YWJsZURlZmluZS5zdGFydFJvdyAmJiB2ZXJ0aWNhbEZpZWxkRGVmaW5lLmZpZWxkUm93ICYmIHZlcnRpY2FsRmllbGREZWZpbmUudHlwZVJvdykgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Q29sID0gXCJCXCI7XG4gICAgICAgIH0gZWxzZSBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuICAgICAgICAgICAgdGFibGVEZWZpbmUuaG9yaXpvbnRhbEZpZWxkRGVmaW5lID0ge30gYXMgYW55O1xuICAgICAgICAgICAgY29uc3QgaG9yaXpvbnRhbEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUuaG9yaXpvbnRhbEZpZWxkRGVmaW5lO1xuICAgICAgICAgICAgaG9yaXpvbnRhbEZpZWxkRGVmaW5lLnRleHRDb2wgPSBcIkFcIjtcbiAgICAgICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZS50eXBlQ29sID0gXCJCXCI7XG4gICAgICAgICAgICBob3Jpem9udGFsRmllbGREZWZpbmUuZmllbGRDb2wgPSBcIkNcIjtcbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Q29sID0gXCJFXCI7XG4gICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydFJvdyA9IDI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFibGVEZWZpbmUgYXMgYW55O1xuICAgIH1cbiAgICBwcml2YXRlIF9nZXRGaXJzdENlbGxWYWx1ZShmaXJzdENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCkge1xuICAgICAgICBpZiAoIWZpcnN0Q2VsbE9iaikgcmV0dXJuO1xuICAgICAgICBjb25zdCBjZWxsVmFsdWVzID0gKGZpcnN0Q2VsbE9iai52IGFzIHN0cmluZykuc3BsaXQoXCI6XCIpO1xuICAgICAgICBsZXQgdGFibGVOYW1lSW5TaGVldDogc3RyaW5nO1xuICAgICAgICBsZXQgdGFibGVUeXBlOiBzdHJpbmc7XG4gICAgICAgIGlmIChjZWxsVmFsdWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHRhYmxlTmFtZUluU2hlZXQgPSBjZWxsVmFsdWVzWzFdO1xuICAgICAgICAgICAgdGFibGVUeXBlID0gY2VsbFZhbHVlc1swXSA9PT0gXCJIXCIgPyBUYWJsZVR5cGUuaG9yaXpvbnRhbCA6IFRhYmxlVHlwZS52ZXJ0aWNhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhYmxlTmFtZUluU2hlZXQgPSBjZWxsVmFsdWVzWzBdO1xuICAgICAgICAgICAgdGFibGVUeXBlID0gVGFibGVUeXBlLnZlcnRpY2FsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHRhYmxlTmFtZUluU2hlZXQ6IHRhYmxlTmFtZUluU2hlZXQsIHRhYmxlVHlwZTogdGFibGVUeXBlIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWIpOaWreihqOagvOaYr+WQpuiDveino+aekFxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqL1xuICAgIGNoZWNrU2hlZXRDYW5QYXJzZSh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgc2hlZXROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgLy/lpoLmnpzov5nkuKrooajkuKrnrKzkuIDmoLzlgLzkuI3nrYnkuo7ooajlkI3vvIzliJnkuI3op6PmnpBcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtcIkFcIiArIDFdO1xuICAgICAgICBjb25zdCBmaXJzdENlbGxWYWx1ZSA9IHRoaXMuX2dldEZpcnN0Q2VsbFZhbHVlKGZpcnN0Q2VsbE9iaik7XG4gICAgICAgIGlmIChmaXJzdENlbGxPYmogJiYgdGFibGVEZWZpbmUpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdENlbGxWYWx1ZS50YWJsZU5hbWVJblNoZWV0ICE9PSB0YWJsZURlZmluZS50YWJsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDooajooYznu5PmnZ/liKTmlq1cbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmVcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gcm93XG4gICAgICovXG4gICAgaXNTaGVldFJvd0VuZCh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgcm93OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLy8gaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLnZlcnRpY2FsKSB7XG5cbiAgICAgICAgLy8gfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG5cbiAgICAgICAgLy8gfVxuICAgICAgICAvL+WIpOaWreS4iuS4gOihjOeahOagh+W/l+aYr+WQpuS4ukVORFxuICAgICAgICBpZiAocm93ID4gMSkge1xuICAgICAgICAgICAgcm93ID0gcm93IC0gMTtcbiAgICAgICAgICAgIGNvbnN0IGNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W1wiQVwiICsgcm93XTtcbiAgICAgICAgICAgIHJldHVybiBjZWxsT2JqICYmIGNlbGxPYmoudiA9PT0gXCJFTkRcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDooajliJfnu5PmnZ/liKTmlq1cbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmVcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICovXG4gICAgaXNTaGVldENvbEVuZCh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgLy/liKTmlq3ov5nkuIDliJfnrKzkuIDooYzmmK/lkKbkuLrnqbpcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyAxXTtcbiAgICAgICAgLy8gY29uc3QgdHlwZUNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHRhYmxlRmlsZS50YWJsZURlZmluZS50eXBlUm93XTtcbiAgICAgICAgcmV0dXJuIGlzRW1wdHlDZWxsKGZpcnN0Q2VsbE9iaik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOajgOafpeihjOaYr+WQpumcgOimgeino+aekFxuICAgICAqIEBwYXJhbSB0YWJsZURlZmluZVxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSByb3dJbmRleFxuICAgICAqL1xuICAgIGNoZWNrUm93TmVlZFBhcnNlKHRhYmxlRGVmaW5lOiBJVGFibGVEZWZpbmUsIHNoZWV0OiB4bHN4LlNoZWV0LCByb3dJbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W1wiQVwiICsgcm93SW5kZXhdO1xuICAgICAgICBpZiAoY2VsbE9iaiAmJiBjZWxsT2JqLnYgPT09IFwiTk9cIikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDljZXkuKrmoLzlrZBcbiAgICAgKiBAcGFyYW0gdGFibGVQYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKiBAcGFyYW0gcm93SW5kZXhcbiAgICAgKiBAcGFyYW0gaXNOZXdSb3dPckNvbCDmmK/lkKbkuLrmlrDnmoTkuIDooYzmiJbogIXkuIDliJdcbiAgICAgKi9cbiAgICBwYXJzZVZlcnRpY2FsQ2VsbChcbiAgICAgICAgdGFibGVQYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsXG4gICAgICAgIHNoZWV0OiB4bHN4LlNoZWV0LFxuICAgICAgICBjb2xLZXk6IHN0cmluZyxcbiAgICAgICAgcm93SW5kZXg6IG51bWJlcixcbiAgICAgICAgaXNOZXdSb3dPckNvbDogYm9vbGVhblxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBmaWVsZEluZm8gPSB0aGlzLmdldFZlcnRpY2FsVGFibGVGaWVsZCh0YWJsZVBhcnNlUmVzdWx0LCBzaGVldCwgY29sS2V5LCByb3dJbmRleCk7XG4gICAgICAgIGlmICghZmllbGRJbmZvKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGNlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHJvd0luZGV4XTtcbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKGNlbGwpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0cmFuc1Jlc3VsdCA9IHRoaXMudHJhbnNWYWx1ZSh0YWJsZVBhcnNlUmVzdWx0LCBmaWVsZEluZm8sIGNlbGwudik7XG4gICAgICAgIGlmICh0cmFuc1Jlc3VsdC5lcnJvcikge1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhcbiAgICAgICAgICAgICAgICBgISEhISEhISEhISEhISEhISEhWy0tLS0t6Kej5p6Q6ZSZ6K+vLS0tLS1dISEhISEhISEhISEhISEhISEhISEhISEhIVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBgW3NoZWV0TmFtZXzliIbooajlkI1dPT4gJHt0YWJsZVBhcnNlUmVzdWx0LmN1clNoZWV0TmFtZX1cXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYFtyb3d86KGMXT0+ICR7cm93SW5kZXh9XFxuYCArXG4gICAgICAgICAgICAgICAgICAgIGBbY29sfOWIl109PiAke2NvbEtleX1cXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYFtmaWVsZHzlrZfmrrVdPT4gJHtmaWVsZEluZm8ub3JpZ2luRmllbGROYW1lfVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBgW3R5cGV857G75Z6LXT0+ICR7ZmllbGRJbmZvLm9yaWdpblR5cGV9XFxuYCArXG4gICAgICAgICAgICAgICAgICAgIGBbZXJyb3J86ZSZ6K+vXT0+ICR7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdHJhbnNSZXN1bHQuZXJyb3IgPT09IFwic3RyaW5nXCIgPyB0cmFuc1Jlc3VsdC5lcnJvciA6IHRyYW5zUmVzdWx0LmVycm9yLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfVxcbmAsXG4gICAgICAgICAgICAgICAgXCJlcnJvclwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgLy8gTG9nZ2VyLmxvZyh0cmFuc1Jlc3VsdC5lcnJvciwgXCJlcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0cmFuc2VkVmFsdWUgPSB0cmFuc1Jlc3VsdC52YWx1ZTtcbiAgICAgICAgbGV0IG1haW5LZXlGaWVsZE5hbWU6IHN0cmluZyA9IHRhYmxlUGFyc2VSZXN1bHQubWFpbktleUZpZWxkTmFtZTtcbiAgICAgICAgaWYgKCFtYWluS2V5RmllbGROYW1lKSB7XG4gICAgICAgICAgICAvL+esrOS4gOS4quWtl+auteWwseaYr+S4u+mUrlxuICAgICAgICAgICAgbWFpbktleUZpZWxkTmFtZSA9IGZpZWxkSW5mby5maWVsZE5hbWU7XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0Lm1haW5LZXlGaWVsZE5hbWUgPSBmaWVsZEluZm8uZmllbGROYW1lO1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9iaiA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGxldCByb3dPckNvbE9iajogYW55ID0gdGFibGVQYXJzZVJlc3VsdC5jdXJSb3dPckNvbE9iajtcbiAgICAgICAgaWYgKGlzTmV3Um93T3JDb2wpIHtcbiAgICAgICAgICAgIC8v5paw55qE5LiA6KGMXG4gICAgICAgICAgICByb3dPckNvbE9iaiA9IHt9O1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5jdXJSb3dPckNvbE9iaiA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbdHJhbnNlZFZhbHVlXSA9IHJvd09yQ29sT2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkSW5mby5pc011dGlDb2xPYmopIHtcbiAgICAgICAgICAgIGxldCBzdWJPYmogPSByb3dPckNvbE9ialtmaWVsZEluZm8uZmllbGROYW1lXTtcbiAgICAgICAgICAgIGlmICghc3ViT2JqKSB7XG4gICAgICAgICAgICAgICAgc3ViT2JqID0ge307XG4gICAgICAgICAgICAgICAgcm93T3JDb2xPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSBzdWJPYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJPYmpbZmllbGRJbmZvLnN1YkZpZWxkTmFtZV0gPSB0cmFuc2VkVmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb3dPckNvbE9ialtmaWVsZEluZm8uZmllbGROYW1lXSA9IHRyYW5zZWRWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDmqKrlkJHljZXkuKrmoLzlrZBcbiAgICAgKiBAcGFyYW0gdGFibGVQYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKiBAcGFyYW0gcm93SW5kZXhcbiAgICAgKiBAcGFyYW0gaXNOZXdSb3dPckNvbCDmmK/lkKbkuLrmlrDnmoTkuIDooYzmiJbogIXkuIDliJdcbiAgICAgKi9cbiAgICBwYXJzZUhvcml6b250YWxDZWxsKFxuICAgICAgICB0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgICAgIGNvbEtleTogc3RyaW5nLFxuICAgICAgICByb3dJbmRleDogbnVtYmVyLFxuICAgICAgICBpc05ld1Jvd09yQ29sOiBib29sZWFuXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpZWxkSW5mbyA9IHRoaXMuZ2V0SG9yaXpvbnRhbFRhYmxlRmllbGQodGFibGVQYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgpO1xuICAgICAgICBpZiAoIWZpZWxkSW5mbykgcmV0dXJuO1xuICAgICAgICBjb25zdCBjZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyYW5zUmVzdWx0ID0gdGhpcy50cmFuc1ZhbHVlKHRhYmxlUGFyc2VSZXN1bHQsIGZpZWxkSW5mbywgY2VsbC52KTtcbiAgICAgICAgaWYgKHRyYW5zUmVzdWx0LmVycm9yKSB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKFxuICAgICAgICAgICAgICAgIGAhISEhISEhISEhISEhISEhISFbLS0tLS1QYXJzZUVycm9yfOino+aekOmUmeivry0tLS0tXSEhISEhISEhISEhISEhISEhISEhISEhISFcXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYFtzaGVldE5hbWV85YiG6KGo5ZCNXT0+ICR7dGFibGVQYXJzZVJlc3VsdC5jdXJTaGVldE5hbWV9XFxuYCArXG4gICAgICAgICAgICAgICAgICAgIGBbcm93fOihjF09PiAke3Jvd0luZGV4fVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBgW2NvbHzliJddPT4gJHtjb2xLZXl9XFxuYCArXG4gICAgICAgICAgICAgICAgICAgIGBbZmllbGR85a2X5q61XT0+ICR7ZmllbGRJbmZvLm9yaWdpbkZpZWxkTmFtZX1cXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYFt0eXBlfOexu+Wei109PiAke2ZpZWxkSW5mby5vcmlnaW5UeXBlfVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBgW2Vycm9yfOmUmeivr109PiAke1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHRyYW5zUmVzdWx0LmVycm9yID09PSBcInN0cmluZ1wiID8gdHJhbnNSZXN1bHQuZXJyb3IgOiB0cmFuc1Jlc3VsdC5lcnJvci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIH1cXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYCEhISEhISEhISEhISEhISEhIVstLS0tLVBhcnNlRXJyb3J86Kej5p6Q6ZSZ6K+vLS0tLS1dISEhISEhISEhISEhISEhISEhISEhISEhIVxcbmAsXG5cbiAgICAgICAgICAgICAgICBcImVycm9yXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJhbnNlZFZhbHVlID0gdHJhbnNSZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICghdGFibGVQYXJzZVJlc3VsdC50YWJsZU9iaikge1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9iaiA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWVsZEluZm8uaXNNdXRpQ29sT2JqKSB7XG4gICAgICAgICAgICBsZXQgc3ViT2JqID0gdGFibGVQYXJzZVJlc3VsdC50YWJsZU9ialtmaWVsZEluZm8uZmllbGROYW1lXTtcbiAgICAgICAgICAgIGlmICghc3ViT2JqKSB7XG4gICAgICAgICAgICAgICAgc3ViT2JqID0ge307XG4gICAgICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9ialtmaWVsZEluZm8uZmllbGROYW1lXSA9IHN1Yk9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1Yk9ialtmaWVsZEluZm8uc3ViRmllbGROYW1lXSA9IHRyYW5zZWRWYWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSB0cmFuc2VkVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kej5p6Q5Ye65a2X5q615a+56LGhXG4gICAgICogQHBhcmFtIHRhYmxlUGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICogQHBhcmFtIHJvd0luZGV4XG4gICAgICovXG4gICAgZ2V0VmVydGljYWxUYWJsZUZpZWxkKFxuICAgICAgICB0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgICAgIGNvbEtleTogc3RyaW5nLFxuICAgICAgICByb3dJbmRleDogbnVtYmVyXG4gICAgKTogSVRhYmxlRmllbGQge1xuICAgICAgICBjb25zdCB0YWJsZURlZmluZSA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVEZWZpbmU7XG4gICAgICAgIGxldCB0YWJsZUZpbGVkTWFwID0gdGFibGVQYXJzZVJlc3VsdC5maWxlZE1hcDtcbiAgICAgICAgaWYgKCF0YWJsZUZpbGVkTWFwKSB7XG4gICAgICAgICAgICB0YWJsZUZpbGVkTWFwID0ge307XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LmZpbGVkTWFwID0gdGFibGVGaWxlZE1hcDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2ZXJ0aWNhbEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUudmVydGljYWxGaWVsZERlZmluZTtcbiAgICAgICAgY29uc3QgZmlsZWRDZWxsID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS5maWVsZFJvd107XG4gICAgICAgIGxldCBvcmlnaW5GaWVsZE5hbWU6IHN0cmluZztcbiAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChmaWxlZENlbGwpKSB7XG4gICAgICAgICAgICBvcmlnaW5GaWVsZE5hbWUgPSBmaWxlZENlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvcmlnaW5GaWVsZE5hbWUpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgZmllbGQ6IElUYWJsZUZpZWxkID0ge30gYXMgYW55O1xuICAgICAgICAvL+e8k+WtmFxuICAgICAgICBpZiAodGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgLy/ms6jph4pcbiAgICAgICAgY29uc3QgdGV4dENlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUudGV4dFJvd107XG4gICAgICAgIGlmICghaXNFbXB0eUNlbGwodGV4dENlbGwpKSB7XG4gICAgICAgICAgICBmaWVsZC50ZXh0ID0gdGV4dENlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgLy/nsbvlnotcbiAgICAgICAgbGV0IGlzT2JqVHlwZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBjb25zdCB0eXBlQ2VsbCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUudHlwZVJvd107XG5cbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKHR5cGVDZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZC5vcmlnaW5UeXBlID0gdHlwZUNlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgICAgICBpZiAoZmllbGQub3JpZ2luVHlwZS5pbmNsdWRlcyhcIm1mOlwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVTdHJzID0gZmllbGQub3JpZ2luVHlwZS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVTdHJzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpZWxkLnR5cGUgPSB0eXBlU3Ryc1syXTtcbiAgICAgICAgICAgICAgICBpc09ialR5cGUgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gZmllbGQub3JpZ2luVHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWVsZC5pc011dGlDb2xPYmogPSBpc09ialR5cGU7XG4gICAgICAgIC8v5a2X5q615ZCNXG4gICAgICAgIGZpZWxkLm9yaWdpbkZpZWxkTmFtZSA9IG9yaWdpbkZpZWxkTmFtZTtcbiAgICAgICAgaWYgKGlzT2JqVHlwZSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTdHJzID0gZmllbGQub3JpZ2luRmllbGROYW1lLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgIGlmIChmaWVsZFN0cnMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmllbGQuZmllbGROYW1lID0gZmllbGRTdHJzWzBdO1xuICAgICAgICAgICAgZmllbGQuc3ViRmllbGROYW1lID0gZmllbGRTdHJzWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmllbGQuZmllbGROYW1lID0gZmllbGQub3JpZ2luRmllbGROYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFibGVGaWxlZE1hcFtjb2xLZXldID0gZmllbGQ7XG4gICAgICAgIHJldHVybiBmaWVsZDtcbiAgICB9XG4gICAgZ2V0SG9yaXpvbnRhbFRhYmxlRmllbGQoXG4gICAgICAgIHRhYmxlUGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICAgICAgY29sS2V5OiBzdHJpbmcsXG4gICAgICAgIHJvd0luZGV4OiBudW1iZXJcbiAgICApOiBJVGFibGVGaWVsZCB7XG4gICAgICAgIGNvbnN0IHRhYmxlRGVmaW5lID0gdGFibGVQYXJzZVJlc3VsdC50YWJsZURlZmluZTtcbiAgICAgICAgbGV0IHRhYmxlRmlsZWRNYXAgPSB0YWJsZVBhcnNlUmVzdWx0LmZpbGVkTWFwO1xuICAgICAgICBpZiAoIXRhYmxlRmlsZWRNYXApIHtcbiAgICAgICAgICAgIHRhYmxlRmlsZWRNYXAgPSB7fTtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQuZmlsZWRNYXAgPSB0YWJsZUZpbGVkTWFwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLmhvcml6b250YWxGaWVsZERlZmluZTtcbiAgICAgICAgY29uc3QgZmllbGROYW1lQ2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbaEZpZWxkRGVmaW5lLmZpZWxkQ29sICsgcm93SW5kZXhdO1xuICAgICAgICBsZXQgb3JpZ2luRmllbGROYW1lOiBzdHJpbmc7XG4gICAgICAgIGlmICghaXNFbXB0eUNlbGwoZmllbGROYW1lQ2VsbCkpIHtcbiAgICAgICAgICAgIG9yaWdpbkZpZWxkTmFtZSA9IGZpZWxkTmFtZUNlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvcmlnaW5GaWVsZE5hbWUpIHJldHVybiBudWxsO1xuICAgICAgICBpZiAodGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpZWxkOiBJVGFibGVGaWVsZCA9IHt9IGFzIGFueTtcblxuICAgICAgICBjb25zdCB0ZXh0Q2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbaEZpZWxkRGVmaW5lLnRleHRDb2wgKyByb3dJbmRleF07XG4gICAgICAgIC8v5rOo6YeKXG4gICAgICAgIGlmICghaXNFbXB0eUNlbGwodGV4dENlbGwpKSB7XG4gICAgICAgICAgICBmaWVsZC50ZXh0ID0gdGV4dENlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGlzT2JqVHlwZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAvL+exu+Wei1xuICAgICAgICBjb25zdCB0eXBlQ2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbaEZpZWxkRGVmaW5lLnR5cGVDb2wgKyByb3dJbmRleF07XG5cbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKHR5cGVDZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL+WkhOeQhuexu+Wei1xuICAgICAgICAgICAgZmllbGQub3JpZ2luVHlwZSA9IHR5cGVDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICAgICAgaWYgKGZpZWxkLm9yaWdpblR5cGUuaW5jbHVkZXMoXCJtZjpcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlU3RycyA9IGZpZWxkLm9yaWdpblR5cGUuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlU3Rycy5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gdHlwZVN0cnNbMl07XG4gICAgICAgICAgICAgICAgaXNPYmpUeXBlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmllbGQudHlwZSA9IGZpZWxkLm9yaWdpblR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmllbGQuaXNNdXRpQ29sT2JqID0gaXNPYmpUeXBlO1xuICAgICAgICBmaWVsZC5vcmlnaW5GaWVsZE5hbWUgPSBvcmlnaW5GaWVsZE5hbWU7XG4gICAgICAgIGlmIChpc09ialR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkU3RycyA9IGZpZWxkLm9yaWdpbkZpZWxkTmFtZS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICBpZiAoZmllbGRTdHJzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkU3Ryc1swXTtcbiAgICAgICAgICAgIGZpZWxkLnN1YkZpZWxkTmFtZSA9IGZpZWxkU3Ryc1sxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkLm9yaWdpbkZpZWxkTmFtZTtcbiAgICAgICAgfVxuICAgICAgICB0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV0gPSBmaWVsZDtcbiAgICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmo4Dmn6XliJfmmK/lkKbpnIDopoHop6PmnpBcbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmVcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICovXG4gICAgY2hlY2tDb2xOZWVkUGFyc2UodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIOWmguaenOexu+Wei+aIluiAheWImeS4jemcgOimgeino+aekFxuICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcbiAgICAgICAgICAgIGNvbnN0IHZlcnRpY2FsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS52ZXJ0aWNhbEZpZWxkRGVmaW5lO1xuICAgICAgICAgICAgY29uc3QgdHlwZUNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUudHlwZVJvd107XG4gICAgICAgICAgICBjb25zdCBmaWVsZENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3ddO1xuICAgICAgICAgICAgaWYgKGlzRW1wdHlDZWxsKHR5cGVDZWxsT2JqKSB8fCBpc0VtcHR5Q2VsbChmaWVsZENlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICBjb25zdCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyAxXTtcbiAgICAgICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsT2JqKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6L2s5o2i6KGo5qC855qE5YC8XG4gICAgICogQHBhcmFtIHBhcnNlUmVzdWx0XG4gICAgICogQHBhcmFtIGZpbGVkSXRlbVxuICAgICAqIEBwYXJhbSBjZWxsVmFsdWVcbiAgICAgKi9cbiAgICBwdWJsaWMgdHJhbnNWYWx1ZShwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsIGZpbGVkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogYW55KTogSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgICAgICBsZXQgdHJhbnNSZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0O1xuXG4gICAgICAgIGxldCB0cmFuc0Z1bmMgPSB0aGlzLl92YWx1ZVRyYW5zRnVuY01hcFtmaWxlZEl0ZW0udHlwZV07XG4gICAgICAgIGlmICghdHJhbnNGdW5jKSB7XG4gICAgICAgICAgICB0cmFuc0Z1bmMgPSB0aGlzLl92YWx1ZVRyYW5zRnVuY01hcFtcImpzb25cIl07XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNSZXN1bHQgPSB0cmFuc0Z1bmMoZmlsZWRJdGVtLCBjZWxsVmFsdWUpO1xuICAgICAgICByZXR1cm4gdHJhbnNSZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6Kej5p6Q6YWN572u6KGo5paH5Lu2XG4gICAgICogQHBhcmFtIHBhcnNlQ29uZmlnIOino+aekOmFjee9rlxuICAgICAqIEBwYXJhbSBmaWxlSW5mbyDmlofku7bkv6Hmga9cbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHQg6Kej5p6Q57uT5p6cXG4gICAgICovXG4gICAgcHVibGljIHBhcnNlVGFibGVGaWxlKFxuICAgICAgICBwYXJzZUNvbmZpZzogSVRhYmxlQ29udmVydENvbmZpZyxcbiAgICAgICAgZmlsZUluZm86IElGaWxlSW5mbyxcbiAgICAgICAgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0XG4gICAgKTogSVRhYmxlUGFyc2VSZXN1bHQge1xuICAgICAgICBjb25zdCB3b3JrYm9vayA9IGZpbGVJbmZvLmZpbGVEYXRhID8gcmVhZFRhYmxlRGF0YShmaWxlSW5mbykgOiByZWFkVGFibGVGaWxlKGZpbGVJbmZvKTtcbiAgICAgICAgaWYgKCF3b3JrYm9vay5TaGVldE5hbWVzLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNoZWV0TmFtZXMgPSB3b3JrYm9vay5TaGVldE5hbWVzO1xuICAgICAgICBjb25zdCB0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lID0gdGhpcy5nZXRUYWJsZURlZmluZShmaWxlSW5mbywgd29ya2Jvb2spO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHt9XG4gICAgICAgIGlmICghdGFibGVEZWZpbmUpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgc2hlZXROYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBzaGVldDogeGxzeC5TaGVldDtcbiAgICAgICAgY29uc3QgaXNTaGVldFJvd0VuZCA9IHRoaXMuaXNTaGVldFJvd0VuZC5iaW5kKG51bGwsIHRhYmxlRGVmaW5lKTtcbiAgICAgICAgY29uc3QgaXNTaGVldENvbEVuZCA9IHRoaXMuaXNTaGVldENvbEVuZC5iaW5kKG51bGwsIHRhYmxlRGVmaW5lKTtcbiAgICAgICAgY29uc3QgaXNTa2lwU2hlZXRSb3cgPSAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5jaGVja1Jvd05lZWRQYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIHJvd0luZGV4KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaXNTa2lwU2hlZXRDb2wgPSAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRoaXMuY2hlY2tDb2xOZWVkUGFyc2UodGFibGVEZWZpbmUsIHNoZWV0LCBjb2xLZXkpO1xuICAgICAgICB9O1xuICAgICAgICBsZXQgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0O1xuICAgICAgICBwYXJzZVJlc3VsdC50YWJsZURlZmluZSA9IHRhYmxlRGVmaW5lO1xuICAgICAgICBMb2dnZXIubG9nKGBbcGFyc2VUYWJsZXzop6PmnpDmlofku7ZdPT4gJHtmaWxlSW5mby5maWxlUGF0aH1gKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGVldE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzaGVldE5hbWUgPSBzaGVldE5hbWVzW2ldO1xuICAgICAgICAgICAgc2hlZXQgPSB3b3JrYm9vay5TaGVldHNbc2hlZXROYW1lXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5jaGVja1NoZWV0Q2FuUGFyc2UodGFibGVEZWZpbmUsIHNoZWV0LCBzaGVldE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJzZVJlc3VsdC5jdXJTaGVldE5hbWUgPSBzaGVldE5hbWU7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGB8PVtwYXJzZVNoZWV0fOino+aekOWIhuihqF09PiAke3NoZWV0TmFtZX1gKTtcbiAgICAgICAgICAgIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xuICAgICAgICAgICAgICAgIGxldCBsYXN0Um93SW5kZXg6IG51bWJlcjtcblxuICAgICAgICAgICAgICAgIHZlcnRpY2FsRm9yRWFjaFNoZWV0KFxuICAgICAgICAgICAgICAgICAgICBzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3csXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Q29sLFxuICAgICAgICAgICAgICAgICAgICAoc2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNOZXdSb3dPckNvbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RSb3dJbmRleCAhPT0gcm93SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Um93SW5kZXggPSByb3dJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05ld1Jvd09yQ29sID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxPYmogPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGNlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJzZVZlcnRpY2FsQ2VsbChwYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgsIGlzTmV3Um93T3JDb2wpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBpc1NoZWV0Um93RW5kLFxuICAgICAgICAgICAgICAgICAgICBpc1NoZWV0Q29sRW5kLFxuICAgICAgICAgICAgICAgICAgICBpc1NraXBTaGVldFJvdyxcbiAgICAgICAgICAgICAgICAgICAgaXNTa2lwU2hlZXRDb2xcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGxhc3RDb2xLZXk6IHN0cmluZztcblxuICAgICAgICAgICAgICAgIGhvcml6b250YWxGb3JFYWNoU2hlZXQoXG4gICAgICAgICAgICAgICAgICAgIHNoZWV0LFxuICAgICAgICAgICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydFJvdyxcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRDb2wsXG4gICAgICAgICAgICAgICAgICAgIChzaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc05ld1Jvd09yQ29sID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFzdENvbEtleSAhPT0gY29sS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbEtleSA9IGNvbEtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05ld1Jvd09yQ29sID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY2VsbE9iaiA9IHNoZWV0W2NvbEtleSArIHJvd0luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNFbXB0eUNlbGwoY2VsbE9iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnNlSG9yaXpvbnRhbENlbGwocGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4LCBpc05ld1Jvd09yQ29sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldFJvd0VuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldENvbEVuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTa2lwU2hlZXRSb3csXG4gICAgICAgICAgICAgICAgICAgIGlzU2tpcFNoZWV0Q29sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZVJlc3VsdCBhcyBhbnk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRGVmYXVsdE91dFB1dFRyYW5zZm9ybWVyIH0gZnJvbSBcIi4vZGVmYXVsdC1vdXRwdXQtdHJhbnNmb3JtZXJcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2VyXCI7XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0Q29udmVydEhvb2sgaW1wbGVtZW50cyBJQ29udmVydEhvb2sge1xuICAgIG9uU3RhcnQ/KGNvbnRleHQ6IElDb252ZXJ0Q29udGV4dCwgY2I6IFZvaWRGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGBbZXhjZWwyYWxsXSBjb252ZXJ0LWhvb2sgb25TdGFydGApO1xuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGBbZXhjZWwyYWxsXSDlvIDlp4vooajovazmjaJgKTtcbiAgICAgICAgY2IoKTtcbiAgICB9XG4gICAgb25QYXJzZUJlZm9yZT8oY29udGV4dDogSUNvbnZlcnRDb250ZXh0LCBjYjogVm9pZEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIExvZ2dlci5zeXN0ZW1Mb2coYGNvbnZlcnQtaG9vayBvblBhcnNlQmVmb3JlYCk7XG4gICAgICAgIGNiKCk7XG4gICAgfVxuICAgIG9uUGFyc2VBZnRlcj8oY29udGV4dDogSUNvbnZlcnRDb250ZXh0LCBjYjogVm9pZEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIGxldCB0cmFuc2Zvcm1lcjogSU91dFB1dFRyYW5zZm9ybWVyID0gY29udGV4dC5vdXRwdXRUcmFuc2Zvcm1lcjtcblxuICAgICAgICB0cmFuc2Zvcm1lci50cmFuc2Zvcm0oY29udGV4dCwgY2IpO1xuICAgIH1cbiAgICBvbldyaXRlRmlsZUVuZChjb250ZXh0OiBJQ29udmVydENvbnRleHQpOiB2b2lkIHtcbiAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhgY29udmVydC1ob29rIG9uV3JpdGVGaWxlRW5kIOWGmeWFpee7k+adn2ApO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IFRhYmxlVHlwZSB9IGZyb20gXCIuL2RlZmF1bHQtcGFyc2UtaGFuZGxlclwiO1xuaW1wb3J0IHsgZGVmbGF0ZVN5bmMgfSBmcm9tIFwiemxpYlwiO1xuaW1wb3J0IHsgb3NFb2wgfSBmcm9tIFwiLi9nZXQtb3MtZW9sXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dlclwiO1xuZGVjbGFyZSBnbG9iYWwge1xuICAgIC8qKlxuICAgICAqIOi+k+WHuumFjee9rlxuICAgICAqL1xuICAgIGludGVyZmFjZSBJT3V0cHV0Q29uZmlnIHtcbiAgICAgICAgLyoq5Y2V5Liq6YWN572u6KGoanNvbui+k+WHuuebruW9lei3r+W+hCAqL1xuICAgICAgICBjbGllbnRTaW5nbGVUYWJsZUpzb25EaXI/OiBzdHJpbmc7XG4gICAgICAgIC8qKuWQiOW5tumFjee9ruihqGpzb27mlofku7bot6/lvoQo5YyF5ZCr5paH5Lu25ZCNLOavlOWmgiAuL291dC9idW5kbGUuanNvbikgKi9cbiAgICAgICAgY2xpZW50QnVuZGxlSnNvbk91dFBhdGg/OiBzdHJpbmc7XG4gICAgICAgIC8qKuaYr+WQpuagvOW8j+WMluWQiOW5tuWQjueahGpzb27vvIzpu5jorqTkuI0gKi9cbiAgICAgICAgaXNGb3JtYXRCdW5kbGVKc29uPzogYm9vbGVhbjtcbiAgICAgICAgLyoq5piv5ZCm55Sf5oiQ5aOw5piO5paH5Lu277yM6buY6K6k5LiN6L6T5Ye6ICovXG4gICAgICAgIGlzR2VuRHRzPzogYm9vbGVhbjtcbiAgICAgICAgLyoq5aOw5piO5paH5Lu26L6T5Ye655uu5b2VKOavj+S4qumFjee9ruihqOS4gOS4quWjsOaYjinvvIzpu5jorqTkuI3ovpPlh7ogKi9cbiAgICAgICAgY2xpZW50RHRzT3V0RGlyPzogc3RyaW5nO1xuICAgICAgICAvKirmmK/lkKblkIjlubbmiYDmnInlo7DmmI7kuLrkuIDkuKrmlofku7Ys6buY6K6kdHJ1ZSAqL1xuICAgICAgICBpc0J1bmRsZUR0cz86IGJvb2xlYW47XG4gICAgICAgIC8qKuWQiOW5tuWQjueahOWjsOaYjuaWh+S7tuWQjSzlpoLmnpzmsqHmnInliJnpu5jorqTkuLp0YWJsZU1hcCAqL1xuICAgICAgICBidW5kbGVEdHNGaWxlTmFtZT86IHN0cmluZztcbiAgICAgICAgLyoq5piv5ZCm5bCGanNvbuagvOW8j+WOi+e8qSzpu5jorqTlkKYs5YeP5bCRanNvbuWtl+auteWQjeWtl+espizmlYjmnpzovoPlsI8gKi9cbiAgICAgICAgaXNDb21wcmVzcz86IGJvb2xlYW47XG4gICAgICAgIC8qKuaYr+WQplppcOWOi+e8qSzkvb/nlKh6bGliICovXG4gICAgICAgIGlzWmlwPzogYm9vbGVhbjtcbiAgICB9XG59XG5cbi8qKuexu+Wei+Wtl+espuS4suaYoOWwhOWtl+WFuCAqL1xuY29uc3QgdHlwZVN0ck1hcCA9IHsgaW50OiBcIm51bWJlclwiLCBqc29uOiBcImFueVwiLCBcIltpbnRdXCI6IFwibnVtYmVyW11cIiwgXCJbc3RyaW5nXVwiOiBcInN0cmluZ1tdXCIgfTtcbmV4cG9ydCBjbGFzcyBEZWZhdWx0T3V0UHV0VHJhbnNmb3JtZXIge1xuICAgIC8qKlxuICAgICAqIOi9rOaNolxuICAgICAqIEBwYXJhbSBjb250ZXh0XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICB0cmFuc2Zvcm0oY29udGV4dDogSUNvbnZlcnRDb250ZXh0LCBjYjogVm9pZEZ1bmN0aW9uKSB7XG4gICAgICAgIGNvbnN0IGNvbnZlcnRDb25maWcgPSBjb250ZXh0LmNvbnZlcnRDb25maWc7XG4gICAgICAgIGNvbnN0IHBhcnNlUmVzdWx0TWFwID0gY29udGV4dC5wYXJzZVJlc3VsdE1hcDtcbiAgICAgICAgbGV0IG91dHB1dENvbmZpZzogSU91dHB1dENvbmZpZyA9IGNvbnZlcnRDb25maWcub3V0cHV0Q29uZmlnO1xuICAgICAgICBpZiAoIW91dHB1dENvbmZpZykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGFyc2VDb25maWcub3V0cHV0Q29uZmlnIGlzIHVuZGVmaW5kYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGFibGVPYmpNYXA6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgICAgICAgbGV0IG91dHB1dEZpbGVNYXA6IE91dFB1dEZpbGVNYXAgPSB7fTtcbiAgICAgICAgbGV0IHRhYmxlVHlwZU1hcER0c1N0ciA9IFwiXCI7XG4gICAgICAgIGxldCB0YWJsZVR5cGVEdHNTdHJzID0gXCJcIjtcbiAgICAgICAgbGV0IHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdDtcbiAgICAgICAgbGV0IHRhYmxlTmFtZTogc3RyaW5nO1xuICAgICAgICBsZXQgdGFibGVPYmo6IGFueTtcbiAgICAgICAgbGV0IG9ialR5cGVUYWJsZU1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICAgICAgTG9nZ2VyLmxvZyhgW291dHB1dFRyYW5zZm9ybSB86L2s5o2i6Kej5p6Q57uT5p6cXeivt+eojeetiS4uLmApO1xuICAgICAgICBmb3IgKGxldCBmaWxlUGF0aCBpbiBwYXJzZVJlc3VsdE1hcCkge1xuICAgICAgICAgICAgcGFyc2VSZXN1bHQgPSBwYXJzZVJlc3VsdE1hcFtmaWxlUGF0aF07XG4gICAgICAgICAgICBpZiAoIXBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lKSBjb250aW51ZTtcblxuICAgICAgICAgICAgdGFibGVOYW1lID0gcGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lO1xuXG4gICAgICAgICAgICAvL+WQiOW5tuWkmuS4quWQjOWQjeihqFxuICAgICAgICAgICAgdGFibGVPYmogPSB0YWJsZU9iak1hcFt0YWJsZU5hbWVdO1xuICAgICAgICAgICAgaWYgKHRhYmxlT2JqKSB7XG4gICAgICAgICAgICAgICAgdGFibGVPYmogPSBPYmplY3QuYXNzaWduKHRhYmxlT2JqLCBwYXJzZVJlc3VsdC50YWJsZU9iaik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhYmxlT2JqID0gcGFyc2VSZXN1bHQudGFibGVPYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YWJsZU9iak1hcFt0YWJsZU5hbWVdID0gdGFibGVPYmo7XG5cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNHZW5EdHMgJiYgb2JqVHlwZVRhYmxlTWFwW3RhYmxlTmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9ialR5cGVUYWJsZU1hcFt0YWJsZU5hbWVdID0gcGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbDtcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuICAgICAgICAgICAgICAgICAgICB0YWJsZVR5cGVNYXBEdHNTdHIgKz0gXCJcXHRyZWFkb25seSBcIiArIHRhYmxlTmFtZSArIFwiPzogXCIgKyBgSVRfJHt0YWJsZU5hbWV9O2AgKyBvc0VvbDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YWJsZVR5cGVNYXBEdHNTdHIgKz0gdGhpcy5fZ2V0T25lVGFibGVUeXBlU3RyKHRhYmxlTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8v6L6T5Ye65Y2V5Liq5paH5Lu2XG4gICAgICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0J1bmRsZUR0cyA9PT0gdW5kZWZpbmVkKSBvdXRwdXRDb25maWcuaXNCdW5kbGVEdHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICghb3V0cHV0Q29uZmlnLmlzQnVuZGxlRHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFNpbmdsZVRhYmxlRHRzT3V0cHV0RmlsZShvdXRwdXRDb25maWcsIHBhcnNlUmVzdWx0LCBvdXRwdXRGaWxlTWFwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YWJsZVR5cGVEdHNTdHJzICs9IHRoaXMuX2dldFNpbmdsZVRhYmxlRHRzKHBhcnNlUmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v55Sf5oiQ5Y2V5Liq6KGoanNvblxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5jbGllbnRTaW5nbGVUYWJsZUpzb25EaXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRTaW5nbGVUYWJsZUpzb25PdXRwdXRGaWxlKG91dHB1dENvbmZpZywgcGFyc2VSZXN1bHQsIG91dHB1dEZpbGVNYXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNHZW5EdHMpIHtcbiAgICAgICAgICAgIC8v6L6T5Ye65aOw5piO5paH5Lu2XG4gICAgICAgICAgICBsZXQgaXRCYXNlU3RyID0gXCJpbnRlcmZhY2UgSVRCYXNlPFQ+IHsgW2tleTpzdHJpbmddOlR9XCIgKyBvc0VvbDtcblxuICAgICAgICAgICAgdGFibGVUeXBlTWFwRHRzU3RyID0gaXRCYXNlU3RyICsgXCJpbnRlcmZhY2UgSVRfVGFibGVNYXAge1wiICsgb3NFb2wgKyB0YWJsZVR5cGVNYXBEdHNTdHIgKyBcIn1cIiArIG9zRW9sO1xuXG4gICAgICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmlzQnVuZGxlRHRzKSB7XG4gICAgICAgICAgICAgICAgLy/lkIjmiJDkuIDkuKrmlofku7ZcbiAgICAgICAgICAgICAgICBjb25zdCBkdHNGaWxlTmFtZSA9IG91dHB1dENvbmZpZy5idW5kbGVEdHNGaWxlTmFtZSA/IG91dHB1dENvbmZpZy5idW5kbGVEdHNGaWxlTmFtZSA6IFwidGFibGVNYXBcIjtcbiAgICAgICAgICAgICAgICBjb25zdCBidW5kbGVEdHNGaWxlUGF0aCA9IHBhdGguam9pbihvdXRwdXRDb25maWcuY2xpZW50RHRzT3V0RGlyLCBgJHtkdHNGaWxlTmFtZX0uZC50c2ApO1xuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbYnVuZGxlRHRzRmlsZVBhdGhdID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogYnVuZGxlRHRzRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhYmxlVHlwZU1hcER0c1N0ciArIHRhYmxlVHlwZUR0c1N0cnNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL+aLhuWIhuaWh+S7tui+k+WHulxuICAgICAgICAgICAgICAgIGNvbnN0IHRhYmxlVHlwZU1hcER0c0ZpbGVQYXRoID0gcGF0aC5qb2luKG91dHB1dENvbmZpZy5jbGllbnREdHNPdXREaXIsIFwidGFibGVNYXAuZC50c1wiKTtcbiAgICAgICAgICAgICAgICBvdXRwdXRGaWxlTWFwW3RhYmxlVHlwZU1hcER0c0ZpbGVQYXRoXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IHRhYmxlVHlwZU1hcER0c0ZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YWJsZVR5cGVNYXBEdHNTdHJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9qc29uQnVuZGxlRmlsZVxuICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmNsaWVudEJ1bmRsZUpzb25PdXRQYXRoKSB7XG4gICAgICAgICAgICBsZXQganNvbkJ1bmRsZUZpbGVQYXRoID0gb3V0cHV0Q29uZmlnLmNsaWVudEJ1bmRsZUpzb25PdXRQYXRoO1xuICAgICAgICAgICAgbGV0IG91dHB1dERhdGE6IGFueTtcbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNDb21wcmVzcykge1xuICAgICAgICAgICAgICAgIC8v6L+b6KGM5qC85byP5Y6L57ypXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VGFibGVPYmpNYXAgPSB7fTtcbiAgICAgICAgICAgICAgICBsZXQgdGFibGVPYmo6IGFueTtcbiAgICAgICAgICAgICAgICBsZXQgbmV3VGFibGVPYmo6IGFueTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0YWJsZU5hbWUgaW4gdGFibGVPYmpNYXApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9ialR5cGVUYWJsZU1hcFt0YWJsZU5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iak1hcFt0YWJsZU5hbWVdID0gdGFibGVPYmpNYXBbdGFibGVOYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlT2JqID0gdGFibGVPYmpNYXBbdGFibGVOYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgbmV3VGFibGVPYmogPSB7IGZpZWxkVmFsdWVzTWFwOiB7fSB9O1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBtYWluS2V5IGluIHRhYmxlT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5ld1RhYmxlT2JqLmZpZWxkTmFtZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iai5maWVsZE5hbWVzID0gT2JqZWN0LmtleXModGFibGVPYmpbbWFpbktleV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VGFibGVPYmouZmllbGRWYWx1ZXNNYXBbbWFpbktleV0gPSBPYmplY3QudmFsdWVzKHRhYmxlT2JqW21haW5LZXldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iak1hcFt0YWJsZU5hbWVdID0gbmV3VGFibGVPYmo7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBKU09OLnN0cmluZ2lmeShuZXdUYWJsZU9iak1hcCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBKU09OLnN0cmluZ2lmeSh0YWJsZU9iak1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL+i/m+ihjGJhc2U2NOWkhOeQhlxuICAgICAgICAgICAgLy8gaWYgKG91dHB1dENvbmZpZy5idW5kbGVKc29uSXNFbmNvZGUyQmFzZTY0KSB7XG4gICAgICAgICAgICAvLyAgICAgb3V0cHV0RGF0YSA9IEJhc2U2NC5lbmNvZGUob3V0cHV0RGF0YSk7XG4gICAgICAgICAgICAvLyAgICAgaWYgKG91dHB1dENvbmZpZy5wcmVCYXNlNjRVZ2x5U3RyaW5nKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIG91dHB1dERhdGEgPSBvdXRwdXRDb25maWcucHJlQmFzZTY0VWdseVN0cmluZyArIG91dHB1dERhdGE7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gICAgIGlmIChvdXRwdXRDb25maWcuc3VmQmFzZTY0VWdseVN0cmluZykge1xuICAgICAgICAgICAgLy8gICAgICAgICBvdXRwdXREYXRhICs9IG91dHB1dENvbmZpZy5zdWZCYXNlNjRVZ2x5U3RyaW5nO1xuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNaaXApIHtcbiAgICAgICAgICAgICAgICAvL+S9v+eUqHppbGLljovnvKlcbiAgICAgICAgICAgICAgICBvdXRwdXREYXRhID0gZGVmbGF0ZVN5bmMob3V0cHV0RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwdXRGaWxlTWFwW2pzb25CdW5kbGVGaWxlUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgZmlsZVBhdGg6IGpzb25CdW5kbGVGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICBlbmNvZGluZzogdHlwZW9mIG91dHB1dERhdGEgIT09IFwic3RyaW5nXCIgPyBcImJpbmFyeVwiIDogXCJ1dGYtOFwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IG91dHB1dERhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbnRleHQub3V0UHV0RmlsZU1hcCkge1xuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIG91dHB1dEZpbGVNYXApIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm91dFB1dEZpbGVNYXBba2V5XSA9IG91dHB1dEZpbGVNYXBba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRleHQub3V0UHV0RmlsZU1hcCA9IG91dHB1dEZpbGVNYXA7XG4gICAgICAgIH1cbiAgICAgICAgY2IoKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfYWRkU2luZ2xlVGFibGVEdHNPdXRwdXRGaWxlKFxuICAgICAgICBjb25maWc6IElPdXRwdXRDb25maWcsXG4gICAgICAgIHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgb3V0cHV0RmlsZU1hcDogT3V0UHV0RmlsZU1hcFxuICAgICk6IHZvaWQge1xuICAgICAgICAvL+WmguaenOWAvOayoeacieWwseS4jei+k+WHuuexu+Wei+S/oeaBr+S6hlxuICAgICAgICBpZiAoIXBhcnNlUmVzdWx0LnRhYmxlT2JqKSByZXR1cm47XG4gICAgICAgIGxldCBkdHNGaWxlUGF0aDogc3RyaW5nID0gcGF0aC5qb2luKGNvbmZpZy5jbGllbnREdHNPdXREaXIsIGAke3BhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlTmFtZX0uZC50c2ApO1xuXG4gICAgICAgIGlmICghb3V0cHV0RmlsZU1hcFtkdHNGaWxlUGF0aF0pIHtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBjb25zdCBkdHNTdHIgPSB0aGlzLl9nZXRTaW5nbGVUYWJsZUR0cyhwYXJzZVJlc3VsdCk7XG4gICAgICAgICAgICBpZiAoZHRzU3RyKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0RmlsZU1hcFtkdHNGaWxlUGF0aF0gPSB7IGZpbGVQYXRoOiBkdHNGaWxlUGF0aCwgZGF0YTogZHRzU3RyIH0gYXMgYW55O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOWHuuWNleS4qumFjee9ruihqOexu+Wei+aVsOaNrlxuICAgICAqIEBwYXJhbSBwYXJzZVJlc3VsdFxuICAgICAqL1xuICAgIHByaXZhdGUgX2dldFNpbmdsZVRhYmxlRHRzKHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHRhYmxlTmFtZSA9IHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlTmFtZTtcblxuICAgICAgICBjb25zdCBjb2xLZXlUYWJsZUZpZWxkTWFwOiBDb2xLZXlUYWJsZUZpZWxkTWFwID0gcGFyc2VSZXN1bHQuZmlsZWRNYXA7XG4gICAgICAgIGxldCBpdGVtSW50ZXJmYWNlID0gXCJpbnRlcmZhY2UgSVRfXCIgKyB0YWJsZU5hbWUgKyBcIiB7XCIgKyBvc0VvbDtcbiAgICAgICAgbGV0IHRhYmxlRmllbGQ6IElUYWJsZUZpZWxkO1xuICAgICAgICBsZXQgdHlwZVN0cjogc3RyaW5nO1xuICAgICAgICBsZXQgb2JqVHlwZVN0ck1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuXG4gICAgICAgIGZvciAobGV0IGNvbEtleSBpbiBjb2xLZXlUYWJsZUZpZWxkTWFwKSB7XG4gICAgICAgICAgICB0YWJsZUZpZWxkID0gY29sS2V5VGFibGVGaWVsZE1hcFtjb2xLZXldO1xuICAgICAgICAgICAgaWYgKCF0YWJsZUZpZWxkKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmICghdGFibGVGaWVsZC5pc011dGlDb2xPYmopIHtcbiAgICAgICAgICAgICAgICAvL+azqOmHiuihjFxuICAgICAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJcXHQvKiogXCIgKyB0YWJsZUZpZWxkLnRleHQgKyBcIiAqL1wiICsgb3NFb2w7XG4gICAgICAgICAgICAgICAgLy/lrZfmrrXnsbvlnovlo7DmmI7ooYxcbiAgICAgICAgICAgICAgICBpdGVtSW50ZXJmYWNlICs9XG4gICAgICAgICAgICAgICAgICAgIFwiXFx0cmVhZG9ubHkgXCIgK1xuICAgICAgICAgICAgICAgICAgICB0YWJsZUZpZWxkLmZpZWxkTmFtZSArXG4gICAgICAgICAgICAgICAgICAgIFwiPzogXCIgK1xuICAgICAgICAgICAgICAgICAgICAodHlwZVN0ck1hcFt0YWJsZUZpZWxkLnR5cGVdID8gdHlwZVN0ck1hcFt0YWJsZUZpZWxkLnR5cGVdIDogdGFibGVGaWVsZC50eXBlKSArXG4gICAgICAgICAgICAgICAgICAgIFwiO1wiICtcbiAgICAgICAgICAgICAgICAgICAgb3NFb2w7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9iakZpZWxkS2V5ID0gdGFibGVGaWVsZC5maWVsZE5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy/ms6jph4rooYxcbiAgICAgICAgICAgICAgICBvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XSArPSBcIlxcdFxcdC8qKiBcIiArIHRhYmxlRmllbGQudGV4dCArIFwiICovXCIgKyBvc0VvbDtcblxuICAgICAgICAgICAgICAgIC8v5a2X5q6157G75Z6L5aOw5piO6KGMXG4gICAgICAgICAgICAgICAgb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV0gKz1cbiAgICAgICAgICAgICAgICAgICAgXCJcXHRcXHRyZWFkb25seSBcIiArXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRmllbGQuc3ViRmllbGROYW1lICtcbiAgICAgICAgICAgICAgICAgICAgXCI/OiBcIiArXG4gICAgICAgICAgICAgICAgICAgICh0eXBlU3RyTWFwW3RhYmxlRmllbGQudHlwZV0gPyB0eXBlU3RyTWFwW3RhYmxlRmllbGQudHlwZV0gOiB0YWJsZUZpZWxkLnR5cGUpICtcbiAgICAgICAgICAgICAgICAgICAgXCI7XCIgK1xuICAgICAgICAgICAgICAgICAgICBvc0VvbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL+esrOS6jOWxguWvueixoVxuICAgICAgICBmb3IgKGxldCBvYmpGaWVsZEtleSBpbiBvYmpUeXBlU3RyTWFwKSB7XG4gICAgICAgICAgICAvL+Wtl+auteexu+Wei+WjsOaYjuihjFxuICAgICAgICAgICAgaXRlbUludGVyZmFjZSArPSBcIlxcdHJlYWRvbmx5IFwiICsgb2JqRmllbGRLZXkgKyBcIj86IHtcIiArIG9zRW9sICsgb2JqVHlwZVN0ck1hcFtvYmpGaWVsZEtleV07XG4gICAgICAgICAgICBpdGVtSW50ZXJmYWNlICs9IFwiXFx0fVwiICsgb3NFb2w7XG4gICAgICAgIH1cbiAgICAgICAgaXRlbUludGVyZmFjZSArPSBcIn1cIiArIG9zRW9sO1xuXG4gICAgICAgIHJldHVybiBpdGVtSW50ZXJmYWNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmt7vliqDljZXni6zlr7zlh7rphY3nva7ooahqc29u5paH5Lu2XG4gICAgICogQHBhcmFtIGNvbmZpZ1xuICAgICAqIEBwYXJhbSBwYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBvdXRwdXRGaWxlTWFwXG4gICAgICovXG4gICAgcHJpdmF0ZSBfYWRkU2luZ2xlVGFibGVKc29uT3V0cHV0RmlsZShcbiAgICAgICAgY29uZmlnOiBJT3V0cHV0Q29uZmlnLFxuICAgICAgICBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsXG4gICAgICAgIG91dHB1dEZpbGVNYXA6IE91dFB1dEZpbGVNYXBcbiAgICApIHtcbiAgICAgICAgY29uc3QgdGFibGVPYmogPSBwYXJzZVJlc3VsdC50YWJsZU9iajtcbiAgICAgICAgaWYgKCF0YWJsZU9iaikgcmV0dXJuO1xuICAgICAgICBjb25zdCB0YWJsZU5hbWUgPSBwYXJzZVJlc3VsdC50YWJsZURlZmluZS50YWJsZU5hbWU7XG4gICAgICAgIGxldCBzaW5nbGVKc29uRmlsZVBhdGggPSBwYXRoLmpvaW4oY29uZmlnLmNsaWVudFNpbmdsZVRhYmxlSnNvbkRpciwgYCR7dGFibGVOYW1lfS5qc29uYCk7XG4gICAgICAgIGxldCBzaW5nbGVKc29uRGF0YSA9IEpTT04uc3RyaW5naWZ5KHRhYmxlT2JqLCBudWxsLCBcIlxcdFwiKTtcblxuICAgICAgICBsZXQgc2luZ2xlT3V0cHV0RmlsZUluZm8gPSBvdXRwdXRGaWxlTWFwW3NpbmdsZUpzb25GaWxlUGF0aF07XG4gICAgICAgIGlmIChzaW5nbGVPdXRwdXRGaWxlSW5mbykge1xuICAgICAgICAgICAgc2luZ2xlT3V0cHV0RmlsZUluZm8uZGF0YSA9IHNpbmdsZUpzb25EYXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2luZ2xlT3V0cHV0RmlsZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgZmlsZVBhdGg6IHNpbmdsZUpzb25GaWxlUGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhOiBzaW5nbGVKc29uRGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbc2luZ2xlSnNvbkZpbGVQYXRoXSA9IHNpbmdsZU91dHB1dEZpbGVJbmZvO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgX2dldE9uZVRhYmxlVHlwZVN0cih0YWJsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIlxcdHJlYWRvbmx5IFwiICsgdGFibGVOYW1lICsgXCI/OiBcIiArIFwiSVRCYXNlPFwiICsgXCJJVF9cIiArIHRhYmxlTmFtZSArIFwiPjtcIiArIG9zRW9sO1xuICAgIH1cbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBkb1BhcnNlKFxuICAgIHBhcnNlQ29uZmlnOiBJVGFibGVDb252ZXJ0Q29uZmlnLFxuICAgIGZpbGVJbmZvczogSUZpbGVJbmZvW10sXG4gICAgcGFyc2VSZXN1bHRNYXA6IFRhYmxlUGFyc2VSZXN1bHRNYXAsXG4gICAgcGFyc2VIYW5kbGVyOiBJVGFibGVQYXJzZUhhbmRsZXJcbikge1xuICAgIGxldCBwYXJzZVJlc3VsdDtcbiAgICBmb3IgKGxldCBpID0gZmlsZUluZm9zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VSZXN1bHRNYXBbZmlsZUluZm9zW2ldLmZpbGVQYXRoXTtcbiAgICAgICAgaWYgKCFwYXJzZVJlc3VsdCkge1xuICAgICAgICAgICAgcGFyc2VSZXN1bHQgPSB7IGZpbGVQYXRoOiBmaWxlSW5mb3NbaV0uZmlsZVBhdGggfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhcnNlUmVzdWx0LnRhYmxlT2JqKSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHBhcnNlSGFuZGxlci5wYXJzZVRhYmxlRmlsZShwYXJzZUNvbmZpZywgZmlsZUluZm9zW2ldLCBwYXJzZVJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnNlUmVzdWx0KSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdE1hcFtmaWxlSW5mb3NbaV0uZmlsZVBhdGhdID0gcGFyc2VSZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tIFwiY3J5cHRvXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dlclwiO1xuaW1wb3J0IHsgQmluYXJ5TGlrZSB9IGZyb20gXCJub2RlOmNyeXB0b1wiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElPdXRQdXRGaWxlSW5mbyB7XG4gICAgICAgIGZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgIC8qKuWGmeWFpee8luegge+8jOWtl+espuS4sum7mOiupHV0ZjggKi9cbiAgICAgICAgZW5jb2Rpbmc/OiBCdWZmZXJFbmNvZGluZztcbiAgICAgICAgLyoq5piv5ZCm5Yig6ZmkICovXG4gICAgICAgIGlzRGVsZXRlPzogYm9vbGVhbjtcbiAgICAgICAgZGF0YT86IGFueTtcbiAgICB9XG59XG4vKipcbiAqIOmBjeWOhuaWh+S7tlxuICogQHBhcmFtIGRpclBhdGgg5paH5Lu25aS56Lev5b6EXG4gKiBAcGFyYW0gZWFjaENhbGxiYWNrIOmBjeWOhuWbnuiwgyAoZmlsZVBhdGg6IHN0cmluZykgPT4gdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaEZpbGUoZmlsZU9yRGlyUGF0aDogc3RyaW5nLCBlYWNoQ2FsbGJhY2s/OiAoZmlsZVBhdGg6IHN0cmluZykgPT4gdm9pZCkge1xuICAgIGlmIChmcy5zdGF0U3luYyhmaWxlT3JEaXJQYXRoKS5pc0RpcmVjdG9yeSgpICYmIGZpbGVPckRpclBhdGggIT09IFwiLmdpdFwiICYmIGZpbGVPckRpclBhdGggIT09IFwiLnN2blwiKSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lcyA9IGZzLnJlYWRkaXJTeW5jKGZpbGVPckRpclBhdGgpO1xuICAgICAgICBsZXQgY2hpbGRGaWxlUGF0aDogc3RyaW5nO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY2hpbGRGaWxlUGF0aCA9IHBhdGguam9pbihmaWxlT3JEaXJQYXRoLCBmaWxlTmFtZXNbaV0pO1xuICAgICAgICAgICAgZm9yRWFjaEZpbGUoY2hpbGRGaWxlUGF0aCwgZWFjaENhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGVhY2hDYWxsYmFjayhmaWxlT3JEaXJQYXRoKTtcbiAgICB9XG59XG4vKipcbiAqIOaJuemHj+WGmeWFpeWSjOWIoOmZpOaWh+S7tlxuICogQHBhcmFtIG91dHB1dEZpbGVJbmZvcyDpnIDopoHlhpnlhaXnmoTmlofku7bkv6Hmga/mlbDnu4RcbiAqIEBwYXJhbSBvblByb2dyZXNzIOi/m+W6puWPmOWMluWbnuiwg1xuICogQHBhcmFtIGNvbXBsZXRlIOWujOaIkOWbnuiwg1xuICovXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVPckRlbGV0ZU91dFB1dEZpbGVzKFxuICAgIG91dHB1dEZpbGVJbmZvczogSU91dFB1dEZpbGVJbmZvW10sXG4gICAgb25Qcm9ncmVzcz86IChmaWxlUGF0aDogc3RyaW5nLCB0b3RhbDogbnVtYmVyLCBub3c6IG51bWJlciwgaXNPazogYm9vbGVhbikgPT4gdm9pZCxcbiAgICBjb21wbGV0ZT86ICh0b3RhbDogbnVtYmVyKSA9PiB2b2lkXG4pIHtcbiAgICBsZXQgZmlsZUluZm86IElPdXRQdXRGaWxlSW5mbztcbiAgICBjb25zdCB0b3RhbCA9IG91dHB1dEZpbGVJbmZvcy5sZW5ndGg7XG4gICAgaWYgKG91dHB1dEZpbGVJbmZvcyAmJiB0b3RhbCkge1xuICAgICAgICBsZXQgbm93ID0gMDtcbiAgICAgICAgY29uc3Qgb25Xcml0ZUVuZCA9IChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBMb2dnZXIubG9nKGVyciwgXCJlcnJvclwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vdysrO1xuICAgICAgICAgICAgb25Qcm9ncmVzcyAmJiBvblByb2dyZXNzKG91dHB1dEZpbGVJbmZvc1tub3cgLSAxXS5maWxlUGF0aCwgdG90YWwsIG5vdywgIWVycik7XG4gICAgICAgICAgICBpZiAobm93ID49IHRvdGFsKSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGUgJiYgY29tcGxldGUodG90YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKGxldCBpID0gb3V0cHV0RmlsZUluZm9zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBmaWxlSW5mbyA9IG91dHB1dEZpbGVJbmZvc1tpXTtcblxuICAgICAgICAgICAgaWYgKGZpbGVJbmZvLmlzRGVsZXRlICYmIGZzLmV4aXN0c1N5bmMoZmlsZUluZm8uZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgZnMudW5saW5rU3luYyhmaWxlSW5mby5maWxlUGF0aCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGZpbGVJbmZvLmZpbGVQYXRoKSAmJiBmcy5zdGF0U3luYyhmaWxlSW5mby5maWxlUGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICBMb2dnZXIubG9nKGDot6/lvoTkuLrmlofku7blpLk6JHtmaWxlSW5mby5maWxlUGF0aH1gLCBcImVycm9yXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWZpbGVJbmZvLmVuY29kaW5nICYmIHR5cGVvZiBmaWxlSW5mby5kYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmVuY29kaW5nID0gXCJ1dGY4XCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZzLmVuc3VyZUZpbGVTeW5jKGZpbGVJbmZvLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGUoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby5lbmNvZGluZyA/IHsgZW5jb2Rpbmc6IGZpbGVJbmZvLmVuY29kaW5nIH0gOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIG9uV3JpdGVFbmRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiDojrflj5blj5jljJbov4fnmoTmlofku7bmlbDnu4RcbiAqIEBwYXJhbSBkaXIg55uu5qCH55uu5b2VXG4gKiBAcGFyYW0gY2FjaGVGaWxlUGF0aCDnvJPlrZjmlofku7bnu53lr7not6/lvoRcbiAqIEBwYXJhbSBlYWNoQ2FsbGJhY2sg6YGN5Y6G5Zue6LCDXG4gKiBAcmV0dXJucyDov5Tlm57nvJPlrZjmlofku7bot6/lvoRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvckVhY2hDaGFuZ2VkRmlsZShcbiAgICBkaXI6IHN0cmluZyxcbiAgICBjYWNoZUZpbGVQYXRoPzogc3RyaW5nLFxuICAgIGVhY2hDYWxsYmFjaz86IChmaWxlUGF0aDogc3RyaW5nLCBpc0RlbGV0ZT86IGJvb2xlYW4pID0+IHZvaWRcbikge1xuICAgIGNvbnN0IGdjZkNhY2hlID0gZ2V0Q2FjaGVEYXRhKGNhY2hlRmlsZVBhdGgpO1xuICAgIGNvbnN0IG9sZEZpbGVQYXRocyA9IE9iamVjdC5rZXlzKGdjZkNhY2hlKTtcbiAgICBsZXQgb2xkRmlsZVBhdGhJbmRleDogbnVtYmVyO1xuICAgIGZvckVhY2hGaWxlKGRpciwgKGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIHZhciBtZDVzdHIgPSBnZXRGaWxlTWQ1U3luYyhmaWxlUGF0aCk7XG4gICAgICAgIGlmICghZ2NmQ2FjaGVbZmlsZVBhdGhdIHx8IChnY2ZDYWNoZVtmaWxlUGF0aF0gJiYgZ2NmQ2FjaGVbZmlsZVBhdGhdICE9PSBtZDVzdHIpKSB7XG4gICAgICAgICAgICBnY2ZDYWNoZVtmaWxlUGF0aF0gPSBtZDVzdHI7XG4gICAgICAgICAgICBlYWNoQ2FsbGJhY2soZmlsZVBhdGgsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBvbGRGaWxlUGF0aEluZGV4ID0gb2xkRmlsZVBhdGhzLmluZGV4T2YoZmlsZVBhdGgpO1xuICAgICAgICBpZiAob2xkRmlsZVBhdGhJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBlbmRGaWxlUGF0aCA9IG9sZEZpbGVQYXRoc1tvbGRGaWxlUGF0aHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhJbmRleF0gPSBlbmRGaWxlUGF0aDtcbiAgICAgICAgICAgIG9sZEZpbGVQYXRocy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2xkRmlsZVBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRlbGV0ZSBnY2ZDYWNoZVtvbGRGaWxlUGF0aHNbaV1dO1xuICAgICAgICBlYWNoQ2FsbGJhY2sob2xkRmlsZVBhdGhzW2ldLCB0cnVlKTtcbiAgICB9XG4gICAgZnMud3JpdGVGaWxlU3luYyhjYWNoZUZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShnY2ZDYWNoZSksIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KTtcbn1cbi8qKlxuICog5YaZ5YWl57yT5a2Y5pWw5o2uXG4gKiBAcGFyYW0gY2FjaGVGaWxlUGF0aFxuICogQHBhcmFtIGNhY2hlRGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVDYWNoZURhdGEoY2FjaGVGaWxlUGF0aDogc3RyaW5nLCBjYWNoZURhdGE6IGFueSkge1xuICAgIGlmICghY2FjaGVGaWxlUGF0aCkge1xuICAgICAgICBMb2dnZXIubG9nKGBjYWNoZUZpbGVQYXRoIGlzIG51bGxgLCBcImVycm9yXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZzLndyaXRlRmlsZVN5bmMoY2FjaGVGaWxlUGF0aCwgSlNPTi5zdHJpbmdpZnkoY2FjaGVEYXRhKSwgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0pO1xufVxuLyoqXG4gKiDor7vlj5bnvJPlrZjmlbDmja5cbiAqIEBwYXJhbSBjYWNoZUZpbGVQYXRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYWNoZURhdGEoY2FjaGVGaWxlUGF0aDogc3RyaW5nKTogYW55IHtcbiAgICBpZiAoIWNhY2hlRmlsZVBhdGgpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhgY2FjaGVGaWxlUGF0aCBpcyBudWxsYCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoY2FjaGVGaWxlUGF0aCkpIHtcbiAgICAgICAgZnMuZW5zdXJlRmlsZVN5bmMoY2FjaGVGaWxlUGF0aCk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoY2FjaGVGaWxlUGF0aCwgXCJ7fVwiLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSk7XG4gICAgfVxuICAgIGNvbnN0IGdjZkNhY2hlRmlsZSA9IGZzLnJlYWRGaWxlU3luYyhjYWNoZUZpbGVQYXRoLCBcInV0Zi04XCIpO1xuICAgIGNvbnN0IGdjZkNhY2hlID0gSlNPTi5wYXJzZShnY2ZDYWNoZUZpbGUpO1xuICAgIHJldHVybiBnY2ZDYWNoZTtcbn1cbi8qKlxuICog6I635Y+W5paH5Lu2bWQ1ICjlkIzmraUpXG4gKiBAcGFyYW0gZmlsZVBhdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVNZDVTeW5jKGZpbGVQYXRoOiBzdHJpbmcsIGVuY29kaW5nPzogQnVmZmVyRW5jb2RpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGZpbGUgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIGVuY29kaW5nKTtcbiAgICB2YXIgbWQ1dW0gPSBjcnlwdG8uY3JlYXRlSGFzaChcIm1kNVwiKTtcbiAgICBtZDV1bS51cGRhdGUoZmlsZSk7XG4gICAgcmV0dXJuIG1kNXVtLmRpZ2VzdChcImhleFwiKTtcbn1cbi8qKlxuICog6I635Y+W5paH5Lu2bWQ1ICjlvILmraUpXG4gKiBAcGFyYW0gZmlsZVBhdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVNZDVBc3luYyhmaWxlUGF0aDogc3RyaW5nLCBjYjogKG1kNVN0cjogc3RyaW5nKSA9PiB2b2lkLCBlbmNvZGluZz86IEJ1ZmZlckVuY29kaW5nKSB7XG4gICAgZnMucmVhZEZpbGUoZmlsZVBhdGgsIGVuY29kaW5nLCAoZXJyLCBmaWxlKSA9PiB7XG4gICAgICAgIHZhciBtZDV1bSA9IGNyeXB0by5jcmVhdGVIYXNoKFwibWQ1XCIpO1xuICAgICAgICBtZDV1bS51cGRhdGUoZmlsZSk7XG4gICAgICAgIGNvbnN0IG1kNVN0ciA9IG1kNXVtLmRpZ2VzdChcImhleFwiKTtcbiAgICAgICAgY2IobWQ1U3RyKTtcbiAgICB9KTtcbn1cbi8qKlxuICog6I635Y+W5paH5Lu2bWQ1XG4gKiBAcGFyYW0gZmlsZSDmlofku7blr7nosaFcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlTWQ1KGZpbGU6IEJpbmFyeUxpa2UpIHtcbiAgICBjb25zdCBtZDV1bSA9IGNyeXB0by5jcmVhdGVIYXNoKFwibWQ1XCIpO1xuICAgIG1kNXVtLnVwZGF0ZShmaWxlKTtcbiAgICByZXR1cm4gbWQ1dW0uZGlnZXN0KFwiaGV4XCIpO1xufVxuLyoqXG4gKiDojrflj5bmlofku7YgbWQ1XG4gKiBAcGFyYW0gZmlsZVBhdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEZpbGVNZDVCeVBhdGgoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHJldHVybiBnZXRGaWxlTWQ1U3luYyhmaWxlUGF0aCk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuaXNJbnRlZ2VyID0gbnVtID0+IHtcbiAgaWYgKHR5cGVvZiBudW0gPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIE51bWJlci5pc0ludGVnZXIobnVtKTtcbiAgfVxuICBpZiAodHlwZW9mIG51bSA9PT0gJ3N0cmluZycgJiYgbnVtLnRyaW0oKSAhPT0gJycpIHtcbiAgICByZXR1cm4gTnVtYmVyLmlzSW50ZWdlcihOdW1iZXIobnVtKSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBGaW5kIGEgbm9kZSBvZiB0aGUgZ2l2ZW4gdHlwZVxuICovXG5cbmV4cG9ydHMuZmluZCA9IChub2RlLCB0eXBlKSA9PiBub2RlLm5vZGVzLmZpbmQobm9kZSA9PiBub2RlLnR5cGUgPT09IHR5cGUpO1xuXG4vKipcbiAqIEZpbmQgYSBub2RlIG9mIHRoZSBnaXZlbiB0eXBlXG4gKi9cblxuZXhwb3J0cy5leGNlZWRzTGltaXQgPSAobWluLCBtYXgsIHN0ZXAgPSAxLCBsaW1pdCkgPT4ge1xuICBpZiAobGltaXQgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG4gIGlmICghZXhwb3J0cy5pc0ludGVnZXIobWluKSB8fCAhZXhwb3J0cy5pc0ludGVnZXIobWF4KSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gKChOdW1iZXIobWF4KSAtIE51bWJlcihtaW4pKSAvIE51bWJlcihzdGVwKSkgPj0gbGltaXQ7XG59O1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gbm9kZSB3aXRoICdcXFxcJyBiZWZvcmUgbm9kZS52YWx1ZVxuICovXG5cbmV4cG9ydHMuZXNjYXBlTm9kZSA9IChibG9jaywgbiA9IDAsIHR5cGUpID0+IHtcbiAgbGV0IG5vZGUgPSBibG9jay5ub2Rlc1tuXTtcbiAgaWYgKCFub2RlKSByZXR1cm47XG5cbiAgaWYgKCh0eXBlICYmIG5vZGUudHlwZSA9PT0gdHlwZSkgfHwgbm9kZS50eXBlID09PSAnb3BlbicgfHwgbm9kZS50eXBlID09PSAnY2xvc2UnKSB7XG4gICAgaWYgKG5vZGUuZXNjYXBlZCAhPT0gdHJ1ZSkge1xuICAgICAgbm9kZS52YWx1ZSA9ICdcXFxcJyArIG5vZGUudmFsdWU7XG4gICAgICBub2RlLmVzY2FwZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIGJyYWNlIG5vZGUgc2hvdWxkIGJlIGVuY2xvc2VkIGluIGxpdGVyYWwgYnJhY2VzXG4gKi9cblxuZXhwb3J0cy5lbmNsb3NlQnJhY2UgPSBub2RlID0+IHtcbiAgaWYgKG5vZGUudHlwZSAhPT0gJ2JyYWNlJykgcmV0dXJuIGZhbHNlO1xuICBpZiAoKG5vZGUuY29tbWFzID4+IDAgKyBub2RlLnJhbmdlcyA+PiAwKSA9PT0gMCkge1xuICAgIG5vZGUuaW52YWxpZCA9IHRydWU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgYSBicmFjZSBub2RlIGlzIGludmFsaWQuXG4gKi9cblxuZXhwb3J0cy5pc0ludmFsaWRCcmFjZSA9IGJsb2NrID0+IHtcbiAgaWYgKGJsb2NrLnR5cGUgIT09ICdicmFjZScpIHJldHVybiBmYWxzZTtcbiAgaWYgKGJsb2NrLmludmFsaWQgPT09IHRydWUgfHwgYmxvY2suZG9sbGFyKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKChibG9jay5jb21tYXMgPj4gMCArIGJsb2NrLnJhbmdlcyA+PiAwKSA9PT0gMCkge1xuICAgIGJsb2NrLmludmFsaWQgPSB0cnVlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChibG9jay5vcGVuICE9PSB0cnVlIHx8IGJsb2NrLmNsb3NlICE9PSB0cnVlKSB7XG4gICAgYmxvY2suaW52YWxpZCA9IHRydWU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgYSBub2RlIGlzIGFuIG9wZW4gb3IgY2xvc2Ugbm9kZVxuICovXG5cbmV4cG9ydHMuaXNPcGVuT3JDbG9zZSA9IG5vZGUgPT4ge1xuICBpZiAobm9kZS50eXBlID09PSAnb3BlbicgfHwgbm9kZS50eXBlID09PSAnY2xvc2UnKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIG5vZGUub3BlbiA9PT0gdHJ1ZSB8fCBub2RlLmNsb3NlID09PSB0cnVlO1xufTtcblxuLyoqXG4gKiBSZWR1Y2UgYW4gYXJyYXkgb2YgdGV4dCBub2Rlcy5cbiAqL1xuXG5leHBvcnRzLnJlZHVjZSA9IG5vZGVzID0+IG5vZGVzLnJlZHVjZSgoYWNjLCBub2RlKSA9PiB7XG4gIGlmIChub2RlLnR5cGUgPT09ICd0ZXh0JykgYWNjLnB1c2gobm9kZS52YWx1ZSk7XG4gIGlmIChub2RlLnR5cGUgPT09ICdyYW5nZScpIG5vZGUudHlwZSA9ICd0ZXh0JztcbiAgcmV0dXJuIGFjYztcbn0sIFtdKTtcblxuLyoqXG4gKiBGbGF0dGVuIGFuIGFycmF5XG4gKi9cblxuZXhwb3J0cy5mbGF0dGVuID0gKC4uLmFyZ3MpID0+IHtcbiAgY29uc3QgcmVzdWx0ID0gW107XG4gIGNvbnN0IGZsYXQgPSBhcnIgPT4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgZWxlID0gYXJyW2ldO1xuICAgICAgQXJyYXkuaXNBcnJheShlbGUpID8gZmxhdChlbGUsIHJlc3VsdCkgOiBlbGUgIT09IHZvaWQgMCAmJiByZXN1bHQucHVzaChlbGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBmbGF0KGFyZ3MpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IFdJTl9TTEFTSCA9ICdcXFxcXFxcXC8nO1xuY29uc3QgV0lOX05PX1NMQVNIID0gYFteJHtXSU5fU0xBU0h9XWA7XG5cbi8qKlxuICogUG9zaXggZ2xvYiByZWdleFxuICovXG5cbmNvbnN0IERPVF9MSVRFUkFMID0gJ1xcXFwuJztcbmNvbnN0IFBMVVNfTElURVJBTCA9ICdcXFxcKyc7XG5jb25zdCBRTUFSS19MSVRFUkFMID0gJ1xcXFw/JztcbmNvbnN0IFNMQVNIX0xJVEVSQUwgPSAnXFxcXC8nO1xuY29uc3QgT05FX0NIQVIgPSAnKD89LiknO1xuY29uc3QgUU1BUksgPSAnW14vXSc7XG5jb25zdCBFTkRfQU5DSE9SID0gYCg/OiR7U0xBU0hfTElURVJBTH18JClgO1xuY29uc3QgU1RBUlRfQU5DSE9SID0gYCg/Ol58JHtTTEFTSF9MSVRFUkFMfSlgO1xuY29uc3QgRE9UU19TTEFTSCA9IGAke0RPVF9MSVRFUkFMfXsxLDJ9JHtFTkRfQU5DSE9SfWA7XG5jb25zdCBOT19ET1QgPSBgKD8hJHtET1RfTElURVJBTH0pYDtcbmNvbnN0IE5PX0RPVFMgPSBgKD8hJHtTVEFSVF9BTkNIT1J9JHtET1RTX1NMQVNIfSlgO1xuY29uc3QgTk9fRE9UX1NMQVNIID0gYCg/ISR7RE9UX0xJVEVSQUx9ezAsMX0ke0VORF9BTkNIT1J9KWA7XG5jb25zdCBOT19ET1RTX1NMQVNIID0gYCg/ISR7RE9UU19TTEFTSH0pYDtcbmNvbnN0IFFNQVJLX05PX0RPVCA9IGBbXi4ke1NMQVNIX0xJVEVSQUx9XWA7XG5jb25zdCBTVEFSID0gYCR7UU1BUkt9Kj9gO1xuXG5jb25zdCBQT1NJWF9DSEFSUyA9IHtcbiAgRE9UX0xJVEVSQUwsXG4gIFBMVVNfTElURVJBTCxcbiAgUU1BUktfTElURVJBTCxcbiAgU0xBU0hfTElURVJBTCxcbiAgT05FX0NIQVIsXG4gIFFNQVJLLFxuICBFTkRfQU5DSE9SLFxuICBET1RTX1NMQVNILFxuICBOT19ET1QsXG4gIE5PX0RPVFMsXG4gIE5PX0RPVF9TTEFTSCxcbiAgTk9fRE9UU19TTEFTSCxcbiAgUU1BUktfTk9fRE9ULFxuICBTVEFSLFxuICBTVEFSVF9BTkNIT1Jcbn07XG5cbi8qKlxuICogV2luZG93cyBnbG9iIHJlZ2V4XG4gKi9cblxuY29uc3QgV0lORE9XU19DSEFSUyA9IHtcbiAgLi4uUE9TSVhfQ0hBUlMsXG5cbiAgU0xBU0hfTElURVJBTDogYFske1dJTl9TTEFTSH1dYCxcbiAgUU1BUks6IFdJTl9OT19TTEFTSCxcbiAgU1RBUjogYCR7V0lOX05PX1NMQVNIfSo/YCxcbiAgRE9UU19TTEFTSDogYCR7RE9UX0xJVEVSQUx9ezEsMn0oPzpbJHtXSU5fU0xBU0h9XXwkKWAsXG4gIE5PX0RPVDogYCg/ISR7RE9UX0xJVEVSQUx9KWAsXG4gIE5PX0RPVFM6IGAoPyEoPzpefFske1dJTl9TTEFTSH1dKSR7RE9UX0xJVEVSQUx9ezEsMn0oPzpbJHtXSU5fU0xBU0h9XXwkKSlgLFxuICBOT19ET1RfU0xBU0g6IGAoPyEke0RPVF9MSVRFUkFMfXswLDF9KD86WyR7V0lOX1NMQVNIfV18JCkpYCxcbiAgTk9fRE9UU19TTEFTSDogYCg/ISR7RE9UX0xJVEVSQUx9ezEsMn0oPzpbJHtXSU5fU0xBU0h9XXwkKSlgLFxuICBRTUFSS19OT19ET1Q6IGBbXi4ke1dJTl9TTEFTSH1dYCxcbiAgU1RBUlRfQU5DSE9SOiBgKD86XnxbJHtXSU5fU0xBU0h9XSlgLFxuICBFTkRfQU5DSE9SOiBgKD86WyR7V0lOX1NMQVNIfV18JClgXG59O1xuXG4vKipcbiAqIFBPU0lYIEJyYWNrZXQgUmVnZXhcbiAqL1xuXG5jb25zdCBQT1NJWF9SRUdFWF9TT1VSQ0UgPSB7XG4gIGFsbnVtOiAnYS16QS1aMC05JyxcbiAgYWxwaGE6ICdhLXpBLVonLFxuICBhc2NpaTogJ1xcXFx4MDAtXFxcXHg3RicsXG4gIGJsYW5rOiAnIFxcXFx0JyxcbiAgY250cmw6ICdcXFxceDAwLVxcXFx4MUZcXFxceDdGJyxcbiAgZGlnaXQ6ICcwLTknLFxuICBncmFwaDogJ1xcXFx4MjEtXFxcXHg3RScsXG4gIGxvd2VyOiAnYS16JyxcbiAgcHJpbnQ6ICdcXFxceDIwLVxcXFx4N0UgJyxcbiAgcHVuY3Q6ICdcXFxcLSFcIiMkJSZcXCcoKVxcXFwqKywuLzo7PD0+P0BbXFxcXF1eX2B7fH1+JyxcbiAgc3BhY2U6ICcgXFxcXHRcXFxcclxcXFxuXFxcXHZcXFxcZicsXG4gIHVwcGVyOiAnQS1aJyxcbiAgd29yZDogJ0EtWmEtejAtOV8nLFxuICB4ZGlnaXQ6ICdBLUZhLWYwLTknXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgTUFYX0xFTkdUSDogMTAyNCAqIDY0LFxuICBQT1NJWF9SRUdFWF9TT1VSQ0UsXG5cbiAgLy8gcmVndWxhciBleHByZXNzaW9uc1xuICBSRUdFWF9CQUNLU0xBU0g6IC9cXFxcKD8hWyorP14ke30ofClbXFxdXSkvZyxcbiAgUkVHRVhfTk9OX1NQRUNJQUxfQ0hBUlM6IC9eW15AIVtcXF0uLCQqKz9ee30oKXxcXFxcL10rLyxcbiAgUkVHRVhfU1BFQ0lBTF9DSEFSUzogL1stKis/Ll4ke30ofClbXFxdXS8sXG4gIFJFR0VYX1NQRUNJQUxfQ0hBUlNfQkFDS1JFRjogLyhcXFxcPykoKFxcVykoXFwzKikpL2csXG4gIFJFR0VYX1NQRUNJQUxfQ0hBUlNfR0xPQkFMOiAvKFstKis/Ll4ke30ofClbXFxdXSkvZyxcbiAgUkVHRVhfUkVNT1ZFX0JBQ0tTTEFTSDogLyg/OlxcWy4qP1teXFxcXF1cXF18XFxcXCg/PS4pKS9nLFxuXG4gIC8vIFJlcGxhY2UgZ2xvYnMgd2l0aCBlcXVpdmFsZW50IHBhdHRlcm5zIHRvIHJlZHVjZSBwYXJzaW5nIHRpbWUuXG4gIFJFUExBQ0VNRU5UUzoge1xuICAgICcqKionOiAnKicsXG4gICAgJyoqLyoqJzogJyoqJyxcbiAgICAnKiovKiovKionOiAnKionXG4gIH0sXG5cbiAgLy8gRGlnaXRzXG4gIENIQVJfMDogNDgsIC8qIDAgKi9cbiAgQ0hBUl85OiA1NywgLyogOSAqL1xuXG4gIC8vIEFscGhhYmV0IGNoYXJzLlxuICBDSEFSX1VQUEVSQ0FTRV9BOiA2NSwgLyogQSAqL1xuICBDSEFSX0xPV0VSQ0FTRV9BOiA5NywgLyogYSAqL1xuICBDSEFSX1VQUEVSQ0FTRV9aOiA5MCwgLyogWiAqL1xuICBDSEFSX0xPV0VSQ0FTRV9aOiAxMjIsIC8qIHogKi9cblxuICBDSEFSX0xFRlRfUEFSRU5USEVTRVM6IDQwLCAvKiAoICovXG4gIENIQVJfUklHSFRfUEFSRU5USEVTRVM6IDQxLCAvKiApICovXG5cbiAgQ0hBUl9BU1RFUklTSzogNDIsIC8qICogKi9cblxuICAvLyBOb24tYWxwaGFiZXRpYyBjaGFycy5cbiAgQ0hBUl9BTVBFUlNBTkQ6IDM4LCAvKiAmICovXG4gIENIQVJfQVQ6IDY0LCAvKiBAICovXG4gIENIQVJfQkFDS1dBUkRfU0xBU0g6IDkyLCAvKiBcXCAqL1xuICBDSEFSX0NBUlJJQUdFX1JFVFVSTjogMTMsIC8qIFxcciAqL1xuICBDSEFSX0NJUkNVTUZMRVhfQUNDRU5UOiA5NCwgLyogXiAqL1xuICBDSEFSX0NPTE9OOiA1OCwgLyogOiAqL1xuICBDSEFSX0NPTU1BOiA0NCwgLyogLCAqL1xuICBDSEFSX0RPVDogNDYsIC8qIC4gKi9cbiAgQ0hBUl9ET1VCTEVfUVVPVEU6IDM0LCAvKiBcIiAqL1xuICBDSEFSX0VRVUFMOiA2MSwgLyogPSAqL1xuICBDSEFSX0VYQ0xBTUFUSU9OX01BUks6IDMzLCAvKiAhICovXG4gIENIQVJfRk9STV9GRUVEOiAxMiwgLyogXFxmICovXG4gIENIQVJfRk9SV0FSRF9TTEFTSDogNDcsIC8qIC8gKi9cbiAgQ0hBUl9HUkFWRV9BQ0NFTlQ6IDk2LCAvKiBgICovXG4gIENIQVJfSEFTSDogMzUsIC8qICMgKi9cbiAgQ0hBUl9IWVBIRU5fTUlOVVM6IDQ1LCAvKiAtICovXG4gIENIQVJfTEVGVF9BTkdMRV9CUkFDS0VUOiA2MCwgLyogPCAqL1xuICBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0U6IDEyMywgLyogeyAqL1xuICBDSEFSX0xFRlRfU1FVQVJFX0JSQUNLRVQ6IDkxLCAvKiBbICovXG4gIENIQVJfTElORV9GRUVEOiAxMCwgLyogXFxuICovXG4gIENIQVJfTk9fQlJFQUtfU1BBQ0U6IDE2MCwgLyogXFx1MDBBMCAqL1xuICBDSEFSX1BFUkNFTlQ6IDM3LCAvKiAlICovXG4gIENIQVJfUExVUzogNDMsIC8qICsgKi9cbiAgQ0hBUl9RVUVTVElPTl9NQVJLOiA2MywgLyogPyAqL1xuICBDSEFSX1JJR0hUX0FOR0xFX0JSQUNLRVQ6IDYyLCAvKiA+ICovXG4gIENIQVJfUklHSFRfQ1VSTFlfQlJBQ0U6IDEyNSwgLyogfSAqL1xuICBDSEFSX1JJR0hUX1NRVUFSRV9CUkFDS0VUOiA5MywgLyogXSAqL1xuICBDSEFSX1NFTUlDT0xPTjogNTksIC8qIDsgKi9cbiAgQ0hBUl9TSU5HTEVfUVVPVEU6IDM5LCAvKiAnICovXG4gIENIQVJfU1BBQ0U6IDMyLCAvKiAgICovXG4gIENIQVJfVEFCOiA5LCAvKiBcXHQgKi9cbiAgQ0hBUl9VTkRFUlNDT1JFOiA5NSwgLyogXyAqL1xuICBDSEFSX1ZFUlRJQ0FMX0xJTkU6IDEyNCwgLyogfCAqL1xuICBDSEFSX1pFUk9fV0lEVEhfTk9CUkVBS19TUEFDRTogNjUyNzksIC8qIFxcdUZFRkYgKi9cblxuICBTRVA6IHBhdGguc2VwLFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgRVhUR0xPQl9DSEFSU1xuICAgKi9cblxuICBleHRnbG9iQ2hhcnMoY2hhcnMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgJyEnOiB7IHR5cGU6ICduZWdhdGUnLCBvcGVuOiAnKD86KD8hKD86JywgY2xvc2U6IGApKSR7Y2hhcnMuU1RBUn0pYCB9LFxuICAgICAgJz8nOiB7IHR5cGU6ICdxbWFyaycsIG9wZW46ICcoPzonLCBjbG9zZTogJyk/JyB9LFxuICAgICAgJysnOiB7IHR5cGU6ICdwbHVzJywgb3BlbjogJyg/OicsIGNsb3NlOiAnKSsnIH0sXG4gICAgICAnKic6IHsgdHlwZTogJ3N0YXInLCBvcGVuOiAnKD86JywgY2xvc2U6ICcpKicgfSxcbiAgICAgICdAJzogeyB0eXBlOiAnYXQnLCBvcGVuOiAnKD86JywgY2xvc2U6ICcpJyB9XG4gICAgfTtcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIEdMT0JfQ0hBUlNcbiAgICovXG5cbiAgZ2xvYkNoYXJzKHdpbjMyKSB7XG4gICAgcmV0dXJuIHdpbjMyID09PSB0cnVlID8gV0lORE9XU19DSEFSUyA6IFBPU0lYX0NIQVJTO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3Qgd2luMzIgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuY29uc3Qge1xuICBSRUdFWF9CQUNLU0xBU0gsXG4gIFJFR0VYX1JFTU9WRV9CQUNLU0xBU0gsXG4gIFJFR0VYX1NQRUNJQUxfQ0hBUlMsXG4gIFJFR0VYX1NQRUNJQUxfQ0hBUlNfR0xPQkFMXG59ID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcblxuZXhwb3J0cy5pc09iamVjdCA9IHZhbCA9PiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsKTtcbmV4cG9ydHMuaGFzUmVnZXhDaGFycyA9IHN0ciA9PiBSRUdFWF9TUEVDSUFMX0NIQVJTLnRlc3Qoc3RyKTtcbmV4cG9ydHMuaXNSZWdleENoYXIgPSBzdHIgPT4gc3RyLmxlbmd0aCA9PT0gMSAmJiBleHBvcnRzLmhhc1JlZ2V4Q2hhcnMoc3RyKTtcbmV4cG9ydHMuZXNjYXBlUmVnZXggPSBzdHIgPT4gc3RyLnJlcGxhY2UoUkVHRVhfU1BFQ0lBTF9DSEFSU19HTE9CQUwsICdcXFxcJDEnKTtcbmV4cG9ydHMudG9Qb3NpeFNsYXNoZXMgPSBzdHIgPT4gc3RyLnJlcGxhY2UoUkVHRVhfQkFDS1NMQVNILCAnLycpO1xuXG5leHBvcnRzLnJlbW92ZUJhY2tzbGFzaGVzID0gc3RyID0+IHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKFJFR0VYX1JFTU9WRV9CQUNLU0xBU0gsIG1hdGNoID0+IHtcbiAgICByZXR1cm4gbWF0Y2ggPT09ICdcXFxcJyA/ICcnIDogbWF0Y2g7XG4gIH0pO1xufTtcblxuZXhwb3J0cy5zdXBwb3J0c0xvb2tiZWhpbmRzID0gKCkgPT4ge1xuICBjb25zdCBzZWdzID0gcHJvY2Vzcy52ZXJzaW9uLnNsaWNlKDEpLnNwbGl0KCcuJykubWFwKE51bWJlcik7XG4gIGlmIChzZWdzLmxlbmd0aCA9PT0gMyAmJiBzZWdzWzBdID49IDkgfHwgKHNlZ3NbMF0gPT09IDggJiYgc2Vnc1sxXSA+PSAxMCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmlzV2luZG93cyA9IG9wdGlvbnMgPT4ge1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy53aW5kb3dzID09PSAnYm9vbGVhbicpIHtcbiAgICByZXR1cm4gb3B0aW9ucy53aW5kb3dzO1xuICB9XG4gIHJldHVybiB3aW4zMiA9PT0gdHJ1ZSB8fCBwYXRoLnNlcCA9PT0gJ1xcXFwnO1xufTtcblxuZXhwb3J0cy5lc2NhcGVMYXN0ID0gKGlucHV0LCBjaGFyLCBsYXN0SWR4KSA9PiB7XG4gIGNvbnN0IGlkeCA9IGlucHV0Lmxhc3RJbmRleE9mKGNoYXIsIGxhc3RJZHgpO1xuICBpZiAoaWR4ID09PSAtMSkgcmV0dXJuIGlucHV0O1xuICBpZiAoaW5wdXRbaWR4IC0gMV0gPT09ICdcXFxcJykgcmV0dXJuIGV4cG9ydHMuZXNjYXBlTGFzdChpbnB1dCwgY2hhciwgaWR4IC0gMSk7XG4gIHJldHVybiBgJHtpbnB1dC5zbGljZSgwLCBpZHgpfVxcXFwke2lucHV0LnNsaWNlKGlkeCl9YDtcbn07XG5cbmV4cG9ydHMucmVtb3ZlUHJlZml4ID0gKGlucHV0LCBzdGF0ZSA9IHt9KSA9PiB7XG4gIGxldCBvdXRwdXQgPSBpbnB1dDtcbiAgaWYgKG91dHB1dC5zdGFydHNXaXRoKCcuLycpKSB7XG4gICAgb3V0cHV0ID0gb3V0cHV0LnNsaWNlKDIpO1xuICAgIHN0YXRlLnByZWZpeCA9ICcuLyc7XG4gIH1cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbmV4cG9ydHMud3JhcE91dHB1dCA9IChpbnB1dCwgc3RhdGUgPSB7fSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IHByZXBlbmQgPSBvcHRpb25zLmNvbnRhaW5zID8gJycgOiAnXic7XG4gIGNvbnN0IGFwcGVuZCA9IG9wdGlvbnMuY29udGFpbnMgPyAnJyA6ICckJztcblxuICBsZXQgb3V0cHV0ID0gYCR7cHJlcGVuZH0oPzoke2lucHV0fSkke2FwcGVuZH1gO1xuICBpZiAoc3RhdGUubmVnYXRlZCA9PT0gdHJ1ZSkge1xuICAgIG91dHB1dCA9IGAoPzpeKD8hJHtvdXRwdXR9KS4qJClgO1xuICB9XG4gIHJldHVybiBvdXRwdXQ7XG59O1xuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgKiBhcyBtbWF0Y2ggZnJvbSBcIm1pY3JvbWF0Y2hcIjtcbmltcG9ydCB7XG4gICAgZm9yRWFjaEZpbGUsXG4gICAgZ2V0Q2FjaGVEYXRhLFxuICAgIGdldEZpbGVNZDUsXG4gICAgZ2V0RmlsZU1kNVN5bmMsXG4gICAgd3JpdGVDYWNoZURhdGEsXG4gICAgd3JpdGVPckRlbGV0ZU91dFB1dEZpbGVzXG59IGZyb20gXCIuL2ZpbGUtdXRpbHNcIjtcbmltcG9ydCB7IGRvUGFyc2UgfSBmcm9tIFwiLi9kby1wYXJzZVwiO1xuaW1wb3J0IHsgRGVmYXVsdFBhcnNlSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtcGFyc2UtaGFuZGxlclwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZXJcIjtcbmltcG9ydCB7IERlZmF1bHRDb252ZXJ0SG9vayB9IGZyb20gXCIuL2RlZmF1bHQtY29udmVydC1ob29rXCI7XG5pbXBvcnQgeyBEZWZhdWx0T3V0UHV0VHJhbnNmb3JtZXIgfSBmcm9tIFwiLi9kZWZhdWx0LW91dHB1dC10cmFuc2Zvcm1lclwiO1xuaW1wb3J0IHsgaXNDU1YgfSBmcm9tIFwiLi90YWJsZS11dGlsc1wiO1xuaW1wb3J0IGZnIGZyb20gXCJmYXN0LWdsb2JcIjtcblxuY29uc3QgZGVmYXVsdERpciA9IFwiLmV4Y2VsMmFsbFwiO1xuY29uc3QgY2FjaGVGaWxlTmFtZSA9IFwiLmUyYXBybWNcIjtcbmNvbnN0IGxvZ0ZpbGVOYW1lID0gXCJleGNlbDJhbGwubG9nXCI7XG5sZXQgc3RhcnRUaW1lID0gMDtcbmNvbnN0IGRlZmF1bHRQYXR0ZXJuID0gW1wiLi8qKi8qLnhsc3hcIiwgXCIuLyoqLyouY3N2XCIsIFwiISoqL34kKi4qXCIsIFwiISoqL34uKi4qXCIsIFwiIS5naXQvKiovKlwiLCBcIiEuc3ZuLyoqLypcIl07XG4vKipcbiAqIOi9rOaNolxuICogQHBhcmFtIGNvbnZlckNvbmZpZyDop6PmnpDphY3nva5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbnZlcnQoY29udmVyQ29uZmlnOiBJVGFibGVDb252ZXJ0Q29uZmlnKSB7XG4gICAgLy/lvIDlp4vml7bpl7RcbiAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIGlmICghY29udmVyQ29uZmlnLnByb2pSb290KSB7XG4gICAgICAgIGNvbnZlckNvbmZpZy5wcm9qUm9vdCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgfVxuXG4gICAgTG9nZ2VyLmluaXQoY29udmVyQ29uZmlnKTtcbiAgICBjb25zdCB0YWJsZUZpbGVEaXIgPSBjb252ZXJDb25maWcudGFibGVGaWxlRGlyO1xuICAgIGlmICghdGFibGVGaWxlRGlyKSB7XG4gICAgICAgIExvZ2dlci5sb2coYOmFjee9ruihqOebruW9le+8mnRhYmxlRmlsZURpcuS4uuepumAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHRhYmxlRmlsZURpcikpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhg6YWN572u6KGo5paH5Lu25aS55LiN5a2Y5Zyo77yaJHt0YWJsZUZpbGVEaXJ9YCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghY29udmVyQ29uZmlnLnBhdHRlcm4pIHtcbiAgICAgICAgY29udmVyQ29uZmlnLnBhdHRlcm4gPSBkZWZhdWx0UGF0dGVybjtcbiAgICB9XG4gICAgaWYgKGNvbnZlckNvbmZpZy51c2VNdWx0aVRocmVhZCAmJiBpc05hTihjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtKSkge1xuICAgICAgICBjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtID0gNTtcbiAgICB9XG5cbiAgICBsZXQgY29udmVydEhvb2s6IElDb252ZXJ0SG9vaztcbiAgICBpZiAoY29udmVyQ29uZmlnLmN1c3RvbUNvbnZlcnRIb29rUGF0aCkge1xuICAgICAgICBjb252ZXJ0SG9vayA9IHJlcXVpcmUoY29udmVyQ29uZmlnLmN1c3RvbUNvbnZlcnRIb29rUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29udmVydEhvb2sgPSBuZXcgRGVmYXVsdENvbnZlcnRIb29rKCk7XG4gICAgfVxuICAgIGxldCBvdXRwdXRUcmFuc2Zvcm1lcjogSU91dFB1dFRyYW5zZm9ybWVyO1xuICAgIGlmIChjb252ZXJDb25maWcuY3VzdG9tT3V0UHV0VHJhbnNmb3JtZXJQYXRoKSB7XG4gICAgICAgIG91dHB1dFRyYW5zZm9ybWVyID0gcmVxdWlyZShjb252ZXJDb25maWcuY3VzdG9tT3V0UHV0VHJhbnNmb3JtZXJQYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXRUcmFuc2Zvcm1lciA9IG5ldyBEZWZhdWx0T3V0UHV0VHJhbnNmb3JtZXIoKTtcbiAgICB9XG4gICAgY29uc3QgY29udGV4dDogSUNvbnZlcnRDb250ZXh0ID0ge1xuICAgICAgICBjb252ZXJ0Q29uZmlnOiBjb252ZXJDb25maWcsXG4gICAgICAgIG91dHB1dFRyYW5zZm9ybWVyOiBvdXRwdXRUcmFuc2Zvcm1lclxuICAgIH0gYXMgYW55O1xuICAgIC8v5byA5aeLXG4gICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlcykgPT4ge1xuICAgICAgICBjb252ZXJ0SG9vay5vblN0YXJ0KGNvbnRleHQsIHJlcyk7XG4gICAgfSk7XG5cbiAgICBsZXQgcGFyc2VIYW5kbGVyOiBJVGFibGVQYXJzZUhhbmRsZXI7XG4gICAgaWYgKGNvbnZlckNvbmZpZy5jdXN0b21QYXJzZUhhbmRsZXJQYXRoKSB7XG4gICAgICAgIHBhcnNlSGFuZGxlciA9IHJlcXVpcmUoY29udmVyQ29uZmlnLmN1c3RvbVBhcnNlSGFuZGxlclBhdGgpO1xuICAgICAgICBpZiAoIXBhcnNlSGFuZGxlciB8fCB0eXBlb2YgcGFyc2VIYW5kbGVyLnBhcnNlVGFibGVGaWxlICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOiHquWumuS5ieino+aekOWunueOsOmUmeivrzoke2NvbnZlckNvbmZpZy5jdXN0b21QYXJzZUhhbmRsZXJQYXRofWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VIYW5kbGVyID0gbmV3IERlZmF1bHRQYXJzZUhhbmRsZXIoKTtcbiAgICB9XG4gICAgY29uc3QgcHJlZG9UMSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGdldEZpbGVJbmZvcyhjb250ZXh0KTtcbiAgICBjb25zdCB7IHBhcnNlUmVzdWx0TWFwLCBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgsIGNoYW5nZWRGaWxlSW5mb3MgfSA9IGNvbnRleHQ7XG4gICAgY29uc3QgcHJlZG9UMiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIExvZ2dlci5zeXN0ZW1Mb2coYFvpooTlpITnkIbmlbDmja7ml7bpl7Q6JHtwcmVkb1QyIC0gcHJlZG9UMX1tcywkeyhwcmVkb1QyIC0gcHJlZG9UMSkgLyAxMDAwfV1gKTtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzKSA9PiB7XG4gICAgICAgIGNvbnZlcnRIb29rLm9uUGFyc2VCZWZvcmUoY29udGV4dCwgcmVzKTtcbiAgICB9KTtcbiAgICBMb2dnZXIuc3lzdGVtTG9nKGBb5byA5aeL6Kej5p6QXTrmlbDph49bJHtjaGFuZ2VkRmlsZUluZm9zLmxlbmd0aH1dYCk7XG4gICAgLyoqXG4gICAgICogQHR5cGUge2ltcG9ydChcIndvcmtlcl90aHJlYWRzXCIpLldvcmtlcn07XG4gICAgICovXG4gICAgbGV0IFdvcmtlckNsYXNzO1xuICAgIHRyeSB7XG4gICAgICAgIFdvcmtlckNsYXNzID0gcmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnZlckNvbmZpZy51c2VNdWx0aVRocmVhZCAmJiBMb2dnZXIuc3lzdGVtTG9nKGBub2Rl54mI5pys5LiN5pSv5oyBV29ya2Vy5aSa57q/56iL77yM5YiH5o2i5Li65Y2V57q/56iL5qih5byPYCk7XG4gICAgICAgIGNvbnZlckNvbmZpZy51c2VNdWx0aVRocmVhZCA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlZEZpbGVJbmZvcy5sZW5ndGggPiBjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtICYmIGNvbnZlckNvbmZpZy51c2VNdWx0aVRocmVhZCkge1xuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGBb5aSa57q/56iL6Kej5p6QXWApO1xuICAgICAgICBsZXQgbG9nU3RyOiBzdHJpbmcgPSBcIlwiO1xuICAgICAgICBjb25zdCBjb3VudCA9IE1hdGguZmxvb3IoY2hhbmdlZEZpbGVJbmZvcy5sZW5ndGggLyBjb252ZXJDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtKSArIDE7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7aW1wb3J0KFwid29ya2VyX3RocmVhZHNcIikuV29ya2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHdvcmtlcjtcbiAgICAgICAgbGV0IHN1YkZpbGVJbmZvczogSUZpbGVJbmZvW107XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7aW1wb3J0KFwid29ya2VyX3RocmVhZHNcIikuV29ya2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHdvcmtlck1hcDogeyBba2V5OiBudW1iZXJdOiBXb3JrZXIgfSA9IHt9O1xuICAgICAgICBsZXQgY29tcGxldGVDb3VudDogbnVtYmVyID0gMDtcbiAgICAgICAgY29uc3QgdDEgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgY29uc3Qgb25Xb3JrZXJQYXJzZUVuZCA9IChkYXRhOiBJV29ya0RvUmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGAtLS0tLS0tLS0tLS0tLS0t57q/56iL57uT5p2fOiR7ZGF0YS50aHJlYWRJZH0tLS0tLS0tLS0tLS0tLS0tLWApO1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkTWFwID0gZGF0YS5wYXJzZVJlc3VsdE1hcDtcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBwYXJzZWRNYXApIHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcnNlUmVzdWx0TWFwW2tleV0udGFibGVEZWZpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXBba2V5XSA9IHBhcnNlZE1hcFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBsZXRlQ291bnQrKztcbiAgICAgICAgICAgIGxvZ1N0ciArPSBkYXRhLmxvZ1N0ciArIExvZ2dlci5sb2dTdHI7XG4gICAgICAgICAgICBpZiAoIWNvbnRleHQuaGFzRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lmhhc0Vycm9yID0gTG9nZ2VyLmhhc0Vycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbXBsZXRlQ291bnQgPj0gY291bnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0MiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgIExvZ2dlci5sb2coYFvlpJrnur/nqIvop6PmnpDml7bpl7RdOiR7dDIgLSB0MX1gKTtcbiAgICAgICAgICAgICAgICBvblBhcnNlRW5kKGNvbnRleHQsIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCwgY29udmVydEhvb2ssIGxvZ1N0cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgc3ViRmlsZUluZm9zID0gY2hhbmdlZEZpbGVJbmZvcy5zcGxpY2UoMCwgY29udmVyQ29uZmlnLnRocmVhZFBhcnNlRmlsZU1heE51bSk7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGAtLS0tLS0tLS0tLS0tLS0t57q/56iL5byA5aeLOiR7aX0tLS0tLS0tLS0tLS0tLS0tLWApO1xuXG4gICAgICAgICAgICB3b3JrZXIgPSBuZXcgV29ya2VyQ2xhc3MocGF0aC5qb2luKHBhdGguZGlybmFtZShfX2ZpbGVuYW1lKSwgXCIuLi8uLi8uLi93b3JrZXJfc2NyaXB0cy93b3JrZXIuanNcIiksIHtcbiAgICAgICAgICAgICAgICB3b3JrZXJEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHRocmVhZElkOiBpLFxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mb3M6IHN1YkZpbGVJbmZvcyxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXA6IHBhcnNlUmVzdWx0TWFwLFxuICAgICAgICAgICAgICAgICAgICBjb252ZXJ0Q29uZmlnOiBjb252ZXJDb25maWdcbiAgICAgICAgICAgICAgICB9IGFzIElXb3JrZXJTaGFyZURhdGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgd29ya2VyTWFwW2ldID0gd29ya2VyO1xuICAgICAgICAgICAgd29ya2VyLm9uKFwibWVzc2FnZVwiLCBvbldvcmtlclBhcnNlRW5kKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIExvZ2dlci5zeXN0ZW1Mb2coYFvljZXnur/nqIvop6PmnpBdYCk7XG4gICAgICAgIGlmIChjaGFuZ2VkRmlsZUluZm9zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHQxID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBkb1BhcnNlKGNvbnZlckNvbmZpZywgY2hhbmdlZEZpbGVJbmZvcywgcGFyc2VSZXN1bHRNYXAsIHBhcnNlSGFuZGxlcik7XG4gICAgICAgICAgICBjb25zdCB0MiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhgW+WNlee6v+eoi+ino+aekOaXtumXtF06JHt0MiAtIHQxfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRleHQuaGFzRXJyb3IgPSBMb2dnZXIuaGFzRXJyb3I7XG4gICAgICAgIG9uUGFyc2VFbmQoY29udGV4dCwgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoLCBjb252ZXJ0SG9vayk7XG4gICAgfVxufVxuLyoqXG4gKiDkvb/nlKhmYXN0LWdsb2LkvZzkuLrmlofku7bpgY3ljoZcbiAqIOiOt+WPlumcgOimgeino+aekOeahOaWh+S7tuS/oeaBr1xuICogQHBhcmFtIGNvbnRleHRcbiAqL1xuZnVuY3Rpb24gZ2V0RmlsZUluZm9zKGNvbnRleHQ6IElDb252ZXJ0Q29udGV4dCkge1xuICAgIGNvbnN0IGNvbnZlckNvbmZpZyA9IGNvbnRleHQuY29udmVydENvbmZpZztcbiAgICBsZXQgY2hhbmdlZEZpbGVJbmZvczogSUZpbGVJbmZvW10gPSBbXTtcbiAgICBsZXQgZGVsZXRlRmlsZUluZm9zOiBJRmlsZUluZm9bXSA9IFtdO1xuICAgIGNvbnN0IHRhYmxlRmlsZURpciA9IGNvbnZlckNvbmZpZy50YWJsZUZpbGVEaXI7XG4gICAgY29uc3QgZ2V0RmlsZUluZm8gPSAoZmlsZVBhdGg6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aFBhcnNlID0gcGF0aC5wYXJzZShmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IGZpbGVJbmZvOiBJRmlsZUluZm8gPSB7XG4gICAgICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICBmaWxlTmFtZTogZmlsZVBhdGhQYXJzZS5uYW1lLFxuICAgICAgICAgICAgZmlsZUV4dE5hbWU6IGZpbGVQYXRoUGFyc2UuZXh0LFxuICAgICAgICAgICAgaXNEZWxldGU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBmaWxlSW5mbztcbiAgICB9O1xuICAgIGNvbnN0IG1hdGNoUGF0dGVybiA9IGNvbnZlckNvbmZpZy5wYXR0ZXJuO1xuXG4gICAgY29uc3QgZmlsZVBhdGhzOiBzdHJpbmdbXSA9IGZnLnN5bmMobWF0Y2hQYXR0ZXJuLCB7XG4gICAgICAgIGFic29sdXRlOiB0cnVlLFxuICAgICAgICBvbmx5RmlsZXM6IHRydWUsXG4gICAgICAgIGNhc2VTZW5zaXRpdmVNYXRjaDogZmFsc2UsXG4gICAgICAgIGN3ZDogdGFibGVGaWxlRGlyXG4gICAgfSk7XG4gICAgbGV0IHBhcnNlUmVzdWx0TWFwOiBUYWJsZVBhcnNlUmVzdWx0TWFwID0ge307XG4gICAgLy/nvJPlrZjlpITnkIZcbiAgICBsZXQgY2FjaGVGaWxlRGlyUGF0aDogc3RyaW5nID0gY29udmVyQ29uZmlnLmNhY2hlRmlsZURpclBhdGg7XG4gICAgbGV0IHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aDogc3RyaW5nO1xuXG4gICAgaWYgKCFjb252ZXJDb25maWcudXNlQ2FjaGUpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWxlUGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNoYW5nZWRGaWxlSW5mb3MucHVzaChnZXRGaWxlSW5mbyhmaWxlUGF0aHNbaV0pKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB0MSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBpZiAoIWNhY2hlRmlsZURpclBhdGgpIGNhY2hlRmlsZURpclBhdGggPSBkZWZhdWx0RGlyO1xuICAgICAgICBpZiAoIXBhdGguaXNBYnNvbHV0ZShjYWNoZUZpbGVEaXJQYXRoKSkge1xuICAgICAgICAgICAgY2FjaGVGaWxlRGlyUGF0aCA9IHBhdGguam9pbihjb252ZXJDb25maWcucHJvalJvb3QsIGNhY2hlRmlsZURpclBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCA9IHBhdGguam9pbihjYWNoZUZpbGVEaXJQYXRoLCBjYWNoZUZpbGVOYW1lKTtcbiAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhg6K+75Y+W57yT5a2Y5pWw5o2uYCk7XG5cbiAgICAgICAgcGFyc2VSZXN1bHRNYXAgPSBnZXRDYWNoZURhdGEocGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoKTtcbiAgICAgICAgaWYgKCFwYXJzZVJlc3VsdE1hcCkge1xuICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXAgPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIExvZ2dlci5zeXN0ZW1Mb2coYOW8gOWni+e8k+WtmOWkhOeQhi4uLmApO1xuICAgICAgICBjb25zdCBvbGRGaWxlUGF0aHMgPSBPYmplY3Qua2V5cyhwYXJzZVJlc3VsdE1hcCk7XG4gICAgICAgIGxldCBvbGRGaWxlUGF0aEluZGV4OiBudW1iZXI7XG4gICAgICAgIGxldCBwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQ7XG4gICAgICAgIGxldCBmaWxlUGF0aDogc3RyaW5nO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbGVQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aHNbaV07XG4gICAgICAgICAgICBjb25zdCBmaWxlSW5mbyA9IGdldEZpbGVJbmZvKGZpbGVQYXRoKTtcblxuICAgICAgICAgICAgY29uc3QgZmlsZURhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgpO1xuICAgICAgICAgICAgZmlsZUluZm8uZmlsZURhdGEgPSBmaWxlRGF0YTtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VSZXN1bHRNYXBbZmlsZVBhdGhdO1xuICAgICAgICAgICAgdmFyIG1kNXN0ciA9IGdldEZpbGVNZDUoZmlsZURhdGEpO1xuICAgICAgICAgICAgaWYgKCFwYXJzZVJlc3VsdCB8fCAocGFyc2VSZXN1bHQgJiYgcGFyc2VSZXN1bHQubWQ1aGFzaCAhPT0gbWQ1c3RyKSkge1xuICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXSA9IHBhcnNlUmVzdWx0O1xuICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0Lm1kNWhhc2ggPSBtZDVzdHI7XG4gICAgICAgICAgICAgICAgY2hhbmdlZEZpbGVJbmZvcy5wdXNoKGZpbGVJbmZvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v5Yig6Zmk5LiN5a2Y5Zyo55qE5pen5paH5Lu2XG4gICAgICAgICAgICBvbGRGaWxlUGF0aEluZGV4ID0gb2xkRmlsZVBhdGhzLmluZGV4T2YoZmlsZVBhdGgpO1xuICAgICAgICAgICAgaWYgKG9sZEZpbGVQYXRoSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZEZpbGVQYXRoID0gb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRocy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhJbmRleF0gPSBlbmRGaWxlUGF0aDtcbiAgICAgICAgICAgICAgICBvbGRGaWxlUGF0aHMucG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy/liKDpmaTml6fmlofku7ZcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvbGRGaWxlUGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJzZVJlc3VsdE1hcFtvbGRGaWxlUGF0aHNbaV1dO1xuICAgICAgICAgICAgbGV0IGRlbGV0ZUZpbGVJbmZvID0gZ2V0RmlsZUluZm8ob2xkRmlsZVBhdGhzW2ldKTtcbiAgICAgICAgICAgIGRlbGV0ZUZpbGVJbmZvcy5wdXNoKGRlbGV0ZUZpbGVJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdDIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhg57yT5a2Y5aSE55CG5pe26Ze0OiR7dDIgLSB0MX1tcywkeyh0MiAtIHQxKSAvIDEwMDB9c2ApO1xuICAgIH1cbiAgICBjb250ZXh0LmRlbGV0ZUZpbGVJbmZvcyA9IGRlbGV0ZUZpbGVJbmZvcztcbiAgICBjb250ZXh0LmNoYW5nZWRGaWxlSW5mb3MgPSBjaGFuZ2VkRmlsZUluZm9zO1xuICAgIGNvbnRleHQucGFyc2VSZXN1bHRNYXAgPSBwYXJzZVJlc3VsdE1hcDtcbiAgICBjb250ZXh0LnBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCA9IHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aDtcbn1cbi8qKlxuICog6I635Y+W5paH5Lu25L+h5oGv5Lul5Y+K6aKE5aSE55CGXG4gKiBAcGFyYW0gY29udGV4dFxuICovXG5mdW5jdGlvbiBnZXRGaWxlSW5mb3NBbmRQcmVEbyhjb250ZXh0OiBJQ29udmVydENvbnRleHQpIHtcbiAgICBjb25zdCBjb252ZXJDb25maWcgPSBjb250ZXh0LmNvbnZlcnRDb25maWc7XG4gICAgbGV0IGNoYW5nZWRGaWxlSW5mb3M6IElGaWxlSW5mb1tdID0gW107XG4gICAgbGV0IGRlbGV0ZUZpbGVJbmZvczogSUZpbGVJbmZvW10gPSBbXTtcbiAgICBjb25zdCB0YWJsZUZpbGVEaXIgPSBjb252ZXJDb25maWcudGFibGVGaWxlRGlyO1xuICAgIGNvbnN0IGdldEZpbGVJbmZvID0gKGZpbGVQYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGhQYXJzZSA9IHBhdGgucGFyc2UoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBmaWxlSW5mbzogSUZpbGVJbmZvID0ge1xuICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgZmlsZU5hbWU6IGZpbGVQYXRoUGFyc2UubmFtZSxcbiAgICAgICAgICAgIGZpbGVFeHROYW1lOiBmaWxlUGF0aFBhcnNlLmV4dCxcbiAgICAgICAgICAgIGlzRGVsZXRlOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZmlsZUluZm87XG4gICAgfTtcbiAgICBjb25zdCBtYXRjaFBhdHRlcm4gPSBjb252ZXJDb25maWcucGF0dGVybjtcbiAgICBjb25zdCBlYWNoRmlsZUNhbGxiYWNrID0gKGZpbGVQYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZUluZm8gPSBnZXRGaWxlSW5mbyhmaWxlUGF0aCk7XG4gICAgICAgIGxldCBjYW5SZWFkOiBib29sZWFuO1xuICAgICAgICBjYW5SZWFkID0gbW1hdGNoLmFsbChmaWxlSW5mby5maWxlUGF0aCwgbWF0Y2hQYXR0ZXJuKTtcbiAgICAgICAgcmV0dXJuIHsgZmlsZUluZm8sIGNhblJlYWQgfTtcbiAgICB9O1xuICAgIGxldCBwYXJzZVJlc3VsdE1hcDogVGFibGVQYXJzZVJlc3VsdE1hcCA9IHt9O1xuXG4gICAgLy/nvJPlrZjlpITnkIZcbiAgICBsZXQgY2FjaGVGaWxlRGlyUGF0aDogc3RyaW5nID0gY29udmVyQ29uZmlnLmNhY2hlRmlsZURpclBhdGg7XG4gICAgbGV0IHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aDogc3RyaW5nO1xuXG4gICAgaWYgKCFjb252ZXJDb25maWcudXNlQ2FjaGUpIHtcbiAgICAgICAgZm9yRWFjaEZpbGUodGFibGVGaWxlRGlyLCAoZmlsZVBhdGgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgZmlsZUluZm8sIGNhblJlYWQgfSA9IGVhY2hGaWxlQ2FsbGJhY2soZmlsZVBhdGgpO1xuICAgICAgICAgICAgaWYgKGNhblJlYWQpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkRmlsZUluZm9zLnB1c2goZmlsZUluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgdDEgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgaWYgKCFjYWNoZUZpbGVEaXJQYXRoKSBjYWNoZUZpbGVEaXJQYXRoID0gZGVmYXVsdERpcjtcbiAgICAgICAgaWYgKCFwYXRoLmlzQWJzb2x1dGUoY2FjaGVGaWxlRGlyUGF0aCkpIHtcbiAgICAgICAgICAgIGNhY2hlRmlsZURpclBhdGggPSBwYXRoLmpvaW4oY29udmVyQ29uZmlnLnByb2pSb290LCBjYWNoZUZpbGVEaXJQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGggPSBwYXRoLmpvaW4oY2FjaGVGaWxlRGlyUGF0aCwgY2FjaGVGaWxlTmFtZSk7XG4gICAgICAgIExvZ2dlci5zeXN0ZW1Mb2coYOivu+WPlue8k+WtmOaVsOaNrmApO1xuXG4gICAgICAgIHBhcnNlUmVzdWx0TWFwID0gZ2V0Q2FjaGVEYXRhKHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCk7XG4gICAgICAgIGlmICghcGFyc2VSZXN1bHRNYXApIHtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGDlvIDlp4vnvJPlrZjlpITnkIYuLi5gKTtcbiAgICAgICAgY29uc3Qgb2xkRmlsZVBhdGhzID0gT2JqZWN0LmtleXMocGFyc2VSZXN1bHRNYXApO1xuICAgICAgICBsZXQgb2xkRmlsZVBhdGhJbmRleDogbnVtYmVyO1xuICAgICAgICBsZXQgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0O1xuICAgICAgICBmb3JFYWNoRmlsZSh0YWJsZUZpbGVEaXIsIChmaWxlUGF0aCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBmaWxlSW5mbywgY2FuUmVhZCB9ID0gZWFjaEZpbGVDYWxsYmFjayhmaWxlUGF0aCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGZpbGVEYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCBpc0NTVihmaWxlSW5mby5maWxlRXh0TmFtZSkgPyBcInV0Zi04XCIgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgaWYgKGNhblJlYWQpIHtcbiAgICAgICAgICAgICAgICBmaWxlSW5mby5maWxlRGF0YSA9IGZpbGVEYXRhO1xuICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VSZXN1bHRNYXBbZmlsZVBhdGhdO1xuICAgICAgICAgICAgICAgIHZhciBtZDVzdHIgPSBnZXRGaWxlTWQ1KGZpbGVEYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcnNlUmVzdWx0IHx8IChwYXJzZVJlc3VsdCAmJiBwYXJzZVJlc3VsdC5tZDVoYXNoICE9PSBtZDVzdHIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0TWFwW2ZpbGVQYXRoXSA9IHBhcnNlUmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdC5tZDVoYXNoID0gbWQ1c3RyO1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkRmlsZUluZm9zLnB1c2goZmlsZUluZm8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v5Yig6Zmk5LiN5a2Y5Zyo55qE5pen5paH5Lu2XG4gICAgICAgICAgICBvbGRGaWxlUGF0aEluZGV4ID0gb2xkRmlsZVBhdGhzLmluZGV4T2YoZmlsZVBhdGgpO1xuICAgICAgICAgICAgaWYgKG9sZEZpbGVQYXRoSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZEZpbGVQYXRoID0gb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRocy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhJbmRleF0gPSBlbmRGaWxlUGF0aDtcbiAgICAgICAgICAgICAgICBvbGRGaWxlUGF0aHMucG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZEZpbGVQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGVsZXRlIHBhcnNlUmVzdWx0TWFwW29sZEZpbGVQYXRoc1tpXV07XG4gICAgICAgICAgICBsZXQgZGVsZXRlRmlsZUluZm8gPSBnZXRGaWxlSW5mbyhvbGRGaWxlUGF0aHNbaV0pO1xuICAgICAgICAgICAgZGVsZXRlRmlsZUluZm9zLnB1c2goZGVsZXRlRmlsZUluZm8pO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0MiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGDnvJPlrZjlpITnkIbml7bpl7Q6JHt0MiAtIHQxfW1zLCR7KHQyIC0gdDEpIC8gMTAwMH1zYCk7XG4gICAgfVxuICAgIGNvbnRleHQuZGVsZXRlRmlsZUluZm9zID0gZGVsZXRlRmlsZUluZm9zO1xuICAgIGNvbnRleHQuY2hhbmdlZEZpbGVJbmZvcyA9IGNoYW5nZWRGaWxlSW5mb3M7XG4gICAgY29udGV4dC5wYXJzZVJlc3VsdE1hcCA9IHBhcnNlUmVzdWx0TWFwO1xuICAgIGNvbnRleHQucGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoID0gcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoO1xufVxuLyoqXG4gKiDop6PmnpDnu5PmnZ9cbiAqIEBwYXJhbSBwYXJzZUNvbmZpZ1xuICogQHBhcmFtIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aFxuICogQHBhcmFtIGNvbnZlcnRIb29rXG4gKiBAcGFyYW0gZmlsZUluZm9zXG4gKiBAcGFyYW0gZGVsZXRlRmlsZUluZm9zXG4gKiBAcGFyYW0gcGFyc2VSZXN1bHRNYXBcbiAqIEBwYXJhbSBsb2dTdHJcbiAqL1xuYXN5bmMgZnVuY3Rpb24gb25QYXJzZUVuZChcbiAgICBjb250ZXh0OiBJQ29udmVydENvbnRleHQsXG4gICAgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoOiBzdHJpbmcsXG4gICAgY29udmVydEhvb2s6IElDb252ZXJ0SG9vayxcbiAgICBsb2dTdHI/OiBzdHJpbmdcbikge1xuICAgIGNvbnN0IGNvbnZlcnRDb25maWcgPSBjb250ZXh0LmNvbnZlcnRDb25maWc7XG4gICAgY29uc3QgcGFyc2VSZXN1bHRNYXAgPSBjb250ZXh0LnBhcnNlUmVzdWx0TWFwO1xuICAgIC8v5aaC5p6c5rKh5pyJ6ZSZ6K+vLOWImeWGmeWFpeino+aekOe8k+WtmFxuICAgIC8v5pyJ6ZSZ6K+v5LiN6IO95YaZ5YWl57yT5a2Y77yM6YG/5YWN6ZSZ6K+v6KKr5LiL5qyh6Kej5p6Q57uZ5b+955Wl5o6JXG4gICAgaWYgKGNvbnZlcnRDb25maWcudXNlQ2FjaGUgJiYgIWNvbnRleHQuaGFzRXJyb3IpIHtcbiAgICAgICAgd3JpdGVDYWNoZURhdGEocGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoLCBwYXJzZVJlc3VsdE1hcCk7XG4gICAgfVxuXG4gICAgLy/op6PmnpDnu5PmnZ/vvIzlgZrlr7zlh7rlpITnkIZcbiAgICBMb2dnZXIuc3lzdGVtTG9nKGDlvIDlp4vov5vooYzovazmjaLop6PmnpDnu5PmnpxgKTtcbiAgICBjb25zdCBwYXJzZUFmdGVyVDEgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzKSA9PiB7XG4gICAgICAgIGNvbnZlcnRIb29rLm9uUGFyc2VBZnRlcihjb250ZXh0LCByZXMpO1xuICAgIH0pO1xuICAgIGNvbnN0IHBhcnNlQWZ0ZXJUMiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIExvZ2dlci5zeXN0ZW1Mb2coYOi9rOaNouino+aekOe7k+aenOe7k+adnzoke3BhcnNlQWZ0ZXJUMiAtIHBhcnNlQWZ0ZXJUMX1tcywkeyhwYXJzZUFmdGVyVDIgLSBwYXJzZUFmdGVyVDEpIC8gMTAwMH1zYCk7XG5cbiAgICBpZiAoY29udGV4dC5vdXRQdXRGaWxlTWFwKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dEZpbGVNYXAgPSBjb250ZXh0Lm91dFB1dEZpbGVNYXA7XG4gICAgICAgIGNvbnN0IG91dHB1dEZpbGVzID0gT2JqZWN0LnZhbHVlcyhvdXRwdXRGaWxlTWFwKTtcbiAgICAgICAgLy/lhpnlhaXlkozliKDpmaTmlofku7blpITnkIZcbiAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhg5byA5aeL5YaZ5YWl5paH5Lu2OjAvJHtvdXRwdXRGaWxlcy5sZW5ndGh9YCk7XG5cbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlcykgPT4ge1xuICAgICAgICAgICAgd3JpdGVPckRlbGV0ZU91dFB1dEZpbGVzKFxuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVzLFxuICAgICAgICAgICAgICAgIChmaWxlUGF0aCwgdG90YWwsIG5vdywgaXNPaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBMb2dnZXIubG9nKGBb5YaZ5YWl5paH5Lu2XSDov5vluqY6KCR7bm93fS8ke3RvdGFsfSkg6Lev5b6EOiR7ZmlsZVBhdGh9YCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGDlhpnlhaXnu5PmnZ9+YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhg5rKh5pyJ5Y+v5YaZ5YWl5paH5Lu2fmApO1xuICAgIH1cblxuICAgIC8v5YaZ5YWl5pel5b+X5paH5Lu2XG5cbiAgICBpZiAoIWxvZ1N0cikge1xuICAgICAgICBsb2dTdHIgPSBMb2dnZXIubG9nU3RyO1xuICAgIH1cbiAgICBpZiAobG9nU3RyLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICBsZXQgbG9nRmlsZURpclBhdGggPSBjb250ZXh0LmNvbnZlcnRDb25maWcub3V0cHV0TG9nRGlyUGF0aCBhcyBzdHJpbmc7XG4gICAgICAgIGlmICghbG9nRmlsZURpclBhdGgpIGxvZ0ZpbGVEaXJQYXRoID0gZGVmYXVsdERpcjtcbiAgICAgICAgaWYgKCFwYXRoLmlzQWJzb2x1dGUobG9nRmlsZURpclBhdGgpKSB7XG4gICAgICAgICAgICBsb2dGaWxlRGlyUGF0aCA9IHBhdGguam9pbihjb250ZXh0LmNvbnZlcnRDb25maWcucHJvalJvb3QsIGxvZ0ZpbGVEaXJQYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG91dHB1dExvZ0ZpbGVJbmZvOiBJT3V0UHV0RmlsZUluZm8gPSB7XG4gICAgICAgICAgICBmaWxlUGF0aDogcGF0aC5qb2luKGxvZ0ZpbGVEaXJQYXRoLCBsb2dGaWxlTmFtZSksXG4gICAgICAgICAgICBkYXRhOiBsb2dTdHJcbiAgICAgICAgfTtcbiAgICAgICAgd3JpdGVPckRlbGV0ZU91dFB1dEZpbGVzKFtvdXRwdXRMb2dGaWxlSW5mb10pO1xuICAgIH1cbiAgICAvL+WGmeWFpee7k+adn1xuICAgIGNvbnZlcnRIb29rLm9uV3JpdGVGaWxlRW5kKGNvbnRleHQpO1xuICAgIC8v57uT5p2f5pe26Ze0XG4gICAgY29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGNvbnN0IHVzZVRpbWUgPSBlbmRUaW1lIC0gc3RhcnRUaW1lO1xuICAgIExvZ2dlci5sb2coYOWvvOihqOaAu+aXtumXtDpbJHt1c2VUaW1lfW1zXSxbJHt1c2VUaW1lIC8gMTAwMH1zXWApO1xufVxuLyoqXG4gKiDmtYvor5Xmlofku7bljLnphY1cbiAqIEBwYXJhbSBjb252ZXJ0Q29uZmlnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZXN0RmlsZU1hdGNoKGNvbnZlcnRDb25maWc6IElUYWJsZUNvbnZlcnRDb25maWcpIHtcbiAgICBpZiAoIWNvbnZlcnRDb25maWcucHJvalJvb3QpIHtcbiAgICAgICAgY29udmVydENvbmZpZy5wcm9qUm9vdCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgfVxuICAgIGNvbnN0IHRhYmxlRmlsZURpciA9IGNvbnZlcnRDb25maWcudGFibGVGaWxlRGlyO1xuICAgIGlmICghdGFibGVGaWxlRGlyKSB7XG4gICAgICAgIExvZ2dlci5sb2coYOmFjee9ruihqOebruW9le+8mnRhYmxlRmlsZURpcuS4uuepumAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHRhYmxlRmlsZURpcikpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhg6YWN572u6KGo5paH5Lu25aS55LiN5a2Y5Zyo77yaJHt0YWJsZUZpbGVEaXJ9YCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWNvbnZlcnRDb25maWcucGF0dGVybikge1xuICAgICAgICBjb252ZXJ0Q29uZmlnLnBhdHRlcm4gPSBkZWZhdWx0UGF0dGVybjtcbiAgICB9XG4gICAgaWYgKGNvbnZlcnRDb25maWcudXNlTXVsdGlUaHJlYWQgJiYgaXNOYU4oY29udmVydENvbmZpZy50aHJlYWRQYXJzZUZpbGVNYXhOdW0pKSB7XG4gICAgICAgIGNvbnZlcnRDb25maWcudGhyZWFkUGFyc2VGaWxlTWF4TnVtID0gNTtcbiAgICB9XG4gICAgY29uc3QgY29udGV4dDogSUNvbnZlcnRDb250ZXh0ID0geyBjb252ZXJ0Q29uZmlnOiBjb252ZXJ0Q29uZmlnIH0gYXMgYW55O1xuICAgIGxldCB0MSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGdldEZpbGVJbmZvcyhjb250ZXh0KTtcbiAgICBsZXQgdDIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBjb25zb2xlLmxvZyhg5omn6KGM5pe26Ze0OiR7KHQyIC0gdDEpIC8gMTAwMH1zYCk7XG4gICAgaWYgKGNvbnZlcnRDb25maWcudXNlQ2FjaGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coYC0tLS3jgJDnvJPlrZjmqKHlvI/jgJEtLS0tYCk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS3ljLnphY3liLDnmoTmlofku7YtLS0tLS0tLS0tLS0tLS0tLS0tLS1gKTtcbiAgICBjb25zb2xlLmxvZyhjb250ZXh0LmNoYW5nZWRGaWxlSW5mb3MpO1xufVxuIl0sIm5hbWVzIjpbIm9zLnBsYXRmb3JtIiwieGxzeC5yZWFkRmlsZSIsInhsc3gucmVhZCIsIlRhYmxlVHlwZSIsInBhdGguam9pbiIsImRlZmxhdGVTeW5jIiwiZnMuc3RhdFN5bmMiLCJmcy5yZWFkZGlyU3luYyIsImZzLmV4aXN0c1N5bmMiLCJmcy51bmxpbmtTeW5jIiwiZnMuZW5zdXJlRmlsZVN5bmMiLCJmcy53cml0ZUZpbGUiLCJmcy53cml0ZUZpbGVTeW5jIiwiZnMucmVhZEZpbGVTeW5jIiwiY3J5cHRvLmNyZWF0ZUhhc2giLCJmcy5yZWFkRmlsZSIsInBhdGgiLCJyZXF1aXJlJCQwIiwicGF0aC5kaXJuYW1lIiwicGF0aC5wYXJzZSIsImZnIiwicGF0aC5pc0Fic29sdXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFFYSxpQkFBaUIsR0FFMUIsR0FBRztBQUNQLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUNwQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxRQUFRLENBQUM7QUFDdkMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsV0FBVyxDQUFDO0FBQ3pDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxHQUFHLFdBQVcsQ0FBQztBQUM1QyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZLENBQUM7QUFDekMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQ3JDLFNBQVMsV0FBVyxDQUFDLFNBQXNCLEVBQUUsU0FBaUI7SUFDMUQsU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLEVBQUUsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFF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
