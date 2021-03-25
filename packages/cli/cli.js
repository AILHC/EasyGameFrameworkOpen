#!/usr/bin/env node
const program = require('commander');
const package = require("./package.json");
const rollupDo = require("./rollupdo");
const path = require("path");
const fs = require("fs-extra");



program
    .version(package.version)
    .description('a build tool')
    .usage("egf [command] [args]");

program
    .command("create")
    .description(`创建/初始化模板项目`)
    .option('-n, --name [name]', '项目名，没有则默认')
    .option('-p, --path [path]', "创建路径")
    .action(async function (option) {
        let projPath = option.path ? option.path : "./";
        const isReleative = projPath.includes("./")

        projPath = isReleative ? path.join(process.cwd(), projPath) : projPath;
        if (!fs.existsSync(projPath)) {
            console.error(`目标路径不存在:${projPath}`);
            return;
        }
        const packageJson = path.join(projPath, "package.json");

        if (fs.existsSync(packageJson)) {
            console.error(`指定路径文件夹不为空:${projPath}`);
            return;
        }

        console.log(`创建项目中...`);
        await fs.copyAsync(path.join(__dirname, "./package-template"), projPath);
        let newPkg = JSON.parse(fs.readFileSync(packageJson, "utf-8"));
        if (option.name) {
            newPkg.name = option.name;
        }
        fs.writeFileSync(packageJson, JSON.stringify(newPkg, null, "\t"));
        console.log(`创建项目完成`)
    })
program
    .command("build")
    .option('-w, --watch [watch]', '是否监视 默认false')
    .option('-e, --entry [entry...]', '入口文件 默认src/index.ts,可以是数组')
    .option('-o, --output [output]', '输出文件 默认dist/index.js')
    .option('-od, --output-dir [outputDir]', '输出文件夹')
    .option('-f, --format [format]', '输出格式 默认cjs,可选iife,umd,es <br>如果是iife和umd 需要加:<globalName> 冒号+全局变量名')
    .option('-d, --types-dir [typesDir]', '声明文件输出目录 默认 dist/${format}/types')
    .option('-u, --unRemoveComments [unRemoveComments]', '是否移除注释')
    .option('-t, --target [target]', '编译目标es标准，默认es5')
    .option('-m, --minify [minify]', '是否压缩')
    .description(`构建`)
    .action(function (option) {
        rollupDo.build(
            option.watch,
            option.entry, option.outputDir, option.output, option.format,
            option.typesDir,
            option.unRemoveComments,
            option.target,
            option.minify);
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

