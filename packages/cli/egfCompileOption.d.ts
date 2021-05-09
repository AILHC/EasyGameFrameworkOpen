

declare interface IEgfCompileOption {
    /**项目根路径，默认为执行命令处 process.cwd() */
    proj: string,
    /**配置文件路径，做更多的自定义处理,默认egf.compile.js */
    config: string,
    /**是否监听自动编译 ,默认为false*/
    watch: boolean,
    /**输出sourcemap的形式，inline就是在js里以base64编码存在，false就不生成sourcemap，true就生成单独的xxx.js.map */
    sourcemap?: boolean | "inline"
    /**入口文件 默认src/index.ts,可以是数组,多个入口 */
    entry: string[],
    /**单入口输出文件名  默认dist/${format}/lib/index.js*/
    output: string,
    /**多入口编译输出文件夹 默认dist/${format}/lib*/
    outputDir: string,
    /**输出文件规范,默认cjs,如果是iife和umd 需要加:<globalName> 冒号+全局变量名 */
    format: "cjs" | "es" | "esm" | "iife" | "system" | "umd",
    /**声明文件输出目录 默认dist/${format}/types*/
    typesDir: string,
    /**是否移除注释,默认移除 */
    removeComments: boolean,
    /**编译目标,默认使用tsconfig中的编译目标*/
    target: "es5" | "es6",
    /**是否压缩，默认不压缩 */
    minify: boolean,
    /**是否生成压缩后的js的sourcemap，默认不生成 */
    minifySourcemap: boolean
    /**是否生成声明文件，默认生成 */
    genDts: boolean,
    /**自定义输出文件顶部文本 */
    banner: string | (() => string | Promise<string>),
    /**自定义输出文件尾部文本，在iife规范和umd规范输出中，会有默认全局变量脚本插入 */
    footer: string | (() => string | Promise<string>),
    /**
     * 多入口处理共用js库输出的文件名,如果是字符串可以按照这个规则处理"[name]-[hash]-[format].js"
     * 默认使用:"[name]-[hash].js"
     */
    chunkFileNames: string | ((chunkInfo: import("rollup").PreRenderedChunk) => string)
    /**
     * 多入口处理每个入口输出的js文件名
     * 默认使用 
     * (chunkInfo) => {
            if (format === "es" || format === "esm") {
                return `[name].mjs`
            } else {
                return `[name].js`
            }
        },
     * 用于从入口点创建的块的模式，或者每个入口块调用的函数以返回这样的模式。模式支持以下占位符:
        [format]:在输出选项中定义的呈现格式，例如es或cjs。
        [hash]:基于入口点的内容及其所有依赖项的内容的哈希。
        [name]:入口点的文件名(没有扩展名)，除非输入的对象形式被用来定义一个不同的名称。
        正斜杠/可以用来将文件放在子目录中。当使用一个函数时，chunkInfo是generateBundle中不依赖于文件名的属性的简化版本。看到也输出。assetFileNames output.chunkFileNames。
        设置输出时也会使用此模式。preserveModules选项。这里有一组不同的占位符:
        [format]:输出选项中定义的呈现格式。
        [name]:文件的文件名(不带扩展名)。
        [ext]:文件的扩展名。
        [extname]:文件的扩展名，以。如果它不是空的。
        output.extend
     */
    entryFileNames: string | ((chunkInfo: import("rollup").PreRenderedChunk) => string),
    /**
     * 自定义插件
     */
    plugins?: import("rollup").Plugin[]
    /**
     * 1. dtsGenExclude 生成.d.ts文件时所要忽略的  忽略测试目录下的文件，不生成声明文件
     */
    dtsGenExclude: string[],
    /**externalTag 用来判断引用的模块是否做为外部引用(不编译进来)
   因为packages内的A包，引用了B包，会把A和B的代码编译成一个js */
    externalTag: string | string[]
    /**是否自动创建入口文件，默认false */
    autoCti: boolean
    /**自动创建入口文件模式 */
    ctiMode: "create" | "entrypoint"
    /**
     * 自动创建入口文件配置
     * 具体的配置可见:https://hub.fastgit.org/imjuni/create-ts-index
     */
    ctiOption?: import("./libs/cti/options/ICreateTsIndexOption").ICreateTsIndexOption
}