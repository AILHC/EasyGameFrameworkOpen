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

const defaultValueTransFuncMap = {};
defaultValueTransFuncMap["int"] = strToInt;
defaultValueTransFuncMap["string"] = anyToStr;
defaultValueTransFuncMap["[int]"] = strToIntArr;
defaultValueTransFuncMap["[string]"] = strToStrArr;
defaultValueTransFuncMap["json"] = strToJsonObj;
defaultValueTransFuncMap["any"] = anyToAny;
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
    const trimCellValue = cellValue.trim();
    let result = {};
    let arr;
    if (trimCellValue !== "") {
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
        const trimCellValue = cellValue.trim();
        if (trimCellValue !== "") {
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
    const trimCellValue = cellValue.trim();
    let obj;
    let error;
    if (trimCellValue !== "") {
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
function forEachHorizontalSheet(sheet, startRow, startCol, callback, isSheetRowEnd, isSheetColEnd, isSkipSheetRow, isSkipSheetCol) {
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
function forEachVerticalSheet(sheet, startRow, startCol, callback, isSheetRowEnd, isSheetColEnd, isSkipSheetRow, isSkipSheetCol) {
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
    getTableDefine(fileInfo, workBook) {
        let cellKey;
        let cellObj;
        const sheetNames = workBook.SheetNames;
        let sheet;
        let firstCanParseSheet;
        let firstCellValue;
        let firstCellObj;
        const tableDefine = {};
        for (let i = 0; i < sheetNames.length; i++) {
            sheet = workBook.Sheets[sheetNames[i]];
            firstCellObj = sheet["A" + 1];
            if (!isEmptyCell(firstCellObj)) {
                firstCanParseSheet = sheet;
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
            return null;
        }
        if (tableDefine.tableType === exports.TableType.vertical) {
            tableDefine.verticalFieldDefine = {};
            const verticalFieldDefine = tableDefine.verticalFieldDefine;
            verticalFieldDefine.textCol = "A";
            verticalFieldDefine.typeCol = "B";
            verticalFieldDefine.fieldCol = "C";
            tableDefine.startCol = "D";
            tableDefine.startRow = 2;
        }
        else if (tableDefine.tableType === exports.TableType.horizontal) {
            tableDefine.horizontalFieldDefine = {};
            const horizontalFieldDefine = tableDefine.horizontalFieldDefine;
            horizontalFieldDefine.textRow = 1;
            for (let i = 1; i < 100; i++) {
                cellKey = "A" + i;
                cellObj = firstCanParseSheet[cellKey];
                if (isEmptyCell(cellObj) || cellObj.v === "NO" || cellObj.v === "END" || cellObj.v === "START") {
                    tableDefine.startRow = i;
                }
                else if (cellObj.v === "CLIENT") {
                    horizontalFieldDefine.fieldRow = i;
                }
                else if (cellObj.v === "TYPE") {
                    horizontalFieldDefine.typeRow = i;
                }
                if (tableDefine.startRow && horizontalFieldDefine.fieldRow && horizontalFieldDefine.typeRow)
                    break;
            }
            tableDefine.startCol = "B";
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
            tableType = cellValues[0] === "V" ? exports.TableType.vertical : exports.TableType.horizontal;
        }
        else {
            tableNameInSheet = cellValues[0];
            tableType = exports.TableType.horizontal;
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
    parseHorizontalCell(valueTransFuncMap, tableParseResult, sheet, colKey, rowIndex, isNewRowOrCol) {
        const fieldInfo = this.getHorizontalTableField(tableParseResult, sheet, colKey, rowIndex);
        if (!fieldInfo)
            return;
        const cell = sheet[colKey + rowIndex];
        if (isEmptyCell(cell)) {
            return;
        }
        const transResult = this.transValue(valueTransFuncMap, tableParseResult, fieldInfo, cell.v);
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
    parseVerticalCell(valueTransFuncMap, tableParseResult, sheet, colKey, rowIndex, isNewRowOrCol) {
        const fieldInfo = this.getVerticalTableField(tableParseResult, sheet, colKey, rowIndex);
        if (!fieldInfo)
            return;
        const cell = sheet[colKey + rowIndex];
        if (isEmptyCell(cell)) {
            return;
        }
        const transResult = this.transValue(valueTransFuncMap, tableParseResult, fieldInfo, cell.v);
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
    getHorizontalTableField(tableParseResult, sheet, colKey, rowIndex) {
        const tableDefine = tableParseResult.tableDefine;
        let tableFieldMap = tableParseResult.fieldMap;
        if (!tableFieldMap) {
            tableFieldMap = {};
            tableParseResult.fieldMap = tableFieldMap;
        }
        const horizontalFieldDefine = tableDefine.horizontalFieldDefine;
        const fieldCell = sheet[colKey + horizontalFieldDefine.fieldRow];
        let originFieldName;
        if (!isEmptyCell(fieldCell)) {
            originFieldName = fieldCell.v;
        }
        if (!originFieldName)
            return null;
        let field = {};
        if (tableFieldMap[originFieldName] !== undefined) {
            return tableFieldMap[originFieldName];
        }
        const textCell = sheet[colKey + horizontalFieldDefine.textRow];
        if (!isEmptyCell(textCell)) {
            field.text = textCell.v;
        }
        let isObjType = false;
        const typeCell = sheet[colKey + horizontalFieldDefine.typeRow];
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
        tableFieldMap[originFieldName] = field;
        return field;
    }
    getVerticalTableField(tableParseResult, sheet, colKey, rowIndex) {
        const tableDefine = tableParseResult.tableDefine;
        let tableFieldMap = tableParseResult.fieldMap;
        if (!tableFieldMap) {
            tableFieldMap = {};
            tableParseResult.fieldMap = tableFieldMap;
        }
        const verticalFieldDefine = tableDefine.verticalFieldDefine;
        const fieldNameCell = sheet[verticalFieldDefine.fieldCol + rowIndex];
        let originFieldName;
        if (!isEmptyCell(fieldNameCell)) {
            originFieldName = fieldNameCell.v;
        }
        if (!originFieldName)
            return null;
        if (tableFieldMap[originFieldName] !== undefined) {
            return tableFieldMap[originFieldName];
        }
        let field = {};
        const textCell = sheet[verticalFieldDefine.textCol + rowIndex];
        if (!isEmptyCell(textCell)) {
            field.text = textCell.v;
        }
        let isObjType = false;
        const typeCell = sheet[verticalFieldDefine.typeCol + rowIndex];
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
        tableFieldMap[originFieldName] = field;
        return field;
    }
    checkColNeedParse(tableDefine, sheet, colKey) {
        if (tableDefine.tableType === exports.TableType.vertical) {
            const cellObj = sheet[colKey + 1];
            if (isEmptyCell(cellObj)) {
                return false;
            }
            else {
                return true;
            }
        }
        else if (tableDefine.tableType === exports.TableType.horizontal) {
            const horizontalFieldDefine = tableDefine.horizontalFieldDefine;
            const typeCellObj = sheet[colKey + horizontalFieldDefine.typeRow];
            const fieldCellObj = sheet[colKey + horizontalFieldDefine.fieldRow];
            if (isEmptyCell(typeCellObj) || isEmptyCell(fieldCellObj)) {
                return false;
            }
            else {
                return true;
            }
        }
    }
    transValue(valueTransFuncMap, parseResult, fieldItem, cellValue) {
        let transResult;
        let transFunc = valueTransFuncMap[fieldItem.type];
        if (!transFunc) {
            transFunc = valueTransFuncMap["json"];
        }
        transResult = transFunc(fieldItem, cellValue);
        return transResult;
    }
    parseTableFile(convertConfig, fileInfo, parseResult) {
        var _a;
        fileInfo.fileData = isCSV(fileInfo.fileExtName) ? fileInfo.fileData.toString() : fileInfo.fileData;
        const workbook = readTableData(fileInfo);
        if (!workbook.SheetNames.length)
            return;
        let valueTransFuncMap = (_a = convertConfig === null || convertConfig === void 0 ? void 0 : convertConfig.parserConfig) === null || _a === void 0 ? void 0 : _a.customValueTransFuncMap;
        if (!valueTransFuncMap) {
            valueTransFuncMap = defaultValueTransFuncMap;
        }
        else {
            valueTransFuncMap = Object.assign(valueTransFuncMap, defaultValueTransFuncMap);
        }
        const sheetNames = workbook.SheetNames;
        const tableDefine = this.getTableDefine(fileInfo, workbook);
        if (!tableDefine) {
            Logger.log(`表格不规范,跳过解析,路径:${fileInfo.filePath}`, "warn");
            return;
        }
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
            if (tableDefine.tableType === exports.TableType.horizontal) {
                let lastRowIndex;
                forEachHorizontalSheet(sheet, tableDefine.startRow, tableDefine.startCol, (sheet, colKey, rowIndex) => {
                    let isNewRowOrCol = false;
                    if (lastRowIndex !== rowIndex) {
                        lastRowIndex = rowIndex;
                        isNewRowOrCol = true;
                    }
                    cellObj = sheet[colKey + rowIndex];
                    this.parseHorizontalCell(valueTransFuncMap, parseResult, sheet, colKey, rowIndex, isNewRowOrCol);
                }, isSheetRowEnd, isSheetColEnd, isSkipSheetRow, isSkipSheetCol);
            }
            else if (tableDefine.tableType === exports.TableType.vertical) {
                let lastColKey;
                forEachVerticalSheet(sheet, tableDefine.startRow, tableDefine.startCol, (sheet, colKey, rowIndex) => {
                    let isNewRowOrCol = false;
                    if (lastColKey !== colKey) {
                        lastColKey = colKey;
                        isNewRowOrCol = true;
                    }
                    cellObj = sheet[colKey + rowIndex];
                    if (!isEmptyCell(cellObj)) {
                        this.parseVerticalCell(valueTransFuncMap, parseResult, sheet, colKey, rowIndex, isNewRowOrCol);
                    }
                }, isSheetRowEnd, isSheetColEnd, isSkipSheetRow, isSkipSheetCol);
            }
        }
        return parseResult;
    }
}

const defaultTypeStrMap = { int: "number", json: "any", "[int]": "number[]", "[string]": "string[]" };
class DefaultParseResultTransformer {
    transform(context, cb) {
        const convertConfig = context.convertConfig;
        const parseResultMap = context.parseResultMap;
        let outputConfig = convertConfig.outputConfig;
        if (!outputConfig) {
            console.error(`导出配置outputConfig is undefind`);
            return;
        }
        let typeStrMap = defaultTypeStrMap;
        if (outputConfig.customTypeStrMap) {
            typeStrMap = Object.assign(defaultTypeStrMap, outputConfig.customTypeStrMap);
        }
        let tableObjMap = {};
        let tableFieldInfoMap = {};
        let fieldInfoMap;
        let outputFileMap = {};
        let tableTypeMapDtsStr = "";
        let tableTypeDtsStrs = "";
        let parseResult;
        let tableName;
        let tableObj;
        let isObjTypeTableMap = {};
        Logger.log(`[outputTransform |转换解析结果]请稍等...`);
        for (let filePath in parseResultMap) {
            parseResult = parseResultMap[filePath];
            if (!parseResult.tableDefine || !parseResult.tableObj)
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
            fieldInfoMap = tableFieldInfoMap[tableName];
            if (fieldInfoMap) {
                fieldInfoMap = Object.assign(fieldInfoMap, parseResult.fieldMap);
            }
            else {
                fieldInfoMap = parseResult.fieldMap;
            }
            tableFieldInfoMap[tableName] = fieldInfoMap;
            if (outputConfig.clientDtsOutDir && isObjTypeTableMap[tableName] === undefined) {
                isObjTypeTableMap[tableName] = parseResult.tableDefine.tableType === exports.TableType.vertical;
                if (parseResult.tableDefine.tableType === exports.TableType.vertical) {
                    tableTypeMapDtsStr += "\treadonly " + tableName + "?: " + `IT_${tableName};` + osEol;
                }
                else {
                    tableTypeMapDtsStr += this._getOneTableTypeStr(tableName);
                }
            }
        }
        for (let tableName in tableObjMap) {
            if (outputConfig.clientSingleTableJsonDir) {
                this._addSingleTableJsonOutputFile(outputConfig, tableName, tableObjMap[tableName], outputFileMap);
            }
            if (outputConfig.isBundleDts === undefined)
                outputConfig.isBundleDts = true;
            if (!outputConfig.isBundleDts) {
                this._addSingleTableDtsOutputFile(outputConfig, tableName, tableFieldInfoMap[tableName], outputFileMap);
            }
            else {
                tableTypeDtsStrs += this._getSingleTableDts(typeStrMap, tableName, tableFieldInfoMap[tableName]);
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
                    if (isObjTypeTableMap[tableName]) {
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
    _addSingleTableDtsOutputFile(config, tableName, colKeyTableFieldMap, outputFileMap) {
        let dtsFilePath = path__namespace.join(config.clientDtsOutDir, `${tableName}.d.ts`);
        let typeStrMap = defaultTypeStrMap;
        if (config.customTypeStrMap) {
            typeStrMap = Object.assign(defaultTypeStrMap, config.customTypeStrMap);
        }
        if (!outputFileMap[dtsFilePath]) {
            const dtsStr = this._getSingleTableDts(typeStrMap, tableName, colKeyTableFieldMap);
            if (dtsStr) {
                outputFileMap[dtsFilePath] = { filePath: dtsFilePath, data: dtsStr };
            }
        }
    }
    _getSingleTableDts(typeStrMap, tableName, tableFieldMap) {
        let itemInterface = "interface IT_" + tableName + " {" + osEol;
        let tableField;
        let objTypeStrMap = {};
        for (let originFieldName in tableFieldMap) {
            tableField = tableFieldMap[originFieldName];
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
    _addSingleTableJsonOutputFile(config, tableName, tableObj, outputFileMap) {
        if (!tableObj)
            return;
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
            parseResult = tableParser.parseTableFile(convertConfig, fileInfo, parseResult);
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
const defaultPattern = ["./**/*.xlsx", "./**/*.csv"];
const needIgnorePattern = ["!**/~$*.*", "!**/~.*.*", "!.git/**/*", "!.svn/**/*"];
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
        if (!fs__namespace.existsSync(tableFileDir)) {
            Logger.log(`配置表文件夹不存在：${tableFileDir}`, "error");
            return;
        }
        if (!converConfig.pattern) {
            converConfig.pattern = defaultPattern;
        }
        converConfig.pattern = converConfig.pattern.concat(needIgnorePattern);
        let convertHook = new DefaultConvertHook();
        const context = {
            convertConfig: converConfig,
            utils: {
                fs: require("fs-extra"),
                xlsx: require("xlsx")
            }
        };
        const customConvertHook = converConfig.customConvertHook;
        yield new Promise((res) => {
            customConvertHook && customConvertHook.onStart
                ? customConvertHook.onStart(context, res)
                : convertHook.onStart(context, res);
        });
        const predoT1 = new Date().getTime();
        getFileInfos(context);
        const { parseResultMapCacheFilePath, changedFileInfos } = context;
        const predoT2 = new Date().getTime();
        Logger.systemLog(`[预处理数据时间:${predoT2 - predoT1}ms,${(predoT2 - predoT1) / 1000}]`);
        yield new Promise((res) => {
            customConvertHook && customConvertHook.onParseBefore
                ? customConvertHook.onParseBefore(context, res)
                : convertHook.onParseBefore(context, res);
        });
        Logger.systemLog(`[开始解析]:数量[${changedFileInfos.length}]`);
        Logger.systemLog(`[解析]`);
        if (changedFileInfos.length > 0) {
            const t1 = new Date().getTime();
            yield new Promise((res) => {
                customConvertHook && customConvertHook.onParse
                    ? customConvertHook.onParse(context, res)
                    : convertHook.onParse(context, res);
            });
            const t2 = new Date().getTime();
            Logger.systemLog(`[解析时间]:${t2 - t1}`);
        }
        onParseEnd(context, parseResultMapCacheFilePath, customConvertHook, convertHook);
    });
}
function onParseEnd(context, parseResultMapCacheFilePath, customConvertHook, convertHook, logStr) {
    return __awaiter(this, void 0, void 0, function* () {
        const convertConfig = context.convertConfig;
        if (convertConfig.useCache) {
            writeCacheData(parseResultMapCacheFilePath, context.cacheData);
        }
        Logger.systemLog(`开始进行转换解析结果`);
        const parseAfterT1 = new Date().getTime();
        yield new Promise((res) => {
            customConvertHook && customConvertHook.onParseAfter
                ? customConvertHook.onParseAfter(context, res)
                : convertHook.onParseAfter(context, res);
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
        customConvertHook && customConvertHook.onConvertEnd
            ? customConvertHook.onConvertEnd(context)
            : convertHook.onConvertEnd(context);
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
    const filePaths = context.changedFileInfos.map((value) => {
        return value.filePath;
    });
    console.log(filePaths);
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
    let cacheData;
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
        cacheData = getCacheData(parseResultMapCacheFilePath);
        console.log(__dirname);
        const packageJson = getCacheData(path__namespace.join(__dirname, "../../../package.json"));
        if (!cacheData.version || cacheData.version !== packageJson.version) {
            Logger.systemLog(`工具版本不一致，缓存失效 => cacheVersion:${cacheData.version},toolVersion:${packageJson.version}`);
            parseResultMap = {};
        }
        else {
            parseResultMap = cacheData.parseResultMap;
        }
        if (!parseResultMap) {
            parseResultMap = {};
        }
        cacheData.parseResultMap = parseResultMap;
        cacheData.version = packageJson.version;
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
    context.cacheData = cacheData;
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
exports.defaultValueTransFuncMap = defaultValueTransFuncMap;
exports.forEachChangedFile = forEachChangedFile;
exports.forEachFile = forEachFile;
exports.forEachHorizontalSheet = forEachHorizontalSheet;
exports.forEachVerticalSheet = forEachVerticalSheet;
exports.getCacheData = getCacheData;
exports.getCharCodeSum = getCharCodeSum;
exports.getFileMd5 = getFileMd5;
exports.getFileMd5Async = getFileMd5Async;
exports.getFileMd5ByPath = getFileMd5ByPath;
exports.getFileMd5Sync = getFileMd5Sync;
exports.getNextColKey = getNextColKey;
exports.getTableFileType = getTableFileType;
exports.isCSV = isCSV;
exports.isEmptyCell = isEmptyCell;
exports.readTableData = readTableData;
exports.readTableFile = readTableFile;
exports.stringToCharCodes = stringToCharCodes;
exports.testFileMatch = testFileMatch;
exports.writeCacheData = writeCacheData;
exports.writeOrDeleteOutPutFiles = writeOrDeleteOutPutFiles;

    
//# sourceMappingURL=index.js.map
