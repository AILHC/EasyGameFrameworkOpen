import { osEol } from "./get-os-eol";
import * as path from "path";
enum LogLevelEnum {
    info,
    warn,
    error,
    no
}
export class Logger {
    private static _enableOutPutLogFile: boolean;
    private static _logLevel: LogLevelEnum;
    private static _logStr: string = "";
    public static init(parseConfig: ITableParseConfig) {
        const level: LogLevel = parseConfig.logLevel ? parseConfig.logLevel : "info";
        this._logLevel = LogLevelEnum[level];
        this._enableOutPutLogFile = parseConfig.outputLogFile === undefined ? true : parseConfig.outputLogFile;
    }
    /**
     * 输出日志
     * @param message
     * @param level
     */
    public static log(message: string, level: LogLevel = "info") {
        if (level === "no") return;
        if (this._logLevel <= LogLevelEnum[level]) {
            switch (level) {
                case "error":
                    console.error(message);
                    break;
                case "info":
                    console.log(message);
                    break;
                case "warn":
                    console.warn(message);
                    break;
            }
        }
        if (!this._enableOutPutLogFile) return;
        this._logStr += message + osEol;
    }
    /**
     * 返回日志数据并清空
     */
    public static get logStr(): string {
        if (!this._enableOutPutLogFile) return null;
        const logStr = this._logStr;
        this._logStr = ""; //清空
        return logStr;
    }
}
