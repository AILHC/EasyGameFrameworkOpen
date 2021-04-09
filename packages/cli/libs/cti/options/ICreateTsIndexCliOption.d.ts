export interface ICreateTsIndexCliOption {
    cwds: Array<string> | string;
    output: string;
    filefirst: boolean;
    addnewline: boolean;
    usesemicolon: boolean;
    includecwd: boolean;
    usetimestamp: boolean;
    excludes: Array<string>;
    fileexcludes: Array<string>;
    targetexts: Array<string>;
    verbose: boolean;
    quote: string;
    withoutcomment: boolean;
    withoutbackup: boolean;
}
