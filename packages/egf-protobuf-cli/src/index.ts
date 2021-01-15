import * as child_process from 'child_process';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as UglifyJS from 'uglify-js';
import * as os from 'os';
import rimraf from 'rimraf';
const root = path.resolve(__filename, '../../');
import * as pbjs from "protobufjs/cli/pbjs"
import * as pbts from "protobufjs/cli/pbts"

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
const configFileName = "epbconfig.js";
const configFileDirName = "protobuf";
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
export async function generate(projRootDir: string) {

    let pbconfigPath = path.join(projRootDir, configFileName);
    if (!(await fs.existsAsync(pbconfigPath))) {
        pbconfigPath = path.join(projRootDir, configFileDirName, configFileName);
        if (!(await fs.existsAsync(pbconfigPath))) {
            throw '请首先执行 pb-egf init 命令'
        }
    }
    const pbconfig: EgfProtobufConfig = require(path.resolve(pbconfigPath));
    // const tempfile = path.join(projRootDir, 'pbtemp.js');
    // await fs.mkdirpAsync(path.dirname(tempfile)).catch(function (res) {
    //     console.log(res);
    // });
    // await fs.writeFileAsync(tempfile, "");
    const pbjsFilePaths: string[] = [];
    //处理客户端输出路径
    if (!pbconfig.outputDir) {
        console.log(`[egf-protobuf]outputDir配置为空，默认输出到配置根目录`)
        pbconfig.outputDir = projRootDir;
    }
    const clientPbjsFilePath = path.join(projRootDir, pbconfig.outputDir, pbconfig.outFileName + ".js");
    pbjsFilePaths.push(clientPbjsFilePath);

    //处理服务器输出路径
    const serverOutputConfig = pbconfig.serverOutputConfig;
    let serverPbjsFilePath: string;
    if (serverOutputConfig && serverOutputConfig.pbjsOutDir) {
        serverPbjsFilePath = path.join(projRootDir, serverOutputConfig.pbjsOutDir, pbconfig.outFileName + ".js");
        pbjsFilePaths.push(serverPbjsFilePath);
    }
    //如果文件夹不存在就创建
    for (let i = 0; i < pbjsFilePaths.length; i++) {
        const dirname = path.dirname(pbjsFilePaths[i]);
        const isPbjsDirExit = await fs.existsAsync(dirname);
        if (!isPbjsDirExit) {
            await fs.mkdirpAsync(dirname).catch(function (res) {
                console.log(res);
            });
        }
    }


    const protoRoot = path.join(projRootDir, pbconfig.sourceRoot);
    const fileList = await fs.readdirAsync(protoRoot);
    const protoList = fileList.filter(item => path.extname(item) === '.proto')
    if (protoList.length == 0) {
        throw ' protofile 文件夹中不存在 .proto 文件'
    }
    await Promise.all(protoList.map(async (protofile) => {
        const content = await fs.readFileAsync(path.join(protoRoot, protofile), 'utf-8')
        if (content.indexOf('package') == -1) {
            throw `${protofile} 中必须包含 package 字段`
        }
    }))

    const args = ['-t', 'static', '--keep-case', '-p', protoRoot].concat(protoList);
    if (pbconfig.options['no-create']) {
        args.unshift('--no-create');
    }
    if (pbconfig.options['no-verify']) {
        args.unshift('--no-verify');
    }
    if (pbconfig.options['no-convert']) {
        args.unshift('--no-convert')
    }
    if (pbconfig.options["no-delimited"]) {
        args.unshift("--no-delimited")
    }
    console.log("[egf-protobuf]解析proto文件");
    // await shell('./node_modules/protobufjs/bin/pbjs', args).catch(function (res) {
    //     console.log(res);
    // });
    // let pbjsResult = await fs.readFileAsync(tempfile, 'utf-8').catch(function (res) { console.log(res) });


    const pbjsResult = await new Promise<string>((res) => {
        pbjs.main(args, (err, output) => {
            if (err) {
                console.error(err);
            }
            res(output);
            return {}
        })
    })
    typeof window !== "undefined" && window || typeof global !== "undefined" && global || typeof self !== "undefined" && self || this;
    const libType = "minimal";
    let pbjsLib = await fs.readFileAsync(path.join(root, `pblib/${libType}/protobuf.min.js`)).catch(function (res) { console.log(res) });
    let outPbj = (pbconfig.concatPbjsLib ? pbjsLib : "") + ' (function(global){global.$protobuf = global.protobuf;\n$protobuf.roots.default=global;})(typeof window !== "undefined" && window|| typeof global !== "undefined" && global|| typeof self   !== "undefined" && self|| this)\n' + pbjsResult;
    console.log("[egf-protobuf]解析proto文件->完成");
    if (pbconfig.outputFileType === 0 || pbconfig.outputFileType === 1) {
        console.log("[egf-protobuf]输出客户端proto文件的js文件");
        await fs.writeFileAsync(clientPbjsFilePath, outPbj, 'utf-8').catch(function (res) { console.log(res) });;
        console.log("[egf-protobuf]输出客户端proto文件的js文件->完成");
    }
    if (pbconfig.outputFileType === 0 || pbconfig.outputFileType === 2) {
        console.log("[egf-protobuf]生成客户端的 .min.js文件");
        const minjs = UglifyJS.minify(outPbj);
        await fs.writeFileAsync(clientPbjsFilePath, minjs, 'utf-8').catch(function (res) { console.log(res) });;
        console.log("[egf-protobuf]生成客户端的.min.js文件->完成");
    }
    if (serverPbjsFilePath) {
        console.log("[egf-protobuf]输出服务端proto文件的js文件");
        await fs.writeFileAsync(serverPbjsFilePath, outPbj, 'utf-8').catch(function (res) { console.log(res) });;
        console.log("[egf-protobuf]输出服务端proto文件的js文件->完成");
    }
    // if (serverOutputConfig && serverOutputConfig.pbjsLibDir) {
    //     const pbjsLibOutFile = path.join(projRootDir, serverOutputConfig.pbjsLibDir, "protobuf.js");
    //     const isPbjsLibExit = await fs.existsAsync(pbjsLibOutFile);
    //     if (!isPbjsLibExit) {
    //         const isPbjsLibDirName = path.dirname(pbjsLibOutFile);
    //         const isPbjsLibDirExit = await fs.existsAsync(isPbjsLibDirName);
    //         if (!isPbjsLibDirExit) {
    //             await fs.mkdirpAsync(isPbjsLibDirName).catch(function (res) {
    //                 console.log(res);
    //             });
    //         }
    //         console.log("[egf-protobuf]写入服务端protobufjs库文件");
    //         fs.copyAsync(path.join(root, `pblib/${libType}`), path.join(projRootDir, serverOutputConfig.pbjsLibDir))
    //         // await fs.writeFileAsync(pbjsLibOutFile, pbjsLib, 'utf-8').catch(function (res) { console.log(res) });;
    //         console.log("[egf-protobuf]写入服务端protobufjs库文件->完成");
    //     }
    // }
    // if (!pbconfig.concatPbjsLib) {
    //     if (pbconfig.pbjsLibDir) {
    //         const pbjsLibOutFile = path.join(projRootDir, pbconfig.pbjsLibDir, "protobuf-library.min.js");
    //         const isPbjsLibExit = await fs.existsAsync(pbjsLibOutFile);
    //         if (!isPbjsLibExit) {
    //             const isPbjsLibDirName = path.dirname(pbjsLibOutFile);
    //             const isPbjsLibDirExit = await fs.existsAsync(isPbjsLibDirName);
    //             if (!isPbjsLibDirExit) {
    //                 await fs.mkdirpAsync(isPbjsLibDirName).catch(function (res) {
    //                     console.log(res);
    //                 });
    //             }
    //             console.log("[egf-protobuf]写入protobufjs库文件");
    //             await fs.writeFileAsync(pbjsLibOutFile, pbjsLib, 'utf-8').catch(function (res) { console.log(res) });;
    //             console.log("[egf-protobuf]写入客户端的protobufjs库文件");
    //         }
    //     }

    // }


    console.log("[egf-protobuf]解析js文件生成.d.ts中");
    let pbtsResult = await new Promise<string>((res) => {
        pbts.main(['--main', pbjsFilePaths[0]], (err, output) => {
            if (err) {
                console.error(err);
            }
            res(output);
            return {}
        })
    })
    pbtsResult = pbtsResult.replace(/\$protobuf/gi, "protobuf").replace(/export namespace/gi, 'declare namespace');
    pbtsResult = 'type Long = protobuf.Long;\n' + pbtsResult;
    console.log("[egf-protobuf]解析js文件->完成");
    console.log("[egf-protobuf]生成.d.ts文件->");

    const clientDtsOut = path.join(projRootDir, pbconfig.dtsOutDir, pbconfig.outFileName + ".d.ts");
    const dtsOutFilePaths: string[] = [clientDtsOut];

    let serverDtsOut: string;
    if (serverOutputConfig && serverOutputConfig.dtsOutDir) {
        serverDtsOut = path.join(projRootDir, serverOutputConfig.dtsOutDir, pbconfig.outFileName + ".d.ts");
        dtsOutFilePaths.push(serverDtsOut);
    }
    let dtsOutFilePath: string;
    for (let i = 0; i < dtsOutFilePaths.length; i++) {
        dtsOutFilePath = dtsOutFilePaths[i];
        const isExit_dts = await fs.existsAsync(dtsOutFilePath);
        if (isExit_dts) {
            console.log(`[egf-protobuf]删除旧.d.ts文件:${dtsOutFilePath}`);
            await new Promise<void>((res, rej) => {
                rimraf(dtsOutFilePath, function () {
                    res();
                })
            })
        }
        const dtsOutDirPath = path.dirname(dtsOutFilePath)
        if (projRootDir !== dtsOutDirPath) {
            const isExit_dtsOutDir = await fs.existsAsync(dtsOutDirPath);
            if (!isExit_dtsOutDir) {
                //
                console.log(`[egf-protobuf]创建.d.ts 的文件夹:${dtsOutDirPath}->`);
                await fs.mkdirAsync(dtsOutDirPath);
            }
        }
        await fs.writeFileAsync(dtsOutFilePath, pbtsResult, 'utf-8').catch(function (res) { console.log(res) });;
    }


    // pbtsResult = await fs.readFileAsync(tempfile, 'utf-8').catch(function (res) { console.log(res) }) as any;



    console.log("[egf-protobuf]生成.d.ts文件->完成");

}


const configTemplateDirPath = path.join(root, "config-template");

export async function initProj(projRoot: string = ".", projType: string) {
    console.log('[egf-protobuf]初始化开始...');
    const protoLibDirPath = path.join(projRoot, configFileDirName, 'library');
    console.log(`[egf-protobuf]复制protobufjs库到：${protoLibDirPath}`);
    await fs.copyAsync(path.join(root, 'pblib'), protoLibDirPath).catch(function (res) { console.log(res) });;
    console.log(`[egf-protobuf]复制protobufjs库完成`);
    console.log(`[egf-protobuf]创建protofiles文件夹`);
    const protoFilesDirPath = path.join(projRoot, configFileDirName, 'protofiles');
    await fs.mkdirpSync(protoFilesDirPath);
    console.log(`[egf-protobuf]创建protofiles文件夹完成`);

    const configFileDirPath = path.join(projRoot, configFileDirName);
    console.log(`[egf-protobuf]复制配置模板到：${configFileDirPath}`);
    await fs.copyAsync(configTemplateDirPath, configFileDirPath);
    console.log(`[egf-protobuf]复制配置模板完成`);

    if (projType === "egret") {
        const egretPropertiesPath = path.join(projRoot, 'egretProperties.json');
        if (await fs.existsAsync(egretPropertiesPath)) {
            console.log('正在将 protobuf 添加到 egretProperties.json 中...');
            const egretProperties = await fs.readJSONAsync(egretPropertiesPath);
            egretProperties.modules.push({ name: 'protobuf-library', path: 'protobuf/library' });
            egretProperties.modules.push({ name: 'protobuf-bundles', path: 'protobuf/bundles' });
            await fs.writeFileAsync(path.join(projRoot, 'egretProperties.json'), JSON.stringify(egretProperties, null, '\t\t'));
            console.log('正在将 protobuf 添加到 tsconfig.json 中...');
            const tsconfig = await fs.readJSONAsync(path.join(projRoot, 'tsconfig.json'));
            tsconfig.include.push('protobuf/**/*.d.ts');
            await fs.writeFileAsync(path.join(projRoot, 'tsconfig.json'), JSON.stringify(tsconfig, null, '\t\t')).catch(function (res) { console.log(res) });;
        }
        else {
            console.log('输入的文件夹不是白鹭引擎项目')
        }
    }



}

