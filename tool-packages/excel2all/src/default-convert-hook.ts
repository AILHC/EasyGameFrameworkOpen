import { DefaultOutPutTransformer } from "./default-output-transformer";
import { Logger } from "./loger";

export class DefaultConvertHook implements IConvertHook {
    onStart?(context: IConvertContext, cb: VoidFunction): void {
        Logger.systemLog(`[excel2all] convert-hook onStart`);
        Logger.systemLog(`[excel2all] 开始表转换`);
        cb();
    }
    onParseBefore?(context: IConvertContext, cb: VoidFunction): void {
        Logger.systemLog(`convert-hook onParseBefore`);
        cb();
    }
    onParseAfter?(context: IConvertContext, cb: VoidFunction): void {
        let transformer: IOutPutTransformer = context.outputTransformer;

        transformer.transform(context, cb);
    }
    onWriteFileEnd(context: IConvertContext): void {
        Logger.systemLog(`convert-hook onWriteFileEnd 写入结束`);
    }
}
