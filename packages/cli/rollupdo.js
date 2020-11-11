const typescript = require('rollup-plugin-typescript2');
const rollup = require("rollup");
const rollupCjs = require("rollup-plugin-commonjs");
const nodeResolve = require("rollup-plugin-node-resolve");
const path = require("path");
const matched = require("matched")
const fs = require("fs");
const rdts = require("rollup-plugin-dts").default;
const npmDts = require("npm-dts");
const dtsGenerator = require('dts-generator');

var curPackFiles = null;  //当前包的所有的文件
var mentry = 'multientry:entry-point';
function myMultiInput() {
    var include = [];
    var exclude = [];
    //解析输入的路径
    function configure(config) {
        if (typeof config === 'string') {
            include = [config];
        } else if (Array.isArray(config)) {
            include = config;
        } else {
            include = config.include || [];
            exclude = config.exclude || [];

            if (config.exports === false) {
                exporter = function exporter(p) {
                    if (p.substr(p.length - 3) == '.ts') {
                        p = p.substr(0, p.length - 3);
                    }
                    return `import ${JSON.stringify(p)};`;
                };
            }
        }
    }
    /**将每个ts文件里的东西导出 返回 export * from <path> */
    var exporter = function exporter(p) {
        if (p.substr(p.length - 3) == '.ts') {
            p = p.substr(0, p.length - 3);
        }
        return `export * from ${JSON.stringify(p)};`;
    };

    return (
        {   //解析调用rollup时传入的配置
            options(options) {
                configure(options.input);
                options.input = mentry;
            },
            //解决每个文件里的引用
            //id 被引用的文件，importer引用者
            resolveId(id, importer) {//entry是个特殊字符串，rollup并不识别，所以假装这里解析一下
                if (id === mentry) {//被引用的是多路径就返回
                    return mentry;
                }
                if (mentry == importer)//引用者是多路径集合返回
                    return;
                //以下处理，是Laya针对，引用的文件不存在于这个包内的，返回Laya的标识，当作全局引用处理
                var importfile = path.join(path.dirname(importer), id);
                var ext = path.extname(importfile);
                if (ext != '.ts' && ext != '.glsl' && ext != '.vs' && ext != '.ps' && ext != '.fs') {
                    importfile += '.ts';
                }
                //console.log('import ', importfile);
                // if (curPackFiles.indexOf(importfile) < 0) {
                //     //其他包里的文件
                //     // console.log('other pack:',id,'importer=', importer);
                //     return 'Laya';
                // }
            },
            load(id) {
                //id加载的文件名
                if (id === mentry) {
                    //是多路径集合
                    if (!include.length) {
                        return Promise.resolve('');
                    }
                    //拼接匹配正则
                    var patterns = include.concat(exclude.map(function (pattern) {
                        return '!' + pattern;
                    }));
                    //匹配出符合规则的路径集合
                    return matched.promise(patterns, { realpath: true }).then(function (paths) {
                        curPackFiles = paths;   // 记录一下所有的文件
                        paths.sort();//将路径集合排序一下
                        /**
                         * 遍历生成
                         * 类似
                         * export * from "<path1>";
                         * export * from "<path2>";
                         */
                        const matchExportResult = paths.map(exporter).join('\n');
                        return matchExportResult
                    });
                } else {
                    //console.log('load ',id);
                }
            }
        }
    );
}
const tsconfigOverride = {
    compilerOptions: {}
}
/**
 * 构建
 * @param {boolean} isWatch 是否监视
 * @param {string} entry 入口文件 默认src/index.ts
 * @param {string} output 输出文件 默认dist/${format}/lib/index.js
 * @param {string} format 输出格式 默认cjs,可选iife,umd,es  
 *  如果是iife和umd 需要加:<globalName> 冒号+全局变量名
 * @param {string} typesDir 声明文件输出目录 默认 dist/types
 * @param {string} sourceDir 源码目录数组，默认[src]
 * @param {string} unRemoveComments 不移除注释
 * @param {string} target 目标es标准
 */
async function rollupBuild(isWatch, entry, output, format, typesDir, sourceDir, unRemoveComments, target) {
    let moduleName;
    let customDts;
    let useFooter;
    if (format.includes("iife") || format.includes("umd")) {
        const strs = format.split(":");
        format = strs[0];
        moduleName = strs[1];
        customDts = true;
        useFooter = true;
    }
    if (format.includes("system")) {
        const strs = format.split(":");
        format = strs[0];
        moduleName = strs[1];
    }
    if (!moduleName) {
        const package = require(path.join(process.cwd(), `package.json`));
        moduleName = package.name;
    }
    if (!format) {
        format = "cjs"
    }
    if (!entry) {
        entry = "src/index.ts";
    }
    if (!output) {
        output = `dist/${format}/lib/index.js`
    }
    if (!typesDir) {
        typesDir = `dist/${format}/types`;
    }
    if (unRemoveComments !== undefined) {
        tsconfigOverride.compilerOptions.removeComments = !unRemoveComments;
    }

    tsconfigOverride.compilerOptions.declarationDir = typesDir;
    tsconfigOverride.compilerOptions.target = target ? target : "es5";
    tsconfigOverride.compilerOptions.declaration = false;
    const tsconfig = require(path.join(process.cwd(), `tsconfig.json`));
    let exclude;
    if (!tsconfig.exclude) {
        exclude = ["__tests__"];
    } else if (!tsconfig.exclude.includes("__tests__")) {
        exclude = tsconfig.exclude;
        exclude.push("__tests__");
    }
    tsconfigOverride.exclude = exclude;
    /**
     * @type {import('rollup').InputOptions}
     */
    const buildConfig = {
        //输出log便于调试
        onwarn: function ({ loc, frame, message }) {
            // 打印位置（如果适用）
            if (loc) {
                console.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
                if (frame) console.warn(frame);
            } else {
                console.warn(message);
            }
        },
        input: entry,
        plugins: [
            // myMultiInput(),
            typescript({
                clean: true,
                tsconfigOverride: tsconfigOverride,
                useTsconfigDeclarationDir: true,
            }),
            rollupCjs(),
            nodeResolve({
                customResolveOptions: {
                    moduleDirectory: "node_modules"
                }
            }),
            // rdts()
        ]
    }
    /**
     * @type { import('rollup').OutputOptions }
     */
    let outputOption = {
        file: output,
        format: format,
        name: moduleName,
        // globals: {
        //     fairygui: "fairygui",
        //     Laya: "Laya"
        // },
        footer: moduleName && useFooter ? `window.${moduleName}?Object.assign({},window.${moduleName}):(window.${moduleName} = ${moduleName})` : ''
    }

    if (isWatch) {
        /**@type {import('rollup').RollupWatchOptions} */
        const watchConfig = buildConfig;
        watchConfig.output = outputOption;
        watchConfig.watch = {
            clearScreen: true
        }
        const rollupWatcher = await rollup.watch(watchConfig);
        rollupWatcher.on("event", (event) => {
            if (event.code === "START") {

            } else if (event.code === "BUNDLE_START") {
                console.log("开始构建");
                console.log(event.output);
            } else if (event.code === "BUNDLE_END") {
                console.log("构建结束");
            }
            else if (event.code === "END") {
                console.log(`结束`)
            } else if (event.code === "ERROR") {
                console.error(`构建错误`, event.error);
            }


        })
    } else {
        /**
         * @type { import('rollup').RollupBuild }
         */
        let rollupBuild;
        rollupBuild = await rollup.rollup(buildConfig);
        await rollupBuild.write(outputOption);
        // /**
        //  * @type {dtsGenerator}
        //  */
        // const dtsGen = require("dts-generator").default;

        // const typesDirPath = path.join(process.cwd(), typesDir);
        // const dtsFileName = moduleName.includes("@") ? moduleName.split("/")[1] : moduleName;
        // dtsGen({
        //     baseDir: path.resolve(process.cwd()),
        //     exclude: ["__tests__/**/*.ts", "node_modules/**/*.d.ts"],
        //     out: path.resolve(typesDirPath, `${dtsFileName}.d.ts`),
        //     // prefix: moduleName,
        //     resolveModuleId: function (params) {
        //         console.log(params.currentModuleId)
        //         if (params.currentModuleId === entry.split(".")[0]) {
        //             return moduleName;
        //         }
        //         return `${moduleName}/${params.currentModuleId}`
        //     },
        //     resolveModuleImport: function (params) {
        //         console.log(params)
        //         // {
        //         //     importedModuleId: './interfaces',
        //         //     currentModuleId: 'src/index',
        //         //     isDeclaredExternalModule: false
        //         //   }
        //         if (params.currentModuleId === entry.split(".")[0]) {
        //             return moduleName;
        //         }
        //         return params.importedModuleId
        //     }
        // })
        //npm-dts
        const typesDirPath = path.join(process.cwd(), typesDir);
        const dtsFileName = moduleName.includes("@") ? moduleName.split("/")[1] : moduleName;
        if(!fs.existsSync(typesDirPath)){
            fs.mkdirSync(typesDirPath);
        }
        new npmDts.Generator({
            entry: path.resolve(process.cwd(),entry),
            root: path.resolve(process.cwd()),
            tmp: path.resolve(process.cwd(), 'cache/tmp'),
            output: path.resolve(typesDirPath, `${dtsFileName}.d.ts`),
            tsc: '--project tsconfigDts.json --extendedDiagnostics',
        }).generate()
        // if (customDts) {
        //     const modules = rollupBuild.cache.modules;
        //     let fileName;
        //     let dtsFilePath;
        //     let dtsStr = "";
        //     const sigleDtsFilePath = path.join(process.cwd(), `dist/${format}`, `${moduleName}.d.ts`);
        //     if (fs.existsSync(sigleDtsFilePath)) {
        //         fs.unlinkSync(sigleDtsFilePath);
        //     }

        //     // fs.readdirSync(path.join(process.cwd(), typesDir))
        //     const typesDirPath = path.join(process.cwd(), typesDir);
        //     const declareGlobalRegex = /(declare global \{{1})([\s\S]*\}{1})([\s]*\}{1})/g;
        //     const importRegex = /import\s?{\s?[\w\d]*?\s?}\s?from\s?"[\w\W]*?";?/g
        //     fs.readdir(typesDirPath, function (err, files) {
        //         let str;
        //         let regexMatch;
        //         for (let i = 0; i < files.length; i++) {
        //             if (files[i] === "index.d.ts") continue;
        //             // if (files[i] === "index.d.ts" || files[i].includes("interface")) continue;
        //             str = fs.readFileSync(path.join(typesDirPath, files[i]), "utf8");
        //             regexMatch = importRegex.exec(str);
        //             if (regexMatch) {
        //                 regexMatch.forEach(function (match) {
        //                     str = str.replace(match, "")
        //                 })
        //             }
        //             regexMatch = declareGlobalRegex.exec(str)
        //             if (regexMatch) {
        //                 dtsStr += regexMatch[2];
        //             } else {
        //                 dtsStr += str;
        //             }

        //         }
        //         dtsStr = dtsStr.replace(/export {}/g, "");
        //         dtsStr = dtsStr.replace(/export declare /g, "");
        //         dtsStr = dtsStr.replace(/export default /g, "");

        //         dtsStr = `declare namespace ${moduleName} {\n` + dtsStr + "}\n";

        //         fs.writeFileSync(sigleDtsFilePath, dtsStr, "utf8");
        //     })
        //     // for (let i = 0; i < modules.length; i++) {
        //     //     fileName = modules[i].id.includes("/") ? modules[i].id.split("/").pop() : modules[i].id.split("\\").pop();
        //     //     if (fileName === "index.ts") {
        //     //         continue;
        //     //     }
        //     //     dtsFilePath = path.join(process.cwd(), typesDir, fileName.replace(".ts", ".d.ts"));
        //     //     dtsStr += fs.readFileSync(dtsFilePath, "utf8");

        //     // }

        // }
    }

}
module.exports = {
    build: rollupBuild,
}