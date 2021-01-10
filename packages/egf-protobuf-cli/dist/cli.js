#! /usr/bin/env node

var cmd = require('commander');
var script = require('./index');
cmd
    .command("generate")
    .alias('g')
    .description("生成protojs")
    .action(async option => {
        console.log("生成protojs");
        await script.generate(".");
    });
cmd
    .command("init")
    .alias('i')
    .description("初始化项目")
    .option("-p,--path", "项目路径,默认当前路径 .")
    .option("-t,--type", "项目类型,默认undefined,支持egret")
    .action(async (option) => {
        console.log("初始化项目");
        await script.initProj(option.path ? option.path : ".", option.type);
    })
cmd.parse(process.argv);