import { type } from "os";
import * as xlsx from "xlsx";
declare global {
    /**
     * 多线程传递数据
     */
    interface IWorkerShareData {
        /**线程id */
        threadId: number;
        /**解析配置 */
        parseConfig: ITableParseConfig;
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
    type TableParseResultMap = { [key: string]: ITableParseResult };

    interface ITableParseConfig {
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
         * 线程最大处理文件数，默认5
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
         * @type {ITableParseHandler} 实现了ITableParseHandler的类
         *
         * @example
         *
         * export class CustomParseHandler  implements ITableParseHandler {
         *      parseTableFile(parseConfig: ITableParseConfig, fileInfo: IFileInfo, parseResult: ITableParseResult): ITableParseResult {
         *          //doSomething
         *      }
         * }
         *
         * 或者返回一个
         * @type {ParseTableFileFunc} 实现了ParseTableFileFunc的方法
         * @example
         * module.exports = function(
         * parseConfig: ITableParseConfig,
         * fileInfo: IFileInfo,
         *  parseResult: ITableParseResult)
         * {
         *    //dosomething
         *     return OutPutFileMap
         * }
         */
        customParseHandlerPath?: string;
        /**
         * 自定义导出处理器，require(customTrans2FileHandlerPath)
         *
         * 需要返回一个
         * @type {ITransResult2AnyFileHandler} 实现了ITransResult2AnyFileHandler的类
         *
         * @example
         * export class CustomParseHandler  implements ITransResult2AnyFileHandler {
         *  trans2Files(
         *      parseConfig: ITableParseConfig,
         *      changedFileInfos: IFileInfo[],
         *      deleteFileInfos: IFileInfo[],
         *      parseResultMap: TableParseResultMap): OutPutFileMap {
         *      //doSomething
         *
         *  }
         * }
         *
         * 或者返回一个
         * @type {Trans2FilesFunc} 实现了Trans2FilesFunc的方法
         *
         * @example
         *
         * module.exports = function(
         *  parseConfig: ITableParseConfig,
         *  changedFileInfos: IFileInfo[],
         *  deleteFileInfos: IFileInfo[],
         *  parseResultMap: TableParseResultMap)
         * {
         *    //dosomething
         *     return OutPutFileMap
         * }
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
    type OutPutFileMap = { [key: string]: IOutPutFileInfo };

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
            parseConfig: ITableParseConfig,
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
            parseConfig: ITableParseConfig,
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
