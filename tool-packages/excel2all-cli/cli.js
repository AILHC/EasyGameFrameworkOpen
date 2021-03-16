#!/usr/bin/env node
const program = require('commander');
const path = require("path");
const excel2all = require("@ailhc/excel2all");

const package = require("./package.json");
program
    .version(package.version)
    .description(`一个将excel文件转换为typescript声明文件和json工具
    A tool to convert Excel files to TypeScript declaration files and JSON`)
    .usage('excel2all');

program
    .command("convert")
    .description("")
    .option('-p, --projRoot [projRoot]', '项目根目录，默认执行命令处\n-------------------------')
    .option('-c, --config [config]', '导表配置文件路径，如果没有则使用默认的\n-------------------------')
    .option('-t, --tableFileDir [tableFileDir]', "excel文件夹路径,如果没有则使用项目根目录\n-------------------------")
    .option('-pt, --pattern [pattern...]', 'excel文件名匹配规则,多个以空格隔开 以 -- 结束,\n如: -pt "\\**\\*.{xlsx,csv}" "!~$*.*" -- \n默认匹配规则["\\**\\*.{xlsx,csv}", "!~$*.*"]\n匹配所有后缀为.xlsx和.csv的文件，如果符合~$*.* 或~.*.* 则排除\n参考：https://github.com/micromatch/micromatch\n--------')
    .option('-c, --useCache', '是否使用缓存，默认不\n-------------------------')
    .option('-cf, --cacheFileDirPath [cacheFileDirPath]', '缓存文件文件夹，\n-------------------------')
    .option('-mt, --useMultiThread', '是否使用多线程，默认不')
    .option('-tn, --threadParseFileMaxNum [threadParseFileMaxNum]', '单个线程解析文件的最大数量\n-------------------------')

    .option('-l --logLevel [logLevel]', '日志等级,"no" | "info" | "warn" | "error"\n-------------------------')
    .option('-olf --outputLogFile', '是否输出日志文件，默认输出\n-------------------------')

    .option('-cphp --customParseHandlerPath [customParseHandlerPath]', '自定义解析处理器实现路径，\n需要返回一个实现了ITableParseHandler的对象,\n可以直接调用parseTableFile方法\n-------------------------')
    .option('-cthp --customTrans2FileHandlerPath [customTrans2FileHandlerPath]', '自定义文件导出处理器路径，\n需要返回一个实现了ITransResult2AnyFileHandler的对象,\n可以直接调用trans2Files\n-------------------------')


    .option('-cstj, --clientSingleTableJsonDir', '单个配置表json输出目录路径，默认输出到当前执行目录下的./excelJsonOut\n-------------------------')

    .option('-j, --clientBundleJsonOutPath [clientBundleJsonOutPath]', '合并配置表json输出路径(包含文件名)，如果不配置则不合并json\n-------------------------')
    .option('-fbj, --isFormatBundleJson', '是否格式化合并后的json，默认不\n-------------------------')
    .option('-gd, --isGenDts', '是否生成声明文件，默认不输出\n-------------------------')
    .option('-cdod,--clientDtsOutDir [clientDtsOutDir]', '声明文件输出目录(每个配置表一个声明)，默认不输出,配置了就输出\n-------------------------')
    .option('-bd, --no-isBundleDts', '是否合并所有声明为一个文件,默认true\n-------------------------')
    .option('-bdn, --bundleDtsFileName [bundleDtsFileName]', '合并后的声明文件名\n-------------------------')
    .option('-cj, --isCompress', '是否将json格式压缩,默认否,减少json字段名字符,效果较小\n-------------------------')

    .action(
        /**
         * 
         * @param {ITableParseConfig & IOutputConfig &{ config:string }} option 
         */
        function (option) {
            /**
             * @type {ITableParseConfig}
             */
            let config = {};
            if (!option.projRoot) {
                option.projRoot = process.cwd();
            } else if (!path.isAbsolute(option.projRoot)) {
                option.projRoot = path.join(process.cwd(), option.projRoot);
            }
            if (option.config) {
                if (!path.isAbsolute(option.config)) {
                    option.config = path.join(option.projRoot, option.config);
                }
                config = require(option.config);
            } else {
                config = option;
            }
            if (!config) {
                console.error(`配置路径不存在:${option.config}`);
                return;
            }
            if (!config.projRoot) {
                config.projRoot = option.projRoot;
            }
            if (!config.tableFileDir) {
                config.tableFileDir = config.projRoot;
            } else if (!path.isAbsolute(config.tableFileDir)) {
                config.tableFileDir = path.join(config.projRoot, config.tableFileDir);
            }

            if (!config.outputConfig) {
                /**
                 * @type {IOutputConfig}
                 */
                config.outputConfig = {
                    clientSingleTableJsonDir: option.clientSingleTableJsonDir,
                    clientBundleJsonOutPath: option.clientBundleJsonOutPath,
                    isFormatBundleJson: option.isFormatBundleJson,
                    isGenDts: option.isGenDts,
                    clientDtsOutDir: option.clientDtsOutDir,
                    isBundleDts: option.isBundleDts,

                    bundleDtsFileName: option.bundleDtsFileName,
                    isCompress: option.isCompress
                }
                for(let key in config.outputConfig){
                    delete config[key];
                }
            }

            /**
             * @type {IOutputConfig}
             */
            const outputConfig = config.outputConfig;
            if (!outputConfig.clientSingleTableJsonDir) {
                outputConfig.clientSingleTableJsonDir = path.join(process.cwd(), "./excelJsonOut");
            }
            if (!outputConfig.bundleDtsFileName) {
                outputConfig.bundleDtsFileName = "tableMap";
            }
            excel2all.convert(config)
        }).parse();