import * as xlsx from "xlsx";
/**
 * 是否为空表格格子
 * @param cell
 */
export function isEmptyCell(cell: xlsx.CellObject) {
    if (cell && cell.v !== undefined) {
        if (typeof cell.v === "string") {
            return cell.v === "";
        } else if (typeof cell.v === "number") {
            return isNaN(cell.v);
        } else {
            return false;
        }
    } else {
        return true;
    }
}
/**
 * 字母Z的编码
 */
export const ZCharCode = 90;
/**
 * 字母A的编码
 *
 */
export const ACharCode = 65;
/**
 * 根据当前列的charCodes获取下一列Key
 * @param charCodes
 */
export function getNextColKey(charCodes: number[]): string {
    let isAdd: boolean;
    for (let i = charCodes.length - 1; i >= 0; i--) {
        if (charCodes[i] < ZCharCode) {
            charCodes[i] += 1;
            isAdd = true;
            break;
        } else if (charCodes[i] === ZCharCode) {
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
export function charCodesToString(charCodes: number[]): string {
    return String.fromCharCode(...charCodes);
}
/**
 * 字符串转编码数组
 * @param colKey
 */
export function stringToCharCodes(colKey: string) {
    const charCodes = [];
    for (let i = 0; i < colKey.length; i++) {
        charCodes.push(colKey.charCodeAt(i));
    }
    return charCodes;
}
let colKeySumMap = {};
/**
 * 获取列标签的大小 用于比较是否最大列 比如 最大列key: BD,当前列key: AF AF < BD
 * @param colKey
 * @returns
 */
export function getCharCodeSum(colKey: string): number {
    let sum: number = colKeySumMap[colKey];
    if (!sum) {
        sum = 0;
        for (let i = 0; i < colKey.length; i++) {
            sum += colKey.charCodeAt(i) * (colKey.length - i - 1) * 100;
        }
        colKeySumMap[colKey] = sum;
    }
    return sum;
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
export function verticalForEachSheet(
    sheet: xlsx.Sheet,
    startRow: number,
    startCol: string,
    callback: (sheet: xlsx.Sheet, colKey: string, rowIndex: number) => void,
    isSheetRowEnd?: (sheet: xlsx.Sheet, rowIndex: number) => boolean,
    isSheetColEnd?: (sheet: xlsx.Sheet, colkey: string) => boolean,
    isSkipSheetRow?: (sheet: xlsx.Sheet, rowIndex: number) => boolean,
    isSkipSheetCol?: (sheet: xlsx.Sheet, colKey: string) => boolean
) {
    const sheetRef: string = sheet["!ref"];
    const maxRowNum = parseInt(sheetRef.match(/\d+$/)[0]);

    const maxColKey = sheetRef.split(":")[1].match(/^[A-Za-z]+/)[0];
    let maxColKeyCodeSum = getCharCodeSum(maxColKey);

    let colCharCodes: number[];
    let colKey: string;
    let curColCodeSum: number = 0;
    const startCharcodes = stringToCharCodes(startCol);
    for (let i = startRow; i <= maxRowNum; i++) {
        if (isSheetRowEnd ? isSheetRowEnd(sheet, i) : false) break;
        if (isSkipSheetRow ? isSkipSheetRow(sheet, i) : false) continue;
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
            } else {
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
export function horizontalForEachSheet(
    sheet: xlsx.Sheet,
    startRow: number,
    startCol: string,
    callback: (sheet: xlsx.Sheet, colKey: string, rowIndex: number) => void,
    isSheetRowEnd?: (sheet: xlsx.Sheet, rowIndex: number) => boolean,
    isSheetColEnd?: (sheet: xlsx.Sheet, colkey: string) => boolean,
    isSkipSheetRow?: (sheet: xlsx.Sheet, rowIndex: number) => boolean,
    isSkipSheetCol?: (sheet: xlsx.Sheet, colKey: string) => boolean
) {
    const sheetRef: string = sheet["!ref"];
    const maxRowNum = parseInt(sheetRef.match(/\d+$/)[0]);

    const maxColKey = sheetRef.split(":")[1].match(/^[A-Za-z]+/)[0];
    const maxColKeyCodeSum = getCharCodeSum(maxColKey);
    let colCharCodes: number[];
    let colKey: string;
    colCharCodes = stringToCharCodes(startCol);
    let curColCodeSum: number = 0;
    colKey = startCol;
    let hasNextCol = isSheetColEnd ? !isSheetColEnd(sheet, colKey) : true;
    while (hasNextCol) {
        if (!(isSkipSheetCol ? isSkipSheetCol(sheet, colKey) : false)) {
            for (let i = startRow; i <= maxRowNum; i++) {
                if (isSheetRowEnd ? isSheetRowEnd(sheet, i) : false) break;
                if (isSkipSheetRow ? isSkipSheetRow(sheet, i) : false) continue;
                callback(sheet, colKey, i);
            }
        }

        colKey = getNextColKey(colCharCodes);
        curColCodeSum = getCharCodeSum(colKey);
        if (maxColKeyCodeSum >= curColCodeSum) {
            hasNextCol = isSheetColEnd ? !isSheetColEnd(sheet, colKey) : true;
        } else {
            hasNextCol = false;
        }
    }
}

/**
 * 读取配置表文件 同步的
 * @param fileInfo
 */
export function readTableFile(fileInfo: IFileInfo): xlsx.WorkBook {
    const workBook = xlsx.readFile(fileInfo.filePath, { type: getTableFileType(fileInfo) });
    return workBook;
}
/**
 * 读取配置表文件 同步的
 * 如果fileData typeof === string xlsx.read 的 type是string,否则是buffer
 * @param fileInfo
 */
export function readTableData(fileInfo: IFileInfo): xlsx.WorkBook {
    // const workBook = xlsx.read(fileInfo.fileData, { type: isCSV(fileInfo.fileExtName) ? "string" : "buffer" });
    const workBook = xlsx.read(fileInfo.fileData, {
        type: typeof fileInfo.fileData === "string" ? "string" : "buffer"
    });
    return workBook;
}
/**
 * 获取配置文件类型
 * @param fileInfo
 * @returns
 */
export function getTableFileType(fileInfo: IFileInfo) {
    return isCSV(fileInfo.fileExtName) ? "string" : "file";
}
/**
 * 根据文件名后缀判断是否为csv文件
 * @param fileExtName
 */
export function isCSV(fileExtName: string): boolean {
    return fileExtName === ".csv";
}
