#! /usr/bin/env node

var cmd = require('commander');
var script = require('./index');
cmd
    .command("generate")
    .alias('g')

    .description("生成protojs")
    .option("-p, --path <path>", "项目路径,默认当前路径 .")
    .action(async option => {
        console.log("生成protojs");
        await script.generate(option.path ? option.path : ".");
    });
cmd
    .command("init")
    .alias('i')
    .description("初始化项目")
    .option("-p, --path <path>", "项目路径,默认当前路径 .")
    .option("-t, --type <type>", "项目类型,默认undefined")
    .action(async (option) => {
        console.log("初始化项目");
        await script.initProj(option.path ? option.path : ".", option.type);
    })
cmd.parse(process.argv);