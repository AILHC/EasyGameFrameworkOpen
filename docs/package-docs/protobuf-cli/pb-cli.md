# egf protobuf

## 特性


1. 提供 protobuf.js 基础运行时库
2. 提供命令行脚本，将 protofile 生成 JavaScript 代码
3. 生成正确的 .d.ts 代码，以方便 TypeScript 项目使用
5. 理论上支持所有 HTML5 游戏引擎。欢迎使用 PIXI.js , Cocos2d-js , LayaAir 等其他引擎的开发者使用本库。
6. 封装protobufjs的命令行，不需另外安装protobufjs
7. 支持服务端文件同时输出
8. 配置有智能提示

## 原理

封装了 protobufjs 库及命令行。使用 protobufjs 6.8.4 的运行时库和命令行工具。

protobufjs 自身存在着 pbts 命令，虽然也可以生成 .d.ts 文件，但是在全局模式而非 ES6 module 的情况下存在一些错误，本项目致力于解决这个问题，使 protobufjs 可以在非 ES6 模块项目中（比如白鹭引擎,LayaAir引擎，Cocoscreator引擎）中也可以使用 protobufjs 

protobufjs 提供了多种使用方式，由于微信小游戏禁止 eval , new Function 等动态代码形式，所以本项目只提供了生成代码的形式，不支持通过 ```protobuf.load('awesome.proto')``` 的方式（因为这种方式也无法在微信小游戏中运行）。


## 如何安装

```
npm install egf-protobuf -g
或者
npm install -S egf-protobuf
```

## 如何使用


+ 假设用户有个名为 project 的项目
    
    ```
    cd projectRoot
    egf-pb init //初始化项目
    ```
+ 将 protofile 文件放在 projectRoot/protobuf/protofile 文件夹中
+ 配置protobuf/epbconfig.js文件
配置类型
```ts 
declare type EgfProtobufConfig = {
    /**protobufjs 编译选项 */
    options: {
        /**
         * Does not generate create functions used for reflection compatibility.
         * 不生成用于反射兼容性的create函数。
         * 默认 false
         */
        "no-create": boolean,
        /**
         * Does not generate verify functions.
         * 不生成 verify函数和代码
         * false
         */
        "no-verify": boolean,
        /**
         * Does not generate convert functions like from/toObject
         * 不生成转换函数 像这种 from/toObject
         * 默认true
         */
        "no-convert": boolean,
        /**
         * Does not generate delimited encode/decode functions.
         * 不生成带分隔符的encode/decode函数。
         * 默认false
         */
        "no-delimited": boolean
    },
    /**是否合并protobufjs库 */
    concatPbjsLib: boolean
    /**pbjs库输出文件夹,concatPbjsLib为true时有效 */
    pbjsLibDir?: string
    /**输出protojs文件类型  0 全部（js和.min.js）1(js) 2(.min.js)*/
    outputFileType: 0 | 1 | 2,
    /**声明文件输出路径 */
    dtsOutDir: string,
    /**输出js文件名 */
    outFileName: string,
    /**.proto 文件夹路径  */
    sourceRoot: string,
    /**生成js的输出路径 */
    outputDir: string


    /**服务端输出配置 */
    serverOutputConfig: {
        /**protobufjs库输出目录 */
        pbjsLibDir: string,
        /**生成的proto js文件输出 */
        pbjsOutDir: string
    }
}
```
+ 使用生成命令

    egf-pb generate
    或者
    egf-pb g


## [CHANGELOG](./CHANGELOG.md);


## 已知问题

proto 文件中的每一个协议一定要从属于一个 package，否则.d.ts生成会出现错误导致 ts 文件无法正确的找到这些类





