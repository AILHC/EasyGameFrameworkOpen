// @ts-check
/**
 * @type {any}
 */
const typescript = require('rollup-plugin-typescript2');
const rollup = require("rollup");
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

/**
 * @type {any}
 */
const jsonPlugin = require("@rollup/plugin-json");
/**
 * @type {any}
 */
const terser = require("rollup-plugin-terser");
const { TypeScritIndexWriter } = require('./cti/TypeScritIndexWriter');
const genDts = require('./genDts');
const tsconfigOverride = {
    compilerOptions: {}
}
/**
 * 构建编译
 * @param {import("@ailhc/egf-cli").IEgfCompileOption} option 
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
     * @type {import("@ailhc/egf-cli").IEgfCompileOption}
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

    let entrys = option.entry ? option.entry : undefined;
    if (!entrys) {
        entrys = ["src/index.ts"];
    }
    if (typeof entrys === "string") {
        entrys = [entrys];
    } else if (typeof entrys === "object") {
        entrys = [].concat(entrys)
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
     * @type {any}
     */

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
    const isSpecialSourceMapPath = option.specialSourcemapPath;
    const sourceMapPathTransform = isSpecialSourceMapPath && ((relativePath, sourcemapPath) => {
        let sourceFilePath = require("path").join(sourcemapPath, "../", relativePath);
        sourceFilePath = sourceFilePath.replace(projRoot, pkgName);
        return sourceFilePath;
    });
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
        sourcemapPathTransform: sourceMapPathTransform,
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
        await autoCreateIndex(option.ctiMode, entrys, option.ctiOption);
    }
    if (option.watch) {
        console.log(`[EGF-CLI] 监听模式开启`)
        /**@type {import('rollup').RollupWatchOptions} */
        const watchConfig = buildConfig;
        watchConfig.output = outputOption;
        watchConfig.watch = {
            clearScreen: true
        }
        const rollupWatcher = await rollup.watch(watchConfig);
        rollupWatcher.on("event", async (event) => {

            if (event.code === "START") {
                console.log("[EGF-CLI] 开始");
            } else if (event.code === "BUNDLE_START") {
                console.log("[EGF-CLI] BUNDLE开始");

                // console.log(event.output);
            } else if (event.code === "BUNDLE_END") {
                console.log("[EGF-CLI] BUNDLE构建结束");

            } else if (event.code === "END") {
                console.log(`[EGF-CLI] 构建结束`);
                isGenDts && doGenDts(projRoot, entrys, format, typesDir, moduleName, option);
            } else if (event.code === "ERROR") {
                console.error(`[EGF-CLI] 构建错误`, event.error);
            }


        })
    } else {
        console.log("[EGF-CLI] 开始构建js");
        // await build(buildConfig, outputOpts[i], typesDir[i], moduleName, customDts, minify);
        /**
         * @type { import('rollup').RollupBuild }
         */
        let rollupBuild;
        rollupBuild = await rollup.rollup(buildConfig);
        console.log("[EGF-CLI] 构建js结束");

        const writeResult = await rollupBuild.write(outputOption);

        const minify = option.minify;
        if (minify) {
            console.log("[EGF-CLI] 生成压缩js");
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
        isGenDts && doGenDts(projRoot, entrys, format, typesDir, moduleName, option);


    }

}
/**
 * 生成声明文件
 * @param {string} projRoot 
 * @param {string[]} entrys 
 * @param {string} format 
 * @param {string} typesDir 
 * @param {string} moduleName
 * @param {import("@ailhc/egf-cli").IEgfCompileOption} option
 */
function doGenDts(projRoot, entrys, format, typesDir, moduleName, option) {

    const typesDirPath = path.join(projRoot, typesDir);
    const isGlobal = format === "iife" || format === "umd";
    const pkgName = process.env.npm_package_name;

    let dtsGenExclude = ["node_modules/**/*.d.ts",].concat(option.dtsGenExclude ? option.dtsGenExclude : []);

    const out = path.join(typesDirPath, isGlobal ? `${moduleName}.d.ts` : `index.d.ts`);
    moduleName = isGlobal ? moduleName : pkgName;
    // console.log(dtsGenExclude)

    genDts(projRoot, out, moduleName, dtsGenExclude, isGlobal, false);
}

/**
 * @param {"create"|"entrypoint"} ctiMode 
 * @param {string[]} entrys
 * @param {import("./cti/options/ICreateTsIndexOption").ICreateTsIndexOption} option
 */
async function autoCreateIndex(ctiMode, entrys, option) {

    for (let i = 0; i < entrys.length; i++) {
        const dirPath = path.dirname(entrys[i])
        await createIndex(dirPath, ctiMode, option);
    }

}

const tsIndexWriter = new TypeScritIndexWriter();
/**
 * 
 * @param {string} dirPath 
 * @param {"create"|"entrypoint"} mode
 * @param {import("./cti/options/ICreateTsIndexOption").ICreateTsIndexOption} option
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