'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var os = require('os');
var xlsx = require('xlsx');
var path = require('path');
var zlib = require('zlib');
var fs = require('fs-extra');
var crypto = require('crypto');
var fg = require('fast-glob');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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

var os__namespace = /*#__PURE__*/_interopNamespace(os);
var xlsx__namespace = /*#__PURE__*/_interopNamespace(xlsx);
var path__namespace = /*#__PURE__*/_interopNamespace(path);
var fs__namespace = /*#__PURE__*/_interopNamespace(fs);
var crypto__namespace = /*#__PURE__*/_interopNamespace(crypto);
var fg__default = /*#__PURE__*/_interopDefaultLegacy(fg);

const valueTransFuncMap = {};
valueTransFuncMap["int"] = strToInt;
valueTransFuncMap["string"] = anyToStr;
valueTransFuncMap["[int]"] = strToIntArr;
valueTransFuncMap["[string]"] = strToStrArr;
valueTransFuncMap["json"] = strToJsonObj;
valueTransFuncMap["any"] = anyToAny;
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

const platform = os__namespace.platform();
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
let colKeySumMap = {};
function getCharCodeSum(colKey) {
    let sum = colKeySumMap[colKey];
    if (!sum) {
        sum = 0;
        for (let i = 0; i < colKey.length; i++) {
            sum += colKey.charCodeAt(i) * (colKey.length - i - 1) * 100;
        }
        colKeySumMap[colKey] = sum;
    }
    return sum;
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
function readTableFile(fileInfo) {
    const workBook = xlsx__namespace.readFile(fileInfo.filePath, { type: getTableFileType(fileInfo) });
    return workBook;
}
function readTableData(fileInfo) {
    const workBook = xlsx__namespace.read(fileInfo.fileData, {
        type: typeof fileInfo.fileData === "string" ? "string" : "buffer"
    });
    return workBook;
}
function getTableFileType(fileInfo) {
    return isCSV(fileInfo.fileExtName) ? "string" : "file";
}
function isCSV(fileExtName) {
    return fileExtName === ".csv";
}

exports.TableType = void 0;
(function (TableType) {
    TableType["vertical"] = "vertical";
    TableType["horizontal"] = "horizontal";
})(exports.TableType || (exports.TableType = {}));
class DefaultTableParser {
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
            tableParseResult.hasError = true;
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
        fileInfo.fileData = isCSV(fileInfo.fileExtName) ? fileInfo.fileData.toString() : fileInfo.fileData;
        const workbook = readTableData(fileInfo);
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

const typeStrMap = { int: "number", json: "any", "[int]": "number[]", "[string]": "string[]" };
class DefaultParseResultTransformer {
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
            if (outputConfig.clientDtsOutDir && objTypeTableMap[tableName] === undefined) {
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
        if (outputConfig.clientDtsOutDir) {
            let itBaseStr = "interface ITBase<T> { [key:string]:T}" + osEol;
            tableTypeMapDtsStr = itBaseStr + "interface IT_TableMap {" + osEol + tableTypeMapDtsStr + "}" + osEol;
            if (outputConfig.isBundleDts) {
                const dtsFileName = outputConfig.bundleDtsFileName ? outputConfig.bundleDtsFileName : "tableMap";
                const bundleDtsFilePath = path__namespace.join(outputConfig.clientDtsOutDir, `${dtsFileName}.d.ts`);
                outputFileMap[bundleDtsFilePath] = {
                    filePath: bundleDtsFilePath,
                    data: tableTypeMapDtsStr + tableTypeDtsStrs
                };
            }
            else {
                const tableTypeMapDtsFilePath = path__namespace.join(outputConfig.clientDtsOutDir, "tableMap.d.ts");
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
        let dtsFilePath = path__namespace.join(config.clientDtsOutDir, `${parseResult.tableDefine.tableName}.d.ts`);
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
        let singleJsonFilePath = path__namespace.join(config.clientSingleTableJsonDir, `${tableName}.json`);
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

class DefaultConvertHook {
    constructor() {
        this._tableParser = new DefaultTableParser();
        this._tableResultTransformer = new DefaultParseResultTransformer();
    }
    onStart(context, cb) {
        Logger.systemLog(`[excel2all] convert-hook onStart`);
        Logger.systemLog(`[excel2all] 开始表转换`);
        cb();
    }
    onParseBefore(context, cb) {
        Logger.systemLog(`convert-hook onParseBefore`);
        cb();
    }
    onParse(context, cb) {
        const { changedFileInfos, parseResultMap, convertConfig } = context;
        const tableParser = this._tableParser;
        let parseResult;
        let fileNum = changedFileInfos.length;
        let fileInfo;
        for (let i = 0; i < fileNum; i++) {
            fileInfo = changedFileInfos[i];
            parseResult = parseResultMap[fileInfo.filePath];
            if (!parseResult) {
                parseResult = { filePath: fileInfo.filePath };
            }
            if (!parseResult.tableObj) {
                parseResult = tableParser.parseTableFile(convertConfig, fileInfo, parseResult);
            }
            if (parseResult) {
                parseResultMap[fileInfo.filePath] = parseResult;
            }
        }
        cb();
    }
    onParseAfter(context, cb) {
        let transformer = this._tableResultTransformer;
        transformer.transform(context, cb);
    }
    onConvertEnd(context) {
        Logger.systemLog(`convert-hook onWriteFileEnd 写入结束`);
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
    if (fs__namespace.statSync(fileOrDirPath).isDirectory() && fileOrDirPath !== ".git" && fileOrDirPath !== ".svn") {
        const fileNames = fs__namespace.readdirSync(fileOrDirPath);
        let childFilePath;
        for (var i = 0; i < fileNames.length; i++) {
            childFilePath = path__namespace.join(fileOrDirPath, fileNames[i]);
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
            if (fileInfo.isDelete && fs__namespace.existsSync(fileInfo.filePath)) {
                fs__namespace.unlinkSync(fileInfo.filePath);
            }
            else {
                if (fs__namespace.existsSync(fileInfo.filePath) && fs__namespace.statSync(fileInfo.filePath).isDirectory()) {
                    Logger.log(`路径为文件夹:${fileInfo.filePath}`, "error");
                    continue;
                }
                if (!fileInfo.encoding && typeof fileInfo.data === "string") {
                    fileInfo.encoding = "utf8";
                }
                fs__namespace.ensureFileSync(fileInfo.filePath);
                fs__namespace.writeFile(fileInfo.filePath, fileInfo.data, fileInfo.encoding ? { encoding: fileInfo.encoding } : undefined, onWriteEnd);
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
    fs__namespace.writeFileSync(cacheFilePath, JSON.stringify(gcfCache), { encoding: "utf-8" });
}
function writeCacheData(cacheFilePath, cacheData) {
    if (!cacheFilePath) {
        Logger.log(`cacheFilePath is null`, "error");
        return;
    }
    fs__namespace.writeFileSync(cacheFilePath, JSON.stringify(cacheData), { encoding: "utf-8" });
}
function getCacheData(cacheFilePath) {
    if (!cacheFilePath) {
        Logger.log(`cacheFilePath is null`, "error");
        return;
    }
    if (!fs__namespace.existsSync(cacheFilePath)) {
        fs__namespace.ensureFileSync(cacheFilePath);
        fs__namespace.writeFileSync(cacheFilePath, "{}", { encoding: "utf-8" });
    }
    const gcfCacheFile = fs__namespace.readFileSync(cacheFilePath, "utf-8");
    const gcfCache = JSON.parse(gcfCacheFile);
    return gcfCache;
}
function getFileMd5Sync(filePath, encoding) {
    const file = fs__namespace.readFileSync(filePath, encoding);
    var md5um = crypto__namespace.createHash("md5");
    md5um.update(file);
    return md5um.digest("hex");
}
function getFileMd5Async(filePath, cb, encoding) {
    fs__namespace.readFile(filePath, encoding, (err, file) => {
        var md5um = crypto__namespace.createHash("md5");
        md5um.update(file);
        const md5Str = md5um.digest("hex");
        cb(md5Str);
    });
}
function getFileMd5(file) {
    const md5um = crypto__namespace.createHash("md5");
    md5um.update(file);
    return md5um.digest("hex");
}
function getFileMd5ByPath(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return getFileMd5Sync(filePath);
    });
}

const defaultDir = ".excel2all";
const cacheFileName = ".e2aprmc";
const logFileName = "excel2all.log";
let startTime = 0;
const defaultPattern = ["./**/*.xlsx", "./**/*.csv", "!**/~$*.*", "!**/~.*.*", "!.git/**/*", "!.svn/**/*"];
function convert(converConfig, customConvertHook) {
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
        if (!fs__namespace.existsSync(tableFileDir)) {
            Logger.log(`配置表文件夹不存在：${tableFileDir}`, "error");
            return;
        }
        if (!converConfig.pattern) {
            converConfig.pattern = defaultPattern;
        }
        let convertHook = new DefaultConvertHook();
        const context = {
            convertConfig: converConfig,
            utils: {
                fs: require("fs-extra"),
                xlsx: require("xlsx")
            }
        };
        yield new Promise((res) => {
            customConvertHook && customConvertHook.onStart ? customConvertHook.onStart(context, res) : convertHook.onStart(context, res);
        });
        const predoT1 = new Date().getTime();
        getFileInfos(context);
        const { parseResultMapCacheFilePath, changedFileInfos } = context;
        const predoT2 = new Date().getTime();
        Logger.systemLog(`[预处理数据时间:${predoT2 - predoT1}ms,${(predoT2 - predoT1) / 1000}]`);
        yield new Promise((res) => {
            customConvertHook && customConvertHook.onParseBefore ? customConvertHook.onParseBefore(context, res) : convertHook.onParseBefore(context, res);
        });
        Logger.systemLog(`[开始解析]:数量[${changedFileInfos.length}]`);
        Logger.systemLog(`[单线程解析]`);
        if (changedFileInfos.length > 0) {
            const t1 = new Date().getTime();
            yield new Promise((res) => {
                customConvertHook && customConvertHook.onParse ? customConvertHook.onParse(context, res) : convertHook.onParse(context, res);
            });
            const t2 = new Date().getTime();
            Logger.systemLog(`[单线程解析时间]:${t2 - t1}`);
        }
        onParseEnd(context, parseResultMapCacheFilePath, customConvertHook, convertHook);
    });
}
function onParseEnd(context, parseResultMapCacheFilePath, customConvertHook, convertHook, logStr) {
    return __awaiter(this, void 0, void 0, function* () {
        const convertConfig = context.convertConfig;
        const parseResultMap = context.parseResultMap;
        if (convertConfig.useCache) {
            writeCacheData(parseResultMapCacheFilePath, parseResultMap);
        }
        Logger.systemLog(`开始进行转换解析结果`);
        const parseAfterT1 = new Date().getTime();
        yield new Promise((res) => {
            customConvertHook && customConvertHook.onParseAfter ? customConvertHook.onParseAfter(context, res) : convertHook.onParseAfter(context, res);
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
            if (!path__namespace.isAbsolute(logFileDirPath)) {
                logFileDirPath = path__namespace.join(context.convertConfig.projRoot, logFileDirPath);
            }
            const outputLogFileInfo = {
                filePath: path__namespace.join(logFileDirPath, logFileName),
                data: logStr
            };
            writeOrDeleteOutPutFiles([outputLogFileInfo]);
        }
        convertHook.onConvertEnd(context);
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
    if (!fs__namespace.existsSync(tableFileDir)) {
        Logger.log(`配置表文件夹不存在：${tableFileDir}`, "error");
        return;
    }
    if (!convertConfig.pattern) {
        convertConfig.pattern = defaultPattern;
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
function getFileInfos(context) {
    const converConfig = context.convertConfig;
    let changedFileInfos = [];
    let deleteFileInfos = [];
    const tableFileDir = converConfig.tableFileDir;
    const getFileInfo = (filePath, isDelete) => {
        const filePathParse = path__namespace.parse(filePath);
        let fileData = !isDelete ? fs__namespace.readFileSync(filePath) : undefined;
        const fileInfo = {
            filePath: filePath,
            fileName: filePathParse.name,
            fileExtName: filePathParse.ext,
            isDelete: isDelete,
            fileData: fileData
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
    let fileInfo;
    if (!converConfig.useCache) {
        for (let i = 0; i < filePaths.length; i++) {
            fileInfo = getFileInfo(filePaths[i]);
            changedFileInfos.push(fileInfo);
        }
    }
    else {
        let t1 = new Date().getTime();
        if (!cacheFileDirPath)
            cacheFileDirPath = defaultDir;
        if (!path__namespace.isAbsolute(cacheFileDirPath)) {
            cacheFileDirPath = path__namespace.join(converConfig.projRoot, cacheFileDirPath);
        }
        parseResultMapCacheFilePath = path__namespace.join(cacheFileDirPath, cacheFileName);
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
            oldFilePathIndex = oldFilePaths.indexOf(filePath);
            if (oldFilePathIndex > -1) {
                const endFilePath = oldFilePaths[oldFilePaths.length - 1];
                oldFilePaths[oldFilePathIndex] = endFilePath;
                oldFilePaths.pop();
            }
        }
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

exports.ACharCode = ACharCode;
exports.DefaultConvertHook = DefaultConvertHook;
exports.DefaultParseResultTransformer = DefaultParseResultTransformer;
exports.DefaultTableParser = DefaultTableParser;
exports.Logger = Logger;
exports.ZCharCode = ZCharCode;
exports.charCodesToString = charCodesToString;
exports.convert = convert;
exports.forEachChangedFile = forEachChangedFile;
exports.forEachFile = forEachFile;
exports.getCacheData = getCacheData;
exports.getCharCodeSum = getCharCodeSum;
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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXZhbHVlLWZ1bmMtbWFwLnRzIiwiLi4vLi4vLi4vc3JjL2dldC1vcy1lb2wudHMiLCIuLi8uLi8uLi9zcmMvbG9nZXIudHMiLCIuLi8uLi8uLi9zcmMvdGFibGUtdXRpbHMudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC10YWJsZS1wYXJzZXIudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC1yZXN1bHQtdHJhbnNmb3JtZXIudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC1jb252ZXJ0LWhvb2sudHMiLCIuLi8uLi8uLi9zcmMvZmlsZS11dGlscy50cyIsIi4uLy4uLy4uL3NyYy9jb252ZXJ0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2VyXCI7XG5cbmV4cG9ydCBjb25zdCB2YWx1ZVRyYW5zRnVuY01hcDoge1xuICAgIFtrZXk6IHN0cmluZ106IFZhbHVlVHJhbnNGdW5jO1xufSA9IHt9O1xudmFsdWVUcmFuc0Z1bmNNYXBbXCJpbnRcIl0gPSBzdHJUb0ludDtcbnZhbHVlVHJhbnNGdW5jTWFwW1wic3RyaW5nXCJdID0gYW55VG9TdHI7XG52YWx1ZVRyYW5zRnVuY01hcFtcIltpbnRdXCJdID0gc3RyVG9JbnRBcnI7XG52YWx1ZVRyYW5zRnVuY01hcFtcIltzdHJpbmddXCJdID0gc3RyVG9TdHJBcnI7XG52YWx1ZVRyYW5zRnVuY01hcFtcImpzb25cIl0gPSBzdHJUb0pzb25PYmo7XG52YWx1ZVRyYW5zRnVuY01hcFtcImFueVwiXSA9IGFueVRvQW55O1xuZnVuY3Rpb24gc3RyVG9JbnRBcnIoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgaW50QXJyOiBudW1iZXJbXTtcbiAgICBjb25zdCByZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0ID0ge307XG4gICAgaWYgKGNlbGxWYWx1ZSAhPT0gXCJcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaW50QXJyID0gSlNPTi5wYXJzZShjZWxsVmFsdWUpO1xuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gaW50QXJyO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gc3RyVG9TdHJBcnIoZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9O1xuICAgIGxldCBhcnI6IHN0cmluZ1tdO1xuICAgIGlmIChjZWxsVmFsdWUgIT09IFwiXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGFyciA9IEpTT04ucGFyc2UoY2VsbFZhbHVlKTtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGFycjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvciA9IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBzdHJUb0ludChmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IHN0cmluZyk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9IGFzIGFueTtcbiAgICBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiBjZWxsVmFsdWUudHJpbSgpICE9PSBcIlwiKSB7XG4gICAgICAgIHJlc3VsdC52YWx1ZSA9IGNlbGxWYWx1ZS5pbmNsdWRlcyhcIi5cIikgPyBwYXJzZUZsb2F0KGNlbGxWYWx1ZSkgOiAocGFyc2VJbnQoY2VsbFZhbHVlKSBhcyBhbnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBzdHJUb0pzb25PYmooZmllbGRJdGVtOiBJVGFibGVGaWVsZCwgY2VsbFZhbHVlOiBzdHJpbmcpOiBJVHJhbnNWYWx1ZVJlc3VsdCB7XG4gICAgY2VsbFZhbHVlID0gKGNlbGxWYWx1ZSArIFwiXCIpLnJlcGxhY2UoL++8jC9nLCBcIixcIik7IC8v5Li65LqG6Ziy5q2i562W5YiS6K+v5aGr77yM5YWI6L+b6KGM6L2s5o2iXG4gICAgY2VsbFZhbHVlID0gY2VsbFZhbHVlLnRyaW0oKTtcbiAgICBsZXQgb2JqO1xuICAgIGxldCBlcnJvcjtcbiAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBvYmogPSBKU09OLnBhcnNlKGNlbGxWYWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICBvYmogPSBjZWxsVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgZXJyb3I6IGVycm9yLCB2YWx1ZTogb2JqIH07XG59XG5mdW5jdGlvbiBhbnlUb1N0cihmaWVsZEl0ZW06IElUYWJsZUZpZWxkLCBjZWxsVmFsdWU6IGFueSk6IElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICBsZXQgcmVzdWx0OiBJVHJhbnNWYWx1ZVJlc3VsdCA9IHt9IGFzIGFueTtcbiAgICBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBjZWxsVmFsdWUgPSBjZWxsVmFsdWUudHJpbSgpO1xuICAgICAgICBpZiAoY2VsbFZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQudmFsdWUgPSBjZWxsVmFsdWUgKyBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKiDlhYjlsJ3or5XovazmjaLmnKrlr7nosaHvvIzkuI3ooYzlho3kvb/nlKjljp/lgLxcbiAqIEBwYXJhbSBmaWVsZEl0ZW1cbiAqIEBwYXJhbSBjZWxsVmFsdWVcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIGFueVRvQW55KGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogc3RyaW5nKTogSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgIGNlbGxWYWx1ZSA9IChjZWxsVmFsdWUgKyBcIlwiKS5yZXBsYWNlKC/vvIwvZywgXCIsXCIpOyAvL+S4uuS6humYsuatouetluWIkuivr+Whq++8jOWFiOi/m+ihjOi9rOaNolxuICAgIGNlbGxWYWx1ZSA9IGNlbGxWYWx1ZS50cmltKCk7XG4gICAgbGV0IG9iajtcbiAgICBsZXQgZXJyb3I7XG4gICAgaWYgKGNlbGxWYWx1ZSAhPT0gXCJcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgb2JqID0gSlNPTi5wYXJzZShjZWxsVmFsdWUpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIG9iaiA9IGNlbGxWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBlcnJvcjogZXJyb3IsIHZhbHVlOiBvYmogfTtcbn1cbiIsImltcG9ydCAqIGFzIG9zIGZyb20gXCJvc1wiO1xuY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuLyoq5b2T5YmN57O757uf6KGM5bC+ICBwbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiID8gXCJcXG5cIiA6IFwiXFxyXFxuXCI7Ki9cbmV4cG9ydCBjb25zdCBvc0VvbCA9IHBsYXRmb3JtID09PSBcIndpbjMyXCIgPyBcIlxcblwiIDogXCJcXHJcXG5cIjtcbiIsImltcG9ydCB7IG9zRW9sIH0gZnJvbSBcIi4vZ2V0LW9zLWVvbFwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuZW51bSBMb2dMZXZlbEVudW0ge1xuICAgIGluZm8sXG4gICAgd2FybixcbiAgICBlcnJvcixcbiAgICBub1xufVxuZXhwb3J0IGNsYXNzIExvZ2dlciB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2VuYWJsZU91dFB1dExvZ0ZpbGU6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2xvZ0xldmVsOiBMb2dMZXZlbEVudW07XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2xvZ1N0cjogc3RyaW5nID0gXCJcIjtcbiAgICAvKipcbiAgICAgKiDlpoLmnpzmnInovpPlh7rov4fplJnor6/kv6Hmga/liJnkuLp0cnVlXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBoYXNFcnJvcjogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyBzdGF0aWMgaW5pdChjb252ZXJ0Q29uZmlnOiBJVGFibGVDb252ZXJ0Q29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGxldmVsOiBMb2dMZXZlbCA9IGNvbnZlcnRDb25maWcubG9nTGV2ZWwgPyBjb252ZXJ0Q29uZmlnLmxvZ0xldmVsIDogXCJpbmZvXCI7XG4gICAgICAgIHRoaXMuX2xvZ0xldmVsID0gTG9nTGV2ZWxFbnVtW2xldmVsXTtcbiAgICAgICAgdGhpcy5fZW5hYmxlT3V0UHV0TG9nRmlsZSA9IGNvbnZlcnRDb25maWcub3V0cHV0TG9nRGlyUGF0aCA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOi+k+WHuuaXpeW/lyzml6Xlv5fnrYnnuqflj6rmmK/pmZDliLbkuobmjqfliLblj7DovpPlh7rvvIzkvYbkuI3pmZDliLbml6Xlv5forrDlvZVcbiAgICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgICAqIEBwYXJhbSBsZXZlbFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbG9nKG1lc3NhZ2U6IHN0cmluZywgbGV2ZWw6IExvZ0xldmVsID0gXCJpbmZvXCIpIHtcbiAgICAgICAgaWYgKGxldmVsICE9PSBcIm5vXCIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9sb2dMZXZlbCA8PSBMb2dMZXZlbEVudW1bbGV2ZWxdKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaGFzRXJyb3IpIHRoaXMuaGFzRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJpbmZvXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwid2FyblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVPdXRQdXRMb2dGaWxlKSByZXR1cm47XG4gICAgICAgIHRoaXMuX2xvZ1N0ciArPSBtZXNzYWdlICsgb3NFb2w7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOezu+e7n+aXpeW/l+i+k+WHulxuICAgICAqIEBwYXJhbSBhcmdzXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBzeXN0ZW1Mb2cobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICBpZiAoIXRoaXMuX2VuYWJsZU91dFB1dExvZ0ZpbGUpIHJldHVybjtcbiAgICAgICAgdGhpcy5fbG9nU3RyICs9IG1lc3NhZ2UgKyBvc0VvbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6L+U5Zue5pel5b+X5pWw5o2u5bm25riF56m6XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXQgbG9nU3RyKCk6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy5fZW5hYmxlT3V0UHV0TG9nRmlsZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IGxvZ1N0ciA9IHRoaXMuX2xvZ1N0cjtcbiAgICAgICAgdGhpcy5fbG9nU3RyID0gXCJcIjsgLy/muIXnqbpcbiAgICAgICAgcmV0dXJuIGxvZ1N0cjtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyB4bHN4IGZyb20gXCJ4bHN4XCI7XG4vKipcbiAqIOaYr+WQpuS4uuepuuihqOagvOagvOWtkFxuICogQHBhcmFtIGNlbGxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHlDZWxsKGNlbGw6IHhsc3guQ2VsbE9iamVjdCkge1xuICAgIGlmIChjZWxsICYmIGNlbGwudiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2VsbC52ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gY2VsbC52ID09PSBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZWxsLnYgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBpc05hTihjZWxsLnYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuLyoqXG4gKiDlrZfmr41a55qE57yW56CBXG4gKi9cbmV4cG9ydCBjb25zdCBaQ2hhckNvZGUgPSA5MDtcbi8qKlxuICog5a2X5q+NQeeahOe8lueggVxuICpcbiAqL1xuZXhwb3J0IGNvbnN0IEFDaGFyQ29kZSA9IDY1O1xuLyoqXG4gKiDmoLnmja7lvZPliY3liJfnmoRjaGFyQ29kZXPojrflj5bkuIvkuIDliJdLZXlcbiAqIEBwYXJhbSBjaGFyQ29kZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5leHRDb2xLZXkoY2hhckNvZGVzOiBudW1iZXJbXSk6IHN0cmluZyB7XG4gICAgbGV0IGlzQWRkOiBib29sZWFuO1xuICAgIGZvciAobGV0IGkgPSBjaGFyQ29kZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgaWYgKGNoYXJDb2Rlc1tpXSA8IFpDaGFyQ29kZSkge1xuICAgICAgICAgICAgY2hhckNvZGVzW2ldICs9IDE7XG4gICAgICAgICAgICBpc0FkZCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZXNbaV0gPT09IFpDaGFyQ29kZSkge1xuICAgICAgICAgICAgY2hhckNvZGVzW2ldID0gQUNoYXJDb2RlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghaXNBZGQpIHtcbiAgICAgICAgY2hhckNvZGVzLnB1c2goQUNoYXJDb2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hhckNvZGVzVG9TdHJpbmcoY2hhckNvZGVzKTtcbn1cblxuLyoqXG4gKiDliJfnmoTlrZfnrKbnvJbnoIHmlbDnu4TovazlrZfnrKbkuLJcbiAqIEBwYXJhbSBjaGFyQ29kZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoYXJDb2Rlc1RvU3RyaW5nKGNoYXJDb2RlczogbnVtYmVyW10pOiBzdHJpbmcge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmNoYXJDb2Rlcyk7XG59XG4vKipcbiAqIOWtl+espuS4sui9rOe8lueggeaVsOe7hFxuICogQHBhcmFtIGNvbEtleVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9DaGFyQ29kZXMoY29sS2V5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBjaGFyQ29kZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbEtleS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjaGFyQ29kZXMucHVzaChjb2xLZXkuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuICAgIHJldHVybiBjaGFyQ29kZXM7XG59XG5sZXQgY29sS2V5U3VtTWFwID0ge307XG4vKipcbiAqIOiOt+WPluWIl+agh+etvueahOWkp+WwjyDnlKjkuo7mr5TovoPmmK/lkKbmnIDlpKfliJcg5q+U5aaCIOacgOWkp+WIl2tleTogQkQs5b2T5YmN5YiXa2V5OiBBRiBBRiA8IEJEXG4gKiBAcGFyYW0gY29sS2V5XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2hhckNvZGVTdW0oY29sS2V5OiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGxldCBzdW06IG51bWJlciA9IGNvbEtleVN1bU1hcFtjb2xLZXldO1xuICAgIGlmICghc3VtKSB7XG4gICAgICAgIHN1bSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sS2V5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzdW0gKz0gY29sS2V5LmNoYXJDb2RlQXQoaSkgKiAoY29sS2V5Lmxlbmd0aCAtIGkgLSAxKSAqIDEwMDtcbiAgICAgICAgfVxuICAgICAgICBjb2xLZXlTdW1NYXBbY29sS2V5XSA9IHN1bTtcbiAgICB9XG4gICAgcmV0dXJuIHN1bTtcbn1cbi8qKlxuICog57q15ZCR6YGN5Y6G6KGo5qC8XG4gKiBAcGFyYW0gc2hlZXQgeGxzeOihqOagvOWvueixoVxuICogQHBhcmFtIHN0YXJ0Um93IOW8gOWni+ihjCDku44x5byA5aeLXG4gKiBAcGFyYW0gc3RhcnRDb2wg5YiX5a2X56ymIOavlOWmgkEgQlxuICogQHBhcmFtIGNhbGxiYWNrIOmBjeWOhuWbnuiwgyAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB2b2lkXG4gKiBAcGFyYW0gaXNTaGVldFJvd0VuZCDmmK/lkKbooYznu5PmnZ/liKTmlq3mlrnms5VcbiAqIEBwYXJhbSBpc1NoZWV0Q29sRW5kIOaYr+WQpuWIl+e7k+adn+WIpOaWreaWueazlVxuICogQHBhcmFtIGlzU2tpcFNoZWV0Um93IOaYr+WQpui3s+i/h+ihjFxuICogQHBhcmFtIGlzU2tpcFNoZWV0Q29sIOaYr+WQpui3s+i/h+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gdmVydGljYWxGb3JFYWNoU2hlZXQoXG4gICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgc3RhcnRSb3c6IG51bWJlcixcbiAgICBzdGFydENvbDogc3RyaW5nLFxuICAgIGNhbGxiYWNrOiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB2b2lkLFxuICAgIGlzU2hlZXRSb3dFbmQ/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IGJvb2xlYW4sXG4gICAgaXNTaGVldENvbEVuZD86IChzaGVldDogeGxzeC5TaGVldCwgY29sa2V5OiBzdHJpbmcpID0+IGJvb2xlYW4sXG4gICAgaXNTa2lwU2hlZXRSb3c/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IGJvb2xlYW4sXG4gICAgaXNTa2lwU2hlZXRDb2w/OiAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKSA9PiBib29sZWFuXG4pIHtcbiAgICBjb25zdCBzaGVldFJlZjogc3RyaW5nID0gc2hlZXRbXCIhcmVmXCJdO1xuICAgIGNvbnN0IG1heFJvd051bSA9IHBhcnNlSW50KHNoZWV0UmVmLm1hdGNoKC9cXGQrJC8pWzBdKTtcblxuICAgIGNvbnN0IG1heENvbEtleSA9IHNoZWV0UmVmLnNwbGl0KFwiOlwiKVsxXS5tYXRjaCgvXltBLVphLXpdKy8pWzBdO1xuICAgIGxldCBtYXhDb2xLZXlDb2RlU3VtID0gZ2V0Q2hhckNvZGVTdW0obWF4Q29sS2V5KTtcblxuICAgIGxldCBjb2xDaGFyQ29kZXM6IG51bWJlcltdO1xuICAgIGxldCBjb2xLZXk6IHN0cmluZztcbiAgICBsZXQgY3VyQ29sQ29kZVN1bTogbnVtYmVyID0gMDtcbiAgICBjb25zdCBzdGFydENoYXJjb2RlcyA9IHN0cmluZ1RvQ2hhckNvZGVzKHN0YXJ0Q29sKTtcbiAgICBmb3IgKGxldCBpID0gc3RhcnRSb3c7IGkgPD0gbWF4Um93TnVtOyBpKyspIHtcbiAgICAgICAgaWYgKGlzU2hlZXRSb3dFbmQgPyBpc1NoZWV0Um93RW5kKHNoZWV0LCBpKSA6IGZhbHNlKSBicmVhaztcbiAgICAgICAgaWYgKGlzU2tpcFNoZWV0Um93ID8gaXNTa2lwU2hlZXRSb3coc2hlZXQsIGkpIDogZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgICBjb2xDaGFyQ29kZXMgPSBzdGFydENoYXJjb2Rlcy5jb25jYXQoW10pO1xuXG4gICAgICAgIGNvbEtleSA9IHN0YXJ0Q29sO1xuXG4gICAgICAgIGxldCBoYXNOZXh0Q29sID0gaXNTaGVldENvbEVuZCA/ICFpc1NoZWV0Q29sRW5kKHNoZWV0LCBjb2xLZXkpIDogdHJ1ZTtcbiAgICAgICAgd2hpbGUgKGhhc05leHRDb2wpIHtcbiAgICAgICAgICAgIGlmICghKGlzU2tpcFNoZWV0Q29sID8gaXNTa2lwU2hlZXRDb2woc2hlZXQsIGNvbEtleSkgOiBmYWxzZSkpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhzaGVldCwgY29sS2V5LCBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbEtleSA9IGdldE5leHRDb2xLZXkoY29sQ2hhckNvZGVzKTtcbiAgICAgICAgICAgIGN1ckNvbENvZGVTdW0gPSBnZXRDaGFyQ29kZVN1bShjb2xLZXkpO1xuICAgICAgICAgICAgaWYgKG1heENvbEtleUNvZGVTdW0gPj0gY3VyQ29sQ29kZVN1bSkge1xuICAgICAgICAgICAgICAgIGhhc05leHRDb2wgPSBpc1NoZWV0Q29sRW5kID8gIWlzU2hlZXRDb2xFbmQoc2hlZXQsIGNvbEtleSkgOiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoYXNOZXh0Q29sID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICog5qiq5ZCR6YGN5Y6G6KGo5qC8XG4gKiBAcGFyYW0gc2hlZXQgeGxzeOihqOagvOWvueixoVxuICogQHBhcmFtIHN0YXJ0Um93IOW8gOWni+ihjCDku44x5byA5aeLXG4gKiBAcGFyYW0gc3RhcnRDb2wg5YiX5a2X56ymIOavlOWmgkEgQlxuICogQHBhcmFtIGNhbGxiYWNrIOmBjeWOhuWbnuiwgyAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB2b2lkXG4gKiBAcGFyYW0gaXNTaGVldFJvd0VuZCDmmK/lkKbooYznu5PmnZ/liKTmlq3mlrnms5VcbiAqIEBwYXJhbSBpc1NoZWV0Q29sRW5kIOaYr+WQpuWIl+e7k+adn+WIpOaWreaWueazlVxuICogQHBhcmFtIGlzU2tpcFNoZWV0Um93IOaYr+WQpui3s+i/h+ihjFxuICogQHBhcmFtIGlzU2tpcFNoZWV0Q29sIOaYr+WQpui3s+i/h+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gaG9yaXpvbnRhbEZvckVhY2hTaGVldChcbiAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICBzdGFydFJvdzogbnVtYmVyLFxuICAgIHN0YXJ0Q29sOiBzdHJpbmcsXG4gICAgY2FsbGJhY2s6IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHZvaWQsXG4gICAgaXNTaGVldFJvd0VuZD86IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbixcbiAgICBpc1NoZWV0Q29sRW5kPzogKHNoZWV0OiB4bHN4LlNoZWV0LCBjb2xrZXk6IHN0cmluZykgPT4gYm9vbGVhbixcbiAgICBpc1NraXBTaGVldFJvdz86IChzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbixcbiAgICBpc1NraXBTaGVldENvbD86IChzaGVldDogeGxzeC5TaGVldCwgY29sS2V5OiBzdHJpbmcpID0+IGJvb2xlYW5cbikge1xuICAgIGNvbnN0IHNoZWV0UmVmOiBzdHJpbmcgPSBzaGVldFtcIiFyZWZcIl07XG4gICAgY29uc3QgbWF4Um93TnVtID0gcGFyc2VJbnQoc2hlZXRSZWYubWF0Y2goL1xcZCskLylbMF0pO1xuXG4gICAgY29uc3QgbWF4Q29sS2V5ID0gc2hlZXRSZWYuc3BsaXQoXCI6XCIpWzFdLm1hdGNoKC9eW0EtWmEtel0rLylbMF07XG4gICAgY29uc3QgbWF4Q29sS2V5Q29kZVN1bSA9IGdldENoYXJDb2RlU3VtKG1heENvbEtleSk7XG4gICAgbGV0IGNvbENoYXJDb2RlczogbnVtYmVyW107XG4gICAgbGV0IGNvbEtleTogc3RyaW5nO1xuICAgIGNvbENoYXJDb2RlcyA9IHN0cmluZ1RvQ2hhckNvZGVzKHN0YXJ0Q29sKTtcbiAgICBsZXQgY3VyQ29sQ29kZVN1bTogbnVtYmVyID0gMDtcbiAgICBjb2xLZXkgPSBzdGFydENvbDtcbiAgICBsZXQgaGFzTmV4dENvbCA9IGlzU2hlZXRDb2xFbmQgPyAhaXNTaGVldENvbEVuZChzaGVldCwgY29sS2V5KSA6IHRydWU7XG4gICAgd2hpbGUgKGhhc05leHRDb2wpIHtcbiAgICAgICAgaWYgKCEoaXNTa2lwU2hlZXRDb2wgPyBpc1NraXBTaGVldENvbChzaGVldCwgY29sS2V5KSA6IGZhbHNlKSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0Um93OyBpIDw9IG1heFJvd051bTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzU2hlZXRSb3dFbmQgPyBpc1NoZWV0Um93RW5kKHNoZWV0LCBpKSA6IGZhbHNlKSBicmVhaztcbiAgICAgICAgICAgICAgICBpZiAoaXNTa2lwU2hlZXRSb3cgPyBpc1NraXBTaGVldFJvdyhzaGVldCwgaSkgOiBmYWxzZSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soc2hlZXQsIGNvbEtleSwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb2xLZXkgPSBnZXROZXh0Q29sS2V5KGNvbENoYXJDb2Rlcyk7XG4gICAgICAgIGN1ckNvbENvZGVTdW0gPSBnZXRDaGFyQ29kZVN1bShjb2xLZXkpO1xuICAgICAgICBpZiAobWF4Q29sS2V5Q29kZVN1bSA+PSBjdXJDb2xDb2RlU3VtKSB7XG4gICAgICAgICAgICBoYXNOZXh0Q29sID0gaXNTaGVldENvbEVuZCA/ICFpc1NoZWV0Q29sRW5kKHNoZWV0LCBjb2xLZXkpIDogdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhc05leHRDb2wgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiDor7vlj5bphY3nva7ooajmlofku7Yg5ZCM5q2l55qEXG4gKiBAcGFyYW0gZmlsZUluZm9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlYWRUYWJsZUZpbGUoZmlsZUluZm86IElGaWxlSW5mbyk6IHhsc3guV29ya0Jvb2sge1xuICAgIGNvbnN0IHdvcmtCb29rID0geGxzeC5yZWFkRmlsZShmaWxlSW5mby5maWxlUGF0aCwgeyB0eXBlOiBnZXRUYWJsZUZpbGVUeXBlKGZpbGVJbmZvKSB9KTtcbiAgICByZXR1cm4gd29ya0Jvb2s7XG59XG4vKipcbiAqIOivu+WPlumFjee9ruihqOaWh+S7tiDlkIzmraXnmoRcbiAqIOWmguaenGZpbGVEYXRhIHR5cGVvZiA9PT0gc3RyaW5nIHhsc3gucmVhZCDnmoQgdHlwZeaYr3N0cmluZyzlkKbliJnmmK9idWZmZXJcbiAqIEBwYXJhbSBmaWxlSW5mb1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZFRhYmxlRGF0YShmaWxlSW5mbzogSUZpbGVJbmZvKTogeGxzeC5Xb3JrQm9vayB7XG4gICAgLy8gY29uc3Qgd29ya0Jvb2sgPSB4bHN4LnJlYWQoZmlsZUluZm8uZmlsZURhdGEsIHsgdHlwZTogaXNDU1YoZmlsZUluZm8uZmlsZUV4dE5hbWUpID8gXCJzdHJpbmdcIiA6IFwiYnVmZmVyXCIgfSk7XG4gICAgY29uc3Qgd29ya0Jvb2sgPSB4bHN4LnJlYWQoZmlsZUluZm8uZmlsZURhdGEsIHtcbiAgICAgICAgdHlwZTogdHlwZW9mIGZpbGVJbmZvLmZpbGVEYXRhID09PSBcInN0cmluZ1wiID8gXCJzdHJpbmdcIiA6IFwiYnVmZmVyXCJcbiAgICB9KTtcbiAgICByZXR1cm4gd29ya0Jvb2s7XG59XG4vKipcbiAqIOiOt+WPlumFjee9ruaWh+S7tuexu+Wei1xuICogQHBhcmFtIGZpbGVJbmZvXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVGaWxlVHlwZShmaWxlSW5mbzogSUZpbGVJbmZvKSB7XG4gICAgcmV0dXJuIGlzQ1NWKGZpbGVJbmZvLmZpbGVFeHROYW1lKSA/IFwic3RyaW5nXCIgOiBcImZpbGVcIjtcbn1cbi8qKlxuICog5qC55o2u5paH5Lu25ZCN5ZCO57yA5Yik5pat5piv5ZCm5Li6Y3N25paH5Lu2XG4gKiBAcGFyYW0gZmlsZUV4dE5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ1NWKGZpbGVFeHROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmlsZUV4dE5hbWUgPT09IFwiLmNzdlwiO1xufVxuIiwiaW1wb3J0ICogYXMgeGxzeCBmcm9tIFwieGxzeFwiO1xuaW1wb3J0IHsgdmFsdWVUcmFuc0Z1bmNNYXAgfSBmcm9tIFwiLi9kZWZhdWx0LXZhbHVlLWZ1bmMtbWFwXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dlclwiO1xuaW1wb3J0IHtcbiAgICBob3Jpem9udGFsRm9yRWFjaFNoZWV0LFxuICAgIGlzQ1NWLFxuICAgIGlzRW1wdHlDZWxsLFxuICAgIHJlYWRUYWJsZURhdGEsXG4gICAgcmVhZFRhYmxlRmlsZSxcbiAgICB2ZXJ0aWNhbEZvckVhY2hTaGVldFxufSBmcm9tIFwiLi90YWJsZS11dGlsc1wiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElUYWJsZUZpZWxkIHtcbiAgICAgICAgLyoq6YWN572u6KGo5Lit5rOo6YeK5YC8ICovXG4gICAgICAgIHRleHQ6IHN0cmluZztcbiAgICAgICAgLyoq6YWN572u6KGo5Lit57G75Z6L5YC8ICovXG4gICAgICAgIG9yaWdpblR5cGU6IHN0cmluZztcbiAgICAgICAgLyoq6YWN572u6KGo5Lit5a2X5q615ZCN5YC8ICovXG4gICAgICAgIG9yaWdpbkZpZWxkTmFtZTogc3RyaW5nO1xuICAgICAgICAvKirop6PmnpDlkI7nmoTnsbvlnovlgLwgKi9cbiAgICAgICAgdHlwZT86IHN0cmluZztcbiAgICAgICAgLyoq6Kej5p6Q5ZCO55qE5a2X5q615ZCN5YC8ICovXG4gICAgICAgIGZpZWxkTmFtZT86IHN0cmluZztcbiAgICAgICAgLyoq5a+56LGh55qE5a2Q5a2X5q615ZCNICovXG4gICAgICAgIHN1YkZpZWxkTmFtZT86IHN0cmluZztcbiAgICAgICAgLyoq5aSa5YiX5a+56LGhICovXG4gICAgICAgIGlzTXV0aUNvbE9iaj86IGJvb2xlYW47XG4gICAgfVxuICAgIGludGVyZmFjZSBJVGFibGVEZWZpbmUge1xuICAgICAgICAvKirphY3nva7ooajlkI0gKi9cbiAgICAgICAgdGFibGVOYW1lOiBzdHJpbmc7XG4gICAgICAgIC8qKumFjee9ruihqOexu+WeiyDpu5jorqTkuKTnp406IHZlcnRpY2FsIOWSjCBob3Jpem9udGFsKi9cbiAgICAgICAgdGFibGVUeXBlOiBzdHJpbmc7XG5cbiAgICAgICAgLyoq5byA5aeL6KGM5LuOMeW8gOWniyAqL1xuICAgICAgICBzdGFydFJvdzogbnVtYmVyO1xuICAgICAgICAvKirlvIDlp4vliJfku45B5byA5aeLICovXG4gICAgICAgIHN0YXJ0Q29sOiBzdHJpbmc7XG4gICAgICAgIC8qKuWeguebtOino+aekOWtl+auteWumuS5iSAqL1xuICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lOiBJVmVydGljYWxGaWVsZERlZmluZTtcbiAgICAgICAgLyoq5qiq5ZCR6Kej5p6Q5a2X5q615a6a5LmJICovXG4gICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZTogSUhvcml6b250YWxGaWVsZERlZmluZTtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElIb3Jpem9udGFsRmllbGREZWZpbmUge1xuICAgICAgICAvKirnsbvlnovooYwgKi9cbiAgICAgICAgdHlwZUNvbDogc3RyaW5nO1xuICAgICAgICAvKirlrZfmrrXlkI3ooYwgKi9cbiAgICAgICAgZmllbGRDb2w6IHN0cmluZztcbiAgICAgICAgLyoq5rOo6YeK6KGMICovXG4gICAgICAgIHRleHRDb2w6IHN0cmluZztcbiAgICB9XG4gICAgaW50ZXJmYWNlIElWZXJ0aWNhbEZpZWxkRGVmaW5lIHtcbiAgICAgICAgLyoq57G75Z6L6KGMICovXG4gICAgICAgIHR5cGVSb3c6IG51bWJlcjtcbiAgICAgICAgLyoq5a2X5q615ZCN6KGMICovXG4gICAgICAgIGZpZWxkUm93OiBudW1iZXI7XG4gICAgICAgIC8qKuazqOmHiuihjCAqL1xuICAgICAgICB0ZXh0Um93OiBudW1iZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWtl+auteWtl+WFuFxuICAgICAqIGtleeaYr+WIl2NvbEtleVxuICAgICAqIHZhbHVl5piv5a2X5q615a+56LGhXG4gICAgICovXG4gICAgdHlwZSBDb2xLZXlUYWJsZUZpZWxkTWFwID0geyBba2V5OiBzdHJpbmddOiBJVGFibGVGaWVsZCB9O1xuXG4gICAgLyoqXG4gICAgICog6KGo5qC855qE5LiA6KGM5oiW6ICF5LiA5YiXXG4gICAgICoga2V55Li65a2X5q615ZCN5YC877yMdmFsdWXkuLrooajmoLznmoTkuIDmoLxcbiAgICAgKi9cbiAgICB0eXBlIFRhYmxlUm93T3JDb2wgPSB7IFtrZXk6IHN0cmluZ106IElUYWJsZUNlbGwgfTtcbiAgICAvKipcbiAgICAgKiDooajmoLznmoTkuIDmoLxcbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSVRhYmxlQ2VsbCB7XG4gICAgICAgIC8qKuWtl+auteWvueixoSAqL1xuICAgICAgICBmaWxlZDogSVRhYmxlRmllbGQ7XG4gICAgICAgIC8qKuWAvCAqL1xuICAgICAgICB2YWx1ZTogYW55O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDooajmoLzooYzmiJbliJfnmoTlrZflhbhcbiAgICAgKiBrZXnkuLrooYzntKLlvJXvvIx2YWx1ZeS4uuihqOagvOeahOS4gOihjFxuICAgICAqL1xuICAgIHR5cGUgVGFibGVSb3dPckNvbE1hcCA9IHsgW2tleTogc3RyaW5nXTogVGFibGVSb3dPckNvbCB9O1xuICAgIC8qKlxuICAgICAqIOihqOagvOihjOaIluWIl+WAvOaVsOe7hFxuICAgICAqIGtleeS4u+mUru+8jHZhbHVl5piv5YC85pWw57uEXG4gICAgICovXG4gICAgdHlwZSBSb3dPckNvbFZhbHVlc01hcCA9IHsgW2tleTogc3RyaW5nXTogYW55W10gfTtcbiAgICBpbnRlcmZhY2UgSVRhYmxlVmFsdWVzIHtcbiAgICAgICAgLyoq5a2X5q615ZCN5pWw57uEICovXG4gICAgICAgIGZpZWxkczogc3RyaW5nW107XG4gICAgICAgIC8qKuihqOagvOWAvOaVsOe7hCAqL1xuICAgICAgICByb3dPckNvbFZhbHVlc01hcDogUm93T3JDb2xWYWx1ZXNNYXA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOino+aekOe7k+aenFxuICAgICAqL1xuICAgIGludGVyZmFjZSBJVGFibGVQYXJzZVJlc3VsdCB7XG4gICAgICAgIC8qKumFjee9ruihqOWumuS5iSAqL1xuICAgICAgICB0YWJsZURlZmluZT86IElUYWJsZURlZmluZTtcbiAgICAgICAgLyoq5b2T5YmN5YiG6KGo5ZCNICovXG4gICAgICAgIGN1clNoZWV0TmFtZT86IHN0cmluZztcbiAgICAgICAgLyoq5a2X5q615a2X5YW4ICovXG4gICAgICAgIGZpbGVkTWFwPzogQ29sS2V5VGFibGVGaWVsZE1hcDtcbiAgICAgICAgLy8gLyoq6KGo5qC86KGM5oiW5YiX55qE5a2X5YW4ICovXG4gICAgICAgIC8vIHJvd09yQ29sTWFwOiBUYWJsZVJvd09yQ29sTWFwXG4gICAgICAgIC8qKuWNleS4quihqOagvOWvueixoSAqL1xuICAgICAgICAvKiprZXnmmK/kuLvplK7lgLzvvIx2YWx1ZeaYr+S4gOihjOWvueixoSAqL1xuICAgICAgICB0YWJsZU9iaj86IHsgW2tleTogc3RyaW5nXTogYW55IH07XG4gICAgICAgIC8qKuW9k+WJjeihjOaIluWIl+WvueixoSAqL1xuICAgICAgICBjdXJSb3dPckNvbE9iaj86IGFueTtcbiAgICAgICAgLyoq5Li76ZSu5YC8ICovXG4gICAgICAgIG1haW5LZXlGaWVsZE5hbWU/OiBzdHJpbmc7XG4gICAgfVxuXG4gICAgLyoq5YC86L2s5o2i5pa55rOVICovXG4gICAgaW50ZXJmYWNlIElUcmFuc1ZhbHVlUmVzdWx0IHtcbiAgICAgICAgZXJyb3I/OiBhbnk7XG4gICAgICAgIHZhbHVlPzogYW55O1xuICAgIH1cbiAgICB0eXBlIFZhbHVlVHJhbnNGdW5jID0gKGZpZWxkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogYW55KSA9PiBJVHJhbnNWYWx1ZVJlc3VsdDtcbiAgICAvKipcbiAgICAgKiDlgLzovazmjaLmlrnms5XlrZflhbhcbiAgICAgKiBrZXnmmK/nsbvlnotrZXlcbiAgICAgKiB2YWx1ZeaYr+aWueazlVxuICAgICAqL1xuICAgIHR5cGUgVmFsdWVUcmFuc0Z1bmNNYXAgPSB7IFtrZXk6IHN0cmluZ106IFZhbHVlVHJhbnNGdW5jIH07XG59XG5leHBvcnQgZW51bSBUYWJsZVR5cGUge1xuICAgIHZlcnRpY2FsID0gXCJ2ZXJ0aWNhbFwiLFxuICAgIGhvcml6b250YWwgPSBcImhvcml6b250YWxcIlxufVxuXG5leHBvcnQgY2xhc3MgRGVmYXVsdFRhYmxlUGFyc2VyIGltcGxlbWVudHMgSVRhYmxlUGFyc2VyIHtcbiAgICBwcml2YXRlIF92YWx1ZVRyYW5zRnVuY01hcDogVmFsdWVUcmFuc0Z1bmNNYXA7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlVHJhbnNGdW5jTWFwID0gdmFsdWVUcmFuc0Z1bmNNYXA7XG4gICAgfVxuICAgIGdldFRhYmxlRGVmaW5lKGZpbGVJbmZvOiBJRmlsZUluZm8sIHdvcmtCb29rOiB4bHN4LldvcmtCb29rKTogSVRhYmxlRGVmaW5lIHtcbiAgICAgICAgbGV0IGNlbGxLZXk6IHN0cmluZztcbiAgICAgICAgbGV0IGNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdDtcblxuICAgICAgICBjb25zdCBzaGVldE5hbWVzID0gd29ya0Jvb2suU2hlZXROYW1lcztcbiAgICAgICAgbGV0IHNoZWV0OiB4bHN4LlNoZWV0O1xuICAgICAgICBsZXQgZmlyc3RDZWxsVmFsdWU6IHsgdGFibGVOYW1lSW5TaGVldDogc3RyaW5nOyB0YWJsZVR5cGU6IHN0cmluZyB9O1xuICAgICAgICBsZXQgZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3Q7XG5cbiAgICAgICAgY29uc3QgdGFibGVEZWZpbmU6IFBhcnRpYWw8SVRhYmxlRGVmaW5lPiA9IHt9O1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hlZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2hlZXQgPSB3b3JrQm9vay5TaGVldHNbc2hlZXROYW1lc1tpXV07XG4gICAgICAgICAgICBmaXJzdENlbGxPYmogPSBzaGVldFtcIkFcIiArIDFdO1xuICAgICAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChmaXJzdENlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgZmlyc3RDZWxsVmFsdWUgPSB0aGlzLl9nZXRGaXJzdENlbGxWYWx1ZShmaXJzdENlbGxPYmopO1xuICAgICAgICAgICAgICAgIGlmICghdGFibGVEZWZpbmUudGFibGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnRhYmxlTmFtZSA9IGZpcnN0Q2VsbFZhbHVlLnRhYmxlTmFtZUluU2hlZXQ7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9IGZpcnN0Q2VsbFZhbHVlLnRhYmxlVHlwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Q2VsbFZhbHVlICYmIGZpcnN0Q2VsbFZhbHVlLnRhYmxlTmFtZUluU2hlZXQgPT09IHRhYmxlRGVmaW5lLnRhYmxlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0YWJsZURlZmluZS50YWJsZU5hbWUgfHwgIXRhYmxlRGVmaW5lLnRhYmxlVHlwZSkge1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhg6KGo5qC85LiN6KeE6IyDLOi3s+i/h+ino+aekCzot6/lvoQ6JHtmaWxlSW5mby5maWxlUGF0aH1gLCBcIndhcm5cIik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLnZlcnRpY2FsRmllbGREZWZpbmUgPSB7fSBhcyBhbnk7XG4gICAgICAgICAgICBjb25zdCB2ZXJ0aWNhbEZpZWxkRGVmaW5lOiBJVmVydGljYWxGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLnZlcnRpY2FsRmllbGREZWZpbmU7XG4gICAgICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnRleHRSb3cgPSAxO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgICAgIGNlbGxLZXkgPSBcIkFcIiArIGk7XG4gICAgICAgICAgICAgICAgY2VsbE9iaiA9IHNoZWV0W2NlbGxLZXldO1xuICAgICAgICAgICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsT2JqKSB8fCBjZWxsT2JqLnYgPT09IFwiTk9cIiB8fCBjZWxsT2JqLnYgPT09IFwiRU5EXCIgfHwgY2VsbE9iai52ID09PSBcIlNUQVJUXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3cgPSBpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2VsbE9iai52ID09PSBcIkNMSUVOVFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3cgPSBpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2VsbE9iai52ID09PSBcIlRZUEVcIikge1xuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3cgPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGFibGVEZWZpbmUuc3RhcnRSb3cgJiYgdmVydGljYWxGaWVsZERlZmluZS5maWVsZFJvdyAmJiB2ZXJ0aWNhbEZpZWxkRGVmaW5lLnR5cGVSb3cpIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydENvbCA9IFwiQlwiO1xuICAgICAgICB9IGVsc2UgaWYgKHRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcbiAgICAgICAgICAgIHRhYmxlRGVmaW5lLmhvcml6b250YWxGaWVsZERlZmluZSA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgIGNvbnN0IGhvcml6b250YWxGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLmhvcml6b250YWxGaWVsZERlZmluZTtcbiAgICAgICAgICAgIGhvcml6b250YWxGaWVsZERlZmluZS50ZXh0Q29sID0gXCJBXCI7XG4gICAgICAgICAgICBob3Jpem9udGFsRmllbGREZWZpbmUudHlwZUNvbCA9IFwiQlwiO1xuICAgICAgICAgICAgaG9yaXpvbnRhbEZpZWxkRGVmaW5lLmZpZWxkQ29sID0gXCJDXCI7XG4gICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydENvbCA9IFwiRVwiO1xuICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3cgPSAyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhYmxlRGVmaW5lIGFzIGFueTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfZ2V0Rmlyc3RDZWxsVmFsdWUoZmlyc3RDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QpIHtcbiAgICAgICAgaWYgKCFmaXJzdENlbGxPYmopIHJldHVybjtcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlcyA9IChmaXJzdENlbGxPYmoudiBhcyBzdHJpbmcpLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgbGV0IHRhYmxlTmFtZUluU2hlZXQ6IHN0cmluZztcbiAgICAgICAgbGV0IHRhYmxlVHlwZTogc3RyaW5nO1xuICAgICAgICBpZiAoY2VsbFZhbHVlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB0YWJsZU5hbWVJblNoZWV0ID0gY2VsbFZhbHVlc1sxXTtcbiAgICAgICAgICAgIHRhYmxlVHlwZSA9IGNlbGxWYWx1ZXNbMF0gPT09IFwiSFwiID8gVGFibGVUeXBlLmhvcml6b250YWwgOiBUYWJsZVR5cGUudmVydGljYWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YWJsZU5hbWVJblNoZWV0ID0gY2VsbFZhbHVlc1swXTtcbiAgICAgICAgICAgIHRhYmxlVHlwZSA9IFRhYmxlVHlwZS52ZXJ0aWNhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB0YWJsZU5hbWVJblNoZWV0OiB0YWJsZU5hbWVJblNoZWV0LCB0YWJsZVR5cGU6IHRhYmxlVHlwZSB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDliKTmlq3ooajmoLzmmK/lkKbog73op6PmnpBcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKi9cbiAgICBjaGVja1NoZWV0Q2FuUGFyc2UodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIHNoZWV0TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8v5aaC5p6c6L+Z5Liq6KGo5Liq56ys5LiA5qC85YC85LiN562J5LqO6KGo5ZCN77yM5YiZ5LiN6Kej5p6QXG4gICAgICAgIGNvbnN0IGZpcnN0Q2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbXCJBXCIgKyAxXTtcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsVmFsdWUgPSB0aGlzLl9nZXRGaXJzdENlbGxWYWx1ZShmaXJzdENlbGxPYmopO1xuICAgICAgICBpZiAoZmlyc3RDZWxsT2JqICYmIHRhYmxlRGVmaW5lKSB7XG4gICAgICAgICAgICBpZiAoZmlyc3RDZWxsVmFsdWUudGFibGVOYW1lSW5TaGVldCAhPT0gdGFibGVEZWZpbmUudGFibGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6KGo6KGM57uT5p2f5Yik5patXG4gICAgICogQHBhcmFtIHRhYmxlRGVmaW5lXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIHJvd1xuICAgICAqL1xuICAgIGlzU2hlZXRSb3dFbmQodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIHJvdzogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xuXG4gICAgICAgIC8vIH0gZWxzZSBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUuaG9yaXpvbnRhbCkge1xuXG4gICAgICAgIC8vIH1cbiAgICAgICAgLy/liKTmlq3kuIrkuIDooYznmoTmoIflv5fmmK/lkKbkuLpFTkRcbiAgICAgICAgaWYgKHJvdyA+IDEpIHtcbiAgICAgICAgICAgIHJvdyA9IHJvdyAtIDE7XG4gICAgICAgICAgICBjb25zdCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtcIkFcIiArIHJvd107XG4gICAgICAgICAgICByZXR1cm4gY2VsbE9iaiAmJiBjZWxsT2JqLnYgPT09IFwiRU5EXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6KGo5YiX57uT5p2f5Yik5patXG4gICAgICogQHBhcmFtIHRhYmxlRGVmaW5lXG4gICAgICogQHBhcmFtIHNoZWV0XG4gICAgICogQHBhcmFtIGNvbEtleVxuICAgICAqL1xuICAgIGlzU2hlZXRDb2xFbmQodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8v5Yik5pat6L+Z5LiA5YiX56ys5LiA6KGM5piv5ZCm5Li656m6XG4gICAgICAgIGNvbnN0IGZpcnN0Q2VsbE9iajogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbY29sS2V5ICsgMV07XG4gICAgICAgIC8vIGNvbnN0IHR5cGVDZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyB0YWJsZUZpbGUudGFibGVEZWZpbmUudHlwZVJvd107XG4gICAgICAgIHJldHVybiBpc0VtcHR5Q2VsbChmaXJzdENlbGxPYmopO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmo4Dmn6XooYzmmK/lkKbpnIDopoHop6PmnpBcbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmVcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gcm93SW5kZXhcbiAgICAgKi9cbiAgICBjaGVja1Jvd05lZWRQYXJzZSh0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lLCBzaGVldDogeGxzeC5TaGVldCwgcm93SW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtcIkFcIiArIHJvd0luZGV4XTtcbiAgICAgICAgaWYgKGNlbGxPYmogJiYgY2VsbE9iai52ID09PSBcIk5PXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kej5p6Q5Y2V5Liq5qC85a2QXG4gICAgICogQHBhcmFtIHRhYmxlUGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICogQHBhcmFtIHJvd0luZGV4XG4gICAgICogQHBhcmFtIGlzTmV3Um93T3JDb2wg5piv5ZCm5Li65paw55qE5LiA6KGM5oiW6ICF5LiA5YiXXG4gICAgICovXG4gICAgcGFyc2VWZXJ0aWNhbENlbGwoXG4gICAgICAgIHRhYmxlUGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICAgICAgY29sS2V5OiBzdHJpbmcsXG4gICAgICAgIHJvd0luZGV4OiBudW1iZXIsXG4gICAgICAgIGlzTmV3Um93T3JDb2w6IGJvb2xlYW5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmllbGRJbmZvID0gdGhpcy5nZXRWZXJ0aWNhbFRhYmxlRmllbGQodGFibGVQYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgpO1xuICAgICAgICBpZiAoIWZpZWxkSW5mbykgcmV0dXJuO1xuICAgICAgICBjb25zdCBjZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJhbnNSZXN1bHQgPSB0aGlzLnRyYW5zVmFsdWUodGFibGVQYXJzZVJlc3VsdCwgZmllbGRJbmZvLCBjZWxsLnYpO1xuICAgICAgICBpZiAodHJhbnNSZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQuaGFzRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgTG9nZ2VyLmxvZyhcbiAgICAgICAgICAgICAgICBgISEhISEhISEhISEhISEhISEhWy0tLS0t6Kej5p6Q6ZSZ6K+vLS0tLS1dISEhISEhISEhISEhISEhISEhISEhISEhIVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBgW3NoZWV0TmFtZXzliIbooajlkI1dPT4gJHt0YWJsZVBhcnNlUmVzdWx0LmN1clNoZWV0TmFtZX1cXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYFtyb3d86KGMXT0+ICR7cm93SW5kZXh9XFxuYCArXG4gICAgICAgICAgICAgICAgICAgIGBbY29sfOWIl109PiAke2NvbEtleX1cXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYFtmaWVsZHzlrZfmrrVdPT4gJHtmaWVsZEluZm8ub3JpZ2luRmllbGROYW1lfVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBgW3R5cGV857G75Z6LXT0+ICR7ZmllbGRJbmZvLm9yaWdpblR5cGV9XFxuYCArXG4gICAgICAgICAgICAgICAgICAgIGBbZXJyb3J86ZSZ6K+vXT0+ICR7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdHJhbnNSZXN1bHQuZXJyb3IgPT09IFwic3RyaW5nXCIgPyB0cmFuc1Jlc3VsdC5lcnJvciA6IHRyYW5zUmVzdWx0LmVycm9yLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfVxcbmAsXG4gICAgICAgICAgICAgICAgXCJlcnJvclwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgLy8gTG9nZ2VyLmxvZyh0cmFuc1Jlc3VsdC5lcnJvciwgXCJlcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0cmFuc2VkVmFsdWUgPSB0cmFuc1Jlc3VsdC52YWx1ZTtcbiAgICAgICAgbGV0IG1haW5LZXlGaWVsZE5hbWU6IHN0cmluZyA9IHRhYmxlUGFyc2VSZXN1bHQubWFpbktleUZpZWxkTmFtZTtcbiAgICAgICAgaWYgKCFtYWluS2V5RmllbGROYW1lKSB7XG4gICAgICAgICAgICAvL+esrOS4gOS4quWtl+auteWwseaYr+S4u+mUrlxuICAgICAgICAgICAgbWFpbktleUZpZWxkTmFtZSA9IGZpZWxkSW5mby5maWVsZE5hbWU7XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0Lm1haW5LZXlGaWVsZE5hbWUgPSBmaWVsZEluZm8uZmllbGROYW1lO1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9iaiA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGxldCByb3dPckNvbE9iajogYW55ID0gdGFibGVQYXJzZVJlc3VsdC5jdXJSb3dPckNvbE9iajtcbiAgICAgICAgaWYgKGlzTmV3Um93T3JDb2wpIHtcbiAgICAgICAgICAgIC8v5paw55qE5LiA6KGMXG4gICAgICAgICAgICByb3dPckNvbE9iaiA9IHt9O1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC5jdXJSb3dPckNvbE9iaiA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbdHJhbnNlZFZhbHVlXSA9IHJvd09yQ29sT2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkSW5mby5pc011dGlDb2xPYmopIHtcbiAgICAgICAgICAgIGxldCBzdWJPYmogPSByb3dPckNvbE9ialtmaWVsZEluZm8uZmllbGROYW1lXTtcbiAgICAgICAgICAgIGlmICghc3ViT2JqKSB7XG4gICAgICAgICAgICAgICAgc3ViT2JqID0ge307XG4gICAgICAgICAgICAgICAgcm93T3JDb2xPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSBzdWJPYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJPYmpbZmllbGRJbmZvLnN1YkZpZWxkTmFtZV0gPSB0cmFuc2VkVmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb3dPckNvbE9ialtmaWVsZEluZm8uZmllbGROYW1lXSA9IHRyYW5zZWRWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6PmnpDmqKrlkJHljZXkuKrmoLzlrZBcbiAgICAgKiBAcGFyYW0gdGFibGVQYXJzZVJlc3VsdFxuICAgICAqIEBwYXJhbSBzaGVldFxuICAgICAqIEBwYXJhbSBjb2xLZXlcbiAgICAgKiBAcGFyYW0gcm93SW5kZXhcbiAgICAgKiBAcGFyYW0gaXNOZXdSb3dPckNvbCDmmK/lkKbkuLrmlrDnmoTkuIDooYzmiJbogIXkuIDliJdcbiAgICAgKi9cbiAgICBwYXJzZUhvcml6b250YWxDZWxsKFxuICAgICAgICB0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgICAgIGNvbEtleTogc3RyaW5nLFxuICAgICAgICByb3dJbmRleDogbnVtYmVyLFxuICAgICAgICBpc05ld1Jvd09yQ29sOiBib29sZWFuXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpZWxkSW5mbyA9IHRoaXMuZ2V0SG9yaXpvbnRhbFRhYmxlRmllbGQodGFibGVQYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgpO1xuICAgICAgICBpZiAoIWZpZWxkSW5mbykgcmV0dXJuO1xuICAgICAgICBjb25zdCBjZWxsOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyYW5zUmVzdWx0ID0gdGhpcy50cmFuc1ZhbHVlKHRhYmxlUGFyc2VSZXN1bHQsIGZpZWxkSW5mbywgY2VsbC52KTtcbiAgICAgICAgaWYgKHRyYW5zUmVzdWx0LmVycm9yKSB7XG4gICAgICAgICAgICBMb2dnZXIubG9nKFxuICAgICAgICAgICAgICAgIGAhISEhISEhISEhISEhISEhISFbLS0tLS1QYXJzZUVycm9yfOino+aekOmUmeivry0tLS0tXSEhISEhISEhISEhISEhISEhISEhISEhISFcXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYFtzaGVldE5hbWV85YiG6KGo5ZCNXT0+ICR7dGFibGVQYXJzZVJlc3VsdC5jdXJTaGVldE5hbWV9XFxuYCArXG4gICAgICAgICAgICAgICAgICAgIGBbcm93fOihjF09PiAke3Jvd0luZGV4fVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBgW2NvbHzliJddPT4gJHtjb2xLZXl9XFxuYCArXG4gICAgICAgICAgICAgICAgICAgIGBbZmllbGR85a2X5q61XT0+ICR7ZmllbGRJbmZvLm9yaWdpbkZpZWxkTmFtZX1cXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYFt0eXBlfOexu+Wei109PiAke2ZpZWxkSW5mby5vcmlnaW5UeXBlfVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBgW2Vycm9yfOmUmeivr109PiAke1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHRyYW5zUmVzdWx0LmVycm9yID09PSBcInN0cmluZ1wiID8gdHJhbnNSZXN1bHQuZXJyb3IgOiB0cmFuc1Jlc3VsdC5lcnJvci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIH1cXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYCEhISEhISEhISEhISEhISEhIVstLS0tLVBhcnNlRXJyb3J86Kej5p6Q6ZSZ6K+vLS0tLS1dISEhISEhISEhISEhISEhISEhISEhISEhIVxcbmAsXG5cbiAgICAgICAgICAgICAgICBcImVycm9yXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJhbnNlZFZhbHVlID0gdHJhbnNSZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICghdGFibGVQYXJzZVJlc3VsdC50YWJsZU9iaikge1xuICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9iaiA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWVsZEluZm8uaXNNdXRpQ29sT2JqKSB7XG4gICAgICAgICAgICBsZXQgc3ViT2JqID0gdGFibGVQYXJzZVJlc3VsdC50YWJsZU9ialtmaWVsZEluZm8uZmllbGROYW1lXTtcbiAgICAgICAgICAgIGlmICghc3ViT2JqKSB7XG4gICAgICAgICAgICAgICAgc3ViT2JqID0ge307XG4gICAgICAgICAgICAgICAgdGFibGVQYXJzZVJlc3VsdC50YWJsZU9ialtmaWVsZEluZm8uZmllbGROYW1lXSA9IHN1Yk9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1Yk9ialtmaWVsZEluZm8uc3ViRmllbGROYW1lXSA9IHRyYW5zZWRWYWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQudGFibGVPYmpbZmllbGRJbmZvLmZpZWxkTmFtZV0gPSB0cmFuc2VkVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kej5p6Q5Ye65a2X5q615a+56LGhXG4gICAgICogQHBhcmFtIHRhYmxlUGFyc2VSZXN1bHRcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICogQHBhcmFtIHJvd0luZGV4XG4gICAgICovXG4gICAgZ2V0VmVydGljYWxUYWJsZUZpZWxkKFxuICAgICAgICB0YWJsZVBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgc2hlZXQ6IHhsc3guU2hlZXQsXG4gICAgICAgIGNvbEtleTogc3RyaW5nLFxuICAgICAgICByb3dJbmRleDogbnVtYmVyXG4gICAgKTogSVRhYmxlRmllbGQge1xuICAgICAgICBjb25zdCB0YWJsZURlZmluZSA9IHRhYmxlUGFyc2VSZXN1bHQudGFibGVEZWZpbmU7XG4gICAgICAgIGxldCB0YWJsZUZpbGVkTWFwID0gdGFibGVQYXJzZVJlc3VsdC5maWxlZE1hcDtcbiAgICAgICAgaWYgKCF0YWJsZUZpbGVkTWFwKSB7XG4gICAgICAgICAgICB0YWJsZUZpbGVkTWFwID0ge307XG4gICAgICAgICAgICB0YWJsZVBhcnNlUmVzdWx0LmZpbGVkTWFwID0gdGFibGVGaWxlZE1hcDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2ZXJ0aWNhbEZpZWxkRGVmaW5lID0gdGFibGVEZWZpbmUudmVydGljYWxGaWVsZERlZmluZTtcbiAgICAgICAgY29uc3QgZmlsZWRDZWxsID0gc2hlZXRbY29sS2V5ICsgdmVydGljYWxGaWVsZERlZmluZS5maWVsZFJvd107XG4gICAgICAgIGxldCBvcmlnaW5GaWVsZE5hbWU6IHN0cmluZztcbiAgICAgICAgaWYgKCFpc0VtcHR5Q2VsbChmaWxlZENlbGwpKSB7XG4gICAgICAgICAgICBvcmlnaW5GaWVsZE5hbWUgPSBmaWxlZENlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvcmlnaW5GaWVsZE5hbWUpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgZmllbGQ6IElUYWJsZUZpZWxkID0ge30gYXMgYW55O1xuICAgICAgICAvL+e8k+WtmFxuICAgICAgICBpZiAodGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgLy/ms6jph4pcbiAgICAgICAgY29uc3QgdGV4dENlbGw6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUudGV4dFJvd107XG4gICAgICAgIGlmICghaXNFbXB0eUNlbGwodGV4dENlbGwpKSB7XG4gICAgICAgICAgICBmaWVsZC50ZXh0ID0gdGV4dENlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgLy/nsbvlnotcbiAgICAgICAgbGV0IGlzT2JqVHlwZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBjb25zdCB0eXBlQ2VsbCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUudHlwZVJvd107XG5cbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKHR5cGVDZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZC5vcmlnaW5UeXBlID0gdHlwZUNlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgICAgICBpZiAoZmllbGQub3JpZ2luVHlwZS5pbmNsdWRlcyhcIm1mOlwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVTdHJzID0gZmllbGQub3JpZ2luVHlwZS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVTdHJzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpZWxkLnR5cGUgPSB0eXBlU3Ryc1syXTtcbiAgICAgICAgICAgICAgICBpc09ialR5cGUgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gZmllbGQub3JpZ2luVHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWVsZC5pc011dGlDb2xPYmogPSBpc09ialR5cGU7XG4gICAgICAgIC8v5a2X5q615ZCNXG4gICAgICAgIGZpZWxkLm9yaWdpbkZpZWxkTmFtZSA9IG9yaWdpbkZpZWxkTmFtZTtcbiAgICAgICAgaWYgKGlzT2JqVHlwZSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTdHJzID0gZmllbGQub3JpZ2luRmllbGROYW1lLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgIGlmIChmaWVsZFN0cnMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmllbGQuZmllbGROYW1lID0gZmllbGRTdHJzWzBdO1xuICAgICAgICAgICAgZmllbGQuc3ViRmllbGROYW1lID0gZmllbGRTdHJzWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmllbGQuZmllbGROYW1lID0gZmllbGQub3JpZ2luRmllbGROYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFibGVGaWxlZE1hcFtjb2xLZXldID0gZmllbGQ7XG4gICAgICAgIHJldHVybiBmaWVsZDtcbiAgICB9XG4gICAgZ2V0SG9yaXpvbnRhbFRhYmxlRmllbGQoXG4gICAgICAgIHRhYmxlUGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBzaGVldDogeGxzeC5TaGVldCxcbiAgICAgICAgY29sS2V5OiBzdHJpbmcsXG4gICAgICAgIHJvd0luZGV4OiBudW1iZXJcbiAgICApOiBJVGFibGVGaWVsZCB7XG4gICAgICAgIGNvbnN0IHRhYmxlRGVmaW5lID0gdGFibGVQYXJzZVJlc3VsdC50YWJsZURlZmluZTtcbiAgICAgICAgbGV0IHRhYmxlRmlsZWRNYXAgPSB0YWJsZVBhcnNlUmVzdWx0LmZpbGVkTWFwO1xuICAgICAgICBpZiAoIXRhYmxlRmlsZWRNYXApIHtcbiAgICAgICAgICAgIHRhYmxlRmlsZWRNYXAgPSB7fTtcbiAgICAgICAgICAgIHRhYmxlUGFyc2VSZXN1bHQuZmlsZWRNYXAgPSB0YWJsZUZpbGVkTWFwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhGaWVsZERlZmluZSA9IHRhYmxlRGVmaW5lLmhvcml6b250YWxGaWVsZERlZmluZTtcbiAgICAgICAgY29uc3QgZmllbGROYW1lQ2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbaEZpZWxkRGVmaW5lLmZpZWxkQ29sICsgcm93SW5kZXhdO1xuICAgICAgICBsZXQgb3JpZ2luRmllbGROYW1lOiBzdHJpbmc7XG4gICAgICAgIGlmICghaXNFbXB0eUNlbGwoZmllbGROYW1lQ2VsbCkpIHtcbiAgICAgICAgICAgIG9yaWdpbkZpZWxkTmFtZSA9IGZpZWxkTmFtZUNlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvcmlnaW5GaWVsZE5hbWUpIHJldHVybiBudWxsO1xuICAgICAgICBpZiAodGFibGVGaWxlZE1hcFtvcmlnaW5GaWVsZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpZWxkOiBJVGFibGVGaWVsZCA9IHt9IGFzIGFueTtcblxuICAgICAgICBjb25zdCB0ZXh0Q2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbaEZpZWxkRGVmaW5lLnRleHRDb2wgKyByb3dJbmRleF07XG4gICAgICAgIC8v5rOo6YeKXG4gICAgICAgIGlmICghaXNFbXB0eUNlbGwodGV4dENlbGwpKSB7XG4gICAgICAgICAgICBmaWVsZC50ZXh0ID0gdGV4dENlbGwudiBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGlzT2JqVHlwZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAvL+exu+Wei1xuICAgICAgICBjb25zdCB0eXBlQ2VsbDogeGxzeC5DZWxsT2JqZWN0ID0gc2hlZXRbaEZpZWxkRGVmaW5lLnR5cGVDb2wgKyByb3dJbmRleF07XG5cbiAgICAgICAgaWYgKGlzRW1wdHlDZWxsKHR5cGVDZWxsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL+WkhOeQhuexu+Wei1xuICAgICAgICAgICAgZmllbGQub3JpZ2luVHlwZSA9IHR5cGVDZWxsLnYgYXMgc3RyaW5nO1xuICAgICAgICAgICAgaWYgKGZpZWxkLm9yaWdpblR5cGUuaW5jbHVkZXMoXCJtZjpcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlU3RycyA9IGZpZWxkLm9yaWdpblR5cGUuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlU3Rycy5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaWVsZC50eXBlID0gdHlwZVN0cnNbMl07XG4gICAgICAgICAgICAgICAgaXNPYmpUeXBlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmllbGQudHlwZSA9IGZpZWxkLm9yaWdpblR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmllbGQuaXNNdXRpQ29sT2JqID0gaXNPYmpUeXBlO1xuICAgICAgICBmaWVsZC5vcmlnaW5GaWVsZE5hbWUgPSBvcmlnaW5GaWVsZE5hbWU7XG4gICAgICAgIGlmIChpc09ialR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkU3RycyA9IGZpZWxkLm9yaWdpbkZpZWxkTmFtZS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICBpZiAoZmllbGRTdHJzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkU3Ryc1swXTtcbiAgICAgICAgICAgIGZpZWxkLnN1YkZpZWxkTmFtZSA9IGZpZWxkU3Ryc1sxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZWxkLmZpZWxkTmFtZSA9IGZpZWxkLm9yaWdpbkZpZWxkTmFtZTtcbiAgICAgICAgfVxuICAgICAgICB0YWJsZUZpbGVkTWFwW29yaWdpbkZpZWxkTmFtZV0gPSBmaWVsZDtcbiAgICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmo4Dmn6XliJfmmK/lkKbpnIDopoHop6PmnpBcbiAgICAgKiBAcGFyYW0gdGFibGVEZWZpbmVcbiAgICAgKiBAcGFyYW0gc2hlZXRcbiAgICAgKiBAcGFyYW0gY29sS2V5XG4gICAgICovXG4gICAgY2hlY2tDb2xOZWVkUGFyc2UodGFibGVEZWZpbmU6IElUYWJsZURlZmluZSwgc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIOWmguaenOexu+Wei+aIluiAheWImeS4jemcgOimgeino+aekFxuICAgICAgICBpZiAodGFibGVEZWZpbmUudGFibGVUeXBlID09PSBUYWJsZVR5cGUudmVydGljYWwpIHtcbiAgICAgICAgICAgIGNvbnN0IHZlcnRpY2FsRmllbGREZWZpbmUgPSB0YWJsZURlZmluZS52ZXJ0aWNhbEZpZWxkRGVmaW5lO1xuICAgICAgICAgICAgY29uc3QgdHlwZUNlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUudHlwZVJvd107XG4gICAgICAgICAgICBjb25zdCBmaWVsZENlbGxPYmo6IHhsc3guQ2VsbE9iamVjdCA9IHNoZWV0W2NvbEtleSArIHZlcnRpY2FsRmllbGREZWZpbmUuZmllbGRSb3ddO1xuICAgICAgICAgICAgaWYgKGlzRW1wdHlDZWxsKHR5cGVDZWxsT2JqKSB8fCBpc0VtcHR5Q2VsbChmaWVsZENlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICBjb25zdCBjZWxsT2JqOiB4bHN4LkNlbGxPYmplY3QgPSBzaGVldFtjb2xLZXkgKyAxXTtcbiAgICAgICAgICAgIGlmIChpc0VtcHR5Q2VsbChjZWxsT2JqKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6L2s5o2i6KGo5qC855qE5YC8XG4gICAgICogQHBhcmFtIHBhcnNlUmVzdWx0XG4gICAgICogQHBhcmFtIGZpbGVkSXRlbVxuICAgICAqIEBwYXJhbSBjZWxsVmFsdWVcbiAgICAgKi9cbiAgICBwdWJsaWMgdHJhbnNWYWx1ZShwYXJzZVJlc3VsdDogSVRhYmxlUGFyc2VSZXN1bHQsIGZpbGVkSXRlbTogSVRhYmxlRmllbGQsIGNlbGxWYWx1ZTogYW55KTogSVRyYW5zVmFsdWVSZXN1bHQge1xuICAgICAgICBsZXQgdHJhbnNSZXN1bHQ6IElUcmFuc1ZhbHVlUmVzdWx0O1xuXG4gICAgICAgIGxldCB0cmFuc0Z1bmMgPSB0aGlzLl92YWx1ZVRyYW5zRnVuY01hcFtmaWxlZEl0ZW0udHlwZV07XG4gICAgICAgIGlmICghdHJhbnNGdW5jKSB7XG4gICAgICAgICAgICB0cmFuc0Z1bmMgPSB0aGlzLl92YWx1ZVRyYW5zRnVuY01hcFtcImpzb25cIl07XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNSZXN1bHQgPSB0cmFuc0Z1bmMoZmlsZWRJdGVtLCBjZWxsVmFsdWUpO1xuICAgICAgICByZXR1cm4gdHJhbnNSZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6Kej5p6Q6YWN572u6KGo5paH5Lu2XG4gICAgICogQHBhcmFtIHBhcnNlQ29uZmlnIOino+aekOmFjee9rlxuICAgICAqIEBwYXJhbSBmaWxlSW5mbyDmlofku7bkv6Hmga9cbiAgICAgKiBAcGFyYW0gcGFyc2VSZXN1bHQg6Kej5p6Q57uT5p6cXG4gICAgICovXG4gICAgcHVibGljIHBhcnNlVGFibGVGaWxlKFxuICAgICAgICBwYXJzZUNvbmZpZzogSVRhYmxlQ29udmVydENvbmZpZyxcbiAgICAgICAgZmlsZUluZm86IElGaWxlSW5mbyxcbiAgICAgICAgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0XG4gICAgKTogSVRhYmxlUGFyc2VSZXN1bHQge1xuICAgICAgICBmaWxlSW5mby5maWxlRGF0YSA9IGlzQ1NWKGZpbGVJbmZvLmZpbGVFeHROYW1lKSA/IChmaWxlSW5mby5maWxlRGF0YSBhcyBCdWZmZXIpLnRvU3RyaW5nKCkgOiBmaWxlSW5mby5maWxlRGF0YTtcbiAgICAgICAgY29uc3Qgd29ya2Jvb2sgPSByZWFkVGFibGVEYXRhKGZpbGVJbmZvKTtcbiAgICAgICAgaWYgKCF3b3JrYm9vay5TaGVldE5hbWVzLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNoZWV0TmFtZXMgPSB3b3JrYm9vay5TaGVldE5hbWVzO1xuICAgICAgICBjb25zdCB0YWJsZURlZmluZTogSVRhYmxlRGVmaW5lID0gdGhpcy5nZXRUYWJsZURlZmluZShmaWxlSW5mbywgd29ya2Jvb2spO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoZWV0TmFtZXMubGVuZ3RoOyBpKyspIHt9XG4gICAgICAgIGlmICghdGFibGVEZWZpbmUpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgc2hlZXROYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBzaGVldDogeGxzeC5TaGVldDtcbiAgICAgICAgY29uc3QgaXNTaGVldFJvd0VuZCA9IHRoaXMuaXNTaGVldFJvd0VuZC5iaW5kKG51bGwsIHRhYmxlRGVmaW5lKTtcbiAgICAgICAgY29uc3QgaXNTaGVldENvbEVuZCA9IHRoaXMuaXNTaGVldENvbEVuZC5iaW5kKG51bGwsIHRhYmxlRGVmaW5lKTtcbiAgICAgICAgY29uc3QgaXNTa2lwU2hlZXRSb3cgPSAoc2hlZXQ6IHhsc3guU2hlZXQsIHJvd0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5jaGVja1Jvd05lZWRQYXJzZSh0YWJsZURlZmluZSwgc2hlZXQsIHJvd0luZGV4KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaXNTa2lwU2hlZXRDb2wgPSAoc2hlZXQ6IHhsc3guU2hlZXQsIGNvbEtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRoaXMuY2hlY2tDb2xOZWVkUGFyc2UodGFibGVEZWZpbmUsIHNoZWV0LCBjb2xLZXkpO1xuICAgICAgICB9O1xuICAgICAgICBsZXQgY2VsbE9iajogeGxzeC5DZWxsT2JqZWN0O1xuICAgICAgICBwYXJzZVJlc3VsdC50YWJsZURlZmluZSA9IHRhYmxlRGVmaW5lO1xuICAgICAgICBMb2dnZXIubG9nKGBbcGFyc2VUYWJsZXzop6PmnpDmlofku7ZdPT4gJHtmaWxlSW5mby5maWxlUGF0aH1gKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGVldE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzaGVldE5hbWUgPSBzaGVldE5hbWVzW2ldO1xuICAgICAgICAgICAgc2hlZXQgPSB3b3JrYm9vay5TaGVldHNbc2hlZXROYW1lXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5jaGVja1NoZWV0Q2FuUGFyc2UodGFibGVEZWZpbmUsIHNoZWV0LCBzaGVldE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJzZVJlc3VsdC5jdXJTaGVldE5hbWUgPSBzaGVldE5hbWU7XG4gICAgICAgICAgICBMb2dnZXIubG9nKGB8PVtwYXJzZVNoZWV0fOino+aekOWIhuihqF09PiAke3NoZWV0TmFtZX1gKTtcbiAgICAgICAgICAgIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS52ZXJ0aWNhbCkge1xuICAgICAgICAgICAgICAgIGxldCBsYXN0Um93SW5kZXg6IG51bWJlcjtcblxuICAgICAgICAgICAgICAgIHZlcnRpY2FsRm9yRWFjaFNoZWV0KFxuICAgICAgICAgICAgICAgICAgICBzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRSb3csXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5lLnN0YXJ0Q29sLFxuICAgICAgICAgICAgICAgICAgICAoc2hlZXQsIGNvbEtleTogc3RyaW5nLCByb3dJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNOZXdSb3dPckNvbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RSb3dJbmRleCAhPT0gcm93SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Um93SW5kZXggPSByb3dJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05ld1Jvd09yQ29sID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxPYmogPSBzaGVldFtjb2xLZXkgKyByb3dJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRW1wdHlDZWxsKGNlbGxPYmopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJzZVZlcnRpY2FsQ2VsbChwYXJzZVJlc3VsdCwgc2hlZXQsIGNvbEtleSwgcm93SW5kZXgsIGlzTmV3Um93T3JDb2wpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBpc1NoZWV0Um93RW5kLFxuICAgICAgICAgICAgICAgICAgICBpc1NoZWV0Q29sRW5kLFxuICAgICAgICAgICAgICAgICAgICBpc1NraXBTaGVldFJvdyxcbiAgICAgICAgICAgICAgICAgICAgaXNTa2lwU2hlZXRDb2xcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0YWJsZURlZmluZS50YWJsZVR5cGUgPT09IFRhYmxlVHlwZS5ob3Jpem9udGFsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGxhc3RDb2xLZXk6IHN0cmluZztcblxuICAgICAgICAgICAgICAgIGhvcml6b250YWxGb3JFYWNoU2hlZXQoXG4gICAgICAgICAgICAgICAgICAgIHNoZWV0LFxuICAgICAgICAgICAgICAgICAgICB0YWJsZURlZmluZS5zdGFydFJvdyxcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEZWZpbmUuc3RhcnRDb2wsXG4gICAgICAgICAgICAgICAgICAgIChzaGVldCwgY29sS2V5OiBzdHJpbmcsIHJvd0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc05ld1Jvd09yQ29sID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFzdENvbEtleSAhPT0gY29sS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbEtleSA9IGNvbEtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05ld1Jvd09yQ29sID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY2VsbE9iaiA9IHNoZWV0W2NvbEtleSArIHJvd0luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNFbXB0eUNlbGwoY2VsbE9iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnNlSG9yaXpvbnRhbENlbGwocGFyc2VSZXN1bHQsIHNoZWV0LCBjb2xLZXksIHJvd0luZGV4LCBpc05ld1Jvd09yQ29sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldFJvd0VuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGVldENvbEVuZCxcbiAgICAgICAgICAgICAgICAgICAgaXNTa2lwU2hlZXRSb3csXG4gICAgICAgICAgICAgICAgICAgIGlzU2tpcFNoZWV0Q29sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZVJlc3VsdCBhcyBhbnk7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgVGFibGVUeXBlIH0gZnJvbSBcIi4vZGVmYXVsdC10YWJsZS1wYXJzZXJcIjtcbmltcG9ydCB7IGRlZmxhdGVTeW5jIH0gZnJvbSBcInpsaWJcIjtcbmltcG9ydCB7IG9zRW9sIH0gZnJvbSBcIi4vZ2V0LW9zLWVvbFwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZXJcIjtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICAvKipcbiAgICAgKiDovpPlh7rphY3nva5cbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSU91dHB1dENvbmZpZyB7XG4gICAgICAgIC8qKuWNleS4qumFjee9ruihqGpzb27ovpPlh7rnm67lvZXot6/lvoQgKi9cbiAgICAgICAgY2xpZW50U2luZ2xlVGFibGVKc29uRGlyPzogc3RyaW5nO1xuICAgICAgICAvKirlkIjlubbphY3nva7ooahqc29u5paH5Lu26Lev5b6EKOWMheWQq+aWh+S7tuWQjSzmr5TlpoIgLi9vdXQvYnVuZGxlLmpzb24pICovXG4gICAgICAgIGNsaWVudEJ1bmRsZUpzb25PdXRQYXRoPzogc3RyaW5nO1xuICAgICAgICAvKirmmK/lkKbmoLzlvI/ljJblkIjlubblkI7nmoRqc29u77yM6buY6K6k5LiNICovXG4gICAgICAgIGlzRm9ybWF0QnVuZGxlSnNvbj86IGJvb2xlYW47XG4gICAgICAgIC8qKuWjsOaYjuaWh+S7tui+k+WHuuebruW9lSjmr4/kuKrphY3nva7ooajkuIDkuKrlo7DmmI4p77yM6buY6K6k5LiN6L6T5Ye6ICovXG4gICAgICAgIGNsaWVudER0c091dERpcj86IHN0cmluZztcbiAgICAgICAgLyoq5piv5ZCm5ZCI5bm25omA5pyJ5aOw5piO5Li65LiA5Liq5paH5Lu2LOm7mOiupHRydWUgKi9cbiAgICAgICAgaXNCdW5kbGVEdHM/OiBib29sZWFuO1xuICAgICAgICAvKirlkIjlubblkI7nmoTlo7DmmI7mlofku7blkI0s5aaC5p6c5rKh5pyJ5YiZ6buY6K6k5Li6dGFibGVNYXAgKi9cbiAgICAgICAgYnVuZGxlRHRzRmlsZU5hbWU/OiBzdHJpbmc7XG4gICAgICAgIC8qKuaYr+WQpuWwhmpzb27moLzlvI/ljovnvKks6buY6K6k5ZCmLOWHj+WwkWpzb27lrZfmrrXlkI3lrZfnrKYs5pWI5p6c6L6D5bCPICovXG4gICAgICAgIGlzQ29tcHJlc3M/OiBib29sZWFuO1xuICAgICAgICAvKirmmK/lkKZaaXDljovnvKks5L2/55SoemxpYiAqL1xuICAgICAgICBpc1ppcD86IGJvb2xlYW47XG4gICAgfVxufVxuXG4vKirnsbvlnovlrZfnrKbkuLLmmKDlsITlrZflhbggKi9cbmNvbnN0IHR5cGVTdHJNYXAgPSB7IGludDogXCJudW1iZXJcIiwganNvbjogXCJhbnlcIiwgXCJbaW50XVwiOiBcIm51bWJlcltdXCIsIFwiW3N0cmluZ11cIjogXCJzdHJpbmdbXVwiIH07XG5leHBvcnQgY2xhc3MgRGVmYXVsdFBhcnNlUmVzdWx0VHJhbnNmb3JtZXIge1xuICAgIC8qKlxuICAgICAqIOi9rOaNolxuICAgICAqIEBwYXJhbSBjb250ZXh0XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICB0cmFuc2Zvcm0oY29udGV4dDogSUNvbnZlcnRDb250ZXh0LCBjYjogVm9pZEZ1bmN0aW9uKSB7XG4gICAgICAgIGNvbnN0IGNvbnZlcnRDb25maWcgPSBjb250ZXh0LmNvbnZlcnRDb25maWc7XG4gICAgICAgIGNvbnN0IHBhcnNlUmVzdWx0TWFwID0gY29udGV4dC5wYXJzZVJlc3VsdE1hcDtcbiAgICAgICAgbGV0IG91dHB1dENvbmZpZzogSU91dHB1dENvbmZpZyA9IGNvbnZlcnRDb25maWcub3V0cHV0Q29uZmlnO1xuICAgICAgICBpZiAoIW91dHB1dENvbmZpZykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGFyc2VDb25maWcub3V0cHV0Q29uZmlnIGlzIHVuZGVmaW5kYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGFibGVPYmpNYXA6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgICAgICAgbGV0IG91dHB1dEZpbGVNYXA6IE91dFB1dEZpbGVNYXAgPSB7fTtcbiAgICAgICAgbGV0IHRhYmxlVHlwZU1hcER0c1N0ciA9IFwiXCI7XG4gICAgICAgIGxldCB0YWJsZVR5cGVEdHNTdHJzID0gXCJcIjtcbiAgICAgICAgbGV0IHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdDtcbiAgICAgICAgbGV0IHRhYmxlTmFtZTogc3RyaW5nO1xuICAgICAgICBsZXQgdGFibGVPYmo6IGFueTtcbiAgICAgICAgbGV0IG9ialR5cGVUYWJsZU1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICAgICAgTG9nZ2VyLmxvZyhgW291dHB1dFRyYW5zZm9ybSB86L2s5o2i6Kej5p6Q57uT5p6cXeivt+eojeetiS4uLmApO1xuICAgICAgICBmb3IgKGxldCBmaWxlUGF0aCBpbiBwYXJzZVJlc3VsdE1hcCkge1xuICAgICAgICAgICAgcGFyc2VSZXN1bHQgPSBwYXJzZVJlc3VsdE1hcFtmaWxlUGF0aF07XG4gICAgICAgICAgICBpZiAoIXBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lKSBjb250aW51ZTtcblxuICAgICAgICAgICAgdGFibGVOYW1lID0gcGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lO1xuXG4gICAgICAgICAgICAvL+WQiOW5tuWkmuS4quWQjOWQjeihqFxuICAgICAgICAgICAgdGFibGVPYmogPSB0YWJsZU9iak1hcFt0YWJsZU5hbWVdO1xuICAgICAgICAgICAgaWYgKHRhYmxlT2JqKSB7XG4gICAgICAgICAgICAgICAgdGFibGVPYmogPSBPYmplY3QuYXNzaWduKHRhYmxlT2JqLCBwYXJzZVJlc3VsdC50YWJsZU9iaik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhYmxlT2JqID0gcGFyc2VSZXN1bHQudGFibGVPYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YWJsZU9iak1hcFt0YWJsZU5hbWVdID0gdGFibGVPYmo7XG5cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuY2xpZW50RHRzT3V0RGlyICYmIG9ialR5cGVUYWJsZU1hcFt0YWJsZU5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvYmpUeXBlVGFibGVNYXBbdGFibGVOYW1lXSA9IHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWw7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlVHlwZSA9PT0gVGFibGVUeXBlLmhvcml6b250YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVUeXBlTWFwRHRzU3RyICs9IFwiXFx0cmVhZG9ubHkgXCIgKyB0YWJsZU5hbWUgKyBcIj86IFwiICsgYElUXyR7dGFibGVOYW1lfTtgICsgb3NFb2w7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVUeXBlTWFwRHRzU3RyICs9IHRoaXMuX2dldE9uZVRhYmxlVHlwZVN0cih0YWJsZU5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL+i+k+WHuuWNleS4quaWh+S7tlxuICAgICAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNCdW5kbGVEdHMgPT09IHVuZGVmaW5lZCkgb3V0cHV0Q29uZmlnLmlzQnVuZGxlRHRzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIW91dHB1dENvbmZpZy5pc0J1bmRsZUR0cykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRTaW5nbGVUYWJsZUR0c091dHB1dEZpbGUob3V0cHV0Q29uZmlnLCBwYXJzZVJlc3VsdCwgb3V0cHV0RmlsZU1hcCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVUeXBlRHRzU3RycyArPSB0aGlzLl9nZXRTaW5nbGVUYWJsZUR0cyhwYXJzZVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+eUn+aIkOWNleS4quihqGpzb25cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuY2xpZW50U2luZ2xlVGFibGVKc29uRGlyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkU2luZ2xlVGFibGVKc29uT3V0cHV0RmlsZShvdXRwdXRDb25maWcsIHBhcnNlUmVzdWx0LCBvdXRwdXRGaWxlTWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob3V0cHV0Q29uZmlnLmNsaWVudER0c091dERpcikge1xuICAgICAgICAgICAgLy/ovpPlh7rlo7DmmI7mlofku7ZcbiAgICAgICAgICAgIGxldCBpdEJhc2VTdHIgPSBcImludGVyZmFjZSBJVEJhc2U8VD4geyBba2V5OnN0cmluZ106VH1cIiArIG9zRW9sO1xuXG4gICAgICAgICAgICB0YWJsZVR5cGVNYXBEdHNTdHIgPSBpdEJhc2VTdHIgKyBcImludGVyZmFjZSBJVF9UYWJsZU1hcCB7XCIgKyBvc0VvbCArIHRhYmxlVHlwZU1hcER0c1N0ciArIFwifVwiICsgb3NFb2w7XG5cbiAgICAgICAgICAgIGlmIChvdXRwdXRDb25maWcuaXNCdW5kbGVEdHMpIHtcbiAgICAgICAgICAgICAgICAvL+WQiOaIkOS4gOS4quaWh+S7tlxuICAgICAgICAgICAgICAgIGNvbnN0IGR0c0ZpbGVOYW1lID0gb3V0cHV0Q29uZmlnLmJ1bmRsZUR0c0ZpbGVOYW1lID8gb3V0cHV0Q29uZmlnLmJ1bmRsZUR0c0ZpbGVOYW1lIDogXCJ0YWJsZU1hcFwiO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZUR0c0ZpbGVQYXRoID0gcGF0aC5qb2luKG91dHB1dENvbmZpZy5jbGllbnREdHNPdXREaXIsIGAke2R0c0ZpbGVOYW1lfS5kLnRzYCk7XG4gICAgICAgICAgICAgICAgb3V0cHV0RmlsZU1hcFtidW5kbGVEdHNGaWxlUGF0aF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBidW5kbGVEdHNGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFibGVUeXBlTWFwRHRzU3RyICsgdGFibGVUeXBlRHRzU3Ryc1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8v5ouG5YiG5paH5Lu26L6T5Ye6XG4gICAgICAgICAgICAgICAgY29uc3QgdGFibGVUeXBlTWFwRHRzRmlsZVBhdGggPSBwYXRoLmpvaW4ob3V0cHV0Q29uZmlnLmNsaWVudER0c091dERpciwgXCJ0YWJsZU1hcC5kLnRzXCIpO1xuICAgICAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbdGFibGVUeXBlTWFwRHRzRmlsZVBhdGhdID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogdGFibGVUeXBlTWFwRHRzRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhYmxlVHlwZU1hcER0c1N0clxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL2pzb25CdW5kbGVGaWxlXG4gICAgICAgIGlmIChvdXRwdXRDb25maWcuY2xpZW50QnVuZGxlSnNvbk91dFBhdGgpIHtcbiAgICAgICAgICAgIGxldCBqc29uQnVuZGxlRmlsZVBhdGggPSBvdXRwdXRDb25maWcuY2xpZW50QnVuZGxlSnNvbk91dFBhdGg7XG4gICAgICAgICAgICBsZXQgb3V0cHV0RGF0YTogYW55O1xuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc0NvbXByZXNzKSB7XG4gICAgICAgICAgICAgICAgLy/ov5vooYzmoLzlvI/ljovnvKlcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdUYWJsZU9iak1hcCA9IHt9O1xuICAgICAgICAgICAgICAgIGxldCB0YWJsZU9iajogYW55O1xuICAgICAgICAgICAgICAgIGxldCBuZXdUYWJsZU9iajogYW55O1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHRhYmxlTmFtZSBpbiB0YWJsZU9iak1hcCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAob2JqVHlwZVRhYmxlTWFwW3RhYmxlTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSB0YWJsZU9iak1hcFt0YWJsZU5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGFibGVPYmogPSB0YWJsZU9iak1hcFt0YWJsZU5hbWVdO1xuICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iaiA9IHsgZmllbGRWYWx1ZXNNYXA6IHt9IH07XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1haW5LZXkgaW4gdGFibGVPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmV3VGFibGVPYmouZmllbGROYW1lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqLmZpZWxkTmFtZXMgPSBPYmplY3Qua2V5cyh0YWJsZU9ialttYWluS2V5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdUYWJsZU9iai5maWVsZFZhbHVlc01hcFttYWluS2V5XSA9IE9iamVjdC52YWx1ZXModGFibGVPYmpbbWFpbktleV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld1RhYmxlT2JqTWFwW3RhYmxlTmFtZV0gPSBuZXdUYWJsZU9iajtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IEpTT04uc3RyaW5naWZ5KG5ld1RhYmxlT2JqTWFwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0RGF0YSA9IEpTT04uc3RyaW5naWZ5KHRhYmxlT2JqTWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v6L+b6KGMYmFzZTY05aSE55CGXG4gICAgICAgICAgICAvLyBpZiAob3V0cHV0Q29uZmlnLmJ1bmRsZUpzb25Jc0VuY29kZTJCYXNlNjQpIHtcbiAgICAgICAgICAgIC8vICAgICBvdXRwdXREYXRhID0gQmFzZTY0LmVuY29kZShvdXRwdXREYXRhKTtcbiAgICAgICAgICAgIC8vICAgICBpZiAob3V0cHV0Q29uZmlnLnByZUJhc2U2NFVnbHlTdHJpbmcpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgb3V0cHV0RGF0YSA9IG91dHB1dENvbmZpZy5wcmVCYXNlNjRVZ2x5U3RyaW5nICsgb3V0cHV0RGF0YTtcbiAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAvLyAgICAgaWYgKG91dHB1dENvbmZpZy5zdWZCYXNlNjRVZ2x5U3RyaW5nKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIG91dHB1dERhdGEgKz0gb3V0cHV0Q29uZmlnLnN1ZkJhc2U2NFVnbHlTdHJpbmc7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgaWYgKG91dHB1dENvbmZpZy5pc1ppcCkge1xuICAgICAgICAgICAgICAgIC8v5L2/55SoemlsYuWOi+e8qVxuICAgICAgICAgICAgICAgIG91dHB1dERhdGEgPSBkZWZsYXRlU3luYyhvdXRwdXREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dEZpbGVNYXBbanNvbkJ1bmRsZUZpbGVQYXRoXSA9IHtcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDoganNvbkJ1bmRsZUZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIGVuY29kaW5nOiB0eXBlb2Ygb3V0cHV0RGF0YSAhPT0gXCJzdHJpbmdcIiA/IFwiYmluYXJ5XCIgOiBcInV0Zi04XCIsXG4gICAgICAgICAgICAgICAgZGF0YTogb3V0cHV0RGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udGV4dC5vdXRQdXRGaWxlTWFwKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gb3V0cHV0RmlsZU1hcCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQub3V0UHV0RmlsZU1hcFtrZXldID0gb3V0cHV0RmlsZU1hcFtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGV4dC5vdXRQdXRGaWxlTWFwID0gb3V0cHV0RmlsZU1hcDtcbiAgICAgICAgfVxuICAgICAgICBjYigpO1xuICAgIH1cbiAgICBwcml2YXRlIF9hZGRTaW5nbGVUYWJsZUR0c091dHB1dEZpbGUoXG4gICAgICAgIGNvbmZpZzogSU91dHB1dENvbmZpZyxcbiAgICAgICAgcGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0LFxuICAgICAgICBvdXRwdXRGaWxlTWFwOiBPdXRQdXRGaWxlTWFwXG4gICAgKTogdm9pZCB7XG4gICAgICAgIC8v5aaC5p6c5YC85rKh5pyJ5bCx5LiN6L6T5Ye657G75Z6L5L+h5oGv5LqGXG4gICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVPYmopIHJldHVybjtcbiAgICAgICAgbGV0IGR0c0ZpbGVQYXRoOiBzdHJpbmcgPSBwYXRoLmpvaW4oY29uZmlnLmNsaWVudER0c091dERpciwgYCR7cGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lfS5kLnRzYCk7XG5cbiAgICAgICAgaWYgKCFvdXRwdXRGaWxlTWFwW2R0c0ZpbGVQYXRoXSkge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIGNvbnN0IGR0c1N0ciA9IHRoaXMuX2dldFNpbmdsZVRhYmxlRHRzKHBhcnNlUmVzdWx0KTtcbiAgICAgICAgICAgIGlmIChkdHNTdHIpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRGaWxlTWFwW2R0c0ZpbGVQYXRoXSA9IHsgZmlsZVBhdGg6IGR0c0ZpbGVQYXRoLCBkYXRhOiBkdHNTdHIgfSBhcyBhbnk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kej5p6Q5Ye65Y2V5Liq6YWN572u6KGo57G75Z6L5pWw5o2uXG4gICAgICogQHBhcmFtIHBhcnNlUmVzdWx0XG4gICAgICovXG4gICAgcHJpdmF0ZSBfZ2V0U2luZ2xlVGFibGVEdHMocGFyc2VSZXN1bHQ6IElUYWJsZVBhcnNlUmVzdWx0KTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgdGFibGVOYW1lID0gcGFyc2VSZXN1bHQudGFibGVEZWZpbmUudGFibGVOYW1lO1xuXG4gICAgICAgIGNvbnN0IGNvbEtleVRhYmxlRmllbGRNYXA6IENvbEtleVRhYmxlRmllbGRNYXAgPSBwYXJzZVJlc3VsdC5maWxlZE1hcDtcbiAgICAgICAgbGV0IGl0ZW1JbnRlcmZhY2UgPSBcImludGVyZmFjZSBJVF9cIiArIHRhYmxlTmFtZSArIFwiIHtcIiArIG9zRW9sO1xuICAgICAgICBsZXQgdGFibGVGaWVsZDogSVRhYmxlRmllbGQ7XG4gICAgICAgIGxldCB0eXBlU3RyOiBzdHJpbmc7XG4gICAgICAgIGxldCBvYmpUeXBlU3RyTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG5cbiAgICAgICAgZm9yIChsZXQgY29sS2V5IGluIGNvbEtleVRhYmxlRmllbGRNYXApIHtcbiAgICAgICAgICAgIHRhYmxlRmllbGQgPSBjb2xLZXlUYWJsZUZpZWxkTWFwW2NvbEtleV07XG4gICAgICAgICAgICBpZiAoIXRhYmxlRmllbGQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCF0YWJsZUZpZWxkLmlzTXV0aUNvbE9iaikge1xuICAgICAgICAgICAgICAgIC8v5rOo6YeK6KGMXG4gICAgICAgICAgICAgICAgaXRlbUludGVyZmFjZSArPSBcIlxcdC8qKiBcIiArIHRhYmxlRmllbGQudGV4dCArIFwiICovXCIgKyBvc0VvbDtcbiAgICAgICAgICAgICAgICAvL+Wtl+auteexu+Wei+WjsOaYjuihjFxuICAgICAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz1cbiAgICAgICAgICAgICAgICAgICAgXCJcXHRyZWFkb25seSBcIiArXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRmllbGQuZmllbGROYW1lICtcbiAgICAgICAgICAgICAgICAgICAgXCI/OiBcIiArXG4gICAgICAgICAgICAgICAgICAgICh0eXBlU3RyTWFwW3RhYmxlRmllbGQudHlwZV0gPyB0eXBlU3RyTWFwW3RhYmxlRmllbGQudHlwZV0gOiB0YWJsZUZpZWxkLnR5cGUpICtcbiAgICAgICAgICAgICAgICAgICAgXCI7XCIgK1xuICAgICAgICAgICAgICAgICAgICBvc0VvbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2JqRmllbGRLZXkgPSB0YWJsZUZpZWxkLmZpZWxkTmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoIW9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldID0gXCJcIjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL+azqOmHiuihjFxuICAgICAgICAgICAgICAgIG9ialR5cGVTdHJNYXBbb2JqRmllbGRLZXldICs9IFwiXFx0XFx0LyoqIFwiICsgdGFibGVGaWVsZC50ZXh0ICsgXCIgKi9cIiArIG9zRW9sO1xuXG4gICAgICAgICAgICAgICAgLy/lrZfmrrXnsbvlnovlo7DmmI7ooYxcbiAgICAgICAgICAgICAgICBvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XSArPVxuICAgICAgICAgICAgICAgICAgICBcIlxcdFxcdHJlYWRvbmx5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVGaWVsZC5zdWJGaWVsZE5hbWUgK1xuICAgICAgICAgICAgICAgICAgICBcIj86IFwiICtcbiAgICAgICAgICAgICAgICAgICAgKHR5cGVTdHJNYXBbdGFibGVGaWVsZC50eXBlXSA/IHR5cGVTdHJNYXBbdGFibGVGaWVsZC50eXBlXSA6IHRhYmxlRmllbGQudHlwZSkgK1xuICAgICAgICAgICAgICAgICAgICBcIjtcIiArXG4gICAgICAgICAgICAgICAgICAgIG9zRW9sO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8v56ys5LqM5bGC5a+56LGhXG4gICAgICAgIGZvciAobGV0IG9iakZpZWxkS2V5IGluIG9ialR5cGVTdHJNYXApIHtcbiAgICAgICAgICAgIC8v5a2X5q6157G75Z6L5aOw5piO6KGMXG4gICAgICAgICAgICBpdGVtSW50ZXJmYWNlICs9IFwiXFx0cmVhZG9ubHkgXCIgKyBvYmpGaWVsZEtleSArIFwiPzoge1wiICsgb3NFb2wgKyBvYmpUeXBlU3RyTWFwW29iakZpZWxkS2V5XTtcbiAgICAgICAgICAgIGl0ZW1JbnRlcmZhY2UgKz0gXCJcXHR9XCIgKyBvc0VvbDtcbiAgICAgICAgfVxuICAgICAgICBpdGVtSW50ZXJmYWNlICs9IFwifVwiICsgb3NFb2w7XG5cbiAgICAgICAgcmV0dXJuIGl0ZW1JbnRlcmZhY2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOa3u+WKoOWNleeLrOWvvOWHuumFjee9ruihqGpzb27mlofku7ZcbiAgICAgKiBAcGFyYW0gY29uZmlnXG4gICAgICogQHBhcmFtIHBhcnNlUmVzdWx0XG4gICAgICogQHBhcmFtIG91dHB1dEZpbGVNYXBcbiAgICAgKi9cbiAgICBwcml2YXRlIF9hZGRTaW5nbGVUYWJsZUpzb25PdXRwdXRGaWxlKFxuICAgICAgICBjb25maWc6IElPdXRwdXRDb25maWcsXG4gICAgICAgIHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdCxcbiAgICAgICAgb3V0cHV0RmlsZU1hcDogT3V0UHV0RmlsZU1hcFxuICAgICkge1xuICAgICAgICBjb25zdCB0YWJsZU9iaiA9IHBhcnNlUmVzdWx0LnRhYmxlT2JqO1xuICAgICAgICBpZiAoIXRhYmxlT2JqKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHRhYmxlTmFtZSA9IHBhcnNlUmVzdWx0LnRhYmxlRGVmaW5lLnRhYmxlTmFtZTtcbiAgICAgICAgbGV0IHNpbmdsZUpzb25GaWxlUGF0aCA9IHBhdGguam9pbihjb25maWcuY2xpZW50U2luZ2xlVGFibGVKc29uRGlyLCBgJHt0YWJsZU5hbWV9Lmpzb25gKTtcbiAgICAgICAgbGV0IHNpbmdsZUpzb25EYXRhID0gSlNPTi5zdHJpbmdpZnkodGFibGVPYmosIG51bGwsIFwiXFx0XCIpO1xuXG4gICAgICAgIGxldCBzaW5nbGVPdXRwdXRGaWxlSW5mbyA9IG91dHB1dEZpbGVNYXBbc2luZ2xlSnNvbkZpbGVQYXRoXTtcbiAgICAgICAgaWYgKHNpbmdsZU91dHB1dEZpbGVJbmZvKSB7XG4gICAgICAgICAgICBzaW5nbGVPdXRwdXRGaWxlSW5mby5kYXRhID0gc2luZ2xlSnNvbkRhdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaW5nbGVPdXRwdXRGaWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDogc2luZ2xlSnNvbkZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIGRhdGE6IHNpbmdsZUpzb25EYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgb3V0cHV0RmlsZU1hcFtzaW5nbGVKc29uRmlsZVBhdGhdID0gc2luZ2xlT3V0cHV0RmlsZUluZm87XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJpdmF0ZSBfZ2V0T25lVGFibGVUeXBlU3RyKHRhYmxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiXFx0cmVhZG9ubHkgXCIgKyB0YWJsZU5hbWUgKyBcIj86IFwiICsgXCJJVEJhc2U8XCIgKyBcIklUX1wiICsgdGFibGVOYW1lICsgXCI+O1wiICsgb3NFb2w7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRGVmYXVsdFBhcnNlUmVzdWx0VHJhbnNmb3JtZXIgfSBmcm9tICcuL2RlZmF1bHQtcmVzdWx0LXRyYW5zZm9ybWVyJztcbmltcG9ydCB7IERlZmF1bHRUYWJsZVBhcnNlciB9IGZyb20gJy4vZGVmYXVsdC10YWJsZS1wYXJzZXInO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZXJcIjtcblxuZXhwb3J0IGNsYXNzIERlZmF1bHRDb252ZXJ0SG9vayBpbXBsZW1lbnRzIElDb252ZXJ0SG9vayB7XG4gICAgcHJvdGVjdGVkIF90YWJsZVBhcnNlcjtcbiAgICBwcm90ZWN0ZWQgX3RhYmxlUmVzdWx0VHJhbnNmb3JtZXI7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX3RhYmxlUGFyc2VyID0gbmV3IERlZmF1bHRUYWJsZVBhcnNlcigpO1xuICAgICAgICB0aGlzLl90YWJsZVJlc3VsdFRyYW5zZm9ybWVyID0gbmV3IERlZmF1bHRQYXJzZVJlc3VsdFRyYW5zZm9ybWVyKCk7XG4gICAgfVxuICAgIG9uU3RhcnQ/KGNvbnRleHQ6IElDb252ZXJ0Q29udGV4dCwgY2I6IFZvaWRGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGBbZXhjZWwyYWxsXSBjb252ZXJ0LWhvb2sgb25TdGFydGApO1xuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGBbZXhjZWwyYWxsXSDlvIDlp4vooajovazmjaJgKTtcbiAgICAgICAgY2IoKTtcbiAgICB9XG5cbiAgICBvblBhcnNlQmVmb3JlPyhjb250ZXh0OiBJQ29udmVydENvbnRleHQsIGNiOiBWb2lkRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhgY29udmVydC1ob29rIG9uUGFyc2VCZWZvcmVgKTtcbiAgICAgICAgY2IoKTtcbiAgICB9XG4gICAgb25QYXJzZShjb250ZXh0OiBJQ29udmVydENvbnRleHQsIGNiOiBWb2lkRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBjaGFuZ2VkRmlsZUluZm9zLCBwYXJzZVJlc3VsdE1hcCwgY29udmVydENvbmZpZyB9ID0gY29udGV4dDtcbiAgICAgICAgY29uc3QgdGFibGVQYXJzZXIgPSB0aGlzLl90YWJsZVBhcnNlcjtcbiAgICAgICAgbGV0IHBhcnNlUmVzdWx0O1xuICAgICAgICBsZXQgZmlsZU51bSA9IGNoYW5nZWRGaWxlSW5mb3MubGVuZ3RoO1xuICAgICAgICBsZXQgZmlsZUluZm86IElGaWxlSW5mbztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWxlTnVtOyBpKyspIHtcbiAgICAgICAgICAgIGZpbGVJbmZvID0gY2hhbmdlZEZpbGVJbmZvc1tpXTtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VSZXN1bHRNYXBbZmlsZUluZm8uZmlsZVBhdGhdO1xuICAgICAgICAgICAgaWYgKCFwYXJzZVJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0geyBmaWxlUGF0aDogZmlsZUluZm8uZmlsZVBhdGggfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcGFyc2VSZXN1bHQudGFibGVPYmopIHtcbiAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdCA9IHRhYmxlUGFyc2VyLnBhcnNlVGFibGVGaWxlKGNvbnZlcnRDb25maWcsIGZpbGVJbmZvLCBwYXJzZVJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFyc2VSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBwYXJzZVJlc3VsdE1hcFtmaWxlSW5mby5maWxlUGF0aF0gPSBwYXJzZVJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYigpO1xuICAgIH1cbiAgICBvblBhcnNlQWZ0ZXI/KGNvbnRleHQ6IElDb252ZXJ0Q29udGV4dCwgY2I6IFZvaWRGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBsZXQgdHJhbnNmb3JtZXIgPSB0aGlzLl90YWJsZVJlc3VsdFRyYW5zZm9ybWVyO1xuXG4gICAgICAgIHRyYW5zZm9ybWVyLnRyYW5zZm9ybShjb250ZXh0LCBjYik7XG4gICAgfVxuICAgIG9uQ29udmVydEVuZChjb250ZXh0OiBJQ29udmVydENvbnRleHQpOiB2b2lkIHtcbiAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhgY29udmVydC1ob29rIG9uV3JpdGVGaWxlRW5kIOWGmeWFpee7k+adn2ApO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2VyXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSU91dFB1dEZpbGVJbmZvIHtcbiAgICAgICAgZmlsZVBhdGg6IHN0cmluZztcbiAgICAgICAgLyoq5YaZ5YWl57yW56CB77yM5a2X56ym5Liy6buY6K6kdXRmOCAqL1xuICAgICAgICBlbmNvZGluZz86IEJ1ZmZlckVuY29kaW5nO1xuICAgICAgICAvKirmmK/lkKbliKDpmaQgKi9cbiAgICAgICAgaXNEZWxldGU/OiBib29sZWFuO1xuICAgICAgICBkYXRhPzogYW55O1xuICAgIH1cbn1cbi8qKlxuICog6YGN5Y6G5paH5Lu2XG4gKiBAcGFyYW0gZGlyUGF0aCDmlofku7blpLnot6/lvoRcbiAqIEBwYXJhbSBlYWNoQ2FsbGJhY2sg6YGN5Y6G5Zue6LCDIChmaWxlUGF0aDogc3RyaW5nKSA9PiB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JFYWNoRmlsZShmaWxlT3JEaXJQYXRoOiBzdHJpbmcsIGVhY2hDYWxsYmFjaz86IChmaWxlUGF0aDogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgaWYgKGZzLnN0YXRTeW5jKGZpbGVPckRpclBhdGgpLmlzRGlyZWN0b3J5KCkgJiYgZmlsZU9yRGlyUGF0aCAhPT0gXCIuZ2l0XCIgJiYgZmlsZU9yRGlyUGF0aCAhPT0gXCIuc3ZuXCIpIHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWVzID0gZnMucmVhZGRpclN5bmMoZmlsZU9yRGlyUGF0aCk7XG4gICAgICAgIGxldCBjaGlsZEZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjaGlsZEZpbGVQYXRoID0gcGF0aC5qb2luKGZpbGVPckRpclBhdGgsIGZpbGVOYW1lc1tpXSk7XG4gICAgICAgICAgICBmb3JFYWNoRmlsZShjaGlsZEZpbGVQYXRoLCBlYWNoQ2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZWFjaENhbGxiYWNrKGZpbGVPckRpclBhdGgpO1xuICAgIH1cbn1cbi8qKlxuICog5om56YeP5YaZ5YWl5ZKM5Yig6Zmk5paH5Lu2XG4gKiBAcGFyYW0gb3V0cHV0RmlsZUluZm9zIOmcgOimgeWGmeWFpeeahOaWh+S7tuS/oeaBr+aVsOe7hFxuICogQHBhcmFtIG9uUHJvZ3Jlc3Mg6L+b5bqm5Y+Y5YyW5Zue6LCDXG4gKiBAcGFyYW0gY29tcGxldGUg5a6M5oiQ5Zue6LCDXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZU9yRGVsZXRlT3V0UHV0RmlsZXMoXG4gICAgb3V0cHV0RmlsZUluZm9zOiBJT3V0UHV0RmlsZUluZm9bXSxcbiAgICBvblByb2dyZXNzPzogKGZpbGVQYXRoOiBzdHJpbmcsIHRvdGFsOiBudW1iZXIsIG5vdzogbnVtYmVyLCBpc09rOiBib29sZWFuKSA9PiB2b2lkLFxuICAgIGNvbXBsZXRlPzogKHRvdGFsOiBudW1iZXIpID0+IHZvaWRcbikge1xuICAgIGxldCBmaWxlSW5mbzogSU91dFB1dEZpbGVJbmZvO1xuICAgIGNvbnN0IHRvdGFsID0gb3V0cHV0RmlsZUluZm9zLmxlbmd0aDtcbiAgICBpZiAob3V0cHV0RmlsZUluZm9zICYmIHRvdGFsKSB7XG4gICAgICAgIGxldCBub3cgPSAwO1xuICAgICAgICBjb25zdCBvbldyaXRlRW5kID0gKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIExvZ2dlci5sb2coZXJyLCBcImVycm9yXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm93Kys7XG4gICAgICAgICAgICBvblByb2dyZXNzICYmIG9uUHJvZ3Jlc3Mob3V0cHV0RmlsZUluZm9zW25vdyAtIDFdLmZpbGVQYXRoLCB0b3RhbCwgbm93LCAhZXJyKTtcbiAgICAgICAgICAgIGlmIChub3cgPj0gdG90YWwpIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSAmJiBjb21wbGV0ZSh0b3RhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZvciAobGV0IGkgPSBvdXRwdXRGaWxlSW5mb3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGZpbGVJbmZvID0gb3V0cHV0RmlsZUluZm9zW2ldO1xuXG4gICAgICAgICAgICBpZiAoZmlsZUluZm8uaXNEZWxldGUgJiYgZnMuZXhpc3RzU3luYyhmaWxlSW5mby5maWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICBmcy51bmxpbmtTeW5jKGZpbGVJbmZvLmZpbGVQYXRoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZmlsZUluZm8uZmlsZVBhdGgpICYmIGZzLnN0YXRTeW5jKGZpbGVJbmZvLmZpbGVQYXRoKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5sb2coYOi3r+W+hOS4uuaWh+S7tuWkuToke2ZpbGVJbmZvLmZpbGVQYXRofWAsIFwiZXJyb3JcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghZmlsZUluZm8uZW5jb2RpbmcgJiYgdHlwZW9mIGZpbGVJbmZvLmRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZW5jb2RpbmcgPSBcInV0ZjhcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZnMuZW5zdXJlRmlsZVN5bmMoZmlsZUluZm8uZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZShcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmVuY29kaW5nID8geyBlbmNvZGluZzogZmlsZUluZm8uZW5jb2RpbmcgfSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgb25Xcml0ZUVuZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIOiOt+WPluWPmOWMlui/h+eahOaWh+S7tuaVsOe7hFxuICogQHBhcmFtIGRpciDnm67moIfnm67lvZVcbiAqIEBwYXJhbSBjYWNoZUZpbGVQYXRoIOe8k+WtmOaWh+S7tue7neWvuei3r+W+hFxuICogQHBhcmFtIGVhY2hDYWxsYmFjayDpgY3ljoblm57osINcbiAqIEByZXR1cm5zIOi/lOWbnue8k+WtmOaWh+S7tui3r+W+hFxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaENoYW5nZWRGaWxlKFxuICAgIGRpcjogc3RyaW5nLFxuICAgIGNhY2hlRmlsZVBhdGg/OiBzdHJpbmcsXG4gICAgZWFjaENhbGxiYWNrPzogKGZpbGVQYXRoOiBzdHJpbmcsIGlzRGVsZXRlPzogYm9vbGVhbikgPT4gdm9pZFxuKSB7XG4gICAgY29uc3QgZ2NmQ2FjaGUgPSBnZXRDYWNoZURhdGEoY2FjaGVGaWxlUGF0aCk7XG4gICAgY29uc3Qgb2xkRmlsZVBhdGhzID0gT2JqZWN0LmtleXMoZ2NmQ2FjaGUpO1xuICAgIGxldCBvbGRGaWxlUGF0aEluZGV4OiBudW1iZXI7XG4gICAgZm9yRWFjaEZpbGUoZGlyLCAoZmlsZVBhdGgpID0+IHtcbiAgICAgICAgdmFyIG1kNXN0ciA9IGdldEZpbGVNZDVTeW5jKGZpbGVQYXRoKTtcbiAgICAgICAgaWYgKCFnY2ZDYWNoZVtmaWxlUGF0aF0gfHwgKGdjZkNhY2hlW2ZpbGVQYXRoXSAmJiBnY2ZDYWNoZVtmaWxlUGF0aF0gIT09IG1kNXN0cikpIHtcbiAgICAgICAgICAgIGdjZkNhY2hlW2ZpbGVQYXRoXSA9IG1kNXN0cjtcbiAgICAgICAgICAgIGVhY2hDYWxsYmFjayhmaWxlUGF0aCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIG9sZEZpbGVQYXRoSW5kZXggPSBvbGRGaWxlUGF0aHMuaW5kZXhPZihmaWxlUGF0aCk7XG4gICAgICAgIGlmIChvbGRGaWxlUGF0aEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGVuZEZpbGVQYXRoID0gb2xkRmlsZVBhdGhzW29sZEZpbGVQYXRocy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIG9sZEZpbGVQYXRoc1tvbGRGaWxlUGF0aEluZGV4XSA9IGVuZEZpbGVQYXRoO1xuICAgICAgICAgICAgb2xkRmlsZVBhdGhzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvbGRGaWxlUGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVsZXRlIGdjZkNhY2hlW29sZEZpbGVQYXRoc1tpXV07XG4gICAgICAgIGVhY2hDYWxsYmFjayhvbGRGaWxlUGF0aHNbaV0sIHRydWUpO1xuICAgIH1cbiAgICBmcy53cml0ZUZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGdjZkNhY2hlKSwgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0pO1xufVxuLyoqXG4gKiDlhpnlhaXnvJPlrZjmlbDmja5cbiAqIEBwYXJhbSBjYWNoZUZpbGVQYXRoXG4gKiBAcGFyYW0gY2FjaGVEYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZUNhY2hlRGF0YShjYWNoZUZpbGVQYXRoOiBzdHJpbmcsIGNhY2hlRGF0YTogYW55KSB7XG4gICAgaWYgKCFjYWNoZUZpbGVQYXRoKSB7XG4gICAgICAgIExvZ2dlci5sb2coYGNhY2hlRmlsZVBhdGggaXMgbnVsbGAsIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZnMud3JpdGVGaWxlU3luYyhjYWNoZUZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShjYWNoZURhdGEpLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSk7XG59XG4vKipcbiAqIOivu+WPlue8k+WtmOaVsOaNrlxuICogQHBhcmFtIGNhY2hlRmlsZVBhdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlRGF0YShjYWNoZUZpbGVQYXRoOiBzdHJpbmcpOiBhbnkge1xuICAgIGlmICghY2FjaGVGaWxlUGF0aCkge1xuICAgICAgICBMb2dnZXIubG9nKGBjYWNoZUZpbGVQYXRoIGlzIG51bGxgLCBcImVycm9yXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghZnMuZXhpc3RzU3luYyhjYWNoZUZpbGVQYXRoKSkge1xuICAgICAgICBmcy5lbnN1cmVGaWxlU3luYyhjYWNoZUZpbGVQYXRoKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhjYWNoZUZpbGVQYXRoLCBcInt9XCIsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KTtcbiAgICB9XG4gICAgY29uc3QgZ2NmQ2FjaGVGaWxlID0gZnMucmVhZEZpbGVTeW5jKGNhY2hlRmlsZVBhdGgsIFwidXRmLThcIik7XG4gICAgY29uc3QgZ2NmQ2FjaGUgPSBKU09OLnBhcnNlKGdjZkNhY2hlRmlsZSk7XG4gICAgcmV0dXJuIGdjZkNhY2hlO1xufVxuLyoqXG4gKiDojrflj5bmlofku7ZtZDUgKOWQjOatpSlcbiAqIEBwYXJhbSBmaWxlUGF0aFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGg6IHN0cmluZywgZW5jb2Rpbmc/OiBCdWZmZXJFbmNvZGluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgZmlsZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgZW5jb2RpbmcpO1xuICAgIHZhciBtZDV1bSA9IGNyeXB0by5jcmVhdGVIYXNoKFwibWQ1XCIpO1xuICAgIG1kNXVtLnVwZGF0ZShmaWxlKTtcbiAgICByZXR1cm4gbWQ1dW0uZGlnZXN0KFwiaGV4XCIpO1xufVxuLyoqXG4gKiDojrflj5bmlofku7ZtZDUgKOW8guatpSlcbiAqIEBwYXJhbSBmaWxlUGF0aFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZU1kNUFzeW5jKGZpbGVQYXRoOiBzdHJpbmcsIGNiOiAobWQ1U3RyOiBzdHJpbmcpID0+IHZvaWQsIGVuY29kaW5nPzogQnVmZmVyRW5jb2RpbmcpIHtcbiAgICBmcy5yZWFkRmlsZShmaWxlUGF0aCwgZW5jb2RpbmcsIChlcnIsIGZpbGUpID0+IHtcbiAgICAgICAgdmFyIG1kNXVtID0gY3J5cHRvLmNyZWF0ZUhhc2goXCJtZDVcIik7XG4gICAgICAgIG1kNXVtLnVwZGF0ZShmaWxlKTtcbiAgICAgICAgY29uc3QgbWQ1U3RyID0gbWQ1dW0uZGlnZXN0KFwiaGV4XCIpO1xuICAgICAgICBjYihtZDVTdHIpO1xuICAgIH0pO1xufVxuLyoqXG4gKiDojrflj5bmlofku7ZtZDVcbiAqIEBwYXJhbSBmaWxlIOaWh+S7tuWvueixoVxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVNZDUoZmlsZTogYW55KSB7XG4gICAgY29uc3QgbWQ1dW0gPSBjcnlwdG8uY3JlYXRlSGFzaChcIm1kNVwiKTtcbiAgICBtZDV1bS51cGRhdGUoZmlsZSk7XG4gICAgcmV0dXJuIG1kNXVtLmRpZ2VzdChcImhleFwiKTtcbn1cbi8qKlxuICog6I635Y+W5paH5Lu2IG1kNVxuICogQHBhcmFtIGZpbGVQYXRoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRGaWxlTWQ1QnlQYXRoKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZ2V0RmlsZU1kNVN5bmMoZmlsZVBhdGgpO1xufVxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQge1xuICAgIGdldENhY2hlRGF0YSxcbiAgICBnZXRGaWxlTWQ1LFxuICAgIHdyaXRlQ2FjaGVEYXRhLFxuICAgIHdyaXRlT3JEZWxldGVPdXRQdXRGaWxlc1xufSBmcm9tIFwiLi9maWxlLXV0aWxzXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dlclwiO1xuaW1wb3J0IHsgRGVmYXVsdENvbnZlcnRIb29rIH0gZnJvbSBcIi4vZGVmYXVsdC1jb252ZXJ0LWhvb2tcIjtcbmltcG9ydCBmZyBmcm9tIFwiZmFzdC1nbG9iXCI7XG5cbmNvbnN0IGRlZmF1bHREaXIgPSBcIi5leGNlbDJhbGxcIjtcbmNvbnN0IGNhY2hlRmlsZU5hbWUgPSBcIi5lMmFwcm1jXCI7XG5jb25zdCBsb2dGaWxlTmFtZSA9IFwiZXhjZWwyYWxsLmxvZ1wiO1xubGV0IHN0YXJ0VGltZSA9IDA7XG5jb25zdCBkZWZhdWx0UGF0dGVybiA9IFtcIi4vKiovKi54bHN4XCIsIFwiLi8qKi8qLmNzdlwiLCBcIiEqKi9+JCouKlwiLCBcIiEqKi9+LiouKlwiLCBcIiEuZ2l0LyoqLypcIiwgXCIhLnN2bi8qKi8qXCJdO1xuLyoqXG4gKiDovazmjaJcbiAqIEBwYXJhbSBjb252ZXJDb25maWcg6Kej5p6Q6YWN572uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb252ZXJ0KGNvbnZlckNvbmZpZzogSVRhYmxlQ29udmVydENvbmZpZywgY3VzdG9tQ29udmVydEhvb2s/OiBJQ29udmVydEhvb2spIHtcbiAgICAvL+W8gOWni+aXtumXtFxuICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgaWYgKCFjb252ZXJDb25maWcucHJvalJvb3QpIHtcbiAgICAgICAgY29udmVyQ29uZmlnLnByb2pSb290ID0gcHJvY2Vzcy5jd2QoKTtcbiAgICB9XG5cbiAgICBMb2dnZXIuaW5pdChjb252ZXJDb25maWcpO1xuICAgIGNvbnN0IHRhYmxlRmlsZURpciA9IGNvbnZlckNvbmZpZy50YWJsZUZpbGVEaXI7XG4gICAgaWYgKCF0YWJsZUZpbGVEaXIpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhg6YWN572u6KGo55uu5b2V77yadGFibGVGaWxlRGly5Li656m6YCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWZzLmV4aXN0c1N5bmModGFibGVGaWxlRGlyKSkge1xuICAgICAgICBMb2dnZXIubG9nKGDphY3nva7ooajmlofku7blpLnkuI3lrZjlnKjvvJoke3RhYmxlRmlsZURpcn1gLCBcImVycm9yXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFjb252ZXJDb25maWcucGF0dGVybikge1xuICAgICAgICBjb252ZXJDb25maWcucGF0dGVybiA9IGRlZmF1bHRQYXR0ZXJuO1xuICAgIH1cbiAgICBsZXQgY29udmVydEhvb2sgPSBuZXcgRGVmYXVsdENvbnZlcnRIb29rKCk7XG4gICAgY29uc3QgY29udGV4dDogSUNvbnZlcnRDb250ZXh0ID0ge1xuICAgICAgICBjb252ZXJ0Q29uZmlnOiBjb252ZXJDb25maWcsXG4gICAgICAgIHV0aWxzOiB7XG4gICAgICAgICAgICBmczogcmVxdWlyZShcImZzLWV4dHJhXCIpLFxuICAgICAgICAgICAgeGxzeDogcmVxdWlyZShcInhsc3hcIilcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy/lvIDlp4tcbiAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzKSA9PiB7XG4gICAgICAgIGN1c3RvbUNvbnZlcnRIb29rICYmIGN1c3RvbUNvbnZlcnRIb29rLm9uU3RhcnQgPyBjdXN0b21Db252ZXJ0SG9vay5vblN0YXJ0KGNvbnRleHQsIHJlcykgOiBjb252ZXJ0SG9vay5vblN0YXJ0KGNvbnRleHQsIHJlcyk7XG4gICAgfSk7XG4gICAgY29uc3QgcHJlZG9UMSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGdldEZpbGVJbmZvcyhjb250ZXh0KTtcbiAgICBjb25zdCB7IHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCwgY2hhbmdlZEZpbGVJbmZvcyB9ID0gY29udGV4dDtcbiAgICBjb25zdCBwcmVkb1QyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgTG9nZ2VyLnN5c3RlbUxvZyhgW+mihOWkhOeQhuaVsOaNruaXtumXtDoke3ByZWRvVDIgLSBwcmVkb1QxfW1zLCR7KHByZWRvVDIgLSBwcmVkb1QxKSAvIDEwMDB9XWApO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXMpID0+IHtcbiAgICAgICAgY3VzdG9tQ29udmVydEhvb2sgJiYgY3VzdG9tQ29udmVydEhvb2sub25QYXJzZUJlZm9yZSA/IGN1c3RvbUNvbnZlcnRIb29rLm9uUGFyc2VCZWZvcmUoY29udGV4dCwgcmVzKSA6IGNvbnZlcnRIb29rLm9uUGFyc2VCZWZvcmUoY29udGV4dCwgcmVzKTtcbiAgICB9KTtcbiAgICBMb2dnZXIuc3lzdGVtTG9nKGBb5byA5aeL6Kej5p6QXTrmlbDph49bJHtjaGFuZ2VkRmlsZUluZm9zLmxlbmd0aH1dYCk7XG5cblxuICAgIExvZ2dlci5zeXN0ZW1Mb2coYFvljZXnur/nqIvop6PmnpBdYCk7XG4gICAgaWYgKGNoYW5nZWRGaWxlSW5mb3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB0MSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzKSA9PiB7XG4gICAgICAgICAgICBjdXN0b21Db252ZXJ0SG9vayAmJiBjdXN0b21Db252ZXJ0SG9vay5vblBhcnNlID8gY3VzdG9tQ29udmVydEhvb2sub25QYXJzZShjb250ZXh0LCByZXMpIDogY29udmVydEhvb2sub25QYXJzZShjb250ZXh0LCByZXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdDIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhgW+WNlee6v+eoi+ino+aekOaXtumXtF06JHt0MiAtIHQxfWApO1xuICAgIH1cbiAgICBvblBhcnNlRW5kKGNvbnRleHQsIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aCwgY3VzdG9tQ29udmVydEhvb2ssIGNvbnZlcnRIb29rKTtcbn1cblxuLyoqXG4gKiDop6PmnpDnu5PmnZ9cbiAqIEBwYXJhbSBwYXJzZUNvbmZpZ1xuICogQHBhcmFtIHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aFxuICogQHBhcmFtIGNvbnZlcnRIb29rXG4gKiBAcGFyYW0gZmlsZUluZm9zXG4gKiBAcGFyYW0gZGVsZXRlRmlsZUluZm9zXG4gKiBAcGFyYW0gcGFyc2VSZXN1bHRNYXBcbiAqIEBwYXJhbSBsb2dTdHJcbiAqL1xuYXN5bmMgZnVuY3Rpb24gb25QYXJzZUVuZChcbiAgICBjb250ZXh0OiBJQ29udmVydENvbnRleHQsXG4gICAgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoOiBzdHJpbmcsXG4gICAgY3VzdG9tQ29udmVydEhvb2s6IElDb252ZXJ0SG9vayxcbiAgICBjb252ZXJ0SG9vazogSUNvbnZlcnRIb29rLFxuICAgIGxvZ1N0cj86IHN0cmluZ1xuKSB7XG4gICAgY29uc3QgY29udmVydENvbmZpZyA9IGNvbnRleHQuY29udmVydENvbmZpZztcbiAgICBjb25zdCBwYXJzZVJlc3VsdE1hcCA9IGNvbnRleHQucGFyc2VSZXN1bHRNYXA7XG4gICAgLy/lhpnlhaXop6PmnpDnvJPlrZhcbiAgICBpZiAoY29udmVydENvbmZpZy51c2VDYWNoZSkge1xuICAgICAgICB3cml0ZUNhY2hlRGF0YShwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgsIHBhcnNlUmVzdWx0TWFwKTtcbiAgICB9XG5cbiAgICAvL+ino+aekOe7k+adn++8jOWBmuWvvOWHuuWkhOeQhlxuICAgIExvZ2dlci5zeXN0ZW1Mb2coYOW8gOWni+i/m+ihjOi9rOaNouino+aekOe7k+aenGApO1xuICAgIGNvbnN0IHBhcnNlQWZ0ZXJUMSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXMpID0+IHtcbiAgICAgICAgY3VzdG9tQ29udmVydEhvb2sgJiYgY3VzdG9tQ29udmVydEhvb2sub25QYXJzZUFmdGVyID8gY3VzdG9tQ29udmVydEhvb2sub25QYXJzZUFmdGVyKGNvbnRleHQsIHJlcykgOiBjb252ZXJ0SG9vay5vblBhcnNlQWZ0ZXIoY29udGV4dCwgcmVzKTtcbiAgICB9KTtcbiAgICBjb25zdCBwYXJzZUFmdGVyVDIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBMb2dnZXIuc3lzdGVtTG9nKGDovazmjaLop6PmnpDnu5Pmnpznu5PmnZ86JHtwYXJzZUFmdGVyVDIgLSBwYXJzZUFmdGVyVDF9bXMsJHsocGFyc2VBZnRlclQyIC0gcGFyc2VBZnRlclQxKSAvIDEwMDB9c2ApO1xuXG4gICAgaWYgKGNvbnRleHQub3V0UHV0RmlsZU1hcCkge1xuICAgICAgICBjb25zdCBvdXRwdXRGaWxlTWFwID0gY29udGV4dC5vdXRQdXRGaWxlTWFwO1xuICAgICAgICBjb25zdCBvdXRwdXRGaWxlcyA9IE9iamVjdC52YWx1ZXMob3V0cHV0RmlsZU1hcCk7XG4gICAgICAgIC8v5YaZ5YWl5ZKM5Yig6Zmk5paH5Lu25aSE55CGXG4gICAgICAgIExvZ2dlci5zeXN0ZW1Mb2coYOW8gOWni+WGmeWFpeaWh+S7tjowLyR7b3V0cHV0RmlsZXMubGVuZ3RofWApO1xuXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXMpID0+IHtcbiAgICAgICAgICAgIHdyaXRlT3JEZWxldGVPdXRQdXRGaWxlcyhcbiAgICAgICAgICAgICAgICBvdXRwdXRGaWxlcyxcbiAgICAgICAgICAgICAgICAoZmlsZVBhdGgsIHRvdGFsLCBub3csIGlzT2spID0+IHtcbiAgICAgICAgICAgICAgICAgICAgTG9nZ2VyLmxvZyhgW+WGmeWFpeaWh+S7tl0g6L+b5bqmOigke25vd30vJHt0b3RhbH0pIOi3r+W+hDoke2ZpbGVQYXRofWApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhg5YaZ5YWl57uT5p2ffmApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIExvZ2dlci5zeXN0ZW1Mb2coYOayoeacieWPr+WGmeWFpeaWh+S7tn5gKTtcbiAgICB9XG5cbiAgICAvL+WGmeWFpeaXpeW/l+aWh+S7tlxuXG4gICAgaWYgKCFsb2dTdHIpIHtcbiAgICAgICAgbG9nU3RyID0gTG9nZ2VyLmxvZ1N0cjtcbiAgICB9XG4gICAgaWYgKGxvZ1N0ci50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgbGV0IGxvZ0ZpbGVEaXJQYXRoID0gY29udGV4dC5jb252ZXJ0Q29uZmlnLm91dHB1dExvZ0RpclBhdGggYXMgc3RyaW5nO1xuICAgICAgICBpZiAoIWxvZ0ZpbGVEaXJQYXRoKSBsb2dGaWxlRGlyUGF0aCA9IGRlZmF1bHREaXI7XG4gICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKGxvZ0ZpbGVEaXJQYXRoKSkge1xuICAgICAgICAgICAgbG9nRmlsZURpclBhdGggPSBwYXRoLmpvaW4oY29udGV4dC5jb252ZXJ0Q29uZmlnLnByb2pSb290LCBsb2dGaWxlRGlyUGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvdXRwdXRMb2dGaWxlSW5mbzogSU91dFB1dEZpbGVJbmZvID0ge1xuICAgICAgICAgICAgZmlsZVBhdGg6IHBhdGguam9pbihsb2dGaWxlRGlyUGF0aCwgbG9nRmlsZU5hbWUpLFxuICAgICAgICAgICAgZGF0YTogbG9nU3RyXG4gICAgICAgIH07XG4gICAgICAgIHdyaXRlT3JEZWxldGVPdXRQdXRGaWxlcyhbb3V0cHV0TG9nRmlsZUluZm9dKTtcbiAgICB9XG4gICAgLy/lhpnlhaXnu5PmnZ9cbiAgICBjb252ZXJ0SG9vay5vbkNvbnZlcnRFbmQoY29udGV4dCk7XG4gICAgLy/nu5PmnZ/ml7bpl7RcbiAgICBjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgY29uc3QgdXNlVGltZSA9IGVuZFRpbWUgLSBzdGFydFRpbWU7XG4gICAgTG9nZ2VyLmxvZyhg5a+86KGo5oC75pe26Ze0Olske3VzZVRpbWV9bXNdLFske3VzZVRpbWUgLyAxMDAwfXNdYCk7XG59XG4vKipcbiAqIOa1i+ivleaWh+S7tuWMuemFjVxuICogQHBhcmFtIGNvbnZlcnRDb25maWdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRlc3RGaWxlTWF0Y2goY29udmVydENvbmZpZzogSVRhYmxlQ29udmVydENvbmZpZykge1xuICAgIGlmICghY29udmVydENvbmZpZy5wcm9qUm9vdCkge1xuICAgICAgICBjb252ZXJ0Q29uZmlnLnByb2pSb290ID0gcHJvY2Vzcy5jd2QoKTtcbiAgICB9XG4gICAgY29uc3QgdGFibGVGaWxlRGlyID0gY29udmVydENvbmZpZy50YWJsZUZpbGVEaXI7XG4gICAgaWYgKCF0YWJsZUZpbGVEaXIpIHtcbiAgICAgICAgTG9nZ2VyLmxvZyhg6YWN572u6KGo55uu5b2V77yadGFibGVGaWxlRGly5Li656m6YCwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWZzLmV4aXN0c1N5bmModGFibGVGaWxlRGlyKSkge1xuICAgICAgICBMb2dnZXIubG9nKGDphY3nva7ooajmlofku7blpLnkuI3lrZjlnKjvvJoke3RhYmxlRmlsZURpcn1gLCBcImVycm9yXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghY29udmVydENvbmZpZy5wYXR0ZXJuKSB7XG4gICAgICAgIGNvbnZlcnRDb25maWcucGF0dGVybiA9IGRlZmF1bHRQYXR0ZXJuO1xuICAgIH1cbiAgICBjb25zdCBjb250ZXh0OiBJQ29udmVydENvbnRleHQgPSB7IGNvbnZlcnRDb25maWc6IGNvbnZlcnRDb25maWcgfSBhcyBhbnk7XG4gICAgbGV0IHQxID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgZ2V0RmlsZUluZm9zKGNvbnRleHQpO1xuICAgIGxldCB0MiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGNvbnNvbGUubG9nKGDmiafooYzml7bpl7Q6JHsodDIgLSB0MSkgLyAxMDAwfXNgKTtcbiAgICBpZiAoY29udmVydENvbmZpZy51c2VDYWNoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhgLS0tLeOAkOe8k+WtmOaooeW8j+OAkS0tLS1gKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coYC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLeWMuemFjeWIsOeahOaWh+S7ti0tLS0tLS0tLS0tLS0tLS0tLS0tLWApO1xuICAgIGNvbnNvbGUubG9nKGNvbnRleHQuY2hhbmdlZEZpbGVJbmZvcyk7XG59XG4vKipcbiAqIOS9v+eUqGZhc3QtZ2xvYuS9nOS4uuaWh+S7tumBjeWOhlxuICog6I635Y+W6ZyA6KaB6Kej5p6Q55qE5paH5Lu25L+h5oGvXG4gKiBAcGFyYW0gY29udGV4dFxuICovXG4gZnVuY3Rpb24gZ2V0RmlsZUluZm9zKGNvbnRleHQ6IElDb252ZXJ0Q29udGV4dCkge1xuICAgIGNvbnN0IGNvbnZlckNvbmZpZyA9IGNvbnRleHQuY29udmVydENvbmZpZztcbiAgICBsZXQgY2hhbmdlZEZpbGVJbmZvczogSUZpbGVJbmZvW10gPSBbXTtcbiAgICBsZXQgZGVsZXRlRmlsZUluZm9zOiBJRmlsZUluZm9bXSA9IFtdO1xuICAgIGNvbnN0IHRhYmxlRmlsZURpciA9IGNvbnZlckNvbmZpZy50YWJsZUZpbGVEaXI7XG4gICAgY29uc3QgZ2V0RmlsZUluZm8gPSAoZmlsZVBhdGg6IHN0cmluZywgaXNEZWxldGU/OiBib29sZWFuKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoUGFyc2UgPSBwYXRoLnBhcnNlKGZpbGVQYXRoKTtcblxuICAgICAgICBsZXQgZmlsZURhdGEgPSAhaXNEZWxldGUgPyBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgpIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IGZpbGVJbmZvOiBJRmlsZUluZm8gPSB7XG4gICAgICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICBmaWxlTmFtZTogZmlsZVBhdGhQYXJzZS5uYW1lLFxuICAgICAgICAgICAgZmlsZUV4dE5hbWU6IGZpbGVQYXRoUGFyc2UuZXh0LFxuICAgICAgICAgICAgaXNEZWxldGU6IGlzRGVsZXRlLFxuICAgICAgICAgICAgZmlsZURhdGE6IGZpbGVEYXRhXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBmaWxlSW5mbztcbiAgICB9O1xuICAgIGNvbnN0IG1hdGNoUGF0dGVybiA9IGNvbnZlckNvbmZpZy5wYXR0ZXJuO1xuXG4gICAgY29uc3QgZmlsZVBhdGhzOiBzdHJpbmdbXSA9IGZnLnN5bmMobWF0Y2hQYXR0ZXJuLCB7XG4gICAgICAgIGFic29sdXRlOiB0cnVlLFxuICAgICAgICBvbmx5RmlsZXM6IHRydWUsXG4gICAgICAgIGNhc2VTZW5zaXRpdmVNYXRjaDogZmFsc2UsXG4gICAgICAgIGN3ZDogdGFibGVGaWxlRGlyXG4gICAgfSk7XG4gICAgbGV0IHBhcnNlUmVzdWx0TWFwOiBUYWJsZVBhcnNlUmVzdWx0TWFwID0ge307XG4gICAgLy/nvJPlrZjlpITnkIZcbiAgICBsZXQgY2FjaGVGaWxlRGlyUGF0aDogc3RyaW5nID0gY29udmVyQ29uZmlnLmNhY2hlRmlsZURpclBhdGg7XG4gICAgbGV0IHBhcnNlUmVzdWx0TWFwQ2FjaGVGaWxlUGF0aDogc3RyaW5nO1xuICAgIGxldCBmaWxlSW5mbzogSUZpbGVJbmZvO1xuICAgIGlmICghY29udmVyQ29uZmlnLnVzZUNhY2hlKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsZVBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmaWxlSW5mbyA9IGdldEZpbGVJbmZvKGZpbGVQYXRoc1tpXSk7XG4gICAgICAgICAgICBjaGFuZ2VkRmlsZUluZm9zLnB1c2goZmlsZUluZm8pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHQxID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGlmICghY2FjaGVGaWxlRGlyUGF0aCkgY2FjaGVGaWxlRGlyUGF0aCA9IGRlZmF1bHREaXI7XG4gICAgICAgIGlmICghcGF0aC5pc0Fic29sdXRlKGNhY2hlRmlsZURpclBhdGgpKSB7XG4gICAgICAgICAgICBjYWNoZUZpbGVEaXJQYXRoID0gcGF0aC5qb2luKGNvbnZlckNvbmZpZy5wcm9qUm9vdCwgY2FjaGVGaWxlRGlyUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcGFyc2VSZXN1bHRNYXBDYWNoZUZpbGVQYXRoID0gcGF0aC5qb2luKGNhY2hlRmlsZURpclBhdGgsIGNhY2hlRmlsZU5hbWUpO1xuICAgICAgICBMb2dnZXIuc3lzdGVtTG9nKGDor7vlj5bnvJPlrZjmlbDmja5gKTtcblxuICAgICAgICBwYXJzZVJlc3VsdE1hcCA9IGdldENhY2hlRGF0YShwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGgpO1xuICAgICAgICBpZiAoIXBhcnNlUmVzdWx0TWFwKSB7XG4gICAgICAgICAgICBwYXJzZVJlc3VsdE1hcCA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgTG9nZ2VyLnN5c3RlbUxvZyhg5byA5aeL57yT5a2Y5aSE55CGLi4uYCk7XG4gICAgICAgIGNvbnN0IG9sZEZpbGVQYXRocyA9IE9iamVjdC5rZXlzKHBhcnNlUmVzdWx0TWFwKTtcbiAgICAgICAgbGV0IG9sZEZpbGVQYXRoSW5kZXg6IG51bWJlcjtcbiAgICAgICAgbGV0IHBhcnNlUmVzdWx0OiBJVGFibGVQYXJzZVJlc3VsdDtcbiAgICAgICAgbGV0IGZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsZVBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoc1tpXTtcbiAgICAgICAgICAgIGZpbGVJbmZvID0gZ2V0RmlsZUluZm8oZmlsZVBhdGgpO1xuICAgICAgICAgICAgY29uc3QgZmlsZURhdGEgPSBmaWxlSW5mby5maWxlRGF0YTtcbiAgICAgICAgICAgIHBhcnNlUmVzdWx0ID0gcGFyc2VSZXN1bHRNYXBbZmlsZVBhdGhdO1xuICAgICAgICAgICAgdmFyIG1kNXN0ciA9IGdldEZpbGVNZDUoZmlsZURhdGEpO1xuICAgICAgICAgICAgaWYgKCFwYXJzZVJlc3VsdCB8fCAocGFyc2VSZXN1bHQgJiYgKHBhcnNlUmVzdWx0Lmhhc0Vycm9yIHx8IHBhcnNlUmVzdWx0Lm1kNWhhc2ggIT09IG1kNXN0cikpKSB7XG4gICAgICAgICAgICAgICAgcGFyc2VSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcGFyc2VSZXN1bHRNYXBbZmlsZVBhdGhdID0gcGFyc2VSZXN1bHQ7XG4gICAgICAgICAgICAgICAgcGFyc2VSZXN1bHQubWQ1aGFzaCA9IG1kNXN0cjtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkRmlsZUluZm9zLnB1c2goZmlsZUluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy/liKTmlq3mlofku7bmmK/lkKbov5jlrZjlnKhcbiAgICAgICAgICAgIG9sZEZpbGVQYXRoSW5kZXggPSBvbGRGaWxlUGF0aHMuaW5kZXhPZihmaWxlUGF0aCk7XG4gICAgICAgICAgICBpZiAob2xkRmlsZVBhdGhJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kRmlsZVBhdGggPSBvbGRGaWxlUGF0aHNbb2xkRmlsZVBhdGhzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIG9sZEZpbGVQYXRoc1tvbGRGaWxlUGF0aEluZGV4XSA9IGVuZEZpbGVQYXRoO1xuICAgICAgICAgICAgICAgIG9sZEZpbGVQYXRocy5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL+WIoOmZpOaXp+aWh+S7tlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZEZpbGVQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGVsZXRlIHBhcnNlUmVzdWx0TWFwW29sZEZpbGVQYXRoc1tpXV07XG4gICAgICAgICAgICBsZXQgZGVsZXRlRmlsZUluZm8gPSBnZXRGaWxlSW5mbyhvbGRGaWxlUGF0aHNbaV0sIHRydWUpO1xuICAgICAgICAgICAgZGVsZXRlRmlsZUluZm9zLnB1c2goZGVsZXRlRmlsZUluZm8pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHQyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIExvZ2dlci5zeXN0ZW1Mb2coYOe8k+WtmOWkhOeQhuaXtumXtDoke3QyIC0gdDF9bXMsJHsodDIgLSB0MSkgLyAxMDAwfXNgKTtcbiAgICB9XG4gICAgY29udGV4dC5kZWxldGVGaWxlSW5mb3MgPSBkZWxldGVGaWxlSW5mb3M7XG4gICAgY29udGV4dC5jaGFuZ2VkRmlsZUluZm9zID0gY2hhbmdlZEZpbGVJbmZvcztcbiAgICBjb250ZXh0LnBhcnNlUmVzdWx0TWFwID0gcGFyc2VSZXN1bHRNYXA7XG4gICAgY29udGV4dC5wYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGggPSBwYXJzZVJlc3VsdE1hcENhY2hlRmlsZVBhdGg7XG59XG4iXSwibmFtZXMiOlsib3MiLCJ4bHN4IiwiVGFibGVUeXBlIiwicGF0aCIsImRlZmxhdGVTeW5jIiwiZnMiLCJjcnlwdG8iLCJmZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFFYSxpQkFBaUIsR0FFMUIsR0FBRztBQUNQLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUNwQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxRQUFRLENBQUM7QUFDdkMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsV0FBVyxDQUFDO0FBQ3pDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxHQUFHLFdBQVcsQ0FBQztBQUM1QyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZLENBQUM7QUFDekMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQ3BDLFNBQVMsV0FBVyxDQUFDLFNBQXNCLEVBQUUsU0FBaUI7SUFDMUQsU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLEVBQUUsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2hELFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsSUFBSSxNQUFnQixDQUFDO0lBQ3JCLE1BQU0sTUFBTSxHQUFzQixFQUFFLENBQUM7SUFDckMsSUFBSSxTQUFTLEtBQUssRUFBRSxFQUFFO1FBQ2xCLElBQUk7WUFDQSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztTQUN6QjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7U0FDeEI7S0FDSjtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFDRCxTQUFTLFdBQVcsQ0FBQyxTQUFzQixFQUFFLFNBQWlCO0lBQzFELFNBQVMsR0FBRyxDQUFDLFNBQVMsR0FBRyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoRCxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzdCLElBQUksTUFBTSxHQUFzQixFQUFFLENBQUM7SUFDbkMsSUFBSSxHQUFhLENBQUM7SUFDbEIsSUFBSSxTQUFTLEtBQUssRUFBRSxFQUFFO1FBQ2xCLElBQUk7WUFDQSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztTQUN0QjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7U0FDeEI7S0FDSjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFDRCxTQUFTLFFBQVEsQ0FBQyxTQUFzQixFQUFFLFNBQWlCO0lBQ3ZELElBQUksTUFBTSxHQUFzQixFQUFTLENBQUM7SUFDMUMsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUMxRCxNQUFNLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFJLFFBQVEsQ0FBQyxTQUFTLENBQVMsQ0FBQztLQUNqRztTQUFNLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO1FBQ3RDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0tBQzVCO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQUNELFNBQVMsWUFBWSxDQUFDLFNBQXNCLEVBQUUsU0FBaUI7SUFDM0QsU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLEVBQUUsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2hELFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsSUFBSSxHQUFHLENBQUM7SUFDUixJQUFJLEtBQUssQ0FBQztJQUNWLElBQUksU0FBUyxLQUFLLEVBQUUsRUFBRTtRQUNsQixJQUFJO1lBQ0EsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDL0I7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLEtBQUssR0FBRyxHQUFHLENBQUM7WUFDWixHQUFHLEdBQUcsU0FBUyxDQUFDO1NBQ25CO0tBQ0o7SUFDRCxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDeEMsQ0FBQztBQUNELFNBQVMsUUFBUSxDQUFDLFNBQXNCLEVBQUUsU0FBYztJQUNwRCxJQUFJLE1BQU0sR0FBc0IsRUFBUyxDQUFDO0lBQzFDLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO1FBQy9CLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0IsSUFBSSxTQUFTLEtBQUssRUFBRSxFQUFFO1lBQ2xCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO1NBQzVCO0tBQ0o7U0FBTTtRQUNILE1BQU0sQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLEVBQUUsQ0FBQztLQUNqQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFPRCxTQUFTLFFBQVEsQ0FBQyxTQUFzQixFQUFFLFNBQWlCO0lBQ3ZELFNBQVMsR0FBRyxDQUFDLFNBQVMsR0FBRyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoRCxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzdCLElBQUksR0FBRyxDQUFDO0lBQ1IsSUFBSSxLQUFLLENBQUM7SUFDVixJQUFJLFNBQVMsS0FBSyxFQUFFLEVBQUU7UUFDbEIsSUFBSTtZQUNBLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQy9CO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixHQUFHLEdBQUcsU0FBUyxDQUFDO1NBQ25CO0tBQ0o7SUFDRCxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDeEM7O0FDaEdBLE1BQU0sUUFBUSxHQUFHQSxhQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7QUFFeEIsTUFBTSxLQUFLLEdBQUcsUUFBUSxLQUFLLE9BQU8sR0FBRyxJQUFJLEdBQUcsTUFBTTs7QUNEekQsSUFBSyxZQUtKO0FBTEQsV0FBSyxZQUFZO0lBQ2IsK0NBQUksQ0FBQTtJQUNKLCtDQUFJLENBQUE7SUFDSixpREFBSyxDQUFBO0lBQ0wsMkNBQUUsQ0FBQTtBQUNOLENBQUMsRUFMSSxZQUFZLEtBQVosWUFBWSxRQUtoQjtNQUNZLE1BQU07SUFRUixPQUFPLElBQUksQ0FBQyxhQUFrQztRQUNqRCxNQUFNLEtBQUssR0FBYSxhQUFhLENBQUMsUUFBUSxHQUFHLGFBQWEsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQ2pGLElBQUksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLEtBQUssS0FBSyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7S0FDdkY7SUFNTSxPQUFPLEdBQUcsQ0FBQyxPQUFlLEVBQUUsUUFBa0IsTUFBTTtRQUN2RCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDaEIsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdkMsUUFBUSxLQUFLO29CQUNULEtBQUssT0FBTzt3QkFDUixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7NEJBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7d0JBQ3pDLE1BQU07b0JBQ1YsS0FBSyxNQUFNO3dCQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ3JCLE1BQU07b0JBQ1YsS0FBSyxNQUFNO3dCQUNQLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ3RCLE1BQU07aUJBQ2I7YUFDSjtTQUNKO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0I7WUFBRSxPQUFPO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztLQUNuQztJQUtNLE9BQU8sU0FBUyxDQUFDLE9BQWU7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQjtZQUFFLE9BQU87UUFDdkMsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0tBQ25DO0lBSU0sV0FBVyxNQUFNO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixPQUFPLE1BQU0sQ0FBQztLQUNqQjs7QUFyRGMsY0FBTyxHQUFXLEVBQUUsQ0FBQztBQUl0QixlQUFRLEdBQVksS0FBSzs7U0NWM0IsV0FBVyxDQUFDLElBQXFCO0lBQzdDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO1FBQzlCLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtZQUM1QixPQUFPLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3hCO2FBQU0sSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO1lBQ25DLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN4QjthQUFNO1lBQ0gsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjtTQUFNO1FBQ0gsT0FBTyxJQUFJLENBQUM7S0FDZjtBQUNMLENBQUM7TUFJWSxTQUFTLEdBQUcsR0FBRztNQUtmLFNBQVMsR0FBRyxHQUFHO1NBS1osYUFBYSxDQUFDLFNBQW1CO0lBQzdDLElBQUksS0FBYyxDQUFDO0lBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUM1QyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLEVBQUU7WUFDMUIsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2IsTUFBTTtTQUNUO2FBQU0sSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQ25DLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7U0FDNUI7S0FDSjtJQUNELElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDUixTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQzdCO0lBRUQsT0FBTyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN4QyxDQUFDO1NBTWUsaUJBQWlCLENBQUMsU0FBbUI7SUFDakQsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUM7QUFDN0MsQ0FBQztTQUtlLGlCQUFpQixDQUFDLE1BQWM7SUFDNUMsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3hDO0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFDckIsQ0FBQztBQUNELElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztTQU1OLGNBQWMsQ0FBQyxNQUFjO0lBQ3pDLElBQUksR0FBRyxHQUFXLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ04sR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNSLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BDLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUMvRDtRQUNELFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUM7S0FDOUI7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7U0FZZSxvQkFBb0IsQ0FDaEMsS0FBaUIsRUFDakIsUUFBZ0IsRUFDaEIsUUFBZ0IsRUFDaEIsUUFBdUUsRUFDdkUsYUFBZ0UsRUFDaEUsYUFBOEQsRUFDOUQsY0FBaUUsRUFDakUsY0FBK0Q7SUFFL0QsTUFBTSxRQUFRLEdBQVcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFdEQsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEUsSUFBSSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFakQsSUFBSSxZQUFzQixDQUFDO0lBQzNCLElBQUksTUFBYyxDQUFDO0lBQ25CLElBQUksYUFBYSxHQUFXLENBQUMsQ0FBQztJQUM5QixNQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuRCxLQUFLLElBQUksQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hDLElBQUksYUFBYSxHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSztZQUFFLE1BQU07UUFDM0QsSUFBSSxjQUFjLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLO1lBQUUsU0FBUztRQUNoRSxZQUFZLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUV6QyxNQUFNLEdBQUcsUUFBUSxDQUFDO1FBRWxCLElBQUksVUFBVSxHQUFHLGFBQWEsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3RFLE9BQU8sVUFBVSxFQUFFO1lBQ2YsSUFBSSxFQUFFLGNBQWMsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO2dCQUMzRCxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQzthQUM5QjtZQUNELE1BQU0sR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDckMsYUFBYSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxJQUFJLGdCQUFnQixJQUFJLGFBQWEsRUFBRTtnQkFDbkMsVUFBVSxHQUFHLGFBQWEsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO2FBQ3JFO2lCQUFNO2dCQUNILFVBQVUsR0FBRyxLQUFLLENBQUM7YUFDdEI7U0FDSjtLQUNKO0FBQ0wsQ0FBQztTQWFlLHNCQUFzQixDQUNsQyxLQUFpQixFQUNqQixRQUFnQixFQUNoQixRQUFnQixFQUNoQixRQUF1RSxFQUN2RSxhQUFnRSxFQUNoRSxhQUE4RCxFQUM5RCxjQUFpRSxFQUNqRSxjQUErRDtJQUUvRCxNQUFNLFFBQVEsR0FBVyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0RCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRSxNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuRCxJQUFJLFlBQXNCLENBQUM7SUFDM0IsSUFBSSxNQUFjLENBQUM7SUFDbkIsWUFBWSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLElBQUksYUFBYSxHQUFXLENBQUMsQ0FBQztJQUM5QixNQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ2xCLElBQUksVUFBVSxHQUFHLGFBQWEsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ3RFLE9BQU8sVUFBVSxFQUFFO1FBQ2YsSUFBSSxFQUFFLGNBQWMsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQzNELEtBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hDLElBQUksYUFBYSxHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSztvQkFBRSxNQUFNO2dCQUMzRCxJQUFJLGNBQWMsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUs7b0JBQUUsU0FBUztnQkFDaEUsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDOUI7U0FDSjtRQUVELE1BQU0sR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDckMsYUFBYSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLGdCQUFnQixJQUFJLGFBQWEsRUFBRTtZQUNuQyxVQUFVLEdBQUcsYUFBYSxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDckU7YUFBTTtZQUNILFVBQVUsR0FBRyxLQUFLLENBQUM7U0FDdEI7S0FDSjtBQUNMLENBQUM7U0FNZSxhQUFhLENBQUMsUUFBbUI7SUFDN0MsTUFBTSxRQUFRLEdBQUdDLGVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDeEYsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQztTQU1lLGFBQWEsQ0FBQyxRQUFtQjtJQUU3QyxNQUFNLFFBQVEsR0FBR0EsZUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO1FBQzFDLElBQUksRUFBRSxPQUFPLFFBQVEsQ0FBQyxRQUFRLEtBQUssUUFBUSxHQUFHLFFBQVEsR0FBRyxRQUFRO0tBQ3BFLENBQUMsQ0FBQztJQUNILE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUM7U0FNZSxnQkFBZ0IsQ0FBQyxRQUFtQjtJQUNoRCxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsUUFBUSxHQUFHLE1BQU0sQ0FBQztBQUMzRCxDQUFDO1NBS2UsS0FBSyxDQUFDLFdBQW1CO0lBQ3JDLE9BQU8sV0FBVyxLQUFLLE1BQU0sQ0FBQztBQUNsQzs7QUM1RllDO0FBQVosV0FBWSxTQUFTO0lBQ2pCLGtDQUFxQixDQUFBO0lBQ3JCLHNDQUF5QixDQUFBO0FBQzdCLENBQUMsRUFIV0EsaUJBQVMsS0FBVEEsaUJBQVMsUUFHcEI7TUFFWSxrQkFBa0I7SUFFM0I7UUFDSSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUM7S0FDL0M7SUFDRCxjQUFjLENBQUMsUUFBbUIsRUFBRSxRQUF1QjtRQUN2RCxJQUFJLE9BQWUsQ0FBQztRQUNwQixJQUFJLE9BQXdCLENBQUM7UUFFN0IsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztRQUN2QyxJQUFJLEtBQWlCLENBQUM7UUFDdEIsSUFBSSxjQUErRCxDQUFDO1FBQ3BFLElBQUksWUFBNkIsQ0FBQztRQUVsQyxNQUFNLFdBQVcsR0FBMEIsRUFBRSxDQUFDO1FBRTlDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hDLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLFlBQVksR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQzVCLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFO29CQUN4QixXQUFXLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDeEQsV0FBVyxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDO2lCQUNwRDtnQkFDRCxJQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsZ0JBQWdCLEtBQUssV0FBVyxDQUFDLFNBQVMsRUFBRTtvQkFDN0UsTUFBTTtpQkFDVDthQUNKO1NBQ0o7UUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUU7WUFDbEQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxJQUFJLFdBQVcsQ0FBQyxTQUFTLEtBQUtBLGlCQUFTLENBQUMsUUFBUSxFQUFFO1lBQzlDLFdBQVcsQ0FBQyxtQkFBbUIsR0FBRyxFQUFTLENBQUM7WUFDNUMsTUFBTSxtQkFBbUIsR0FBeUIsV0FBVyxDQUFDLG1CQUFtQixDQUFDO1lBQ2xGLG1CQUFtQixDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUIsT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFO29CQUM1RixXQUFXLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztpQkFDNUI7cUJBQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtvQkFDL0IsbUJBQW1CLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztpQkFDcEM7cUJBQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLLE1BQU0sRUFBRTtvQkFDN0IsbUJBQW1CLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztpQkFDbkM7Z0JBQ0QsSUFBSSxXQUFXLENBQUMsUUFBUSxJQUFJLG1CQUFtQixDQUFDLFFBQVEsSUFBSSxtQkFBbUIsQ0FBQyxPQUFPO29CQUFFLE1BQU07YUFDbEc7WUFFRCxXQUFXLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztTQUM5QjthQUFNLElBQUksV0FBVyxDQUFDLFNBQVMsS0FBS0EsaUJBQVMsQ0FBQyxVQUFVLEVBQUU7WUFDdkQsV0FBVyxDQUFDLHFCQUFxQixHQUFHLEVBQVMsQ0FBQztZQUM5QyxNQUFNLHFCQUFxQixHQUFHLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQztZQUNoRSxxQkFBcUIsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ3BDLHFCQUFxQixDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7WUFDcEMscUJBQXFCLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUNyQyxXQUFXLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUMzQixXQUFXLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztTQUM1QjtRQUVELE9BQU8sV0FBa0IsQ0FBQztLQUM3QjtJQUNPLGtCQUFrQixDQUFDLFlBQTZCO1FBQ3BELElBQUksQ0FBQyxZQUFZO1lBQUUsT0FBTztRQUMxQixNQUFNLFVBQVUsR0FBSSxZQUFZLENBQUMsQ0FBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6RCxJQUFJLGdCQUF3QixDQUFDO1FBQzdCLElBQUksU0FBaUIsQ0FBQztRQUN0QixJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZCLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBR0EsaUJBQVMsQ0FBQyxVQUFVLEdBQUdBLGlCQUFTLENBQUMsUUFBUSxDQUFDO1NBQ2pGO2FBQU07WUFDSCxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsU0FBUyxHQUFHQSxpQkFBUyxDQUFDLFFBQVEsQ0FBQztTQUNsQztRQUNELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDdkU7SUFLRCxrQkFBa0IsQ0FBQyxXQUF5QixFQUFFLEtBQWlCLEVBQUUsU0FBaUI7UUFFOUUsTUFBTSxZQUFZLEdBQW9CLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzdELElBQUksWUFBWSxJQUFJLFdBQVcsRUFBRTtZQUM3QixJQUFJLGNBQWMsQ0FBQyxnQkFBZ0IsS0FBSyxXQUFXLENBQUMsU0FBUyxFQUFFO2dCQUMzRCxPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7YUFBTTtZQUNILE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0tBQ0o7SUFPRCxhQUFhLENBQUMsV0FBeUIsRUFBRSxLQUFpQixFQUFFLEdBQVc7UUFPbkUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO1lBQ1QsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDZCxNQUFNLE9BQU8sR0FBb0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNsRCxPQUFPLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQztTQUN6QzthQUFNO1lBQ0gsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjtJQU9ELGFBQWEsQ0FBQyxXQUF5QixFQUFFLEtBQWlCLEVBQUUsTUFBYztRQUV0RSxNQUFNLFlBQVksR0FBb0IsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUV4RCxPQUFPLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNwQztJQU9ELGlCQUFpQixDQUFDLFdBQXlCLEVBQUUsS0FBaUIsRUFBRSxRQUFnQjtRQUM1RSxNQUFNLE9BQU8sR0FBb0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQztRQUN2RCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUMvQixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFTRCxpQkFBaUIsQ0FDYixnQkFBbUMsRUFDbkMsS0FBaUIsRUFDakIsTUFBYyxFQUNkLFFBQWdCLEVBQ2hCLGFBQXNCO1FBRXRCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3hGLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUN2QixNQUFNLElBQUksR0FBb0IsS0FBSyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsQ0FBQztRQUN2RCxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuQixPQUFPO1NBQ1Y7UUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekUsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFO1lBQ25CLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDakMsTUFBTSxDQUFDLEdBQUcsQ0FDTiwrREFBK0Q7Z0JBQzNELHFCQUFxQixnQkFBZ0IsQ0FBQyxZQUFZLElBQUk7Z0JBQ3RELGFBQWEsUUFBUSxJQUFJO2dCQUN6QixhQUFhLE1BQU0sSUFBSTtnQkFDdkIsZ0JBQWdCLFNBQVMsQ0FBQyxlQUFlLElBQUk7Z0JBQzdDLGVBQWUsU0FBUyxDQUFDLFVBQVUsSUFBSTtnQkFDdkMsZ0JBQ0ksT0FBTyxXQUFXLENBQUMsS0FBSyxLQUFLLFFBQVEsR0FBRyxXQUFXLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FDbEYsSUFBSSxFQUNSLE9BQU8sQ0FDVixDQUFDO1NBRUw7UUFDRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDO1FBQ3ZDLElBQUksZ0JBQWdCLEdBQVcsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUM7UUFDakUsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBRW5CLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7WUFDdkMsZ0JBQWdCLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztZQUN4RCxnQkFBZ0IsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1NBQ2xDO1FBQ0QsSUFBSSxXQUFXLEdBQVEsZ0JBQWdCLENBQUMsY0FBYyxDQUFDO1FBQ3ZELElBQUksYUFBYSxFQUFFO1lBRWYsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUNqQixnQkFBZ0IsQ0FBQyxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLFdBQVcsQ0FBQztTQUMzRjtRQUVELElBQUksU0FBUyxDQUFDLFlBQVksRUFBRTtZQUN4QixJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1QsTUFBTSxHQUFHLEVBQUUsQ0FBQztnQkFDWixXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQzthQUM3QztZQUNELE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsWUFBWSxDQUFDO1NBQ2pEO2FBQU07WUFDSCxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFlBQVksQ0FBQztTQUNuRDtLQUNKO0lBU0QsbUJBQW1CLENBQ2YsZ0JBQW1DLEVBQ25DLEtBQWlCLEVBQ2pCLE1BQWMsRUFDZCxRQUFnQixFQUNoQixhQUFzQjtRQUV0QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMxRixJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFDdkIsTUFBTSxJQUFJLEdBQW9CLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDdkQsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkIsT0FBTztTQUNWO1FBQ0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRTtZQUNuQixNQUFNLENBQUMsR0FBRyxDQUNOLDBFQUEwRTtnQkFDdEUscUJBQXFCLGdCQUFnQixDQUFDLFlBQVksSUFBSTtnQkFDdEQsYUFBYSxRQUFRLElBQUk7Z0JBQ3pCLGFBQWEsTUFBTSxJQUFJO2dCQUN2QixnQkFBZ0IsU0FBUyxDQUFDLGVBQWUsSUFBSTtnQkFDN0MsZUFBZSxTQUFTLENBQUMsVUFBVSxJQUFJO2dCQUN2QyxnQkFDSSxPQUFPLFdBQVcsQ0FBQyxLQUFLLEtBQUssUUFBUSxHQUFHLFdBQVcsQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUNsRixJQUFJO2dCQUNKLDBFQUEwRSxFQUU5RSxPQUFPLENBQ1YsQ0FBQztTQUNMO1FBQ0QsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUN2QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFO1lBQzVCLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7U0FDbEM7UUFDRCxJQUFJLFNBQVMsQ0FBQyxZQUFZLEVBQUU7WUFDeEIsSUFBSSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNULE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBQ1osZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLENBQUM7YUFDM0Q7WUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLFlBQVksQ0FBQztTQUNqRDthQUFNO1lBQ0gsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxZQUFZLENBQUM7U0FDakU7S0FDSjtJQVFELHFCQUFxQixDQUNqQixnQkFBbUMsRUFDbkMsS0FBaUIsRUFDakIsTUFBYyxFQUNkLFFBQWdCO1FBRWhCLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQztRQUNqRCxJQUFJLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7UUFDOUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNoQixhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ25CLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUM7U0FDN0M7UUFDRCxNQUFNLG1CQUFtQixHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQztRQUM1RCxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9ELElBQUksZUFBdUIsQ0FBQztRQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3pCLGVBQWUsR0FBRyxTQUFTLENBQUMsQ0FBVyxDQUFDO1NBQzNDO1FBQ0QsSUFBSSxDQUFDLGVBQWU7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNsQyxJQUFJLEtBQUssR0FBZ0IsRUFBUyxDQUFDO1FBRW5DLElBQUksYUFBYSxDQUFDLGVBQWUsQ0FBQyxLQUFLLFNBQVMsRUFBRTtZQUM5QyxPQUFPLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUN6QztRQUVELE1BQU0sUUFBUSxHQUFvQixLQUFLLENBQUMsTUFBTSxHQUFHLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDeEIsS0FBSyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBVyxDQUFDO1NBQ3JDO1FBRUQsSUFBSSxTQUFTLEdBQVksS0FBSyxDQUFDO1FBQy9CLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFN0QsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUM7U0FDZjthQUFNO1lBQ0gsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsQ0FBVyxDQUFDO1lBQ3hDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNyQixPQUFPLElBQUksQ0FBQztpQkFDZjtnQkFDRCxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsU0FBUyxHQUFHLElBQUksQ0FBQzthQUNwQjtpQkFBTTtnQkFDSCxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7YUFDakM7U0FDSjtRQUNELEtBQUssQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO1FBRS9CLEtBQUssQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3hDLElBQUksU0FBUyxFQUFFO1lBQ1gsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkQsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdEIsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUNELEtBQUssQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLEtBQUssQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO2FBQU07WUFDSCxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUM7U0FDM0M7UUFFRCxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQzlCLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsdUJBQXVCLENBQ25CLGdCQUFtQyxFQUNuQyxLQUFpQixFQUNqQixNQUFjLEVBQ2QsUUFBZ0I7UUFFaEIsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDO1FBQ2pELElBQUksYUFBYSxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztRQUM5QyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2hCLGFBQWEsR0FBRyxFQUFFLENBQUM7WUFDbkIsZ0JBQWdCLENBQUMsUUFBUSxHQUFHLGFBQWEsQ0FBQztTQUM3QztRQUNELE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQztRQUN2RCxNQUFNLGFBQWEsR0FBb0IsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDL0UsSUFBSSxlQUF1QixDQUFDO1FBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDN0IsZUFBZSxHQUFHLGFBQWEsQ0FBQyxDQUFXLENBQUM7U0FDL0M7UUFDRCxJQUFJLENBQUMsZUFBZTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ2xDLElBQUksYUFBYSxDQUFDLGVBQWUsQ0FBQyxLQUFLLFNBQVMsRUFBRTtZQUM5QyxPQUFPLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUN6QztRQUNELElBQUksS0FBSyxHQUFnQixFQUFTLENBQUM7UUFFbkMsTUFBTSxRQUFRLEdBQW9CLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDO1FBRXpFLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDeEIsS0FBSyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBVyxDQUFDO1NBQ3JDO1FBQ0QsSUFBSSxTQUFTLEdBQVksS0FBSyxDQUFDO1FBRS9CLE1BQU0sUUFBUSxHQUFvQixLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQztRQUV6RSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN2QixPQUFPLElBQUksQ0FBQztTQUNmO2FBQU07WUFFSCxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxDQUFXLENBQUM7WUFDeEMsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDbEMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzdDLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ3JCLE9BQU8sSUFBSSxDQUFDO2lCQUNmO2dCQUNELEtBQUssQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixTQUFTLEdBQUcsSUFBSSxDQUFDO2FBQ3BCO2lCQUFNO2dCQUNILEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQzthQUNqQztTQUNKO1FBQ0QsS0FBSyxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7UUFDL0IsS0FBSyxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFDeEMsSUFBSSxTQUFTLEVBQUU7WUFDWCxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN0QixPQUFPLElBQUksQ0FBQzthQUNmO1lBQ0QsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsS0FBSyxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDckM7YUFBTTtZQUNILEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztTQUMzQztRQUNELGFBQWEsQ0FBQyxlQUFlLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDdkMsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFPRCxpQkFBaUIsQ0FBQyxXQUF5QixFQUFFLEtBQWlCLEVBQUUsTUFBYztRQUUxRSxJQUFJLFdBQVcsQ0FBQyxTQUFTLEtBQUtBLGlCQUFTLENBQUMsUUFBUSxFQUFFO1lBQzlDLE1BQU0sbUJBQW1CLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDO1lBQzVELE1BQU0sV0FBVyxHQUFvQixLQUFLLENBQUMsTUFBTSxHQUFHLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pGLE1BQU0sWUFBWSxHQUFvQixLQUFLLENBQUMsTUFBTSxHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ25GLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDdkQsT0FBTyxLQUFLLENBQUM7YUFDaEI7aUJBQU07Z0JBQ0gsT0FBTyxJQUFJLENBQUM7YUFDZjtTQUNKO2FBQU0sSUFBSSxXQUFXLENBQUMsU0FBUyxLQUFLQSxpQkFBUyxDQUFDLFVBQVUsRUFBRTtZQUN2RCxNQUFNLE9BQU8sR0FBb0IsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdEIsT0FBTyxLQUFLLENBQUM7YUFDaEI7aUJBQU07Z0JBQ0gsT0FBTyxJQUFJLENBQUM7YUFDZjtTQUNKO0tBQ0o7SUFPTSxVQUFVLENBQUMsV0FBOEIsRUFBRSxTQUFzQixFQUFFLFNBQWM7UUFDcEYsSUFBSSxXQUE4QixDQUFDO1FBRW5DLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNaLFNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDL0M7UUFDRCxXQUFXLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM5QyxPQUFPLFdBQVcsQ0FBQztLQUN0QjtJQVFNLGNBQWMsQ0FDakIsV0FBZ0MsRUFDaEMsUUFBbUIsRUFDbkIsV0FBOEI7UUFFOUIsUUFBUSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFJLFFBQVEsQ0FBQyxRQUFtQixDQUFDLFFBQVEsRUFBRSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7UUFDL0csTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU07WUFBRSxPQUFPO1FBRXhDLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7UUFDdkMsTUFBTSxXQUFXLEdBQWlCLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzFFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUU7UUFDOUMsSUFBSSxDQUFDLFdBQVc7WUFBRSxPQUFPLElBQUksQ0FBQztRQUM5QixJQUFJLFNBQWlCLENBQUM7UUFDdEIsSUFBSSxLQUFpQixDQUFDO1FBQ3RCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNqRSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDakUsTUFBTSxjQUFjLEdBQUcsQ0FBQyxLQUFpQixFQUFFLFFBQWdCO1lBQ3ZELE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNoRSxDQUFDO1FBQ0YsTUFBTSxjQUFjLEdBQUcsQ0FBQyxLQUFpQixFQUFFLE1BQWM7WUFDckQsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzlELENBQUM7UUFDRixJQUFJLE9BQXdCLENBQUM7UUFDN0IsV0FBVyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDdEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUU7Z0JBQ3pELFNBQVM7YUFDWjtZQUNELFdBQVcsQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxHQUFHLENBQUMseUJBQXlCLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDakQsSUFBSSxXQUFXLENBQUMsU0FBUyxLQUFLQSxpQkFBUyxDQUFDLFFBQVEsRUFBRTtnQkFDOUMsSUFBSSxZQUFvQixDQUFDO2dCQUV6QixvQkFBb0IsQ0FDaEIsS0FBSyxFQUNMLFdBQVcsQ0FBQyxRQUFRLEVBQ3BCLFdBQVcsQ0FBQyxRQUFRLEVBQ3BCLENBQUMsS0FBSyxFQUFFLE1BQWMsRUFBRSxRQUFnQjtvQkFDcEMsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO29CQUMxQixJQUFJLFlBQVksS0FBSyxRQUFRLEVBQUU7d0JBQzNCLFlBQVksR0FBRyxRQUFRLENBQUM7d0JBQ3hCLGFBQWEsR0FBRyxJQUFJLENBQUM7cUJBQ3hCO29CQUNELE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDO29CQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUN2QixJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO3FCQUMvRTtpQkFDSixFQUNELGFBQWEsRUFDYixhQUFhLEVBQ2IsY0FBYyxFQUNkLGNBQWMsQ0FDakIsQ0FBQzthQUNMO2lCQUFNLElBQUksV0FBVyxDQUFDLFNBQVMsS0FBS0EsaUJBQVMsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZELElBQUksVUFBa0IsQ0FBQztnQkFFdkIsc0JBQXNCLENBQ2xCLEtBQUssRUFDTCxXQUFXLENBQUMsUUFBUSxFQUNwQixXQUFXLENBQUMsUUFBUSxFQUNwQixDQUFDLEtBQUssRUFBRSxNQUFjLEVBQUUsUUFBZ0I7b0JBQ3BDLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQztvQkFDMUIsSUFBSSxVQUFVLEtBQUssTUFBTSxFQUFFO3dCQUN2QixVQUFVLEdBQUcsTUFBTSxDQUFDO3dCQUNwQixhQUFhLEdBQUcsSUFBSSxDQUFDO3FCQUN4QjtvQkFFRCxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDdkIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztxQkFDakY7aUJBQ0osRUFDRCxhQUFhLEVBQ2IsYUFBYSxFQUNiLGNBQWMsRUFDZCxjQUFjLENBQ2pCLENBQUM7YUFDTDtTQUNKO1FBRUQsT0FBTyxXQUFrQixDQUFDO0tBQzdCOzs7QUMzbkJMLE1BQU0sVUFBVSxHQUFHLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxDQUFDO01BQ2xGLDZCQUE2QjtJQU10QyxTQUFTLENBQUMsT0FBd0IsRUFBRSxFQUFnQjtRQUNoRCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7UUFDOUMsSUFBSSxZQUFZLEdBQWtCLGFBQWEsQ0FBQyxZQUFZLENBQUM7UUFDN0QsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUN0RCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLFdBQVcsR0FBMkIsRUFBRSxDQUFDO1FBQzdDLElBQUksYUFBYSxHQUFrQixFQUFFLENBQUM7UUFDdEMsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxXQUE4QixDQUFDO1FBQ25DLElBQUksU0FBaUIsQ0FBQztRQUN0QixJQUFJLFFBQWEsQ0FBQztRQUNsQixJQUFJLGVBQWUsR0FBK0IsRUFBRSxDQUFDO1FBQ3JELE1BQU0sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUM5QyxLQUFLLElBQUksUUFBUSxJQUFJLGNBQWMsRUFBRTtZQUNqQyxXQUFXLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVztnQkFBRSxTQUFTO1lBRXZDLFNBQVMsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztZQUc5QyxRQUFRLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksUUFBUSxFQUFFO2dCQUNWLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDNUQ7aUJBQU07Z0JBQ0gsUUFBUSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7YUFDbkM7WUFDRCxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsUUFBUSxDQUFDO1lBRWxDLElBQUksWUFBWSxDQUFDLGVBQWUsSUFBSSxlQUFlLENBQUMsU0FBUyxDQUFDLEtBQUssU0FBUyxFQUFFO2dCQUMxRSxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEtBQUtBLGlCQUFTLENBQUMsVUFBVSxDQUFDO2dCQUN4RixJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsU0FBUyxLQUFLQSxpQkFBUyxDQUFDLFVBQVUsRUFBRTtvQkFDNUQsa0JBQWtCLElBQUksYUFBYSxHQUFHLFNBQVMsR0FBRyxLQUFLLEdBQUcsTUFBTSxTQUFTLEdBQUcsR0FBRyxLQUFLLENBQUM7aUJBQ3hGO3FCQUFNO29CQUNILGtCQUFrQixJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDN0Q7Z0JBRUQsSUFBSSxZQUFZLENBQUMsV0FBVyxLQUFLLFNBQVM7b0JBQUUsWUFBWSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7Z0JBQzVFLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFO29CQUMzQixJQUFJLENBQUMsNEJBQTRCLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztpQkFDL0U7cUJBQU07b0JBQ0gsZ0JBQWdCLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUM1RDthQUNKO1lBR0QsSUFBSSxZQUFZLENBQUMsd0JBQXdCLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQ2hGO1NBQ0o7UUFDRCxJQUFJLFlBQVksQ0FBQyxlQUFlLEVBQUU7WUFFOUIsSUFBSSxTQUFTLEdBQUcsdUNBQXVDLEdBQUcsS0FBSyxDQUFDO1lBRWhFLGtCQUFrQixHQUFHLFNBQVMsR0FBRyx5QkFBeUIsR0FBRyxLQUFLLEdBQUcsa0JBQWtCLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztZQUV0RyxJQUFJLFlBQVksQ0FBQyxXQUFXLEVBQUU7Z0JBRTFCLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxDQUFDO2dCQUNqRyxNQUFNLGlCQUFpQixHQUFHQyxlQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsR0FBRyxXQUFXLE9BQU8sQ0FBQyxDQUFDO2dCQUN6RixhQUFhLENBQUMsaUJBQWlCLENBQUMsR0FBRztvQkFDL0IsUUFBUSxFQUFFLGlCQUFpQjtvQkFDM0IsSUFBSSxFQUFFLGtCQUFrQixHQUFHLGdCQUFnQjtpQkFDOUMsQ0FBQzthQUNMO2lCQUFNO2dCQUVILE1BQU0sdUJBQXVCLEdBQUdBLGVBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDekYsYUFBYSxDQUFDLHVCQUF1QixDQUFDLEdBQUc7b0JBQ3JDLFFBQVEsRUFBRSx1QkFBdUI7b0JBQ2pDLElBQUksRUFBRSxrQkFBa0I7aUJBQzNCLENBQUM7YUFDTDtTQUNKO1FBR0QsSUFBSSxZQUFZLENBQUMsdUJBQXVCLEVBQUU7WUFDdEMsSUFBSSxrQkFBa0IsR0FBRyxZQUFZLENBQUMsdUJBQXVCLENBQUM7WUFDOUQsSUFBSSxVQUFlLENBQUM7WUFDcEIsSUFBSSxZQUFZLENBQUMsVUFBVSxFQUFFO2dCQUV6QixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUM7Z0JBQzFCLElBQUksUUFBYSxDQUFDO2dCQUNsQixJQUFJLFdBQWdCLENBQUM7Z0JBQ3JCLEtBQUssSUFBSSxTQUFTLElBQUksV0FBVyxFQUFFO29CQUMvQixJQUFJLGVBQWUsQ0FBQyxTQUFTLENBQUMsRUFBRTt3QkFDNUIsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDbkQsU0FBUztxQkFDWjtvQkFDRCxRQUFRLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNsQyxXQUFXLEdBQUcsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3JDLEtBQUssSUFBSSxPQUFPLElBQUksUUFBUSxFQUFFO3dCQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRTs0QkFDekIsV0FBVyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO3lCQUMzRDt3QkFDRCxXQUFXLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7cUJBQzFFO29CQUNELGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUM7aUJBQzNDO2dCQUNELFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQy9DO2lCQUFNO2dCQUNILFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzVDO1lBV0QsSUFBSSxZQUFZLENBQUMsS0FBSyxFQUFFO2dCQUVwQixVQUFVLEdBQUdDLGdCQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDeEM7WUFDRCxhQUFhLENBQUMsa0JBQWtCLENBQUMsR0FBRztnQkFDaEMsUUFBUSxFQUFFLGtCQUFrQjtnQkFDNUIsUUFBUSxFQUFFLE9BQU8sVUFBVSxLQUFLLFFBQVEsR0FBRyxRQUFRLEdBQUcsT0FBTztnQkFDN0QsSUFBSSxFQUFFLFVBQVU7YUFDbkIsQ0FBQztTQUNMO1FBQ0QsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQ3ZCLEtBQUssSUFBSSxHQUFHLElBQUksYUFBYSxFQUFFO2dCQUMzQixPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNuRDtTQUNKO2FBQU07WUFDSCxPQUFPLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztTQUN6QztRQUNELEVBQUUsRUFBRSxDQUFDO0tBQ1I7SUFDTyw0QkFBNEIsQ0FDaEMsTUFBcUIsRUFDckIsV0FBOEIsRUFDOUIsYUFBNEI7UUFHNUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUNsQyxJQUFJLFdBQVcsR0FBV0QsZUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxTQUFTLE9BQU8sQ0FBQyxDQUFDO1FBRXpHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFFN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BELElBQUksTUFBTSxFQUFFO2dCQUNSLGFBQWEsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBUyxDQUFDO2FBQy9FO1NBQ0o7S0FDSjtJQUtPLGtCQUFrQixDQUFDLFdBQThCO1FBQ3JELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO1FBRXBELE1BQU0sbUJBQW1CLEdBQXdCLFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDdEUsSUFBSSxhQUFhLEdBQUcsZUFBZSxHQUFHLFNBQVMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQy9ELElBQUksVUFBdUIsQ0FBQztRQUU1QixJQUFJLGFBQWEsR0FBOEIsRUFBRSxDQUFDO1FBRWxELEtBQUssSUFBSSxNQUFNLElBQUksbUJBQW1CLEVBQUU7WUFDcEMsVUFBVSxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxVQUFVO2dCQUFFLFNBQVM7WUFDMUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUU7Z0JBRTFCLGFBQWEsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDO2dCQUU1RCxhQUFhO29CQUNULGFBQWE7d0JBQ2IsVUFBVSxDQUFDLFNBQVM7d0JBQ3BCLEtBQUs7eUJBQ0osVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0JBQzdFLEdBQUc7d0JBQ0gsS0FBSyxDQUFDO2FBQ2I7aUJBQU07Z0JBQ0gsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDN0IsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztpQkFDbkM7Z0JBR0QsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBRzNFLGFBQWEsQ0FBQyxXQUFXLENBQUM7b0JBQ3RCLGVBQWU7d0JBQ2YsVUFBVSxDQUFDLFlBQVk7d0JBQ3ZCLEtBQUs7eUJBQ0osVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0JBQzdFLEdBQUc7d0JBQ0gsS0FBSyxDQUFDO2FBQ2I7U0FDSjtRQUVELEtBQUssSUFBSSxXQUFXLElBQUksYUFBYSxFQUFFO1lBRW5DLGFBQWEsSUFBSSxhQUFhLEdBQUcsV0FBVyxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNGLGFBQWEsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQ2xDO1FBQ0QsYUFBYSxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFFN0IsT0FBTyxhQUFhLENBQUM7S0FDeEI7SUFPTyw2QkFBNkIsQ0FDakMsTUFBcUIsRUFDckIsV0FBOEIsRUFDOUIsYUFBNEI7UUFFNUIsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztRQUN0QyxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFDdEIsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7UUFDcEQsSUFBSSxrQkFBa0IsR0FBR0EsZUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxTQUFTLE9BQU8sQ0FBQyxDQUFDO1FBQ3pGLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUxRCxJQUFJLG9CQUFvQixHQUFHLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzdELElBQUksb0JBQW9CLEVBQUU7WUFDdEIsb0JBQW9CLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQztTQUM5QzthQUFNO1lBQ0gsb0JBQW9CLEdBQUc7Z0JBQ25CLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLElBQUksRUFBRSxjQUFjO2FBQ3ZCLENBQUM7WUFDRixhQUFhLENBQUMsa0JBQWtCLENBQUMsR0FBRyxvQkFBb0IsQ0FBQztTQUM1RDtLQUNKO0lBQ08sbUJBQW1CLENBQUMsU0FBaUI7UUFDekMsT0FBTyxhQUFhLEdBQUcsU0FBUyxHQUFHLEtBQUssR0FBRyxTQUFTLEdBQUcsS0FBSyxHQUFHLFNBQVMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO0tBQzNGOzs7TUMvUVEsa0JBQWtCO0lBRzNCO1FBQ0ksSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksNkJBQTZCLEVBQUUsQ0FBQztLQUN0RTtJQUNELE9BQU8sQ0FBRSxPQUF3QixFQUFFLEVBQWdCO1FBQy9DLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDdEMsRUFBRSxFQUFFLENBQUM7S0FDUjtJQUVELGFBQWEsQ0FBRSxPQUF3QixFQUFFLEVBQWdCO1FBQ3JELE1BQU0sQ0FBQyxTQUFTLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUMvQyxFQUFFLEVBQUUsQ0FBQztLQUNSO0lBQ0QsT0FBTyxDQUFDLE9BQXdCLEVBQUUsRUFBZ0I7UUFDOUMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDcEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUN0QyxJQUFJLFdBQVcsQ0FBQztRQUNoQixJQUFJLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7UUFDdEMsSUFBSSxRQUFtQixDQUFDO1FBQ3hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDOUIsUUFBUSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLFdBQVcsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2QsV0FBVyxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNqRDtZQUNELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFO2dCQUN2QixXQUFXLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ2xGO1lBQ0QsSUFBSSxXQUFXLEVBQUU7Z0JBQ2IsY0FBYyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxXQUFXLENBQUM7YUFDbkQ7U0FDSjtRQUNELEVBQUUsRUFBRSxDQUFDO0tBQ1I7SUFDRCxZQUFZLENBQUUsT0FBd0IsRUFBRSxFQUFnQjtRQUNwRCxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUM7UUFFL0MsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDdEM7SUFDRCxZQUFZLENBQUMsT0FBd0I7UUFDakMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0tBQ3hEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NDN0JXLFdBQVcsQ0FBQyxhQUFxQixFQUFFLFlBQXlDO0lBQ3hGLElBQUlFLGFBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksYUFBYSxLQUFLLE1BQU0sSUFBSSxhQUFhLEtBQUssTUFBTSxFQUFFO1FBQ2xHLE1BQU0sU0FBUyxHQUFHQSxhQUFFLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hELElBQUksYUFBcUIsQ0FBQztRQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN2QyxhQUFhLEdBQUdGLGVBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELFdBQVcsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDNUM7S0FDSjtTQUFNO1FBQ0gsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQy9CO0FBQ0wsQ0FBQztTQU9lLHdCQUF3QixDQUNwQyxlQUFrQyxFQUNsQyxVQUFrRixFQUNsRixRQUFrQztJQUVsQyxJQUFJLFFBQXlCLENBQUM7SUFDOUIsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUNyQyxJQUFJLGVBQWUsSUFBSSxLQUFLLEVBQUU7UUFDMUIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1osTUFBTSxVQUFVLEdBQUcsQ0FBQyxHQUFHO1lBQ25CLElBQUksR0FBRyxFQUFFO2dCQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQzVCO1lBQ0QsR0FBRyxFQUFFLENBQUM7WUFDTixVQUFVLElBQUksVUFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5RSxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUU7Z0JBQ2QsUUFBUSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMvQjtTQUNKLENBQUM7UUFDRixLQUFLLElBQUksQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbEQsUUFBUSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5QixJQUFJLFFBQVEsQ0FBQyxRQUFRLElBQUlFLGFBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN2REEsYUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDcEM7aUJBQU07Z0JBQ0gsSUFBSUEsYUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUlBLGFBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO29CQUNsRixNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNuRCxTQUFTO2lCQUNaO2dCQUVELElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxJQUFJLE9BQU8sUUFBUSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7b0JBQ3pELFFBQVEsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO2lCQUM5QjtnQkFDREEsYUFBRSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3JDQSxhQUFFLENBQUMsU0FBUyxDQUNSLFFBQVEsQ0FBQyxRQUFRLEVBQ2pCLFFBQVEsQ0FBQyxJQUFJLEVBQ2IsUUFBUSxDQUFDLFFBQVEsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLEdBQUcsU0FBUyxFQUMvRCxVQUFVLENBQ2IsQ0FBQzthQUNMO1NBQ0o7S0FDSjtBQUNMLENBQUM7U0FRZSxrQkFBa0IsQ0FDOUIsR0FBVyxFQUNYLGFBQXNCLEVBQ3RCLFlBQTZEO0lBRTdELE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM3QyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLElBQUksZ0JBQXdCLENBQUM7SUFDN0IsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVE7UUFDdEIsSUFBSSxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxNQUFNLENBQUMsRUFBRTtZQUM5RSxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO1lBQzVCLFlBQVksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDakM7UUFDRCxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDdkIsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDMUQsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsV0FBVyxDQUFDO1lBQzdDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUN0QjtLQUNKLENBQUMsQ0FBQztJQUNILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFDLE9BQU8sUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDdkM7SUFDREEsYUFBRSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3JGLENBQUM7U0FNZSxjQUFjLENBQUMsYUFBcUIsRUFBRSxTQUFjO0lBQ2hFLElBQUksQ0FBQyxhQUFhLEVBQUU7UUFDaEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QyxPQUFPO0tBQ1Y7SUFDREEsYUFBRSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLENBQUM7U0FLZSxZQUFZLENBQUMsYUFBcUI7SUFDOUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtRQUNoQixNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLE9BQU87S0FDVjtJQUNELElBQUksQ0FBQ0EsYUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUMvQkEsYUFBRSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNqQ0EsYUFBRSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7S0FDaEU7SUFDRCxNQUFNLFlBQVksR0FBR0EsYUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDN0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxQyxPQUFPLFFBQVEsQ0FBQztBQUNwQixDQUFDO1NBS2UsY0FBYyxDQUFDLFFBQWdCLEVBQUUsUUFBeUI7SUFDdEUsTUFBTSxJQUFJLEdBQUdBLGFBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2pELElBQUksS0FBSyxHQUFHQyxpQkFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25CLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvQixDQUFDO1NBS2UsZUFBZSxDQUFDLFFBQWdCLEVBQUUsRUFBNEIsRUFBRSxRQUF5QjtJQUNyR0QsYUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUk7UUFDdEMsSUFBSSxLQUFLLEdBQUdDLGlCQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDZCxDQUFDLENBQUM7QUFDUCxDQUFDO1NBTWUsVUFBVSxDQUFDLElBQVM7SUFDaEMsTUFBTSxLQUFLLEdBQUdBLGlCQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkIsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9CLENBQUM7U0FLcUIsZ0JBQWdCLENBQUMsUUFBZ0I7O1FBQ25ELE9BQU8sY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ25DOzs7QUMzS0QsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDO0FBQ2hDLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQztBQUNqQyxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLE1BQU0sY0FBYyxHQUFHLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztTQUtyRixPQUFPLENBQUMsWUFBaUMsRUFBRSxpQkFBZ0M7O1FBRTdGLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWpDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFO1lBQ3hCLFlBQVksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3pDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDO1FBQy9DLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDZixNQUFNLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzVDLE9BQU87U0FDVjtRQUNELElBQUksQ0FBQ0QsYUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDLGFBQWEsWUFBWSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDakQsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUU7WUFDdkIsWUFBWSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUM7U0FDekM7UUFDRCxJQUFJLFdBQVcsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7UUFDM0MsTUFBTSxPQUFPLEdBQW9CO1lBQzdCLGFBQWEsRUFBRSxZQUFZO1lBQzNCLEtBQUssRUFBRTtnQkFDSCxFQUFFLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQztnQkFDdkIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUM7YUFDeEI7U0FDSixDQUFDO1FBRUYsTUFBTSxJQUFJLE9BQU8sQ0FBTyxDQUFDLEdBQUc7WUFDeEIsaUJBQWlCLElBQUksaUJBQWlCLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDaEksQ0FBQyxDQUFDO1FBQ0gsTUFBTSxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNyQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEIsTUFBTSxFQUFFLDJCQUEyQixFQUFFLGdCQUFnQixFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ2xFLE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLE9BQU8sR0FBRyxPQUFPLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7UUFDbkYsTUFBTSxJQUFJLE9BQU8sQ0FBTyxDQUFDLEdBQUc7WUFDeEIsaUJBQWlCLElBQUksaUJBQWlCLENBQUMsYUFBYSxHQUFHLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDbEosQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFHMUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QixJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDN0IsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQyxNQUFNLElBQUksT0FBTyxDQUFPLENBQUMsR0FBRztnQkFDeEIsaUJBQWlCLElBQUksaUJBQWlCLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDaEksQ0FBQyxDQUFDO1lBQ0gsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQyxNQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDNUM7UUFDRCxVQUFVLENBQUMsT0FBTyxFQUFFLDJCQUEyQixFQUFFLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3BGO0NBQUE7QUFZRCxTQUFlLFVBQVUsQ0FDckIsT0FBd0IsRUFDeEIsMkJBQW1DLEVBQ25DLGlCQUErQixFQUMvQixXQUF5QixFQUN6QixNQUFlOztRQUVmLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztRQUU5QyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUU7WUFDeEIsY0FBYyxDQUFDLDJCQUEyQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1NBQy9EO1FBR0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvQixNQUFNLFlBQVksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFDLE1BQU0sSUFBSSxPQUFPLENBQU8sQ0FBQyxHQUFHO1lBQ3hCLGlCQUFpQixJQUFJLGlCQUFpQixDQUFDLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQy9JLENBQUMsQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLFlBQVksR0FBRyxZQUFZLE1BQU0sQ0FBQyxZQUFZLEdBQUcsWUFBWSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7UUFFdkcsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQ3ZCLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7WUFDNUMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVqRCxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFFbkQsTUFBTSxJQUFJLE9BQU8sQ0FBTyxDQUFDLEdBQUc7Z0JBQ3hCLHdCQUF3QixDQUNwQixXQUFXLEVBQ1gsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJO29CQUN2QixNQUFNLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyxJQUFJLEtBQUssUUFBUSxRQUFRLEVBQUUsQ0FBQyxDQUFDO2lCQUM1RCxFQUNEO29CQUNJLEdBQUcsRUFBRSxDQUFDO2lCQUNULENBQ0osQ0FBQzthQUNMLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDN0I7YUFBTTtZQUNILE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDaEM7UUFJRCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7U0FDMUI7UUFDRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDdEIsSUFBSSxjQUFjLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxnQkFBMEIsQ0FBQztZQUN0RSxJQUFJLENBQUMsY0FBYztnQkFBRSxjQUFjLEdBQUcsVUFBVSxDQUFDO1lBQ2pELElBQUksQ0FBQ0YsZUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDbEMsY0FBYyxHQUFHQSxlQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2FBQzlFO1lBRUQsTUFBTSxpQkFBaUIsR0FBb0I7Z0JBQ3ZDLFFBQVEsRUFBRUEsZUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDO2dCQUNoRCxJQUFJLEVBQUUsTUFBTTthQUNmLENBQUM7WUFDRix3QkFBd0IsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztTQUNqRDtRQUVELFdBQVcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFbEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNyQyxNQUFNLE9BQU8sR0FBRyxPQUFPLEdBQUcsU0FBUyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxPQUFPLFFBQVEsT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUM7S0FDM0Q7Q0FBQTtTQUtlLGFBQWEsQ0FBQyxhQUFrQztJQUM1RCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRTtRQUN6QixhQUFhLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUMxQztJQUNELE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUM7SUFDaEQsSUFBSSxDQUFDLFlBQVksRUFBRTtRQUNmLE1BQU0sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsT0FBTztLQUNWO0lBQ0QsSUFBSSxDQUFDRSxhQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFO1FBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxZQUFZLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRCxPQUFPO0tBQ1Y7SUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtRQUN4QixhQUFhLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQztLQUMxQztJQUNELE1BQU0sT0FBTyxHQUFvQixFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQVMsQ0FBQztJQUN6RSxJQUFJLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzlCLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0QixJQUFJLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztJQUN6QyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUU7UUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQ2pDO0lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQywyREFBMkQsQ0FBQyxDQUFDO0lBQ3pFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDMUMsQ0FBQztBQU1BLFNBQVMsWUFBWSxDQUFDLE9BQXdCO0lBQzNDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7SUFDM0MsSUFBSSxnQkFBZ0IsR0FBZ0IsRUFBRSxDQUFDO0lBQ3ZDLElBQUksZUFBZSxHQUFnQixFQUFFLENBQUM7SUFDdEMsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQztJQUMvQyxNQUFNLFdBQVcsR0FBRyxDQUFDLFFBQWdCLEVBQUUsUUFBa0I7UUFDckQsTUFBTSxhQUFhLEdBQUdGLGVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFM0MsSUFBSSxRQUFRLEdBQUcsQ0FBQyxRQUFRLEdBQUdFLGFBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsU0FBUyxDQUFDO1FBRWpFLE1BQU0sUUFBUSxHQUFjO1lBQ3hCLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFFBQVEsRUFBRSxhQUFhLENBQUMsSUFBSTtZQUM1QixXQUFXLEVBQUUsYUFBYSxDQUFDLEdBQUc7WUFDOUIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsUUFBUSxFQUFFLFFBQVE7U0FDckIsQ0FBQztRQUNGLE9BQU8sUUFBUSxDQUFDO0tBQ25CLENBQUM7SUFDRixNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDO0lBRTFDLE1BQU0sU0FBUyxHQUFhRSxzQkFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDOUMsUUFBUSxFQUFFLElBQUk7UUFDZCxTQUFTLEVBQUUsSUFBSTtRQUNmLGtCQUFrQixFQUFFLEtBQUs7UUFDekIsR0FBRyxFQUFFLFlBQVk7S0FDcEIsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxjQUFjLEdBQXdCLEVBQUUsQ0FBQztJQUU3QyxJQUFJLGdCQUFnQixHQUFXLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQztJQUM3RCxJQUFJLDJCQUFtQyxDQUFDO0lBQ3hDLElBQUksUUFBbUIsQ0FBQztJQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRTtRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN2QyxRQUFRLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNuQztLQUNKO1NBQU07UUFDSCxJQUFJLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxnQkFBZ0I7WUFBRSxnQkFBZ0IsR0FBRyxVQUFVLENBQUM7UUFDckQsSUFBSSxDQUFDSixlQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDcEMsZ0JBQWdCLEdBQUdBLGVBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ3pFO1FBQ0QsMkJBQTJCLEdBQUdBLGVBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDekUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUzQixjQUFjLEdBQUcsWUFBWSxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNqQixjQUFjLEdBQUcsRUFBRSxDQUFDO1NBQ3ZCO1FBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QixNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2pELElBQUksZ0JBQXdCLENBQUM7UUFDN0IsSUFBSSxXQUE4QixDQUFDO1FBQ25DLElBQUksUUFBZ0IsQ0FBQztRQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN2QyxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDakMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztZQUNuQyxXQUFXLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsV0FBVyxLQUFLLFdBQVcsS0FBSyxXQUFXLENBQUMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRTtnQkFDM0YsV0FBVyxHQUFHO29CQUNWLFFBQVEsRUFBRSxRQUFRO2lCQUNyQixDQUFDO2dCQUNGLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxXQUFXLENBQUM7Z0JBQ3ZDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO2dCQUM3QixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbkM7WUFFRCxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZCLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxZQUFZLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxXQUFXLENBQUM7Z0JBQzdDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUN0QjtTQUNKO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUMsT0FBTyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxjQUFjLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4RCxlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ3hDO1FBRUQsSUFBSSxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5QixNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztLQUNoRTtJQUNELE9BQU8sQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQzFDLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUM1QyxPQUFPLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztJQUN4QyxPQUFPLENBQUMsMkJBQTJCLEdBQUcsMkJBQTJCLENBQUM7QUFDdEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
