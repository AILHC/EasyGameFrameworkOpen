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
    /**
     * 如果有输出过错误信息则为true
     */
    public static hasError: boolean = false;
    public static init(convertConfig: ITableConvertConfig) {
        const level: LogLevel = convertConfig.logLevel ? convertConfig.logLevel : "info";
        this._logLevel = LogLevelEnum[level];
        this._enableOutPutLogFile = convertConfig.outputLogDirPath === false ? false : true;
    }
    /**
     * 输出日志,日志等级只是限制了控制台输出，但不限制日志记录
     * @param message
     * @param level
     */
    public static log(message: string, level: LogLevel = "info") {
        if (level !== "no") {
            if (this._logLevel <= LogLevelEnum[level]) {
                switch (level) {
                    case "error":
                        console.error(message);
                        if (!this.hasError) this.hasError = true;
                        break;
                    case "info":
                        console.log(message);
                        break;
                    case "warn":
                        console.warn(message);
                        break;
                }
            }
        }

        if (!this._enableOutPutLogFile) return;
        this._logStr += message + osEol;
    }
    /**
     * 系统日志输出
     * @param args
     */
    public static systemLog(message: string) {
        console.log(message);
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
