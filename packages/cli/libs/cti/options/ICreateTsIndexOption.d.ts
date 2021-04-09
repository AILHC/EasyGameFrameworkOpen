import * as glob from 'glob';
export interface ICreateTsIndexOption {
    __for_debug_from?: string;
    fileFirst: boolean;
    addNewline: boolean;
    useSemicolon: boolean;
    useTimestamp: boolean;
    includeCWD: boolean;
    withoutComment: boolean;
    excludes: Array<string>;
    fileExcludePatterns: Array<string>;
    targetExts: Array<string>;
    globOptions: glob.IOptions;
    quote: string;
    verbose: boolean;
    withoutBackupFile: boolean;
    output: string;
}
