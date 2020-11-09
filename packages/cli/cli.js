#!/usr/bin/env node
const program = require('commander');
const package = require("./package.json");
const rollupDo = require("./rollupdo");
program
    .version(package.version)
    .description('egfcli')
    .usage("[command] [args]");
program
    .command("build")
    .option('-w, --watch [watch]', '是否监视 默认false')
    .option('-e, --entry [entry]', '入口文件 默认src/index.ts')
    .option('-o, --output [output]', '输出文件 默认dist/index.js')
    .option('-f, --format [format]', '输出格式 默认cjs,可选iife,umd,es <br>如果是iife和umd 需要加:<globalName> 冒号+全局变量名')
    .option('-d, --types-dir [typesDir]', '声明文件输出目录 默认 dist/types')
    .option('-s, --source-dirs [sourceDirs]', '源码目录数组，默认[src],写 src,src2')
    .option('-u, --unRemoveComments [unRemoveComments]', '是否移除注释')
    .option('-t, --target [target]', '编译目标es标准，默认es5')
    .description("构建")
    .action(function (option) {
        if (option.sourceDirs) {
            option.sourceDirs = option.sourceDirs.split(",");
        }
        rollupDo.build(
            option.watch,
            option.entry, option.output, option.format,
            option.typesDir, option.sourceDirs,
            option.unRemoveComments,
            option.target);
    })

program.parse(process.argv);
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

