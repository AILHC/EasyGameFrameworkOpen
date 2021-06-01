// @ts-check
/**
 * @type {any}
 */
const typescript = require('rollup-plugin-typescript2');
const rollup = require("rollup");
const rollupLoadConfig = require("rollup/dist/shared/loadConfigFile");
/**
 * @type {any}
 */
const rollupCjs = require("rollup-plugin-commonjs");
/**
 * @type {any}
 */
const nodeResolve = require("rollup-plugin-node-resolve");
const path = require("path");

const fs = require("fs");
// const npmDts = require("npm-dts");
const dtsGenerator = require('dts-generator');
/**
 * @type {any}
 */
const jsonPlugin = require("@rollup/plugin-json");
/**
 * @type {any}
 */
const terser = require("rollup-plugin-terser");
const { TypeScritIndexWriter } = require('./libs/cti/TypeScritIndexWriter');

const tsconfigOverride = {
    compilerOptions: {}
}
/**
 * 构建编译
 * @param {IEgfCompileOption} option 
 */
async function rollupBuild(option) {
    // projRoot, isWatch, entrys, outputDir, output,
    // format, typesDir, unRemoveComments, target, minify, isGenDts, banner
    let moduleName;
    let useFooter;

    let projRoot = option.proj;

    if (!projRoot) {
        projRoot = process.cwd();
    }
    if (!path.isAbsolute(projRoot)) {
        projRoot = path.join(process.cwd(), projRoot);
    }
    /**
     * @type {IEgfCompileOption}
     */
    let configOption;
    let configPath = typeof option.config === "string" ? option.config : "egf.compile.js";
    if (!path.isAbsolute(configPath)) {
        configPath = path.join(projRoot, configPath);
    }
    if (fs.existsSync(configPath)) {
        try {
            configOption = require(configPath)
        } catch (error) {
            console.error(`配置文件有问题:${configPath}`);
        }
        if (configOption) {
            option = Object.assign(configOption, option);
        }
    }

    let format = option.format ? option.format : "cjs";
    const isIIFE = format.includes("iife") || format.includes("umd");
    if (isIIFE) {
        /**
         * @type {any[]}
         */
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

        useFooter = true;
    }
    if (format.includes("system")) {
        /**
         * @type {any[]}
         */
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
    let entrys = option.entry ? option.entry.concat([]) : undefined;
    if (!entrys) {
        entrys = ["src/index.ts"];
    }
    for (let i = 0; i < entrys.length; i++) {
        entrys[i] = path.join(projRoot, entrys[i]);
    }
    let output = option.output;
    let outputDir = option.outputDir;
    if (entrys.length > 1) {
        if (!outputDir) {
            outputDir = `dist/${format}/lib`;
        }
        output = undefined;
    } else {
        if (!output && (format === "es" || format === "esm")) {
            output = `dist/${format}/lib/index.mjs`
        }
        if (!output) {
            if (isIIFE) {
                output = `dist/${format}/${moduleName}.js`;
            } else {
                output = `dist/${format}/lib/index.js`;
            }

        }
    }
    if (output && !path.isAbsolute(output)) {
        output = path.join(projRoot, output);
    }

    if (outputDir && !path.isAbsolute(outputDir)) {
        outputDir = path.join(projRoot, outputDir);
    }

    let typesDir = option.typesDir;
    if (!typesDir) {
        if (isIIFE) {
            typesDir = `dist/${format}`;
        } else {
            typesDir = `dist/${format}/types`;
        }

    }
    tsconfigOverride.compilerOptions.declarationDir = typesDir;
    tsconfigOverride.compilerOptions.declaration = false;
    tsconfigOverride.compilerOptions.sourceMap = true;
    let removeComments = option.removeComments;
    if (removeComments !== undefined) {
        tsconfigOverride.compilerOptions.removeComments = removeComments;
    }

    let target = option.target;
    if (target) {
        tsconfigOverride.compilerOptions.target = target;
    }
    const tsconfigPath = path.join(projRoot, `tsconfig.json`);

    let externalTag = option.externalTag;

    /**
     * @type {Partial<import('rollup-plugin-typescript2/dist/ioptions').IOptions> }
     */
    const tsOptions = {
        tsconfig: tsconfigPath,
        clean: true,
        abortOnError: false,
        tsconfigOverride: tsconfigOverride,
        useTsconfigDeclarationDir: true
    }
    //自定义插件
    const customPlugins = option.plugins ? option.plugins : [];
    /**
     * @type {import("rollup").ExternalOption}
     * @param {*} source 
     * @param {*} importer 
     * @param {*} isResolved 
     * @returns 
     */
    let customExternal;
    if (externalTag) {
        customExternal = (source,
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
            } else if (typeof tag === "string") {
                isExternal = source.includes(tag);
            }
            if (isExternal) {
                console.log(`'${source}' is imported by ${importer}, is custom external  – treating it as an external dependency`)

            }
            return isExternal;

        };
    }

    /**
     * @type {import('rollup').InputOptions}
     */
    let buildConfig = {
        //输出log便于调试
        // onwarn: function ({ loc, frame, message }) {
        //     // 打印位置（如果适用）
        //     if (loc) {
        //         console.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
        //         if (frame) console.warn(frame);
        //     } else {
        //         console.warn(message);
        //     }
        // },
        onwarn: rollupLoadConfig.batchWarnings().add,
        external: customExternal,
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
        ].concat(customPlugins)
    }
    // 合并输入配置，会覆盖原先的输入配置字段
    if (option.owInput) {
        buildConfig = Object.assign(buildConfig, option.owInput);
    }
    // /**
    //  * @type { import('rollup').OutputOptions[] }
    //  */
    // const outputOpts = [];
    // for (let i = 0; i < outputs.length; i++) {

    //     outputOpts.push(outputOption);
    // }

    let footerStr = option.footer ? option.footer : "";
    footerStr =
        `${footerStr}
    `+ (moduleName && useFooter ? `var globalTarget =window?window:global;
    globalTarget.${moduleName}?Object.assign({},globalTarget.${moduleName}):(globalTarget.${moduleName} = ${moduleName})` : "");

    const entryFileNames = option.entryFileNames ? option.entryFileNames : (chunkInfo) => {
        if (format === "es" || format === "esm") {

            return `[name]${option.minify ? ".min" : ""}.mjs`
        } else {
            return `[name]${option.minify ? ".min" : ""}.js`
        }
    };
    const chunkFileNames = option.chunkFileNames ? option.chunkFileNames : (chunkInfo) => {
        if (format === "es" || format === "esm") {

            return `[name]${option.minify ? ".min" : ""}.mjs`
        } else {
            return `[name]${option.minify ? ".min" : ""}.js`
        }
    };

    const pkgName = process.env.npm_package_name;
    /**
     * @type { import('rollup').OutputOptions }
     */
    let outputOption = {
        file: output,
        chunkFileNames: chunkFileNames, //公共模块生成规则
        entryFileNames: entryFileNames,
        dir: outputDir,
        format: format,
        name: moduleName,
        sourcemap: option.sourcemap,
        sourcemapPathTransform: (relativePath, sourcemapPath) => {
            let sourceFilePath = require("path").join(sourcemapPath, "../", relativePath);
            sourceFilePath = sourceFilePath.replace(projRoot, pkgName);
            return sourceFilePath;
        },
        // globals: {
        //     fairygui: "fairygui",
        //     Laya: "Laya"
        // },
        banner: option.banner,
        footer: footerStr

    }
    //合并输出配置，会覆盖原先的输出配置字段
    if (option.owOutput) {
        outputOption = Object.assign(outputOption, option.owOutput)
    }

    const isGenDts = option.genDts;
    if (option.autoCti) {
        await autoCreateIndex(option);
    }
    if (option.watch) {
        /**@type {import('rollup').RollupWatchOptions} */
        const watchConfig = buildConfig;
        watchConfig.output = outputOption;
        watchConfig.watch = {
            clearScreen: true
        }
        const rollupWatcher = await rollup.watch(watchConfig);
        rollupWatcher.on("event", async (event) => {

            if (event.code === "START") {
                console.log("开始构建");
            } else if (event.code === "BUNDLE_START") {
                console.log("开始输出");

                isGenDts && genDts(projRoot, entrys, format, typesDir, moduleName, option);
                // console.log(event.output);
            } else if (event.code === "BUNDLE_END") {
                console.log("构建结束");

            } else if (event.code === "END") {
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

        isGenDts && genDts(projRoot, entrys, format, typesDir, moduleName, option);

        const writeResult = await rollupBuild.write(outputOption);

        const minify = option.minify;
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
            outputOption.sourcemap = !!option.minifySourcemap;
            outputOption.plugins = [terserPlugin];
            if (!(entrys.length > 1)) {
                outputOption.file = outputOption.file.replace(".", ".min.");
            }
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
 * @param {IEgfCompileOption} option
 */
function genDts(projRoot, entrys, format, typesDir, moduleName, option) {
    /**
     * @type {any}
     */
    const dtsg = require("dts-generator");
    /**
     * @type {dtsGenerator}
     */
    const dtsGen = dtsg.default;
    const typesDirPath = path.join(projRoot, typesDir);
    const isIIFE = format === "iife" || format === "umd";
    const pkgName = process.env.npm_package_name;
    // const dtsFileName = moduleName.includes("@") ? moduleName.split("/")[1] : moduleName;
    let dtsGenExclude = ["node_modules/**/*.d.ts",].concat(option.dtsGenExclude ? option.dtsGenExclude : []);
    // console.log(dtsGenExclude);
    let entry;
    if (entrys.length > 1) {
        //多入口 暂时不做声明输出 TODO
        console.warn(`[多入口暂不做声明输出]`);
    } else {
        entry = entrys[0];
        /**
         * @type {Partial<import('dts-generator').DtsGeneratorOptions> }
         */
        const dtsGOpt = {
            baseDir: projRoot,
            exclude: dtsGenExclude,
            out: path.join(typesDirPath, isIIFE ? `${moduleName}.d.ts` : `index.d.ts`),
            // prefix: moduleName,
            resolveModuleId: function (params) {

                return isIIFE ? moduleName : pkgName;
            },
            resolveModuleImport: function (params) {

                if (!params.isDeclaredExternalModule) {

                    if (!params.importedModuleId.includes(".")) {
                        // npm包
                        return params.importedModuleId;
                    }
                    return isIIFE ? moduleName : pkgName;
                }
                return params.importedModuleId
            }
        };

        dtsGen(dtsGOpt).then((args) => {
            if (isIIFE) {
                const ts = require("typescript");

                let dtsFileStr = fs.readFileSync(dtsGOpt.out, "utf-8");
                //去掉export * from ""
                //去掉export default 
                //去掉export 

                // dtsFileStr = dtsFileStr.replace(/export \* from /g, "");
                const source = ts.createSourceFile(`${moduleName}.d.ts`, dtsFileStr, ts.ScriptTarget.ESNext, true);
                const statements = source.statements;
                /**
                 * @type {ts.Statement}
                 */
                let statement;
                /**
                 * 
                 * @param {ts.Statement} statement 
                 * @returns {statement is ts.ModuleDeclaration}
                 */
                const isModuleDeclare = function (statement) {
                    return statement.kind === ts.SyntaxKind.ModuleDeclaration;
                }
                let namespacesStr = `\ndeclare namespace ${moduleName} {`;
                for (let i = 0; i < statements.length; i++) {
                    statement = statements[i];

                    if (isModuleDeclare(statement)) {
                        /**
                         * @type {ts.ModuleBlock}
                         */
                        let moduleBlock = statement.body;
                        let childStatements = moduleBlock.statements;
                        for (let k = 0; k < childStatements.length; k++) {
                            /**
                             * @type {ts.ClassDeclaration}
                             */
                            let childeStatement = childStatements[k];

                            if (childStatements[k].kind === ts.SyntaxKind.ClassDeclaration) {
                                //泛型处理
                                const typeParameters = childeStatement.typeParameters;
                                let typeStr = "";
                                let refTypeStr = "";
                                if (typeParameters && typeParameters.length > 0) {
                                    typeStr = "<";
                                    refTypeStr = "<";

                                    for (let j = 0; j < typeParameters.length; j++) {
                                        typeStr += typeParameters[j].getFullText();
                                        refTypeStr += typeParameters[j].name.escapedText;
                                        if (j < typeParameters.length - 1) {
                                            typeStr += ", ";
                                            refTypeStr += ", ";
                                        }
                                    }
                                    typeStr += ">";
                                    refTypeStr += ">";
                                }
                                let className = childeStatement.name.escapedText;
                                namespacesStr += `\n\ttype ${className + typeStr} = import('${moduleName}').${className + refTypeStr};`;
                            }
                        }
                    }
                }
                namespacesStr += "\n}";
                dtsFileStr = dtsFileStr.replace(new RegExp(`export \\* from '${moduleName}';`, "g"), "");
                dtsFileStr = dtsFileStr.replace(/export {};/g, "");
                dtsFileStr = dtsFileStr.replace(/export default /g, "");
                dtsFileStr = dtsFileStr.replace(/export /g, "");

                // const typeRegx = new RegExp(/(class|interface){1}\s(.*){/gm);
                // const matchs = [...dtsFileStr.matchAll(typeRegx)];
                // let classOrInterfaceName;
                // let type;

                // for (let i = 0; i < matchs.length; i++) {
                //     // type = matchs[i][1];

                //     classOrInterfaceName = matchs[i][2];

                //     if (classOrInterfaceName.includes("<") && classOrInterfaceName.includes("extends")) {

                //         if (classOrInterfaceName.indexOf("<") < classOrInterfaceName.indexOf("extends")) {
                //             classOrInterfaceName = classOrInterfaceName.split("<")[0];
                //         } else {
                //             classOrInterfaceName = classOrInterfaceName.split(" ")[0];
                //         }
                //     } else if (classOrInterfaceName.includes("<") && classOrInterfaceName.includes("implements")) {
                //         if (classOrInterfaceName.indexOf("<") < classOrInterfaceName.indexOf("implements")) {
                //             classOrInterfaceName = classOrInterfaceName.split("<")[0];
                //         } else {
                //             classOrInterfaceName = classOrInterfaceName.split(" ")[0];
                //         }
                //     } else if ((classOrInterfaceName.includes("extends")
                //         || classOrInterfaceName.includes("implements"))
                //         && !classOrInterfaceName.includes("<")
                //     ) {
                //         classOrInterfaceName = classOrInterfaceName.split(" ")[0];
                //     } else if (classOrInterfaceName.includes("<")) {
                //         classOrInterfaceName = classOrInterfaceName.split("<")[0];
                //     }
                //     classOrInterfaceName = classOrInterfaceName.trim();
                //     namespacesStr += `\n\ttype ${classOrInterfaceName} = import('${moduleName}').${classOrInterfaceName};`;

                // }

                dtsFileStr += namespacesStr;
                // dtsFileStr = dtsFileStr.replace(new RegExp(`${moduleName}`,"g"),"");
                dtsFileStr += `\ndeclare const ${moduleName}:typeof import("${moduleName}");`;
                fs.writeFileSync(dtsGOpt.out, dtsFileStr);
            }
        })
    }
}

/**
 * 
 * @param {IEgfCompileOption} option 
 */
async function autoCreateIndex(option) {
    const mode = option.ctiMode;
    let entrys = option.entry;
    for (let i = 0; i < entrys.length; i++) {
        const dirPath = path.dirname(path.join(option.proj, entrys[i]))
        await createIndex(dirPath, mode, option.ctiOption);
    }

}

const tsIndexWriter = new TypeScritIndexWriter();
/**
 * 
 * @param {string} dirPath 
 * @param {"create"|"entrypoint"} mode
 * @param {import("./libs/cti/options/ICreateTsIndexOption").ICreateTsIndexOption} option
 */
async function createIndex(dirPath, mode, option) {
    if (!option) {
        option = tsIndexWriter.getDefaultOption(dirPath);
    }
    if (!mode || mode === "create") {
        await tsIndexWriter.create(option, dirPath);
    } else {
        await tsIndexWriter.createEntrypoint(option, dirPath);
    }
}

module.exports = {
    build: rollupBuild,
    createIndex: createIndex
}