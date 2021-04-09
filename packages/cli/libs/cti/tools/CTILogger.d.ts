declare type logFunc = (message?: any, ...optionalParams: Array<any>) => void;
export declare class CTILogger {
    readonly log: logFunc;
    readonly error: logFunc;
    readonly flog: logFunc;
    readonly ferror: logFunc;
    constructor(verbose: boolean);
}
export {};
