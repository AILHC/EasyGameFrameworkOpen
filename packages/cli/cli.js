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
    .description(`构建`)
    .option('-p, --proj [proj]', '项目根路径，默认为执行命令处 process.cwd()')
    .option('-c, --config [config]', '配置文件路径，做更多的自定义处理,默认egf.compile.js')
    .option('-w, --watch [watch]', '是否监听自动编译')
    .option('-acti, --auto-cti [autoCti]', '是否自动生成入口文件，默认否')
    .option('-ctim, -cti-mode [cti-mode]', '自动生成入口文件模式，默认create,可选:create,entrypoint,两种模式差异可见文档')
    .option('-e, --entry [entry...]', '入口文件 默认src/index.ts,可以是数组,多个入口')
    .option('-o, --output [output]', '输出文件 默认dist/index.js')
    .option('-od, --output-dir [outputDir]', '多入口编译输出文件夹 默认dist/${format}')
    .option('-f, --format [format]', '输出格式 默认cjs,可选iife,umd,es <br>如果是iife和umd 需要加:<globalName> 冒号+全局变量名')
    .option('-d, --types-dir [typesDir]', '声明文件输出目录 默认 dist/${format}/types')
    .option('-nrc, --no-remove-comments [removeComments]', '是否移除注释,默认移除')
    .option('-t, --target [target]', '编译目标,默认使用tsconfig中的编译目标')
    .option('-m, --minify [minify]', '是否压缩，默认不压缩')
    .option('-ngd, --no-gen-dts [genDts]', "是否生成声明文件，默认生成")
    .option('-bn, --banner [banner]', "自定义输出文件顶部文本")
    .option('-ft, --footer [footer]', "自定义输出文件尾部文本，在iife规范和umd规范输出中，会有默认全局变量脚本插入")
    .option('-s, --no-sourcemap [sourcemap]','默认true,输出sourcemap的形式，inline就是在js里以base64编码存在，false就不生成sourcemap，true就生成单独的xxx.js.map')
    .action(function (option) {
        rollupDo.build(option);
    });
program
    .command("cti")
    .description(`
    基于create-ts-index库
    创建入口文件,一般用于生成库的index.ts比如fairygui`)
    .option('-m, --mode [mode]', '创建模式，默认create,可选create、entrypoint')
    .option('-d, --dir [dir]', '文件夹路径，可以相对也可以绝对，相对路径相对于process.cwd()执行命令处')

    .action(function (option) {
        rollupDo.createIndex(option.dir, option.mode);
    });
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

