import { ICreateTsIndexOption } from '../options/ICreateTsIndexOption';
export declare function addDot(ext: string): string;
export declare function addNewline(option: ICreateTsIndexOption, data: string): string;
export declare function isFalsy(value: boolean): boolean;
export declare function isNotEmpty<T>(value?: T | undefined | null): value is T;
export declare function isEmpty<T>(value?: T | undefined | null): value is T;
export declare function parseBool(value?: unknown | undefined | null): boolean;
export declare function getQuote(value: string): string;
declare const _default: {
    addDot: typeof addDot;
    addNewline: typeof addNewline;
    getQuote: typeof getQuote;
    isEmpty: typeof isEmpty;
    isNotEmpty: typeof isNotEmpty;
    parseBool: typeof parseBool;
};
export default _default;
