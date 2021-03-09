export const valueTransFuncMap: {
    [key: string]: ValueTransFunc;
} = {};
valueTransFuncMap["int"] = strToInt;
valueTransFuncMap["string"] = anyToStr;
valueTransFuncMap["[int]"] = strToIntArr;
valueTransFuncMap["[string]"] = strToStrArr;
valueTransFuncMap["json"] = strToJsonObj;
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
            // console.error(error);
        }
    }

    return result;
}
function strToStrArr(fieldItem: ITableField, cellValue: string): ITransValueResult {
    cellValue = (cellValue + "").replace(/，/g, ","); //为了防止策划误填，先进行转换
    cellValue = cellValue.trim();
    let result: ITransValueResult = {};
    let arr: string[];
    if (cellValue !== "") {
        try {
            arr = JSON.parse(cellValue);
            result.value = arr;
        } catch (error) {
            result.error = error;
            console.error(error);
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
            console.error(err);
        }
    }
    return { error: error, value: obj };
}
function anyToStr(fieldItem: ITableField, cellValue: any): ITransValueResult {
    let result: ITransValueResult = {} as any;
    if (typeof cellValue === "string") {
        cellValue = cellValue.trim();
        if (cellValue !== "") {
            result.value = cellValue;
        }
    } else {
        result.value = cellValue + "";
    }
    return result;
}
