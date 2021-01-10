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