import * as xlsx from "xlsx";
import { defaultValueTransFuncMap } from "./default-value-func-map";
import { Logger } from "./loger";
import {
    forEachHorizontalSheet,
    forEachVerticalSheet,
    isCSV,
    isEmptyCell,
    readTableData,
    readTableFile
} from "./table-utils";

declare global {
    interface ITableParserConfig {
        /**自定义值转换方法字典 */
        customValueTransFuncMap?: ValueTransFuncMap;
    }
    interface ITableConvertConfig {
        /**解析配置 */
        parserConfig?: ITableParserConfig;
    }
    interface ITableField {
        /**配置表中注释值 */
        text: string;
        /**配置表中类型值 */
        originType: string;
        /**配置表中字段名值 */
        originFieldName: string;
        /**解析后的类型值 */
        type?: string;
        /**解析后的字段名值 */
        fieldName?: string;
        /**对象的子字段名 */
        subFieldName?: string;
        /**多列对象 */
        isMutiColObj?: boolean;
    }
    interface ITableFirstCellValue {
        tableNameInSheet: string;
        tableType: TableType;
    }
    interface ITableDefine {
        /**配置表名 */
        tableName: string;
        /**配置表类型 默认两种: vertical 和 horizontal*/
        tableType: string;

        /**遍历开始行 */
        startRow: number;
        /**遍历开始列 */
        startCol: string;
        /**垂直表字段定义 */
        verticalFieldDefine: IVerticalFieldDefine;
        /**横向表字段定义 */
        horizontalFieldDefine: IHorizontalFieldDefine;
    }
    interface IVerticalFieldDefine {
        /**类型行 */
        typeCol: string;
        /**字段名行 */
        fieldCol: string;
        /**注释行 */
        textCol: string;
    }
    interface IHorizontalFieldDefine {
        /**类型行 */
        typeRow: number;
        /**字段名行 */
        fieldRow: number;
        /**注释行 */
        textRow: number;
    }
    /**
     * 字段字典
     * key是列originFieldName
     * value是字段对象
     */
    type TableFieldMap = { [key: string]: ITableField };

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
        field: ITableField;
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
        fieldMap?: TableFieldMap;
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

    /**值转换结果 */
    interface ITransValueResult {
        error?: any;
        value?: any;
    }
    /**值转换方法 */
    type ValueTransFunc = (fieldItem: ITableField, cellValue: any) => ITransValueResult;
    /**
     * 值转换方法字典
     * key是类型key
     * value是方法
     */
    type ValueTransFuncMap = { [key: string]: ValueTransFunc };
}
/**
 * 配置表类型
 * 按照字段扩展方向定
 */
export enum TableType {
    /**字段垂直扩展 */
    vertical = "vertical",
    /**字段横向扩展 */
    horizontal = "horizontal"
}

export class DefaultTableParser implements ITableParser {
    getTableDefine(fileInfo: IFileInfo, workBook: xlsx.WorkBook): ITableDefine {
        let cellKey: string;
        let cellObj: xlsx.CellObject;

        const sheetNames = workBook.SheetNames;
        let sheet: xlsx.Sheet;
        let firstCanParseSheet: xlsx.Sheet;
        //第一个格子的值tableNameInSheet(表名),tableType:表格类型
        let firstCellValue: ITableFirstCellValue;
        let firstCellObj: xlsx.CellObject;

        const tableDefine: Partial<ITableDefine> = {};

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
        if (tableDefine.tableType === TableType.vertical) {
            tableDefine.verticalFieldDefine = {} as any;
            const verticalFieldDefine = tableDefine.verticalFieldDefine;
            verticalFieldDefine.textCol = "A";
            verticalFieldDefine.typeCol = "B";
            verticalFieldDefine.fieldCol = "C";
            tableDefine.startCol = "D";
            tableDefine.startRow = 2;
        } else if (tableDefine.tableType === TableType.horizontal) {
            tableDefine.horizontalFieldDefine = {} as any;
            const horizontalFieldDefine: IHorizontalFieldDefine = tableDefine.horizontalFieldDefine;
            horizontalFieldDefine.textRow = 1;
            for (let i = 1; i < 100; i++) {
                cellKey = "A" + i;
                cellObj = firstCanParseSheet[cellKey];
                if (isEmptyCell(cellObj) || cellObj.v === "NO" || cellObj.v === "END" || cellObj.v === "START") {
                    tableDefine.startRow = i;
                } else if (cellObj.v === "CLIENT") {
                    horizontalFieldDefine.fieldRow = i;
                } else if (cellObj.v === "TYPE") {
                    horizontalFieldDefine.typeRow = i;
                }
                if (tableDefine.startRow && horizontalFieldDefine.fieldRow && horizontalFieldDefine.typeRow) break;
            }

            tableDefine.startCol = "B";
        }

        return tableDefine as any;
    }
    private _getFirstCellValue(firstCellObj: xlsx.CellObject): ITableFirstCellValue {
        if (!firstCellObj) return;
        const cellValues = (firstCellObj.v as string).split(":");
        let tableNameInSheet: string;
        let tableType: TableType;
        if (cellValues.length > 1) {
            tableNameInSheet = cellValues[1];
            tableType = cellValues[0] === "V" ? TableType.vertical : TableType.horizontal;
        } else {
            tableNameInSheet = cellValues[0];
            tableType = TableType.horizontal;
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
     * 解析横向表格的单个格子
     * @param tableParseResult
     * @param sheet
     * @param colKey
     * @param rowIndex
     * @param isNewRowOrCol 是否为新的一行或者一列
     */
    parseHorizontalCell(
        valueTransFuncMap: ValueTransFuncMap,
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

        const transResult = this.transValue(valueTransFuncMap, tableParseResult, fieldInfo, cell.v);
        if (transResult.error) {
            tableParseResult.hasError = true;
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
     * 解析纵向表格的单个格子
     * @param valueTransFuncMap
     * @param tableParseResult
     * @param sheet
     * @param colKey
     * @param rowIndex
     * @param isNewRowOrCol 是否为新的一行或者一列
     */
    parseVerticalCell(
        valueTransFuncMap: ValueTransFuncMap,
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
        const transResult = this.transValue(valueTransFuncMap, tableParseResult, fieldInfo, cell.v);
        if (transResult.error) {
            Logger.log(
                `!!!!!!!!!!!!!!!!!![-----ParseError|解析错误-----]!!!!!!!!!!!!!!!!!!!!!!!!!\n` +
                    `[sheetName|分表名]=> ${tableParseResult.curSheetName}\n` +
                    `[row|行]=> ${rowIndex}\n` +
                    `[col|列]=> ${colKey}\n` +
                    `[field|字段]=> ${fieldInfo.originFieldName}\n` +
                    `[type|类型]=> ${fieldInfo.originType}\n` +
                    `[error|错误]=> ${
                        typeof transResult.error === "string" ? transResult.error : transResult.error.message
                    }\n` +
                    `!!!!!!!!!!!!!!!!!![-----ParseError|解析错误-----]!!!!!!!!!!!!!!!!!!!!!!!!!\n`,

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
     * 解析出横向表的字段对象
     * @param tableParseResult
     * @param sheet
     * @param colKey
     * @param rowIndex
     */
    getHorizontalTableField(
        tableParseResult: ITableParseResult,
        sheet: xlsx.Sheet,
        colKey: string,
        rowIndex: number
    ): ITableField {
        const tableDefine = tableParseResult.tableDefine;
        let tableFieldMap = tableParseResult.fieldMap;
        if (!tableFieldMap) {
            tableFieldMap = {};
            tableParseResult.fieldMap = tableFieldMap;
        }
        const horizontalFieldDefine = tableDefine.horizontalFieldDefine;
        const fieldCell = sheet[colKey + horizontalFieldDefine.fieldRow];
        let originFieldName: string;
        if (!isEmptyCell(fieldCell)) {
            originFieldName = fieldCell.v as string;
        }
        if (!originFieldName) return null;
        let field: ITableField = {} as any;
        //缓存
        if (tableFieldMap[originFieldName] !== undefined) {
            return tableFieldMap[originFieldName];
        }
        //注释
        const textCell: xlsx.CellObject = sheet[colKey + horizontalFieldDefine.textRow];
        if (!isEmptyCell(textCell)) {
            field.text = textCell.v as string;
        }
        //类型
        let isObjType: boolean = false;
        const typeCell = sheet[colKey + horizontalFieldDefine.typeRow];

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

        tableFieldMap[originFieldName] = field;
        return field;
    }
    /**
     * 解析出纵向表的字段类型对象
     * @param tableParseResult
     * @param sheet
     * @param colKey
     * @param rowIndex
     * @returns
     */
    getVerticalTableField(
        tableParseResult: ITableParseResult,
        sheet: xlsx.Sheet,
        colKey: string,
        rowIndex: number
    ): ITableField {
        const tableDefine = tableParseResult.tableDefine;
        let tableFieldMap = tableParseResult.fieldMap;
        if (!tableFieldMap) {
            tableFieldMap = {};
            tableParseResult.fieldMap = tableFieldMap;
        }
        const verticalFieldDefine = tableDefine.verticalFieldDefine;
        const fieldNameCell: xlsx.CellObject = sheet[verticalFieldDefine.fieldCol + rowIndex];
        let originFieldName: string;
        if (!isEmptyCell(fieldNameCell)) {
            originFieldName = fieldNameCell.v as string;
        }
        if (!originFieldName) return null;
        if (tableFieldMap[originFieldName] !== undefined) {
            return tableFieldMap[originFieldName];
        }
        let field: ITableField = {} as any;

        const textCell: xlsx.CellObject = sheet[verticalFieldDefine.textCol + rowIndex];
        //注释
        if (!isEmptyCell(textCell)) {
            field.text = textCell.v as string;
        }
        let isObjType: boolean = false;
        //类型
        const typeCell: xlsx.CellObject = sheet[verticalFieldDefine.typeCol + rowIndex];

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
        tableFieldMap[originFieldName] = field;
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
            const cellObj: xlsx.CellObject = sheet[colKey + 1];
            if (isEmptyCell(cellObj)) {
                return false;
            } else {
                return true;
            }
        } else if (tableDefine.tableType === TableType.horizontal) {
            const horizontalFieldDefine = tableDefine.horizontalFieldDefine;
            const typeCellObj: xlsx.CellObject = sheet[colKey + horizontalFieldDefine.typeRow];
            const fieldCellObj: xlsx.CellObject = sheet[colKey + horizontalFieldDefine.fieldRow];
            if (isEmptyCell(typeCellObj) || isEmptyCell(fieldCellObj)) {
                return false;
            } else {
                return true;
            }
        }
    }
    /**
     * 转换表格的值
     * @param parseResult
     * @param fieldItem
     * @param cellValue
     */
    public transValue(
        valueTransFuncMap: ValueTransFuncMap,
        parseResult: ITableParseResult,
        fieldItem: ITableField,
        cellValue: any
    ): ITransValueResult {
        let transResult: ITransValueResult;

        let transFunc = valueTransFuncMap[fieldItem.type];
        if (!transFunc) {
            transFunc = valueTransFuncMap["json"];
        }
        transResult = transFunc(fieldItem, cellValue);
        return transResult;
    }

    /**
     * 解析配置表文件
     * @param convertConfig 解析配置
     * @param fileInfo 文件信息
     * @param parseResult 解析结果
     */
    public parseTableFile(
        convertConfig: ITableConvertConfig,
        fileInfo: IFileInfo,
        parseResult: ITableParseResult
    ): ITableParseResult {
        fileInfo.fileData = isCSV(fileInfo.fileExtName) ? (fileInfo.fileData as Buffer).toString() : fileInfo.fileData;
        const workbook = readTableData(fileInfo);
        if (!workbook.SheetNames.length) return;
        let valueTransFuncMap = convertConfig?.parserConfig?.customValueTransFuncMap;

        if (!valueTransFuncMap) {
            valueTransFuncMap = defaultValueTransFuncMap;
        } else {
            valueTransFuncMap = Object.assign(valueTransFuncMap, defaultValueTransFuncMap);
        }

        const sheetNames = workbook.SheetNames;
        const tableDefine: ITableDefine = this.getTableDefine(fileInfo, workbook);

        if (!tableDefine) {
            Logger.log(`表格不规范,跳过解析,路径:${fileInfo.filePath}`, "warn");
            return;
        }
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
            if (tableDefine.tableType === TableType.horizontal) {
                let lastRowIndex: number;

                forEachHorizontalSheet(
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
                        this.parseHorizontalCell(
                            valueTransFuncMap,
                            parseResult,
                            sheet,
                            colKey,
                            rowIndex,
                            isNewRowOrCol
                        );
                    },
                    isSheetRowEnd,
                    isSheetColEnd,
                    isSkipSheetRow,
                    isSkipSheetCol
                );
            } else if (tableDefine.tableType === TableType.vertical) {
                let lastColKey: string;

                forEachVerticalSheet(
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
                            this.parseVerticalCell(
                                valueTransFuncMap,
                                parseResult,
                                sheet,
                                colKey,
                                rowIndex,
                                isNewRowOrCol
                            );
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
