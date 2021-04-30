import * as xlsx from "xlsx";
import { valueTransFuncMap } from "./default-value-func-map";
import { Logger } from "./loger";
import { horizontalForEachSheet, isEmptyCell, readTableFile, verticalForEachSheet } from "./table-utils";

declare global {
    interface ITableField {
        /**配置表中注释值 */
        text: string;
        /**配置表中类型值 */
        originType: string;
        /**配置表中字段名值 */
        originFieldName: string;
        /**解析后的类型值 */
        type?: string;
        /**解析后的子类型值 */
        subType?: string;
        /**解析后的字段名值 */
        fieldName?: string;
        /**对象的子字段名 */
        subFieldName?: string;
        /**多列对象 */
        isMutiColObj?: boolean;
    }
    interface ITableDefine {
        /**配置表名 */
        tableName: string;
        /**配置表类型 默认两种: vertical 和 horizontal*/
        tableType: string;

        /**开始行从1开始 */
        startRow: number;
        /**开始列从A开始 */
        startCol: string;
        /**垂直解析字段定义 */
        verticalFieldDefine: IVerticalFieldDefine;
        /**横向解析字段定义 */
        horizontalFieldDefine: IHorizontalFieldDefine;
    }
    interface IHorizontalFieldDefine {
        /**类型行 */
        typeCol: string;
        /**字段名行 */
        fieldCol: string;
        /**注释行 */
        textCol: string;
    }
    interface IVerticalFieldDefine {
        /**类型行 */
        typeRow: number;
        /**字段名行 */
        fieldRow: number;
        /**注释行 */
        textRow: number;
    }
    /**
     * 字段字典
     * key是列colKey
     * value是字段对象
     */
    type ColKeyTableFieldMap = { [key: string]: ITableField };

    /**
     * 表格的一行或者一列
     * key为字段名值，value为表格的一格
     */
    type TableRowOrCol = { [key: string]: ITableCell };
    /**
     * 表格的一格
     */
    interface ITableCell {
        /**字段对象 */
        filed: ITableField;
        /**值 */
        value: any;
    }
    /**
     * 表格行或列的字典
     * key为行索引，value为表格的一行
     */
    type TableRowOrColMap = { [key: string]: TableRowOrCol };
    /**
     * 表格行或列值数组
     * key主键，value是值数组
     */
    type RowOrColValuesMap = { [key: string]: any[] };
    interface ITableValues {
        /**字段名数组 */
        fields: string[];
        /**表格值数组 */
        rowOrColValuesMap: RowOrColValuesMap;
    }
    /**
     * 解析结果
     */
    interface ITableParseResult {
        /**配置表定义 */
        tableDefine?: ITableDefine;
        /**当前分表名 */
        curSheetName?: string;
        /**字段字典 */
        filedMap?: ColKeyTableFieldMap;
        // /**表格行或列的字典 */
        // rowOrColMap: TableRowOrColMap
        /**单个表格对象 */
        /**key是主键值，value是一行对象 */
        tableObj?: { [key: string]: any };
        /**当前行或列对象 */
        curRowOrColObj?: any;
        /**主键值 */
        mainKeyFieldName?: string;
    }

    /**值转换方法 */
    interface ITransValueResult {
        error?: any;
        value?: any;
    }
    type ValueTransFunc = (fieldItem: ITableField, cellValue: any) => ITransValueResult;
    /**
     * 值转换方法字典
     * key是类型key
     * value是方法
     */
    type ValueTransFuncMap = { [key: string]: ValueTransFunc };
}
export enum TableType {
    vertical = "vertical",
    horizontal = "horizontal"
}

export class DefaultParseHandler implements ITableParseHandler {
    private _valueTransFuncMap: ValueTransFuncMap;
    constructor() {
        this._valueTransFuncMap = valueTransFuncMap;
    }
    getTableDefine(fileInfo: IFileInfo, workBook: xlsx.WorkBook): ITableDefine {
        //取表格文件名为表格名
        const tableName = fileInfo.fileName;

        const tableDefine: Partial<ITableDefine> = {
            tableName: tableName
        };

        let cellKey: string;
        let cellObj: xlsx.CellObject;
        //取第一个表
        const sheetNames = workBook.SheetNames;
        let sheet: xlsx.Sheet;
        let firstCellValue: { tableNameInSheet: string; tableType: string };
        let firstCellObj: xlsx.CellObject;
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
        if (tableDefine.tableType === TableType.vertical) {
            tableDefine.verticalFieldDefine = {} as any;
            const verticalFieldDefine: IVerticalFieldDefine = tableDefine.verticalFieldDefine;
            verticalFieldDefine.textRow = 1;
            for (let i = 1; i < 100; i++) {
                cellKey = "A" + i;
                cellObj = sheet[cellKey];
                if (isEmptyCell(cellObj) || cellObj.v === "NO" || cellObj.v === "END" || cellObj.v === "START") {
                    tableDefine.startRow = i;
                } else if (cellObj.v === "CLIENT") {
                    verticalFieldDefine.fieldRow = i;
                } else if (cellObj.v === "TYPE") {
                    verticalFieldDefine.typeRow = i;
                }
                if (tableDefine.startRow && verticalFieldDefine.fieldRow && verticalFieldDefine.typeRow) break;
            }

            tableDefine.startCol = "B";
        } else if (tableDefine.tableType === TableType.horizontal) {
            tableDefine.horizontalFieldDefine = {} as any;
            const horizontalFieldDefine = tableDefine.horizontalFieldDefine;
            horizontalFieldDefine.textCol = "A";
            horizontalFieldDefine.typeCol = "B";
            horizontalFieldDefine.fieldCol = "C";
            tableDefine.startCol = "E";
            tableDefine.startRow = 2;
        }

        return tableDefine as any;
    }
    private _getFirstCellValue(firstCellObj: xlsx.CellObject) {
        if (!firstCellObj) return;
        const cellValues = (firstCellObj.v as string).split(":");
        let tableNameInSheet: string;
        let tableType: string;
        if (cellValues.length > 1) {
            tableNameInSheet = cellValues[1];
            tableType = cellValues[0] === "H" ? TableType.horizontal : TableType.vertical;
        } else {
            tableNameInSheet = cellValues[0];
            tableType = TableType.vertical;
        }
        return { tableNameInSheet: tableNameInSheet, tableType: tableType };
    }
    /**
     * 判断表格是否能解析
     * @param sheet
     */
    checkSheetCanParse(tableDefine: ITableDefine, sheet: xlsx.Sheet, sheetName: string): boolean {
        //如果这个表个第一格值不等于表名，则不解析
        const firstCellObj: xlsx.CellObject = sheet["A" + 1];
        const firstCellValue = this._getFirstCellValue(firstCellObj);
        if (firstCellObj && tableDefine) {
            if (firstCellValue.tableNameInSheet !== tableDefine.tableName) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    }
    /**
     * 表行结束判断
     * @param tableDefine
     * @param sheet
     * @param row
     */
    isSheetRowEnd(tableDefine: ITableDefine, sheet: xlsx.Sheet, row: number): boolean {
        // if (tableDefine.tableType === TableType.vertical) {

        // } else if (tableDefine.tableType === TableType.horizontal) {

        // }
        //判断上一行的标志是否为END
        if (row > 1) {
            row = row - 1;
            const cellObj: xlsx.CellObject = sheet["A" + row];
            return cellObj && cellObj.v === "END";
        } else {
            return false;
        }
    }
    /**
     * 表列结束判断
     * @param tableDefine
     * @param sheet
     * @param colKey
     */
    isSheetColEnd(tableDefine: ITableDefine, sheet: xlsx.Sheet, colKey: string): boolean {
        //判断这一列第一行是否为空
        const firstCellObj: xlsx.CellObject = sheet[colKey + 1];
        // const typeCellObj: xlsx.CellObject = sheet[colKey + tableFile.tableDefine.typeRow];
        return isEmptyCell(firstCellObj);
    }
    /**
     * 检查行是否需要解析
     * @param tableDefine
     * @param sheet
     * @param rowIndex
     */
    checkRowNeedParse(tableDefine: ITableDefine, sheet: xlsx.Sheet, rowIndex: number): boolean {
        const cellObj: xlsx.CellObject = sheet["A" + rowIndex];
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
    parseVerticalCell(
        tableParseResult: ITableParseResult,
        sheet: xlsx.Sheet,
        colKey: string,
        rowIndex: number,
        isNewRowOrCol: boolean
    ): void {
        const fieldInfo = this.getVerticalTableField(tableParseResult, sheet, colKey, rowIndex);
        if (!fieldInfo) return;
        const cell: xlsx.CellObject = sheet[colKey + rowIndex];
        if (isEmptyCell(cell)) {
            return;
        }

        const transResult = this.transValue(tableParseResult, fieldInfo, cell.v);
        if (transResult.error) {
            Logger.log(
                `!!!!!!!!!!!!!!!!!![-----解析错误-----]!!!!!!!!!!!!!!!!!!!!!!!!!\n` +
                    `[sheetName|分表名]=> ${tableParseResult.curSheetName}\n` +
                    `[row|行]=> ${rowIndex}\n` +
                    `[col|列]=> ${colKey}\n` +
                    `[field|字段]=> ${fieldInfo.originFieldName}\n` +
                    `[type|类型]=> ${fieldInfo.originType}\n` +
                    `[error|错误]=> ${
                        typeof transResult.error === "string" ? transResult.error : transResult.error.message
                    }\n`,
                "error"
            );
            // Logger.log(transResult.error, "error");
        }
        const transedValue = transResult.value;
        let mainKeyFieldName: string = tableParseResult.mainKeyFieldName;
        if (!mainKeyFieldName) {
            //第一个字段就是主键
            mainKeyFieldName = fieldInfo.fieldName;
            tableParseResult.mainKeyFieldName = fieldInfo.fieldName;
            tableParseResult.tableObj = {};
        }
        let rowOrColObj: any = tableParseResult.curRowOrColObj;
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
        } else {
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
    parseHorizontalCell(
        tableParseResult: ITableParseResult,
        sheet: xlsx.Sheet,
        colKey: string,
        rowIndex: number,
        isNewRowOrCol: boolean
    ): void {
        const fieldInfo = this.getHorizontalTableField(tableParseResult, sheet, colKey, rowIndex);
        if (!fieldInfo) return;
        const cell: xlsx.CellObject = sheet[colKey + rowIndex];
        if (isEmptyCell(cell)) {
            return;
        }
        const transResult = this.transValue(tableParseResult, fieldInfo, cell.v);
        if (transResult.error) {
            Logger.log(
                `!!!!!!!!!!!!!!!!!![-----解析错误-----]!!!!!!!!!!!!!!!!!!!!!!!!!\n` +
                    `[sheetName|分表名]=> ${tableParseResult.curSheetName}\n` +
                    `[row|行]=> ${rowIndex}\n` +
                    `[col|列]=> ${colKey}\n` +
                    `[field|字段]=> ${fieldInfo.originFieldName}\n` +
                    `[type|类型]=> ${fieldInfo.originType}\n` +
                    `[error|错误]=> ${
                        typeof transResult.error === "string" ? transResult.error : transResult.error.message
                    }\n`,
                "error"
            );
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
        } else {
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
    getVerticalTableField(
        tableParseResult: ITableParseResult,
        sheet: xlsx.Sheet,
        colKey: string,
        rowIndex: number
    ): ITableField {
        const tableDefine = tableParseResult.tableDefine;
        let tableFiledMap = tableParseResult.filedMap;
        if (!tableFiledMap) {
            tableFiledMap = {};
            tableParseResult.filedMap = tableFiledMap;
        }
        const verticalFieldDefine = tableDefine.verticalFieldDefine;
        const filedCell = sheet[colKey + verticalFieldDefine.fieldRow];
        let originFieldName: string;
        if (!isEmptyCell(filedCell)) {
            originFieldName = filedCell.v as string;
        }
        if (!originFieldName) return null;
        let field: ITableField = {} as any;
        //缓存
        if (tableFiledMap[originFieldName] !== undefined) {
            return tableFiledMap[originFieldName];
        }
        //注释
        const textCell: xlsx.CellObject = sheet[colKey + verticalFieldDefine.textRow];
        if (!isEmptyCell(textCell)) {
            field.text = textCell.v as string;
        }
        //类型
        let isObjType: boolean = false;
        const typeCell = sheet[colKey + verticalFieldDefine.typeRow];

        if (isEmptyCell(typeCell)) {
            return null;
        } else {
            field.originType = typeCell.v as string;
            if (field.originType.includes("mf:")) {
                const typeStrs = field.originType.split(":");
                if (typeStrs.length < 3) {
                    return null;
                }
                field.type = typeStrs[2];
                isObjType = true;
            } else {
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
        } else {
            field.fieldName = field.originFieldName;
        }

        tableFiledMap[colKey] = field;
        return field;
    }
    getHorizontalTableField(
        tableParseResult: ITableParseResult,
        sheet: xlsx.Sheet,
        colKey: string,
        rowIndex: number
    ): ITableField {
        const tableDefine = tableParseResult.tableDefine;
        let tableFiledMap = tableParseResult.filedMap;
        if (!tableFiledMap) {
            tableFiledMap = {};
            tableParseResult.filedMap = tableFiledMap;
        }
        const hFieldDefine = tableDefine.horizontalFieldDefine;
        const fieldNameCell: xlsx.CellObject = sheet[hFieldDefine.fieldCol + rowIndex];
        let originFieldName: string;
        if (!isEmptyCell(fieldNameCell)) {
            originFieldName = fieldNameCell.v as string;
        }
        if (!originFieldName) return null;
        if (tableFiledMap[originFieldName] !== undefined) {
            return tableFiledMap[originFieldName];
        }
        let field: ITableField = {} as any;

        const textCell: xlsx.CellObject = sheet[hFieldDefine.textCol + rowIndex];
        //注释
        if (!isEmptyCell(textCell)) {
            field.text = textCell.v as string;
        }
        let isObjType: boolean = false;
        //类型
        const typeCell: xlsx.CellObject = sheet[hFieldDefine.typeCol + rowIndex];

        if (isEmptyCell(typeCell)) {
            return null;
        } else {
            //处理类型
            field.originType = typeCell.v as string;
            if (field.originType.includes("mf:")) {
                const typeStrs = field.originType.split(":");
                if (typeStrs.length < 3) {
                    return null;
                }
                field.type = typeStrs[2];
                isObjType = true;
            } else {
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
        } else {
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
    checkColNeedParse(tableDefine: ITableDefine, sheet: xlsx.Sheet, colKey: string): boolean {
        // 如果类型或者则不需要解析
        if (tableDefine.tableType === TableType.vertical) {
            const verticalFieldDefine = tableDefine.verticalFieldDefine;
            const typeCellObj: xlsx.CellObject = sheet[colKey + verticalFieldDefine.typeRow];
            const fieldCellObj: xlsx.CellObject = sheet[colKey + verticalFieldDefine.fieldRow];
            if (isEmptyCell(typeCellObj) || isEmptyCell(fieldCellObj)) {
                return false;
            } else {
                return true;
            }
        } else if (tableDefine.tableType === TableType.horizontal) {
            const cellObj: xlsx.CellObject = sheet[colKey + 1];
            if (isEmptyCell(cellObj)) {
                return false;
            } else {
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
    public transValue(parseResult: ITableParseResult, filedItem: ITableField, cellValue: any): ITransValueResult {
        let transResult: ITransValueResult;

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
    public parseTableFile(
        parseConfig: ITableConvertConfig,
        fileInfo: IFileInfo,
        parseResult: ITableParseResult
    ): ITableParseResult {
        const workbook = readTableFile(fileInfo);
        if (!workbook.SheetNames.length) return;

        const sheetNames = workbook.SheetNames;
        const tableDefine: ITableDefine = this.getTableDefine(fileInfo, workbook);
        for (let i = 0; i < sheetNames.length; i++) {}
        if (!tableDefine) return null;
        let sheetName: string;
        let sheet: xlsx.Sheet;
        const isSheetRowEnd = this.isSheetRowEnd.bind(null, tableDefine);
        const isSheetColEnd = this.isSheetColEnd.bind(null, tableDefine);
        const isSkipSheetRow = (sheet: xlsx.Sheet, rowIndex: number) => {
            return !this.checkRowNeedParse(tableDefine, sheet, rowIndex);
        };
        const isSkipSheetCol = (sheet: xlsx.Sheet, colKey: string) => {
            return !this.checkColNeedParse(tableDefine, sheet, colKey);
        };
        let cellObj: xlsx.CellObject;
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
            if (tableDefine.tableType === TableType.vertical) {
                let lastRowIndex: number;

                verticalForEachSheet(
                    sheet,
                    tableDefine.startRow,
                    tableDefine.startCol,
                    (sheet, colKey: string, rowIndex: number) => {
                        let isNewRowOrCol = false;
                        if (lastRowIndex !== rowIndex) {
                            lastRowIndex = rowIndex;
                            isNewRowOrCol = true;
                        }
                        cellObj = sheet[colKey + rowIndex];
                        if (!isEmptyCell(cellObj)) {
                            this.parseVerticalCell(parseResult, sheet, colKey, rowIndex, isNewRowOrCol);
                        }
                    },
                    isSheetRowEnd,
                    isSheetColEnd,
                    isSkipSheetRow,
                    isSkipSheetCol
                );
            } else if (tableDefine.tableType === TableType.horizontal) {
                let lastColKey: string;

                horizontalForEachSheet(
                    sheet,
                    tableDefine.startRow,
                    tableDefine.startCol,
                    (sheet, colKey: string, rowIndex: number) => {
                        let isNewRowOrCol = false;
                        if (lastColKey !== colKey) {
                            lastColKey = colKey;
                            isNewRowOrCol = true;
                        }

                        cellObj = sheet[colKey + rowIndex];
                        if (!isEmptyCell(cellObj)) {
                            this.parseHorizontalCell(parseResult, sheet, colKey, rowIndex, isNewRowOrCol);
                        }
                    },
                    isSheetRowEnd,
                    isSheetColEnd,
                    isSkipSheetRow,
                    isSkipSheetCol
                );
            }
        }

        return parseResult as any;
    }
}
