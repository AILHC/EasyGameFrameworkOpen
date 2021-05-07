#!/usr/bin/env node

const program = require('commander');
const path = require("path");
const excel2all = require("@ailhc/excel2all");

const package = require("./package.json");
const getParseConfig = require("./get-parse-config")
program
    .version(package.version)
    .description(`一个将excel文件转换为typescript声明文件和json工具
    A tool to convert Excel files to TypeScript declaration files and JSON`)
    .usage('excel2all');

program
    .command("convert")
    .description("")
    .option('-p, --projRoot [projRoot]', '项目根目录，默认执行命令处\n-------------------------')
    .option('-c, --config [config]', '配置文件路径，相对于projRoot\n-------------------------')
    .option('-t, --tableFileDir [tableFileDir]', "excel文件夹路径,如果没有则使用项目根目录\n-------------------------")
    .option('-pt, --pattern [pattern...]', 'excel文件名匹配规则,多个以空格隔开 以 -- 结束,\n如: -pt "\\**\\*.{xlsx,csv}" "!~$*.*" -- \n默认匹配规则["\\**\\*.{xlsx,csv}", "!~$*.*"]\n匹配所有后缀为.xlsx和.csv的文件，如果符合~$*.* 或~.*.* 则排除\n参考：https://github.com/micromatch/micromatch\n--------')
    .option('-uc, --useCache', '是否使用缓存，默认不\n-------------------------')
    .option('-cf, --cacheFileDirPath [cacheFileDirPath]', '缓存文件的文件夹路径，可以是相对路径，相对于projRoot，\n默认是项目根目录下的.excel2all文件夹\n-------------------------')
    .option('-mt, --useMultiThread', '是否使用多线程，默认不')
    .option('-tn, --threadParseFileMaxNum [threadParseFileMaxNum]', '单个线程解析文件的最大数量\n-------------------------')

    .option('-l --logLevel [logLevel]', '日志等级,只是限制了控制台输出，但不限制日志记录,"no" | "info" | "warn" | "error"\n-------------------------')
    .option('-olf --outputLogDirPath', '日志文件夹路径,默认输出到.excel2all/excel2all.log，\n可以是绝对或相对路径，相对路径相对于projRoot\n填false则不生成log文件\n-------------------------')

    .option('-cphp --customParseHandlerPath [customParseHandlerPath]', '自定义解析处理器实现路径，\n需要返回一个实现了ITableParseHandler的对象,\n可以直接调用parseTableFile方法\n-------------------------')
    .option('-cthp --customTrans2FileHandlerPath [customTrans2FileHandlerPath]', '自定义文件导出处理器路径，\n需要返回一个实现了ITransResult2AnyFileHandler的对象,\n可以直接调用trans2Files\n-------------------------')


    .option('-cstj, --clientSingleTableJsonDir', '单个配置表json输出目录路径，每个配置表输出一个json\n-------------------------')

    .option('-j, --clientBundleJsonOutPath [clientBundleJsonOutPath]', '合并配置表json文件路径(包含文件名,比如 ./out/bundle.json)\n-------------------------')
    .option('-fbj, --isFormatBundleJson', '是否格式化合并后的json，默认不\n-------------------------')
    .option('-gd, --isGenDts', '是否生成声明文件，默认不输出\n-------------------------')
    .option('-cdod,--clientDtsOutDir [clientDtsOutDir]', '声明文件输出目录(每个配置表一个声明)，默认不输出,配置了就输出\n-------------------------')
    .option('-bd, --no-isBundleDts', '是否合并所有声明为一个文件,默认true\n-------------------------')
    .option('-bdn, --bundleDtsFileName [bundleDtsFileName]', '合并后的声明文件名,如果没有则默认为tableMap\n-------------------------')
    .option('-cj, --isCompress', '是否将json格式压缩,默认否,减少json字段名字符,效果较小\n-------------------------')
    .option('-z, --isZip', '是否使用zlib压缩成二进制文件\n-------------------------')

    .action(function (option) {
        const config = getParseConfig(option);
        if (config) {
            excel2all.convert(config)
        }
    })
    .command("tfm")
    .option('-p, --projRoot [projRoot]', '项目根目录，默认执行命令处\n-------------------------')
    .option('-c, --config [config]', '导表配置文件路径，如果没有则使用默认的\n-------------------------')
    .option('-t, --tableFileDir [tableFileDir]', "excel文件夹路径,如果没有则使用项目根目录\n-------------------------")
    .option('-pt, --pattern [pattern...]', 'excel文件名匹配规则,多个以空格隔开 以 -- 结束,\n如: -pt "\\**\\*.{xlsx,csv}" "!~$*.*" -- \n默认匹配规则["\\**\\*.{xlsx,csv}", "!~$*.*"]\n匹配所有后缀为.xlsx和.csv的文件，如果符合~$*.* 或~.*.* 则排除\n参考：https://github.com/micromatch/micromatch\n--------')
    .option('-uc, --useCache', '是否使用缓存，默认不\n-------------------------')
    .option('-cf, --cacheFileDirPath [cacheFileDirPath]', '缓存文件文件夹，\n-------------------------')
    .action(function (option) {
        const config = getParseConfig(option);
        if (config) {
            excel2all.testFileMatch(config)
        }
    })
    .parse(process.argv);
// 未知命令会报错
program.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});
// 当有选项verbose时会执行函数
program.on('option:verbose', function () {
    process.env.VERBOSE = this.verbose;
});
program.on('--help', () => {
    console.log(`\r\nRun ${chalk.greenBright('egf <command> --help')} for detailed usage of given command.`);
});