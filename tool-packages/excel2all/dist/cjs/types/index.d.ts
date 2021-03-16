declare module "@ailhc/excel2all/src/get-os-eol" {
    /**当前系统行尾  platform === "win32" ? "\n" : "\r\n";*/
    export const osEol: string;
}
declare module "@ailhc/excel2all/src/loger" {
    export class Logger {
        private static _enableOutPutLogFile;
        private static _logLevel;
        private static _logStr;
        static init(parseConfig: ITableConvertConfig): void;
        /**
         * 输出日志
         * @param message
         * @param level
         */
        static log(message: string, level?: LogLevel): void;
        /**
         * 返回日志数据并清空
         */
        static get logStr(): string;
    }
}
declare module "@ailhc/excel2all/src/file-utils" {
    global {
        interface IOutPutFileInfo {
            filePath: string;
            /**写入编码，字符串默认utf8 */
            encoding?: BufferEncoding;
            /**是否删除 */
            isDelete?: boolean;
            data?: any;
        }
    }
    /**
     * 遍历文件
     * @param dirPath 文件夹路径
     * @param eachCallback 遍历回调 (filePath: string) => void
     */
    export function forEachFile(fileOrDirPath: string, eachCallback?: (filePath: string) => void): void;
    /**
     * 批量写入和删除文件
     * @param outputFileInfos 需要写入的文件信息数组
     * @param onProgress 进度变化回调
     * @param complete 完成回调
     */
    export function writeOrDeleteOutPutFiles(
        outputFileInfos: IOutPutFileInfo[],
        onProgress?: (filePath: string, total: number, now: number, isOk: boolean) => void,
        complete?: (total: number) => void
    ): void;
    /**
     * 获取变化过的文件数组
     * @param dir 目标目录
     * @param cacheFilePath 缓存文件绝对路径
     * @param eachCallback 遍历回调
     * @returns 返回缓存文件路径
     */
    export function forEachChangedFile(
        dir: string,
        cacheFilePath?: string,
        eachCallback?: (filePath: string, isDelete?: boolean) => void
    ): void;
    /**
     * 写入缓存数据
     * @param cacheFilePath
     * @param cacheData
     */
    export function writeCacheData(cacheFilePath: string, cacheData: any): void;
    /**
     * 读取缓存数据
     * @param cacheFilePath
     */
    export function getCacheData(cacheFilePath: string): any;
    /**
     * 获取文件md5 (同步)
     * @param filePath
     */
    export function getFileMd5Sync(filePath: string): string;
    /**
     * 获取文件 md5
     * @param filePath
     */
    export function getFileMd5(filePath: string): Promise<string>;
}
declare module "@ailhc/excel2all/src/do-parse" {
    export function doParse(
        parseConfig: ITableConvertConfig,
        fileInfos: IFileInfo[],
        parseResultMap: TableParseResultMap,
        parseHandler: ITableParseHandler
    ): void;
}
declare module "@ailhc/excel2all/src/default-trans2file-handler" {
    global {
        /**
         * 输出配置
         */
        interface IOutputConfig {
            /**单个配置表json输出目录路径，默认输出到当前执行目录下的./excelJsonOut */
            clientSingleTableJsonDir: string;
            /**合并配置表json输出路径(包含文件名)，如果不配置则不合并json */
            clientBundleJsonOutPath?: string;
            /**是否格式化合并后的json，默认不 */
            isFormatBundleJson?: boolean;
            /**是否生成声明文件，默认不输出 */
            isGenDts?: boolean;
            /**声明文件输出目录(每个配置表一个声明)，默认不输出 */
            clientDtsOutDir?: string;
            /**是否合并所有声明为一个文件,默认true */
            isBundleDts?: boolean;
            /**合并后的声明文件名 */
            bundleDtsFileName?: string;
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
    export class Trans2JsonAndDtsHandler implements ITransResult2AnyFileHandler {
        trans2Files(
            parseConfig: ITableConvertConfig,
            changedFileInfos: IFileInfo[],
            deleteFileInfos: IFileInfo[],
            parseResultMap: TableParseResultMap
        ): OutPutFileMap;
        private _addSingleTableDtsOutputFile;
        /**
         * 解析出单个配置表类型数据
         * @param parseResult
         */
        private _getSingleTableDts;
        /**
         * 添加单独导出配置表json文件
         * @param config
         * @param parseResult
         * @param outputFileMap
         */
        private _addSingleTableJsonOutputFile;
        private _getOneTableTypeStr;
    }
}
declare module "@ailhc/excel2all/src/default-value-func-map" {
    export const valueTransFuncMap: {
        [key: string]: ValueTransFunc;
    };
}
declare module "@ailhc/excel2all/src/interfaces" {
    global {
        /**
         * 多线程传递数据
         */
        interface IWorkerShareData {
            /**线程id */
            threadId: number;
            /**解析配置 */
            parseConfig: ITableConvertConfig;
            /**需要解析的文件数组 */
            fileInfos: IFileInfo[];
            /**解析结果 */
            parseResultMap: TableParseResultMap;
        }
        /**
         * 多线程执行结果
         */
        interface IWorkDoResult {
            threadId: number;
            parseResultMap: TableParseResultMap;
            logStr: string;
        }
        /**
         * 文件信息对象
         */
        interface IFileInfo {
            filePath: string;
            fileName: string;
            fileExtName: string;
            fileData?: any;
            isDelete?: boolean;
        }
        interface ITableParseResult {
            /**文件路径 */
            filePath: string;
            /**文件哈希值 */
            md5hash?: string;
        }
        /**
         * 所有配置表解析结果字典
         * key为表的文件路径，value为解析结果
         */
        type TableParseResultMap = {
            [key: string]: ITableParseResult;
        };
        interface ITableConvertConfig {
            /**
             * 项目根目录，是其他相对路径的根据
             * 如果没有，则读取命令行执行的目录路径
             */
            projRoot?: string;
            /**
             * 配置表文件夹
             */
            tableFileDir: string;
            /**
             * 是否启用缓存
             */
            useCache?: boolean;
            /**
             * 是否启用多线程
             * 建议配置表文件数大于200以上才开启，会更有效
             * 测试数据（配置表文件数100）:
             *
             */
            useMultiThread?: boolean;
            /**
             * 单个线程解析文件的最大数量,默认5
             */
            threadParseFileMaxNum?: number;
            /**
             * 缓存文件的文件夹路径，可以是相对路径，相对于projRoot
             * 比如 cache 或者../cache
             */
            cacheFileDirPath?: string;
            /**
             * 文件名匹配规则 ,默认匹配规则["\\**\\*.{xlsx,csv}", "!~$*.*"]
             * 匹配所有后缀为.xlsx和.csv的文件，如果符合~$*.* 或~.*.* 则排除
             * 参考：https://github.com/micromatch/micromatch
             * 使用了.all去匹配
             */
            pattern?: string[];
            /**
             * 自定义解析处理器，require(customParseHandlerPath)
             *
             * 需要返回一个
             * @type {ITableParseHandler} 实现了ITableParseHandler的对象
             *
             * @example
             *
             * class CustomParseHandler  implements ITableParseHandler {
             *      parseTableFile(parseConfig: ITableParseConfig, fileInfo: IFileInfo, parseResult: ITableParseResult): ITableParseResult {
             *          //doSomething
             *      }
             * }
             * module.exports = new CustomParseHandler();
             *
             */
            customParseHandlerPath?: string;
            /**
             * 自定义导出处理器，require(customTrans2FileHandlerPath)
             *
             * 需要返回一个
             * @type {ITransResult2AnyFileHandler} 实现了ITransResult2AnyFileHandler的对象
             *
             * @example
             * class CustomTrans2FileHandler  implements ITransResult2AnyFileHandler {
             *  trans2Files(
             *      parseConfig: ITableParseConfig,
             *      changedFileInfos: IFileInfo[],
             *      deleteFileInfos: IFileInfo[],
             *      parseResultMap: TableParseResultMap): OutPutFileMap {
             *      //doSomething
             *
             *  }
             * }
             * module.exports = new CustomTrans2FileHandler();
             */
            customTrans2FileHandlerPath?: string;
            /**日志等级 */
            logLevel?: LogLevel;
            /**默认输出日志文件 */
            outputLogFile?: boolean;
            /**输出配置 */
            outputConfig?: any;
        }
        type LogLevel = "no" | "info" | "warn" | "error";
        /**
         * 输出文件字典
         * key为路径
         * value为文件信息
         */
        type OutPutFileMap = {
            [key: string]: IOutPutFileInfo;
        };
        interface ICellValueTransHandler {
            /**
             * 转换表格的值
             * @param filed
             * @param cellValue
             */
            transCellValue(filed: ITableField, cellValue: string): any;
        }
        interface ITransResult2AnyFileHandler {
            /**
             * 转换解析结果为多个任意文件
             * @param changedFileInfos 变动的文件信息数组
             * @param deleteFileInfos 删除了的文件信息数组
             * @param parseResultMap 解析结果字典
             */
            trans2Files(
                parseConfig: ITableConvertConfig,
                changedFileInfos: IFileInfo[],
                deleteFileInfos: IFileInfo[],
                parseResultMap: TableParseResultMap
            ): OutPutFileMap;
        }
        interface ITableParseHandler {
            /**
             * 解析配置表文件
             * @param fileInfo 文件信息
             * @param parseResult 解析结果
             */
            parseTableFile(
                parseConfig: ITableConvertConfig,
                fileInfo: IFileInfo,
                parseResult: ITableParseResult
            ): ITableParseResult;
        }
        /**配表解析函数 */
        type Trans2FilesFunc = ITransResult2AnyFileHandler["trans2Files"];
        /**文件导出函数 */
        type ParseTableFileFunc = ITableParseHandler["parseTableFile"];
    }
    export interface Interfaces {}
}
declare module "@ailhc/excel2all/src/table-utils" {
    import * as xlsx from "xlsx";
    /**
     * 是否为空表格格子
     * @param cell
     */
    export function isEmptyCell(cell: xlsx.CellObject): boolean;
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
    export function getNextColKey(charCodes: number[]): string;
    /**
     * 列的字符编码数组转字符串
     * @param charCodes
     */
    export function charCodesToString(charCodes: number[]): string;
    /**
     * 字符串转编码数组
     * @param colKey
     */
    export function stringToCharCodes(colKey: string): any[];
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
    ): void;
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
    ): void;
    /**
     * 读取配置表文件 同步的
     * @param fileInfo
     */
    export function readTableFile(fileInfo: IFileInfo): xlsx.WorkBook;
    /**
     * 根据文件名后缀判断是否为csv文件
     * @param fileExtName
     */
    export function isCSV(fileExtName: string): boolean;
}
declare module "@ailhc/excel2all" {
    export * from "@ailhc/excel2all/src/default-parse-handler";
    export * from "@ailhc/excel2all/src/default-trans2file-handler";
    export * from "@ailhc/excel2all/src/default-value-func-map";
    export * from "@ailhc/excel2all/src/do-parse";
    export * from "@ailhc/excel2all/src/file-utils";
    export * from "@ailhc/excel2all/src/convert";
    export * from "@ailhc/excel2all/src/interfaces";
    export * from "@ailhc/excel2all/src/table-utils";
    export * from "@ailhc/excel2all/src/loger";
}
declare module "@ailhc/excel2all/src/default-parse-handler" {
    import * as xlsx from "xlsx";
    global {
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
        type ColKeyTableFieldMap = {
            [key: string]: ITableField;
        };
        /**
         * 表格的一行或者一列
         * key为字段名值，value为表格的一格
         */
        type TableRowOrCol = {
            [key: string]: ITableCell;
        };
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
        type TableRowOrColMap = {
            [key: string]: TableRowOrCol;
        };
        /**
         * 表格行或列值数组
         * key主键，value是值数组
         */
        type RowOrColValuesMap = {
            [key: string]: any[];
        };
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
            /**单个表格对象 */
            /**key是主键值，value是一行对象 */
            tableObj?: {
                [key: string]: any;
            };
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
        type ValueTransFuncMap = {
            [key: string]: ValueTransFunc;
        };
    }
    export enum TableType {
        vertical = "vertical",
        horizontal = "horizontal"
    }
    export class DefaultParseHandler implements ITableParseHandler {
        private _valueTransFuncMap;
        constructor();
        getTableDefine(fileInfo: IFileInfo, workBook: xlsx.WorkBook): ITableDefine;
        private _getFirstCellValue;
        /**
         * 判断表格是否能解析
         * @param sheet
         */
        checkSheetCanParse(tableDefine: ITableDefine, sheet: xlsx.Sheet, sheetName: string): boolean;
        /**
         * 表行结束判断
         * @param tableDefine
         * @param sheet
         * @param row
         */
        isSheetRowEnd(tableDefine: ITableDefine, sheet: xlsx.Sheet, row: number): boolean;
        /**
         * 表列结束判断
         * @param tableDefine
         * @param sheet
         * @param colKey
         */
        isSheetColEnd(tableDefine: ITableDefine, sheet: xlsx.Sheet, colKey: string): boolean;
        /**
         * 检查行是否需要解析
         * @param tableDefine
         * @param sheet
         * @param rowIndex
         */
        checkRowNeedParse(tableDefine: ITableDefine, sheet: xlsx.Sheet, rowIndex: number): boolean;
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
        ): void;
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
        ): void;
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
        ): ITableField;
        getHorizontalTableField(
            tableParseResult: ITableParseResult,
            sheet: xlsx.Sheet,
            colKey: string,
            rowIndex: number
        ): ITableField;
        /**
         * 检查列是否需要解析
         * @param tableDefine
         * @param sheet
         * @param colKey
         */
        checkColNeedParse(tableDefine: ITableDefine, sheet: xlsx.Sheet, colKey: string): boolean;
        /**
         * 转换表格的值
         * @param parseResult
         * @param filedItem
         * @param cellValue
         */
        transValue(parseResult: ITableParseResult, filedItem: ITableField, cellValue: any): ITransValueResult;
        /**
         * 解析配置表文件
         * @param parseConfig 解析配置
         * @param fileInfo 文件信息
         * @param parseResult 解析结果
         */
        parseTableFile(
            parseConfig: ITableConvertConfig,
            fileInfo: IFileInfo,
            parseResult: ITableParseResult
        ): ITableParseResult;
    }
}
declare module "@ailhc/excel2all/src/convert" {
    /**
     * 转换
     * @param converConfig 解析配置
     */
    export function convert(converConfig: ITableConvertConfig): Promise<void>;
}
