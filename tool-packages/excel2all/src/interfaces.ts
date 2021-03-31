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
    type TableParseResultMap = { [key: string]: ITableParseResult };

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
         * @type {IConvertHook} 实现了ITransResult2AnyFileHandler的对象
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
        customConvertHookPath?: string;
        /**日志等级 ,只是限制了控制台输出，但不限制日志记录*/
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
    interface IConvertContext {
        convertConfig: ITableConvertConfig;
        /**
         * 变动的文件信息数组
         */
        changedFileInfos: IFileInfo[];
        /**
         * 删除了的文件信息数组
         */
        deleteFileInfos: IFileInfo[];
        /**
         * 解析结果字典
         */
        parseResultMap: TableParseResultMap;
        outPutFileMap: OutPutFileMap;
    }
    interface IConvertHook {
        onStart?(context: IConvertContext): void;
        /**
         * 遍历文件之后，解析之前
         * @param context
         */
        onParseBefore?(context: IConvertContext): void;
        /**
         * 解析结束
         * 可以转换解析结果为多个任意文件
         * @param context
         */
        onParseAfter?(context: IConvertContext): void;
        /**
         * 写入文件结束
         * @param context
         */
        onWriteFileEnd(context: IConvertContext): void;
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
    /**文件导出函数 */
    type ParseTableFileFunc = ITableParseHandler["parseTableFile"];
}
export interface Interfaces {}
