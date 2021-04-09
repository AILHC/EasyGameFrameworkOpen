"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concreteConfig = exports.readConfigRC = exports.cleansing = exports.cleanGlobOptions = exports.mergingGlobOptions = exports.merging = exports.createFromCli = exports.getDeafultOptions = exports.getRCFilename = exports.CTIRC_FILENAME = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const deepmerge_1 = tslib_1.__importDefault(require("deepmerge"));
const fs = tslib_1.__importStar(require("fs"));
const json5_1 = tslib_1.__importDefault(require("json5"));
const my_easy_fp_1 = require("my-easy-fp");
const path = tslib_1.__importStar(require("path"));
const util = tslib_1.__importStar(require("util"));
const readFile = util.promisify(fs.readFile);
const exists = util.promisify(fs.exists);
const log = debug_1.default('cti:create-test');
exports.CTIRC_FILENAME = '.ctirc';
const defaultOptions = {
    addNewline: true,
    excludes: ['@types', 'typings', '__test__', '__tests__', 'node_modules'],
    fileExcludePatterns: [],
    fileFirst: false,
    globOptions: {
        cwd: process.cwd(),
        dot: true,
        ignore: ['@types/**', 'typings/**', '__test__/**', '__tests__/**', 'node_modules/**'],
        nonull: true,
    },
    includeCWD: true,
    output: 'index.ts',
    quote: "'",
    targetExts: ['ts', 'tsx'],
    useSemicolon: true,
    useTimestamp: false,
    verbose: false,
    withoutBackupFile: false,
    withoutComment: false,
};
function getRCFilename(configPath) {
    log('Test Path: ', path.join(path.resolve(configPath), exports.CTIRC_FILENAME));
    return path.join(path.resolve(configPath), exports.CTIRC_FILENAME);
}
exports.getRCFilename = getRCFilename;
function getDeafultOptions() {
    return Object.assign(Object.assign({}, defaultOptions), { globOptions: Object.assign({}, defaultOptions.globOptions) });
}
exports.getDeafultOptions = getDeafultOptions;
function createFromCli(args, cwd, output) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return {
        addNewline: (_a = args.addnewline) !== null && _a !== void 0 ? _a : undefined,
        excludes: (_b = args.excludes) !== null && _b !== void 0 ? _b : undefined,
        fileExcludePatterns: (_c = args.fileexcludes) !== null && _c !== void 0 ? _c : undefined,
        fileFirst: (_d = args.filefirst) !== null && _d !== void 0 ? _d : undefined,
        globOptions: {
            cwd,
        },
        includeCWD: (_e = args.includecwd) !== null && _e !== void 0 ? _e : undefined,
        output: (_g = (_f = args.output) !== null && _f !== void 0 ? _f : output) !== null && _g !== void 0 ? _g : undefined,
        quote: (_h = args.quote) !== null && _h !== void 0 ? _h : undefined,
        targetExts: (_j = args.targetexts) !== null && _j !== void 0 ? _j : undefined,
        useSemicolon: (_k = args.usesemicolon) !== null && _k !== void 0 ? _k : undefined,
        useTimestamp: (_l = args.usetimestamp) !== null && _l !== void 0 ? _l : undefined,
        verbose: (_m = args.verbose) !== null && _m !== void 0 ? _m : undefined,
        withoutBackupFile: (_o = args.withoutbackup) !== null && _o !== void 0 ? _o : undefined,
        withoutComment: (_p = args.withoutcomment) !== null && _p !== void 0 ? _p : undefined,
    };
}
exports.createFromCli = createFromCli;
function merging(src, dst) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
    const srcGlobOptions = (_a = cleanGlobOptions(src.globOptions)) !== null && _a !== void 0 ? _a : {};
    const dstGlobOptions = (_b = cleanGlobOptions(dst.globOptions)) !== null && _b !== void 0 ? _b : {};
    const full = {
        addNewline: (_d = (_c = dst.addNewline) !== null && _c !== void 0 ? _c : src.addNewline) !== null && _d !== void 0 ? _d : undefined,
        excludes: (_f = (_e = dst.excludes) !== null && _e !== void 0 ? _e : src.excludes) !== null && _f !== void 0 ? _f : undefined,
        fileExcludePatterns: (_h = (_g = dst.fileExcludePatterns) !== null && _g !== void 0 ? _g : src.fileExcludePatterns) !== null && _h !== void 0 ? _h : undefined,
        fileFirst: (_k = (_j = dst.fileFirst) !== null && _j !== void 0 ? _j : src.fileFirst) !== null && _k !== void 0 ? _k : undefined,
        globOptions: mergingGlobOptions(srcGlobOptions, dstGlobOptions),
        includeCWD: (_m = (_l = dst.includeCWD) !== null && _l !== void 0 ? _l : src.includeCWD) !== null && _m !== void 0 ? _m : undefined,
        output: (_p = (_o = dst.output) !== null && _o !== void 0 ? _o : src.output) !== null && _p !== void 0 ? _p : undefined,
        quote: (_r = (_q = dst.quote) !== null && _q !== void 0 ? _q : src.quote) !== null && _r !== void 0 ? _r : undefined,
        targetExts: (_t = (_s = dst.targetExts) !== null && _s !== void 0 ? _s : src.targetExts) !== null && _t !== void 0 ? _t : undefined,
        useSemicolon: (_v = (_u = dst.useSemicolon) !== null && _u !== void 0 ? _u : src.useSemicolon) !== null && _v !== void 0 ? _v : undefined,
        useTimestamp: (_x = (_w = dst.useTimestamp) !== null && _w !== void 0 ? _w : src.useTimestamp) !== null && _x !== void 0 ? _x : undefined,
        verbose: (_z = (_y = dst.verbose) !== null && _y !== void 0 ? _y : src.verbose) !== null && _z !== void 0 ? _z : undefined,
        withoutBackupFile: (_1 = (_0 = dst.withoutBackupFile) !== null && _0 !== void 0 ? _0 : src.withoutBackupFile) !== null && _1 !== void 0 ? _1 : undefined,
        withoutComment: (_3 = (_2 = dst.withoutComment) !== null && _2 !== void 0 ? _2 : src.withoutComment) !== null && _3 !== void 0 ? _3 : undefined,
    };
    const cleansed = cleansing(full);
    return cleansed;
}
exports.merging = merging;
function mergingGlobOptions(prevSrc, prevDst) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const src = prevSrc !== null && prevSrc !== void 0 ? prevSrc : {};
    const dst = prevDst !== null && prevDst !== void 0 ? prevDst : {};
    return {
        cwd: (_b = (_a = dst.cwd) !== null && _a !== void 0 ? _a : src.cwd) !== null && _b !== void 0 ? _b : defaultOptions.globOptions.cwd,
        dot: (_d = (_c = dst.dot) !== null && _c !== void 0 ? _c : src.dot) !== null && _d !== void 0 ? _d : defaultOptions.globOptions.dot,
        ignore: (_f = (_e = dst.ignore) !== null && _e !== void 0 ? _e : src.ignore) !== null && _f !== void 0 ? _f : defaultOptions.globOptions.ignore,
        nonull: (_h = (_g = dst.nonull) !== null && _g !== void 0 ? _g : src.nonull) !== null && _h !== void 0 ? _h : defaultOptions.globOptions.nonull,
    };
}
exports.mergingGlobOptions = mergingGlobOptions;
function cleanGlobOptions(src) {
    if (src === undefined || src === null) {
        return undefined;
    }
    const globOptions = Object.keys(src).reduce((obj, key) => {
        var _a;
        const srcGlobOptions = src !== null && src !== void 0 ? src : {};
        if (srcGlobOptions[key] !== undefined && srcGlobOptions[key] !== null) {
            obj[key] =
                key === 'cwd'
                    ? path.resolve((_a = srcGlobOptions[key]) !== null && _a !== void 0 ? _a : '')
                    : (obj[key] = srcGlobOptions[key]);
            return obj;
        }
        return obj;
    }, {});
    if (Object.keys(globOptions).length <= 0) {
        return undefined;
    }
    return globOptions;
}
exports.cleanGlobOptions = cleanGlobOptions;
function cleansing(src) {
    var _a;
    const full = {
        addNewline: src.addNewline,
        excludes: src.excludes,
        fileExcludePatterns: src.fileExcludePatterns,
        fileFirst: src.fileFirst,
        globOptions: cleanGlobOptions((_a = src.globOptions) !== null && _a !== void 0 ? _a : {}),
        includeCWD: src.includeCWD,
        output: src.output,
        quote: src.quote,
        targetExts: src.targetExts,
        useSemicolon: src.useSemicolon,
        useTimestamp: src.useTimestamp,
        verbose: src.verbose,
        withoutBackupFile: src.withoutBackupFile,
        withoutComment: src.withoutComment,
    };
    const cleansed = Object.keys(full).reduce((obj, key) => {
        if (src[key] !== undefined && src[key] !== null) {
            obj[key] = src[key];
        }
        return obj;
    }, {});
    return cleansed;
}
exports.cleansing = cleansing;
function readConfigRC(configPath) {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            if (yield exists(configPath)) {
                const readed = yield readFile(configPath);
                const converted = readed.toString();
                const config = json5_1.default.parse(converted);
                const cleansed = cleansing(config);
                if (((_a = cleansed.globOptions) === null || _a === void 0 ? void 0 : _a.cwd) !== undefined && ((_b = cleansed.globOptions) === null || _b === void 0 ? void 0 : _b.cwd) !== null) {
                    cleansed.globOptions.cwd = path.resolve(cleansed.globOptions.cwd);
                    const globOptions = deepmerge_1.default(cleansed.globOptions, defaultOptions.globOptions, {
                        clone: true,
                    });
                    cleansed.globOptions = globOptions;
                }
                cleansed.__for_debug_from = configPath;
                return my_easy_fp_1.epass(cleansed);
            }
            return my_easy_fp_1.epass({});
        }
        catch (err) {
            return my_easy_fp_1.efail(err);
        }
    });
}
exports.readConfigRC = readConfigRC;
function concreteConfig(config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return {
        addNewline: (_a = config.addNewline) !== null && _a !== void 0 ? _a : defaultOptions.addNewline,
        excludes: (_b = config.excludes) !== null && _b !== void 0 ? _b : defaultOptions.excludes,
        fileExcludePatterns: (_c = config.fileExcludePatterns) !== null && _c !== void 0 ? _c : defaultOptions.fileExcludePatterns,
        fileFirst: (_d = config.fileFirst) !== null && _d !== void 0 ? _d : defaultOptions.fileFirst,
        globOptions: (_e = cleanGlobOptions(config.globOptions)) !== null && _e !== void 0 ? _e : defaultOptions.globOptions,
        includeCWD: (_f = config.includeCWD) !== null && _f !== void 0 ? _f : defaultOptions.includeCWD,
        output: (_g = config.output) !== null && _g !== void 0 ? _g : defaultOptions.output,
        quote: (_h = config.quote) !== null && _h !== void 0 ? _h : defaultOptions.quote,
        targetExts: (_j = config.targetExts) !== null && _j !== void 0 ? _j : defaultOptions.targetExts,
        useSemicolon: (_k = config.useSemicolon) !== null && _k !== void 0 ? _k : defaultOptions.useSemicolon,
        useTimestamp: (_l = config.useTimestamp) !== null && _l !== void 0 ? _l : defaultOptions.useTimestamp,
        verbose: (_m = config.verbose) !== null && _m !== void 0 ? _m : defaultOptions.verbose,
        withoutBackupFile: (_o = config.withoutBackupFile) !== null && _o !== void 0 ? _o : defaultOptions.withoutBackupFile,
        withoutComment: (_p = config.withoutComment) !== null && _p !== void 0 ? _p : defaultOptions.withoutComment,
    };
}
exports.concreteConfig = concreteConfig;
//# sourceMappingURL=configure.js.map