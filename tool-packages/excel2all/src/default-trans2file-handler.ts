import * as path from "path";
import { TableType } from "./default-parse-handler";
import { Base64 } from "js-base64";
import { deflateSync } from "zlib";
import { osEol } from "./get-os-eol";
declare global {
    /**
     * 输出配置
     */
    interface IOutputConfig {
        /**配置表输出目录路径，默认输出到当前执行目录下的./excelJsonOut */
        clientSingleTableJsonDir: string;
        /**所有配置表打包输出目录，如果不配置则不合并json */
        clientBundleJsonOutPath?: string;
        /**是否格式化合并后的json，默认不 */
        isFormatBundleJson?: boolean;
        /**是否生成声明文件，默认不输出 */
        isGenDts?: boolean;
        /**声明文件输出目录 */
        clientDtsOutDir?: string;
        /**是否合并所有声明为一个文件,默认true */
        isBundleDts?: boolean;
        /**是否将json格式压缩,默认否,减少json字段名字符,效果较小 */
        isCompress?: boolean;
        /**是否Zip压缩,使用zlib */
        isZip?: boolean;
        /**是否将输出的合并json转为base64，默认否*/
        bundleJsonIsEncode2Base64?: boolean;
        /**加密混淆字符串前缀 */
        preBase64UglyString?: string;
        /**加密混淆字符串后缀 */
        sufBase64UglyString?: string;
    }
}
/**类型字符串映射字典 */
const typeStrMap = { int: "number", json: "any", "[int]": "number[]", "[string]": "string[]" };
export class Trans2JsonAndDtsHandler implements ITransResult2AnyFileHandler {
    trans2Files(
        parseConfig: ITableParseConfig,
        changedFileInfos: IFileInfo[],
        deleteFileInfos: IFileInfo[],
        parseResultMap: TableParseResultMap
    ): OutPutFileMap {
        let outputConfig: IOutputConfig = parseConfig.outputConfig;
        if (!outputConfig) {
            outputConfig = {
                clientSingleTableJsonDir: path.join(process.cwd(), "./excelJsonOut")
            };
        }

        let tableObjMap: { [key: string]: any } = {};
        let outputFileMap: OutPutFileMap = {};
        let tableTypeMapDtsStr = "";
        let tableTypeDtsStrs = "";
        let parseResult: ITableParseResult;
        let tableName: string;
        let tableObj: any;
        let objTypeTableMap: { [key: string]: boolean } = {};
        for (let filePath in parseResultMap) {
            parseResult = parseResultMap[filePath];
            if (!parseResult.tableDefine) continue;
            tableName = parseResult.tableDefine.tableName;
            if (parseResult.tableDefine.tableType === TableType.horizontal) {
                tableTypeMapDtsStr += "\treadonly " + tableName + "?: " + `IT_${tableName};` + osEol;
            } else {
                tableTypeMapDtsStr += this._getOneTableTypeStr(tableName);
            }

            //合并多个同名表
            tableObj = tableObjMap[tableName];
            if (tableObj) {
                tableObj = Object.assign(tableObj, parseResult.tableObj);
            } else {
                tableObj = parseResult.tableObj;
            }
            tableObjMap[tableName] = tableObj;
            objTypeTableMap[tableName] = parseResult.tableDefine.tableType === TableType.horizontal;
            if (outputConfig.isGenDts) {
                //输出单个文件
                if (outputConfig.isBundleDts === undefined) outputConfig.isBundleDts = true;
                if (!outputConfig.isBundleDts) {
                    this._addSingleTableDtsOutputFile(outputConfig, parseResult, outputFileMap);
                } else {
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
            let itBaseStr = "interface ITBase<T> { [key:string]:T}" + osEol;

            tableTypeMapDtsStr = itBaseStr + "interface IT_TableMap {" + osEol + tableTypeMapDtsStr + "}" + osEol;

            if (outputConfig.isBundleDts) {
                //合成一个文件
                const bundleDtsFilePath = path.join(outputConfig.clientDtsOutDir, "tableMap.d.ts");
                outputFileMap[bundleDtsFilePath] = {
                    filePath: bundleDtsFilePath,
                    data: tableTypeMapDtsStr + tableTypeDtsStrs
                };
            } else {
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
            let outputData: any;
            if (outputConfig.isCompress) {
                const newTableObjMap = {};
                let tableObj: any;
                let newTableObj: any;
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
            } else {
                outputData = JSON.stringify(tableObjMap);
            }
            if (outputConfig.bundleJsonIsEncode2Base64) {
                outputData = Base64.encode(outputData);
                if (outputConfig.preBase64UglyString) {
                    outputData = outputConfig.preBase64UglyString + outputData;
                }
                if (outputConfig.sufBase64UglyString) {
                    outputData += outputConfig.sufBase64UglyString;
                }
            }
            if (outputConfig.isZip) {
                outputData = deflateSync(outputData);
            }
            outputFileMap[jsonBundleFilePath] = {
                filePath: jsonBundleFilePath,
                encoding: typeof outputData !== "string" ? "binary" : "utf-8",
                data: outputData
            };
        }
        return outputFileMap;
    }
    private _addSingleTableDtsOutputFile(
        config: IOutputConfig,
        parseResult: ITableParseResult,
        outputFileMap: OutPutFileMap
    ): void {
        //如果值没有就不输出类型信息了
        if (!parseResult.tableObj) return;
        let dtsFilePath: string = path.join(config.clientDtsOutDir, `${parseResult.tableDefine.tableName}.d.ts`);

        if (!outputFileMap[dtsFilePath]) {
            //
            const dtsStr = this._getSingleTableDts(parseResult);
            if (dtsStr) {
                outputFileMap[dtsFilePath] = { filePath: dtsFilePath, data: dtsStr } as any;
            }
        }
    }
    /**
     * 解析出单个配置表类型数据
     * @param parseResult
     */
    private _getSingleTableDts(parseResult: ITableParseResult): string {
        const tableName = parseResult.tableDefine.tableName;

        const colKeyTableFieldMap: ColKeyTableFieldMap = parseResult.filedMap;
        let itemInterface = "interface IT_" + tableName + " {" + osEol;
        let tableField: ITableField;
        let typeStr: string;
        let objTypeStrMap: { [key: string]: string } = {};

        for (let colKey in colKeyTableFieldMap) {
            tableField = colKeyTableFieldMap[colKey];
            if (!tableField) continue;
            if (!tableField.isMutiColObj) {
                //注释行
                itemInterface += "\t/** " + tableField.text + " */" + osEol;
                //字段类型声明行
                itemInterface +=
                    "\treadonly " +
                    tableField.fieldName +
                    "?: " +
                    (typeStrMap[tableField.type] ? typeStrMap[tableField.type] : tableField.type) +
                    ";" +
                    osEol;
            } else {
                const objFieldKey = tableField.fieldName;
                if (!objTypeStrMap[objFieldKey]) {
                    objTypeStrMap[objFieldKey] = "";
                }

                //注释行
                objTypeStrMap[objFieldKey] += "\t\t/** " + tableField.text + " */" + osEol;

                //字段类型声明行
                objTypeStrMap[objFieldKey] +=
                    "\t\treadonly " +
                    tableField.subFieldName +
                    "?: " +
                    (typeStrMap[tableField.subType] ? typeStrMap[tableField.subType] : tableField.subType) +
                    ";" +
                    osEol;
            }
        }
        //第二层对象
        for (let objFieldKey in objTypeStrMap) {
            //字段类型声明行
            itemInterface += "\treadonly " + objFieldKey + "?: {" + osEol + objTypeStrMap[objFieldKey];
            itemInterface += "\t}" + osEol;
        }
        itemInterface += "}" + osEol;

        return itemInterface;
    }
    /**
     * 添加单独导出配置表json文件
     * @param config
     * @param parseResult
     * @param outputFileMap
     */
    private _addSingleTableJsonOutputFile(
        config: IOutputConfig,
        parseResult: ITableParseResult,
        outputFileMap: OutPutFileMap
    ) {
        const tableObj = parseResult.tableObj;
        if (!tableObj) return;
        const tableName = parseResult.tableDefine.tableName;
        let singleJsonFilePath = path.join(config.clientSingleTableJsonDir, `${tableName}.json`);
        let singleJsonData = JSON.stringify(tableObj, null, "\t");

        let singleOutputFileInfo = outputFileMap[singleJsonFilePath];
        if (singleOutputFileInfo) {
            singleOutputFileInfo.data = singleJsonData;
        } else {
            singleOutputFileInfo = {
                filePath: singleJsonFilePath,
                data: singleJsonData
            };
            outputFileMap[singleJsonFilePath] = singleOutputFileInfo;
        }
    }
    private _getOneTableTypeStr(tableName: string): string {
        return "\treadonly " + tableName + "?: " + "ITBase<" + "IT_" + tableName + ">;" + osEol;
    }
}
