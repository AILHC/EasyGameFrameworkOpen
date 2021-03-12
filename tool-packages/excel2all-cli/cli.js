#!/usr/bin/env node
const program = require('commander');

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
.option('-c, --config [config]','配置文件路径，如果没有则使用默认的')
.option('-p, --excelDirPath [excelDirPath]',"excel文件夹路径")
.option('-j, --jsonOutPath [jsonOutPath]','json文件输出路径')
.option('-c, --no-cache','是否使用缓存，默认不')
.option('-m')