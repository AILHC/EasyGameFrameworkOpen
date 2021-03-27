const typescript = require('rollup-plugin-typescript2');
const rollup = require("rollup");
const rollupCjs = require("rollup-plugin-commonjs");
const nodeResolve = require("rollup-plugin-node-resolve");
const path = require("path");
const matched = require("matched")
const fs = require("fs");
// const npmDts = require("npm-dts");
const dtsGenerator = require('dts-generator');
const jsonPlugin = require("@rollup/plugin-json");
const terser = require("rollup-plugin-terser");
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
 * @param {string} projRoot 项目根目录，默认为执行命令的当前路径
 * @param {boolean} isWatch 是否监视
 * @param {string[]} entrys 入口文件 默认src/index.ts，可以是数组,如果是多入口，则必须有outputDir参数
 * @param {string} outputDir 多输出文件夹
 * @param {string[]} output 输出文件 默认dist/${format}/lib/index.js
 * @param {string} format 输出格式 默认cjs,可选iife,umd,es  
 *  如果是iife和umd 需要加:<globalName> 冒号+全局变量名
 * @param {string} typesDir 声明文件输出目录,默认输出到dist/${format}/types
 * @param {string} sourceDir 源码目录数组，默认[src]
 * @param {string} unRemoveComments 不移除注释
 * @param {string} target 目标es标准
 * @param {boolean} minify 是否压缩
 * @param {boolean} isGenDts 是否生成dts
 * @param {string} banner 输出的文件开头写入的脚本
 */
async function rollupBuild(
    projRoot, isWatch, entrys, outputDir, output,
    format, typesDir, unRemoveComments, target, minify, isGenDts, banner) {

    let moduleName;
    let customDts = false;
    let useFooter;
    if (!projRoot) {
        projRoot = process.cwd();
    }
    if (!path.isAbsolute(projRoot)) {
        projRoot = path.join(process.cwd(), projRoot);
    }
    if (format.includes("iife") || format.includes("umd")) {
        const strs = format.split(":");
        format = strs[0];
        moduleName = strs[1];
        if (!moduleName || moduleName.trim() === "") {
            const pkgName = process.env.npm_package_name;
            if (pkgName.includes("/")) {
                moduleName = pkgName.split("/")[1];
            } else {
                moduleName = pkgName;
            }

            function camelize(str) {
                return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
            }
            moduleName = camelize(moduleName);
        }
        customDts = true;
        useFooter = true;
    }
    if (format.includes("system")) {

        const strs = format.split(":");
        format = strs[0];
        moduleName = strs[1];
    }
    if (!moduleName) {
        moduleName = process.env.npm_package_name;

    }

    if (!format) {
        format = "cjs"
    }
    if (!entrys) {
        entrys = ["src/index.ts"];
    }
    if (entrys.length > 1) {
        if (!outputDir) {
            outputDir = `dist/${format}`;
        }
        output = undefined;
    } else {
        if (!output && (format === "es" || format === "esm")) {
            output = `dist/es/lib/index.mjs`
        }
        if (!output) {
            output = `dist/${format}/lib/index.js`;
        }
    }
    if (!typesDir) {
        typesDir = `dist/${format}/types`;
    }
    if (unRemoveComments !== undefined) {
        tsconfigOverride.compilerOptions.removeComments = !unRemoveComments;
    }

    tsconfigOverride.compilerOptions.declarationDir = typesDir;
    if (target) {
        tsconfigOverride.compilerOptions.target = target;
    }
    tsconfigOverride.compilerOptions.declaration = customDts;
    const tsconfig = require(path.join(projRoot, `tsconfig.json`));
    let exclude = tsconfig.exclude ? tsconfig.exclude : [];
    exclude = exclude.concat(tsconfig.dtsGenExclude ? tsconfig.dtsGenExclude : []);
    let externalTag = tsconfig.externalTag;
    if (typeof externalTag === "object" && typeof externalTag.length === "number") {
        externalTag = externalTag.length > 0 ? externalTag : undefined;
    }
    // console.log(exclude)
    tsconfigOverride.exclude = exclude;
    /**
     * @type {import('rollup-plugin-typescript2/dist/ioptions').IOptions}
     */
    const tsOptions = {
        clean: true,
        abortOnError: false,
        tsconfigOverride: tsconfigOverride,
        useTsconfigDeclarationDir: true,
    }
    for (let i = 0; i < entrys.length; i++) {
        entrys[i] = path.join(projRoot, entrys[i]);
    }

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
        external: (source,
            importer,
            isResolved) => {
            if (!externalTag || externalTag === "") return false;
            let tag = externalTag;
            let isExternal = false;
            if (typeof externalTag === "object" && externalTag.length) {
                for (let i = 0; i < externalTag.length; i++) {
                    tag = externalTag[i];
                    isExternal = source.includes(tag);
                    if (isExternal) break;
                }
            } else {
                isExternal = source.includes(tag);
            }
            if (isExternal) {
                console.log(`'${source}' is imported by ${importer}, is custom external  – treating it as an external dependency`)

            }
            return isExternal;

        },
        input: entrys,
        plugins: [
            // myMultiInput(),
            jsonPlugin(),
            typescript(tsOptions),
            rollupCjs(),
            nodeResolve({
                customResolveOptions: {
                    moduleDirectory: "node_modules"
                }
            })
            // rdts()
        ]
    }
    // /**
    //  * @type { import('rollup').OutputOptions[] }
    //  */
    // const outputOpts = [];
    // for (let i = 0; i < outputs.length; i++) {

    //     outputOpts.push(outputOption);
    // }
    if (output && !path.isAbsolute(output)) {
        output = path.join(projRoot, output);
    }
    if (outputDir && !path.isAbsolute(outputDir)) {
        outputDir = path.join(projRoot, outputDir);
    }
    /**
     * @type { import('rollup').OutputOptions }
     */
    let outputOption = {
        file: output,
        chunkFileNames:"[name].js",//公共模块生成规则
        entryFileNames: (chunkInfo) => {
            if (format === "es" || format === "esm") {
                return `[name].mjs`
            } else {
                return `[name].js`
            }
        },
        dir: outputDir,
        format: format,
        name: moduleName,
        sourcemap: tsconfig.compilerOptions.sourceMap ? "inline" : false,
        // globals: {
        //     fairygui: "fairygui",
        //     Laya: "Laya"
        // },
        banner: banner,
        footer: moduleName && useFooter ? `var globalTarget =window?window:global; globalTarget.${moduleName}?Object.assign({},globalTarget.${moduleName}):(globalTarget.${moduleName} = ${moduleName})` : ''

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
                isGenDts && !customDts && genDts(projRoot, entrys, format, typesDir, moduleName, customDts);
                console.log(event.output);
            } else if (event.code === "BUNDLE_END") {
                console.log("构建结束");
                isGenDts && customDts && genCustomDts(projRoot, format, typesDir, moduleName);
            }
            else if (event.code === "END") {
                console.log(`结束`)
            } else if (event.code === "ERROR") {
                console.error(`构建错误`, event.error);
            }


        })
    } else {
        // await build(buildConfig, outputOpts[i], typesDir[i], moduleName, customDts, minify);
        /**
         * @type { import('rollup').RollupBuild }
         */
        let rollupBuild;
        rollupBuild = await rollup.rollup(buildConfig);

        isGenDts && !customDts && genDts(projRoot, entrys, format, typesDir, moduleName, customDts);

        const writeResult = await rollupBuild.write(outputOption);
        isGenDts && customDts && genCustomDts(projRoot, format, typesDir, moduleName, customDts);
        if (minify) {
            /**
                * @type {import("rollup-plugin-terser").Options}
                */
            const terserOption = {
                output: {
                    ascii_only: true // 仅输出ascii字符,

                },
                compress: {
                    // pure_funcs: ['console.log'] // 去掉console.log函数
                }
            }
            const terserPlugin = terser.terser(terserOption);
            outputOption.sourcemap = false;
            outputOption.plugins = [terserPlugin];
            outputOption.file = outputOption.file.replace(".", ".min.");

            await rollupBuild.write(outputOption);
        }

    }

}
/**
 * 生成声明文件
 * @param {string} projRoot 
 * @param {string[]} entrys 
 * @param {string} format 
 * @param {string} typesDir 
 * @param {string} moduleName
 */
function genDts(projRoot, entrys, format, typesDir, moduleName) {
    /**
     * @type {dtsGenerator}
     */
    const dtsGen = require("dts-generator").default;
    const tsconfig = require(path.join(projRoot, `tsconfig.json`));
    const typesDirPath = path.join(projRoot, typesDir);
    const dtsFileName = moduleName.includes("@") ? moduleName.split("/")[1] : moduleName;
    const dtsGenExclude = ["node_modules/**/*.d.ts"].concat(tsconfig.dtsGenExclude ? tsconfig.dtsGenExclude : []);
    // console.log(dtsGenExclude);
    let entry;
    if (entrys.length > 1) {
        //多入口 暂时不做声明输出 TODO
        console.warn(`多入口暂不做声明输出`);
    } else {
        entry = entrys[0];
        dtsGen({
            baseDir: projRoot,
            exclude: dtsGenExclude,
            out: path.join(typesDirPath, `index.d.ts`),
            // prefix: moduleName,
            resolveModuleId: function (params) {
                // console.log(params.currentModuleId)
                let entryRelative = path.relative(projRoot, entry);
                if (path.sep === "\\") {
                    entryRelative = entryRelative.replace(/\\/g, '/');
                }
                if (params.currentModuleId === entryRelative.split(".")[0]) {
                    return moduleName;
                }
                return `${moduleName}/${params.currentModuleId}`
            },
            resolveModuleImport: function (params) {
                // console.log(params)
                // {
                //     importedModuleId: './interfaces',
                //     currentModuleId: 'src/index',
                //     isDeclaredExternalModule: false
                //   }
                if (!params.isDeclaredExternalModule) {
                    let importedModuleId = params.importedModuleId;
                    if (params.importedModuleId.includes(".")) {

                        //包内模块
                        importedModuleId = path.join(path.dirname(path.relative(projRoot, entry)), params.importedModuleId);
                        // importedModuleId = `${moduleName}/${entry.split("/")[0]}${path.normalize(params.importedModuleId)}`;
                    }
                    if (path.sep === "\\") {
                        importedModuleId = importedModuleId.replace(/\\/g, '/');
                    }
                    importedModuleId = `${moduleName}/${importedModuleId}`;
                    return importedModuleId;
                }
                return params.importedModuleId
            }
        }).then(() => {

        })
    }
}
/**
 * 生成单个全局dts
 * @param {string} projRoot 
 * @param {string} format
* @param {string} typesDir 
 * @param {string} moduleName 
 */
function genCustomDts(projRoot, format, typesDir, moduleName) {
    let dtsStr = "";
    const sigleDtsFilePath = path.join(projRoot, `dist/${format}`, `${moduleName}.d.ts`);
    if (fs.existsSync(sigleDtsFilePath)) {
        fs.unlinkSync(sigleDtsFilePath);
    }

    // fs.readdirSync(path.join(process.cwd(), typesDir))
    const typesDirPath = path.join(projRoot, typesDir);
    const declareGlobalRegex = /(declare global \{{1})([\s\S]*\}{1})([\s]*\}{1})/g;
    const importRegex = /import\s?{\s?[\w\d]*?\s?}\s?from\s?"[\w\W]*?";?/g
    fs.readdir(typesDirPath, function (err, files) {
        let str;
        let regexMatch;
        for (let i = 0; i < files.length; i++) {
            if (files[i] === "index.d.ts") continue;
            // if (files[i] === "index.d.ts" || files[i].includes("interface")) continue;
            const typeFilePath = path.join(typesDirPath, files[i]);
            // console.log(typeFilePath);
            str = fs.readFileSync(path.join(typesDirPath, files[i]), "utf8");
            regexMatch = importRegex.exec(str);
            if (regexMatch) {
                regexMatch.forEach(function (match) {
                    str = str.replace(match, "")
                })
            }
            regexMatch = declareGlobalRegex.exec(str)
            if (regexMatch) {
                dtsStr += regexMatch[2];
            } else {
                dtsStr += str;
            }

        }
        dtsStr = dtsStr.replace(/export {}/g, "");
        dtsStr = dtsStr.replace(/export declare /g, "");
        dtsStr = dtsStr.replace(/export default /g, "");

        dtsStr = `declare namespace ${moduleName} {\n` + dtsStr + "}\n";

        fs.writeFileSync(sigleDtsFilePath, dtsStr, "utf8");
    })
    // for (let i = 0; i < modules.length; i++) {
    //     fileName = modules[i].id.includes("/") ? modules[i].id.split("/").pop() : modules[i].id.split("\\").pop();
    //     if (fileName === "index.ts") {
    //         continue;
    //     }
    //     dtsFilePath = path.join(process.cwd(), typesDir, fileName.replace(".ts", ".d.ts"));
    //     dtsStr += fs.readFileSync(dtsFilePath, "utf8");

    // }
}
/**
 * 输出js和dts声明文件
 * @param {import('rollup').InputOptions} buildConfig 构建配置
 * @param {import('rollup').OutputOptions} outputOption 输出配置
 * @param {string} typesDir 声明文件输出目录
 * @param {string} moduleName 模块名
 * @param {boolean} customDts iife和umd规范用
 * @param {boolean} minify 是否压缩
 */
async function build(buildConfig, entry, outputOption, typesDir, moduleName, customDts, minify) {

}
module.exports = {
    build: rollupBuild,
}