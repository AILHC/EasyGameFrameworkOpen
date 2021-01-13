"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProj = exports.generate = void 0;
var fs = __importStar(require("fs-extra-promise"));
var path = __importStar(require("path"));
var UglifyJS = __importStar(require("uglify-js"));
var rimraf_1 = __importDefault(require("rimraf"));
var root = path.resolve(__filename, '../../');
var pbjs = __importStar(require("protobufjs/cli/pbjs"));
var pbts = __importStar(require("protobufjs/cli/pbts"));
// const pbconfigContent = JSON.stringify({
//     options: {
//         "no-create": false,
//         "no-verify": false,
//         "no-convert": true,
//         "no-delimited": false
//     },
//     concatPbjsLib: true,
//     outputFileType: 0,
//     dtsOutDir: "protofile",
//     outFileName: "proto_bundle",
//     sourceRoot: "protofile",
//     outputDir: "bundles"
// } as ProtobufConfig, null, '\t');
var configFileName = "epbconfig.js";
var configFileDirName = "protobuf";
process.on('unhandledRejection', function (reason, p) {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
function generate(projRootDir) {
    return __awaiter(this, void 0, void 0, function () {
        var pbconfigPath, pbconfig, pbjsFilePaths, clientPbjsFilePath, serverOutputConfig, serverPbjsFilePath, i, dirname, isPbjsDirExit, protoRoot, fileList, protoList, args, pbjsResult, pbjsLib, outPbj, minjs, pbjsLibOutFile, isPbjsLibExit, isPbjsLibDirName, isPbjsLibDirExit, pbjsLibOutFile, isPbjsLibExit, isPbjsLibDirName, isPbjsLibDirExit, dtsOut, isExit_dts, pbtsResult, dtsOutDirPath, isExit_dtsOutDir;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pbconfigPath = path.join(projRootDir, configFileName);
                    return [4 /*yield*/, fs.existsAsync(pbconfigPath)];
                case 1:
                    if (!!(_a.sent())) return [3 /*break*/, 3];
                    pbconfigPath = path.join(projRootDir, configFileDirName, configFileName);
                    return [4 /*yield*/, fs.existsAsync(pbconfigPath)];
                case 2:
                    if (!(_a.sent())) {
                        throw '请首先执行 pb-egf init 命令';
                    }
                    _a.label = 3;
                case 3:
                    pbconfig = require(path.resolve(pbconfigPath));
                    pbjsFilePaths = [];
                    //处理客户端输出路径
                    if (!pbconfig.outputDir) {
                        console.log("[egf-protobuf]outputDir\u914D\u7F6E\u4E3A\u7A7A\uFF0C\u9ED8\u8BA4\u8F93\u51FA\u5230\u914D\u7F6E\u6839\u76EE\u5F55");
                        pbconfig.outputDir = projRootDir;
                    }
                    clientPbjsFilePath = path.join(projRootDir, pbconfig.outputDir, pbconfig.outFileName + ".js");
                    pbjsFilePaths.push(clientPbjsFilePath);
                    serverOutputConfig = pbconfig.serverOutputConfig;
                    if (serverOutputConfig && serverOutputConfig.pbjsOutDir) {
                        serverPbjsFilePath = path.join(projRootDir, serverOutputConfig.pbjsOutDir, pbconfig.outFileName + ".js");
                        pbjsFilePaths.push(serverPbjsFilePath);
                    }
                    i = 0;
                    _a.label = 4;
                case 4:
                    if (!(i < pbjsFilePaths.length)) return [3 /*break*/, 8];
                    dirname = path.dirname(pbjsFilePaths[i]);
                    return [4 /*yield*/, fs.existsAsync(dirname)];
                case 5:
                    isPbjsDirExit = _a.sent();
                    if (!!isPbjsDirExit) return [3 /*break*/, 7];
                    return [4 /*yield*/, fs.mkdirpAsync(dirname).catch(function (res) {
                            console.log(res);
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 4];
                case 8:
                    protoRoot = path.join(projRootDir, pbconfig.sourceRoot);
                    return [4 /*yield*/, fs.readdirAsync(protoRoot)];
                case 9:
                    fileList = _a.sent();
                    protoList = fileList.filter(function (item) { return path.extname(item) === '.proto'; });
                    if (protoList.length == 0) {
                        throw ' protofile 文件夹中不存在 .proto 文件';
                    }
                    return [4 /*yield*/, Promise.all(protoList.map(function (protofile) { return __awaiter(_this, void 0, void 0, function () {
                            var content;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fs.readFileAsync(path.join(protoRoot, protofile), 'utf-8')];
                                    case 1:
                                        content = _a.sent();
                                        if (content.indexOf('package') == -1) {
                                            throw protofile + " \u4E2D\u5FC5\u987B\u5305\u542B package \u5B57\u6BB5";
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 10:
                    _a.sent();
                    args = ['-t', 'static', '--keep-case', '-p', protoRoot].concat(protoList);
                    if (pbconfig.options['no-create']) {
                        args.unshift('--no-create');
                    }
                    if (pbconfig.options['no-verify']) {
                        args.unshift('--no-verify');
                    }
                    if (pbconfig.options['no-convert']) {
                        args.unshift('--no-convert');
                    }
                    if (pbconfig.options["no-delimited"]) {
                        args.unshift("--no-delimited");
                    }
                    console.log("[egf-protobuf]解析proto文件");
                    return [4 /*yield*/, new Promise(function (res) {
                            pbjs.main(args, function (err, output) {
                                if (err) {
                                    console.error(err);
                                }
                                res(output);
                                return {};
                            });
                        })];
                case 11:
                    pbjsResult = _a.sent();
                    return [4 /*yield*/, fs.readFileAsync(path.join(root, 'pblib/protobuf-library.min.js')).catch(function (res) { console.log(res); })];
                case 12:
                    pbjsLib = _a.sent();
                    outPbj = (pbconfig.concatPbjsLib ? pbjsLib : "") + 'var $protobuf = window.protobuf;\n$protobuf.roots.default=window;\n' + pbjsResult;
                    console.log("[egf-protobuf]解析proto文件->完成");
                    if (!(pbconfig.outputFileType === 0 || pbconfig.outputFileType === 1)) return [3 /*break*/, 14];
                    console.log("[egf-protobuf]输出客户端proto文件的js文件");
                    return [4 /*yield*/, fs.writeFileAsync(clientPbjsFilePath, outPbj, 'utf-8').catch(function (res) { console.log(res); })];
                case 13:
                    _a.sent();
                    ;
                    console.log("[egf-protobuf]输出客户端proto文件的js文件->完成");
                    _a.label = 14;
                case 14:
                    if (!(pbconfig.outputFileType === 0 || pbconfig.outputFileType === 2)) return [3 /*break*/, 16];
                    console.log("[egf-protobuf]生成客户端的 .min.js文件");
                    minjs = UglifyJS.minify(outPbj);
                    return [4 /*yield*/, fs.writeFileAsync(clientPbjsFilePath, outPbj, 'utf-8').catch(function (res) { console.log(res); })];
                case 15:
                    _a.sent();
                    ;
                    console.log("[egf-protobuf]生成客户端的.min.js文件->完成");
                    _a.label = 16;
                case 16:
                    if (!serverPbjsFilePath) return [3 /*break*/, 18];
                    console.log("[egf-protobuf]输出服务端proto文件的js文件");
                    return [4 /*yield*/, fs.writeFileAsync(serverPbjsFilePath, outPbj, 'utf-8').catch(function (res) { console.log(res); })];
                case 17:
                    _a.sent();
                    ;
                    console.log("[egf-protobuf]输出服务端proto文件的js文件->完成");
                    _a.label = 18;
                case 18:
                    if (!(serverOutputConfig && serverOutputConfig.pbjsLibDir)) return [3 /*break*/, 24];
                    pbjsLibOutFile = path.join(projRootDir, serverOutputConfig.pbjsLibDir, "protobuf-library.js");
                    return [4 /*yield*/, fs.existsAsync(pbjsLibOutFile)];
                case 19:
                    isPbjsLibExit = _a.sent();
                    if (!!isPbjsLibExit) return [3 /*break*/, 24];
                    isPbjsLibDirName = path.dirname(pbjsLibOutFile);
                    return [4 /*yield*/, fs.existsAsync(isPbjsLibDirName)];
                case 20:
                    isPbjsLibDirExit = _a.sent();
                    if (!!isPbjsLibDirExit) return [3 /*break*/, 22];
                    return [4 /*yield*/, fs.mkdirpAsync(isPbjsLibDirName).catch(function (res) {
                            console.log(res);
                        })];
                case 21:
                    _a.sent();
                    _a.label = 22;
                case 22:
                    console.log("[egf-protobuf]写入服务端protobufjs库文件");
                    return [4 /*yield*/, fs.writeFileAsync(pbjsLibOutFile, pbjsLib, 'utf-8').catch(function (res) { console.log(res); })];
                case 23:
                    _a.sent();
                    ;
                    console.log("[egf-protobuf]写入服务端protobufjs库文件->完成");
                    _a.label = 24;
                case 24:
                    if (!!pbconfig.concatPbjsLib) return [3 /*break*/, 30];
                    if (!pbconfig.pbjsLibDir) return [3 /*break*/, 30];
                    pbjsLibOutFile = path.join(projRootDir, pbconfig.pbjsLibDir, "protobuf-library.min.js");
                    return [4 /*yield*/, fs.existsAsync(pbjsLibOutFile)];
                case 25:
                    isPbjsLibExit = _a.sent();
                    if (!!isPbjsLibExit) return [3 /*break*/, 30];
                    isPbjsLibDirName = path.dirname(pbjsLibOutFile);
                    return [4 /*yield*/, fs.existsAsync(isPbjsLibDirName)];
                case 26:
                    isPbjsLibDirExit = _a.sent();
                    if (!!isPbjsLibDirExit) return [3 /*break*/, 28];
                    return [4 /*yield*/, fs.mkdirpAsync(isPbjsLibDirName).catch(function (res) {
                            console.log(res);
                        })];
                case 27:
                    _a.sent();
                    _a.label = 28;
                case 28:
                    console.log("[egf-protobuf]写入protobufjs库文件");
                    return [4 /*yield*/, fs.writeFileAsync(pbjsLibOutFile, pbjsLib, 'utf-8').catch(function (res) { console.log(res); })];
                case 29:
                    _a.sent();
                    ;
                    console.log("[egf-protobuf]写入客户端的protobufjs库文件");
                    _a.label = 30;
                case 30:
                    dtsOut = path.join(projRootDir, pbconfig.dtsOutDir, pbconfig.outFileName + ".d.ts");
                    return [4 /*yield*/, fs.existsAsync(dtsOut)];
                case 31:
                    isExit_dts = _a.sent();
                    if (!isExit_dts) return [3 /*break*/, 33];
                    console.log("[egf-protobuf]\u5220\u9664\u65E7.d.ts\u6587\u4EF6:" + dtsOut);
                    return [4 /*yield*/, new Promise(function (res, rej) {
                            rimraf_1.default(dtsOut, function () {
                                res();
                            });
                        })];
                case 32:
                    _a.sent();
                    _a.label = 33;
                case 33:
                    console.log("[egf-protobuf]解析js文件生成.d.ts中");
                    return [4 /*yield*/, new Promise(function (res) {
                            pbts.main(['--main', pbjsFilePaths[0]], function (err, output) {
                                if (err) {
                                    console.error(err);
                                }
                                res(output);
                                return {};
                            });
                        })
                        // pbtsResult = await fs.readFileAsync(tempfile, 'utf-8').catch(function (res) { console.log(res) }) as any;
                    ];
                case 34:
                    pbtsResult = _a.sent();
                    // pbtsResult = await fs.readFileAsync(tempfile, 'utf-8').catch(function (res) { console.log(res) }) as any;
                    pbtsResult = pbtsResult.replace(/\$protobuf/gi, "protobuf").replace(/export namespace/gi, 'declare namespace');
                    pbtsResult = 'type Long = protobuf.Long;\n' + pbtsResult;
                    console.log("[egf-protobuf]解析js文件->完成");
                    dtsOutDirPath = path.dirname(dtsOut);
                    if (!(projRootDir !== dtsOutDirPath)) return [3 /*break*/, 37];
                    return [4 /*yield*/, fs.existsAsync(dtsOutDirPath)];
                case 35:
                    isExit_dtsOutDir = _a.sent();
                    if (!!isExit_dtsOutDir) return [3 /*break*/, 37];
                    //
                    console.log("[egf-protobuf]\u521B\u5EFA.d.ts \u7684\u6587\u4EF6\u5939:" + dtsOutDirPath + "->");
                    return [4 /*yield*/, fs.mkdirAsync(dtsOutDirPath)];
                case 36:
                    _a.sent();
                    _a.label = 37;
                case 37:
                    console.log("[egf-protobuf]生成.d.ts文件->");
                    return [4 /*yield*/, fs.writeFileAsync(dtsOut, pbtsResult, 'utf-8').catch(function (res) { console.log(res); })];
                case 38:
                    _a.sent();
                    ;
                    console.log("[egf-protobuf]生成.d.ts文件->完成");
                    return [2 /*return*/];
            }
        });
    });
}
exports.generate = generate;
var configTemplateDirPath = path.join(root, "config-template");
function initProj(projRoot, projType) {
    if (projRoot === void 0) { projRoot = "."; }
    return __awaiter(this, void 0, void 0, function () {
        var protoLibDirPath, protoFilesDirPath, configFileDirPath, egretPropertiesPath, egretProperties, tsconfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('[egf-protobuf]初始化开始...');
                    protoLibDirPath = path.join(projRoot, configFileDirName, 'library');
                    console.log("[egf-protobuf]\u590D\u5236protobufjs\u5E93\u5230\uFF1A" + protoLibDirPath);
                    return [4 /*yield*/, fs.copyAsync(path.join(root, 'pblib'), protoLibDirPath).catch(function (res) { console.log(res); })];
                case 1:
                    _a.sent();
                    ;
                    console.log("[egf-protobuf]\u590D\u5236protobufjs\u5E93\u5B8C\u6210");
                    console.log("[egf-protobuf]\u521B\u5EFAprotofiles\u6587\u4EF6\u5939");
                    protoFilesDirPath = path.join(projRoot, configFileDirName, 'protofiles');
                    return [4 /*yield*/, fs.mkdirpSync(protoFilesDirPath)];
                case 2:
                    _a.sent();
                    console.log("[egf-protobuf]\u521B\u5EFAprotofiles\u6587\u4EF6\u5939\u5B8C\u6210");
                    configFileDirPath = path.join(projRoot, configFileDirName);
                    console.log("[egf-protobuf]\u590D\u5236\u914D\u7F6E\u6A21\u677F\u5230\uFF1A" + configFileDirPath);
                    return [4 /*yield*/, fs.copyAsync(configTemplateDirPath, configFileDirPath)];
                case 3:
                    _a.sent();
                    console.log("[egf-protobuf]\u590D\u5236\u914D\u7F6E\u6A21\u677F\u5B8C\u6210");
                    if (!(projType === "egret")) return [3 /*break*/, 10];
                    egretPropertiesPath = path.join(projRoot, 'egretProperties.json');
                    return [4 /*yield*/, fs.existsAsync(egretPropertiesPath)];
                case 4:
                    if (!_a.sent()) return [3 /*break*/, 9];
                    console.log('正在将 protobuf 添加到 egretProperties.json 中...');
                    return [4 /*yield*/, fs.readJSONAsync(egretPropertiesPath)];
                case 5:
                    egretProperties = _a.sent();
                    egretProperties.modules.push({ name: 'protobuf-library', path: 'protobuf/library' });
                    egretProperties.modules.push({ name: 'protobuf-bundles', path: 'protobuf/bundles' });
                    return [4 /*yield*/, fs.writeFileAsync(path.join(projRoot, 'egretProperties.json'), JSON.stringify(egretProperties, null, '\t\t'))];
                case 6:
                    _a.sent();
                    console.log('正在将 protobuf 添加到 tsconfig.json 中...');
                    return [4 /*yield*/, fs.readJSONAsync(path.join(projRoot, 'tsconfig.json'))];
                case 7:
                    tsconfig = _a.sent();
                    tsconfig.include.push('protobuf/**/*.d.ts');
                    return [4 /*yield*/, fs.writeFileAsync(path.join(projRoot, 'tsconfig.json'), JSON.stringify(tsconfig, null, '\t\t')).catch(function (res) { console.log(res); })];
                case 8:
                    _a.sent();
                    ;
                    return [3 /*break*/, 10];
                case 9:
                    console.log('输入的文件夹不是白鹭引擎项目');
                    _a.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.initProj = initProj;
//# sourceMappingURL=index.js.map