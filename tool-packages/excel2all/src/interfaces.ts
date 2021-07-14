declare global {
    /**
     * 多线程传递数据
     */
    interface IWorkerShareData {
        /**线程id */
        threadId: number;
        /**解析配置 */
        convertConfig: ITableConvertConfig;
        /**需要解析的文件数组 */
        fileInfos: IFileInfo[];
        /**解析结果 */
        parseResultMap: TableParseResultMap;
    }
    /**
     * 多线程执行结果
     */
    interface IWorkDoResult {
        /**线程id */
        threadId: number;
        /**解析结果 */
        parseResultMap: TableParseResultMap;
        /**日志 */
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
        /**解析出错，缓存无效 */
        hasError?: boolean;
        /**文件路径 */
        filePath: string;
        /**文件哈希值 */
        md5hash?: string;
    }
    interface ITableConvertCacheData {
        /**库版本，版本不一样缓存自动失效 */
        version: string;
        /**解析结果缓存 */
        parseResultMap: TableParseResultMap;
    }
    /**
     * 所有配置表解析结果字典
     * key为表的文件路径，value为解析结果
     */
    type TableParseResultMap = { [key: string]: ITableParseResult };
    /**
     * 配置
     */

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
         * 缓存文件的文件夹路径，可以是相对路径，相对于projRoot
         * 默认是项目根目录下的.excel2all文件夹
         */
        cacheFileDirPath?: string;

        /**
         * 文件名匹配规则 ,默认匹配规则 [".\\**\\*.xlsx", ".\\**\\*.csv", "!**\\~$*.*", "!**\\~.*.*", "!.git\\**\\*", "!.svn\\**\\*"]
         * 匹配所有后缀为.xlsx和.csv的文件，如果符合~$*.* 或~.*.* 则排除(那个是excel文件的临时文件)
         * 匹配规则第一个必须带 ./ 否则匹配会出问题
         * 具体匹配规则参考：https://github.com/mrmlnc/fast-glob#pattern-syntax
         */
        pattern?: string[];

        /**日志等级 ,只是限制了控制台输出，但不限制日志记录*/
        logLevel?: LogLevel;
        /**
         * 日志文件夹路径,默认输出到.excell2all/excell2all.log
         * 可以是绝对或相对路径，相对路径相对于projRoot
         * 填false则不生成log文件
         */
        outputLogDirPath?: string | boolean;
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
        /**配置 */
        convertConfig: ITableConvertConfig;

        /**
         * 变动的文件信息数组
         */
        changedFileInfos?: IFileInfo[];
        /**
         * 删除了的文件信息数组
         */
        deleteFileInfos?: IFileInfo[];
        /**
         * 解析结果字典
         */
        parseResultMap?: TableParseResultMap;
        /**解析缓存 */
        cacheData?: ITableConvertCacheData;
        /**
         * 转换结果字典
         */
        outPutFileMap?: OutPutFileMap;

        /**
         * 是否出错
         */
        hasError?: boolean;
        /**
         * 缓存文件路径
         */
        parseResultMapCacheFilePath?: string;
        utils: {
            /**
             * 好用的第三方文件工具库
             */
            fs: typeof import("fs-extra");
            /**
             * excel表解析库
             *  */
            xlsx: typeof import("xlsx");
        };
    }

    interface IConvertHook {
        /**
         * 开始转换
         * 处理好配置
         * @param context 上下文
         * @param cb 生命周期结束回调,必须调用
         */
        onStart?(context: IConvertContext, cb: VoidFunction): void;
        /**
         * 遍历文件之后，解析之前
         * @param context 上下文
         * @param cb 生命周期结束回调,必须调用
         */
        onParseBefore?(context: IConvertContext, cb: VoidFunction): void;
        /**
         * 配置表解析
         * @param context
         * @param cb
         */
        onParse?(context: IConvertContext, cb: VoidFunction): void;
        /**
         * 解析结束
         * 可以转换解析结果为多个任意文件
         * @param context 上下文
         * @param cb 生命周期结束回调,必须调用
         */
        onParseAfter?(context: IConvertContext, cb: VoidFunction): void;
        /**
         * 写入文件结束
         * @param context 上下文
         */
        onConvertEnd?(context: IConvertContext): void;
    }
    /**
     * 输出转换器
     */
    interface ITableParseResultTransformer {
        /**
         * 转换
         * 将结果文件输出路径为key,
         * 输出文件对象(文本就是字符串，或者二进制)为值，
         * 写入IConvertContext.outPutFileMap
         * @param context
         * @param cb 回调，必须调用
         */
        transform(context: IConvertContext, cb: VoidFunction): void;
    }
    interface ITableParser {
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
}
export interface Interfaces {}
