# `excel2all-cli`

[excell2all](https://www.npmjs.com/package/@ailhc/excel2all) 库的命令行工具

## 安装

```bash

npm install @ailhc/excel2all-cli --save

or

npm install @ailhc/excel2all-cli -g

```
## [CHANGELOG](packages/cli/CHANGELOG.md)

## 使用


### convert (excel表格转换命令)

#### **参数**

```js
    .option('-p, --projRoot [projRoot]', '项目根目录，默认执行命令处\n-------------------------')
    
    .option('-c, --config [config]', '配置文件路径,相对于projRoot,如果不传参数,则会默认读取projRoot下的e2a.config.js,控制台的参数优先于配置的参数\n-------------------------')

    .option('-t, --tableFileDir [tableFileDir]', "excel文件夹路径,如果没有则使用项目根目录\n-------------------------")

    .option('-pt, --pattern [pattern...]', 'excel文件名匹配规则,多个以空格隔开 以 -- 结束,\n如: -pt "./**/*.xlsx" "!**/~$*.*" -- \n默认匹配规则 ["./**/*.xlsx", "./**/*.csv"] \n 必定拼接的排除规则: ["!**/~$*.*", "!**/~.*.*", "!.git/**/*", "!.svn/**/*"]\n 匹配所有后缀为.xlsx和.csv的文件，如果符合~$*.* 或~.*.* 则排除(那个是excel文件的临时文件)\n 匹配规则第一个必须带 ./ 否则匹配会出问题 \n 具体匹配规则参考：https://github.com/mrmlnc/fast-glob#pattern-syntax')

    .option('-uc, --useCache', '是否使用缓存，默认不\n-------------------------')

    .option('-cf, --cacheFileDirPath [cacheFileDirPath]', '缓存文件的文件夹路径，可以是相对路径，相对于projRoot，\n默认是项目根目录下的.excel2all文件夹\n-------------------------')

    .option('-l --logLevel [logLevel]', '日志等级,只是限制了控制台输出，但不限制日志记录,"no" | "info" | "warn" | "error"\n-------------------------')

    .option('-olf --outputLogDirPath', '日志文件夹路径,默认输出到.excel2all/excel2all.log，\n可以是绝对或相对路径，相对路径相对于projRoot\n填false则不生成log文件\n-------------------------')

    .option('-cchkp, --customConvertHookPath [customConvertHookPath]', '自定义转换hook实现路径，\n需要返回一个实现了IConvertHook的对象,\n如果指定方法没有实现这用默认hook的方法\n-------------------------')

    .option('-cstj, --clientSingleTableJsonDir', '单个配置表json输出目录路径，每个配置表输出一个json\n-------------------------')

    .option('-j, --clientBundleJsonOutPath [clientBundleJsonOutPath]', '合并配置表json文件路径(包含文件名,比如 ./out/bundle.json)\n-------------------------')
    
    .option('-fbj, --isFormatBundleJson', '是否格式化合并后的json，默认不\n-------------------------')
    
    .option('-cdod,--clientDtsOutDir [clientDtsOutDir]', '声明文件输出目录(每个配置表一个声明)，默认不输出,配置了就输出\n-------------------------')
    
    .option('-bd, --no-isBundleDts', '是否合并所有声明为一个文件,默认true\n-------------------------')
    
    .option('-bdn, --bundleDtsFileName [bundleDtsFileName]', '合并后的声明文件名,如果没有则默认为tableMap\n-------------------------')
    
    .option('-cj, --isCompress', '是否将json格式压缩,默认否,减少json字段名字符,效果较小\n-------------------------')

    .option('-z, --isZip', '是否使用zlib压缩成二进制文件\n-------------------------')

```

#### **使用例子**

```bash

e2a convert -t ../../excel2all/__test__/test-excel-files -p ./__tests__ -j ./test-export/bundle.json -cstj ./test-export/export-jsons

or
//使用配置文件

e2a convert -p ./__tests__ -c ./testConfig

```
### tfm (测试表格文件匹配)

#### **参数**

```js
    .option('-p, --projRoot [projRoot]', '项目根目录，默认执行命令处\n-------------------------')

    .option('-c, --config [config]', '导表配置文件路径，如果没有则使用默认的e2a.config.js\n-------------------------')

    .option('-t, --tableFileDir [tableFileDir]', "excel文件夹路径,如果没有则使用项目根目录\n-------------------------")

    .option('-pt, --pattern [pattern...]', 'excel文件名匹配规则,多个以空格隔开 以 -- 结束,\n如: -pt ".\\**\\*.{xlsx,csv}" "!~$*.*" -- \n默认匹配规则 [".\\**\\*.xlsx", ".\\**\\*.csv", "!**\\~$*.*", "!**\\~.*.*", "!.git\\**\\*", "!.svn\\**\\*"]\n 匹配所有后缀为.xlsx和.csv的文件，如果符合~$*.* 或~.*.* 则排除(那个是excel文件的临时文件)\n 匹配规则第一个必须带 ./ 否则匹配会出问题 \n 具体匹配规则参考：https://github.com/mrmlnc/fast-glob#pattern-syntax')

    .option('-uc, --useCache', '是否使用缓存，默认不\n-------------------------')

    .option('-cf, --cacheFileDirPath [cacheFileDirPath]', '缓存文件文件夹，\n-------------------------')

```

#### **使用例子**

```bash
e2a tfm -c ./__tests__/testConfig

or 

e2a tfm -t ../../excel2all/__test__/test-excel-files -p ./__tests__ -uc cf ./.cache

```
## 自定义扩展

### 转换流程扩展

新建一个自定义hook的js: customConvertHook.js

```js
/**
 * @type {import("@ailhc/excel2all").DefaultConvertHook}
 * 
 */
const DefaultHook = require("@ailhc/excel2all").DefaultConvertHook;
/**
 * @type {IConvertHook}
 */
const customConvertHook = {
    onStart(context, cb) {
        console.log(`自定义Hook,onStart`);
        cb();
    },
    onConvertEnd(){
        console.log(`转换结束`);
        cb();
    }
    
}
module.exports = customConvertHook;

```
在配置文件e2a.config.js/自定义配置文件 上配置

```js
//__tests__/e2a.config.js
/**
 * @type {ITableConvertConfig}
 */
const config = {
    // customValueTransFuncMap:{"customTypeTrans":function(){return}},
    //
    customConvertHook: require("./testCustomHook"),
    useCache: false,
    projRoot: "./__tests__",
    outputConfig: outConfig,
    tableFileDir: "../../excel2all/__test__/test-excel-files"
}
```
也可以在命令行参数指定

```bash

e2a convert -t ../../excel2all/__test__/test-excel-files -p ./__tests__ -j ./test-export/bundle.json -cstj ./test-export/export-jsons -cchkp ./testCustomHook.js

```
### 配置表值解析和声明生成扩展

基于默认解析逻辑的扩展

具体可见:[excel2all](https://www.npmjs.com/package/@ailhc/excel2all)


