import { DefaultParseResultTransformer } from "./default-result-transformer";
import { DefaultTableParser } from "./default-table-parser";
import { Logger } from "./loger";
export class DefaultConvertHook implements IConvertHook {
    protected _tableParser;
    protected _tableResultTransformer;
    constructor() {
        this._tableParser = new DefaultTableParser();
        this._tableResultTransformer = new DefaultParseResultTransformer();
    }
    onStart?(context: IConvertContext, cb: VoidFunction): void {
        Logger.systemLog(`[excel2all] convert-hook onStart`);
        Logger.systemLog(`[excel2all] 开始表转换`);
        cb();
    }

    onParseBefore?(context: IConvertContext, cb: VoidFunction): void {
        Logger.systemLog(`convert-hook onParseBefore`);
        cb();
    }
    onParse(context: IConvertContext, cb: VoidFunction): void {
        const { changedFileInfos, parseResultMap, convertConfig } = context;
        const tableParser = this._tableParser;
        let parseResult: ITableParseResult;
        let fileNum = changedFileInfos.length;
        let fileInfo: IFileInfo;
        for (let i = 0; i < fileNum; i++) {
            fileInfo = changedFileInfos[i];
            parseResult = parseResultMap[fileInfo.filePath];
            if (!parseResult) {
                parseResult = { filePath: fileInfo.filePath };
            }
            parseResult = tableParser.parseTableFile(convertConfig, fileInfo, parseResult);
            if (parseResult) {
                parseResultMap[fileInfo.filePath] = parseResult;
            }
        }
        cb();
    }
    onParseAfter?(context: IConvertContext, cb: VoidFunction): void {
        let transformer = this._tableResultTransformer;

        transformer.transform(context, cb);
    }
    onConvertEnd(context: IConvertContext): void {
        Logger.systemLog(`convert-hook onWriteFileEnd 写入结束`);
    }
}
