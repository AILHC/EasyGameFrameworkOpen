export const defaultValueTransFuncMap: {
    [key: string]: ValueTransFunc;
} = {};
defaultValueTransFuncMap["int"] = strToInt;
defaultValueTransFuncMap["string"] = anyToStr;
defaultValueTransFuncMap["[int]"] = strToIntArr;
defaultValueTransFuncMap["[string]"] = strToStrArr;
defaultValueTransFuncMap["json"] = strToJsonObj;
defaultValueTransFuncMap["any"] = anyToAny;
defaultValueTransFuncMap["bool"] = anyToBoolean;
defaultValueTransFuncMap["boolean"] = anyToBoolean;
function strToIntArr(fieldItem: ITableField, cellValue: string): ITransValueResult {
    cellValue = (cellValue + "").replace(/，/g, ","); //为了防止策划误填，先进行转换
    cellValue = cellValue.trim();
    let intArr: number[];
    const result: ITransValueResult = {};
    if (cellValue !== "") {
        try {
            intArr = JSON.parse(cellValue);
            result.value = intArr;
        } catch (error) {
            result.error = error;
        }
    }

    return result;
}
function strToStrArr(fieldItem: ITableField, cellValue: string): ITransValueResult {
    cellValue = (cellValue + "").replace(/，/g, ","); //为了防止策划误填，先进行转换
    const trimCellValue = cellValue.trim();
    let result: ITransValueResult = {};
    let arr: string[];
    if (trimCellValue !== "") {
        try {
            arr = JSON.parse(cellValue);
            result.value = arr;
        } catch (error) {
            result.error = error;
        }
    }
    return result;
}
function strToInt(fieldItem: ITableField, cellValue: string): ITransValueResult {
    let result: ITransValueResult = {} as any;
    if (typeof cellValue === "string" && cellValue.trim() !== "") {
        result.value = cellValue.includes(".") ? parseFloat(cellValue) : (parseInt(cellValue) as any);
    } else if (typeof cellValue === "number") {
        result.value = cellValue;
    }
    return result;
}
function strToJsonObj(fieldItem: ITableField, cellValue: string): ITransValueResult {
    cellValue = (cellValue + "").replace(/，/g, ","); //为了防止策划误填，先进行转换
    cellValue = cellValue.trim();
    let obj;
    let error;
    if (cellValue !== "") {
        try {
            obj = JSON.parse(cellValue);
        } catch (err) {
            error = err;
            obj = cellValue;
        }
    }
    return { error: error, value: obj };
}
function anyToStr(fieldItem: ITableField, cellValue: any): ITransValueResult {
    let result: ITransValueResult = {} as any;
    if (typeof cellValue === "string") {
        const trimCellValue = cellValue.trim();
        if (trimCellValue !== "") {
            result.value = cellValue;
        }
    } else {
        result.value = cellValue + "";
    }
    return result;
}
/**
 * 先尝试转换未对象，不行再使用原值
 * @param fieldItem
 * @param cellValue
 * @returns
 */
function anyToAny(fieldItem: ITableField, cellValue: string): ITransValueResult {
    cellValue = (cellValue + "").replace(/，/g, ","); //为了防止策划误填，先进行转换
    const trimCellValue = cellValue.trim();
    let obj;
    let error;
    if (trimCellValue !== "") {
        try {
            obj = JSON.parse(cellValue);
        } catch (err) {
            obj = cellValue;
        }
    }
    return { error: error, value: obj };
}
/**
 *
 * @param fieldItem
 * @param cellValue
 * @returns
 */
function anyToBoolean(fieldItem: ITableField, cellValue: string): ITransValueResult {
    let obj;
    let error: string;
    if (typeof cellValue === "boolean") {
    } else if (typeof cellValue === "string") {
        if (cellValue === "FALSE") {
            obj = false as any;
        } else if (cellValue === "TRUE") {
            obj = true as any;
        } else {
            error = `无法解析这个值：${cellValue}`;
            obj = cellValue;
        }
    } else if (typeof cellValue === "number") {
        if (cellValue > 0) {
            obj = true as any;
        } else {
            obj = false as any;
        }
    } else {
        error = `无法解析这个值：${cellValue}`;
        obj = cellValue;
    }

    return { error: error, value: obj };
}
