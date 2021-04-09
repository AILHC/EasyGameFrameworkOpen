"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = void 0;
exports.options = new Map([
    [
        'filefirst',
        {
            alias: 'f',
            describe: 'export list create filefirst, no option false, option true',
            type: 'boolean',
        },
    ],
    [
        'addnewline',
        {
            alias: 'n',
            describe: 'deside add newline file ending. no option true, option false',
            type: 'boolean',
        },
    ],
    [
        'usesemicolon',
        {
            alias: 's',
            describe: 'deside use semicolon line ending. no option true, option false',
            type: 'boolean',
        },
    ],
    [
        'includecwd',
        {
            alias: 'c',
            describe: 'deside include cwd directory in task. no option true, option false',
            type: 'boolean',
        },
    ],
    [
        'usetimestamp',
        {
            alias: 't',
            describe: `deside use timestamp(YYYY-MM-DD HH:mm) top line comment. \nno option false, option true`,
            type: 'boolean',
        },
    ],
    [
        'excludes',
        {
            alias: 'e',
            array: true,
            describe: `pass exclude directory. default exclude directory is ['@types', 'typings', '__test__', '__tests__']`,
            type: 'string',
        },
    ],
    [
        'fileexcludes',
        {
            alias: 'i',
            array: true,
            describe: 'pass exclude pattern of filename. default exclude directory is "[]"',
            type: 'string',
        },
    ],
    [
        'targetexts',
        {
            alias: 'x',
            array: true,
            describe: `pass include extname. default extname is ["ts", "tsx"]. extname \npass without dot charactor.`,
            type: 'string',
        },
    ],
    [
        'withoutcomment',
        {
            alias: 'w',
            describe: 'remove comment from created file',
            type: 'boolean',
        },
    ],
    [
        'withoutbackup',
        {
            alias: 'b',
            describe: "Don't create backupfile if already exists target file",
            type: 'boolean',
        },
    ],
    [
        'verbose',
        {
            alias: 'v',
            describe: 'verbose logging message. to option false, option true',
            type: 'boolean',
        },
    ],
    [
        'quote',
        {
            alias: 'q',
            describe: "deside quote character. default quote character is '",
            type: 'string',
        },
    ],
    [
        'output',
        {
            alias: 'o',
            describe: 'set output filename. default index.ts or entrypoint.ts',
            type: 'string',
        },
    ],
]);
//# sourceMappingURL=options.js.map