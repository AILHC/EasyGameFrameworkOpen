# `@ailhc/egf-cli`
## 简介
基于rollup的EasyGameFramework的扩展库构建打包工具，也可以用于构建其他库

The Extension library build package based on Rollup's EasyGameFramework can also be used to build other libraries
## 特性
1. 支持typescript开发
2. 可以导出iife，commonjs，systemjs等格式
3. 将声明打包成单个dts声明文件

## 安装
```bash
npm install -D @ailhc/egf-cli
```
## 使用
1. 对于不需要全局变量名的
    ```ts
    egf build -f cjs 
    ```
2. 需要全局变量名的，冒号: 后跟变量名(如果不写，自动从package.json中解析)
    ```ts
    egf build -f iife:xxx 
    ```

更多使用可以参考 模板项目
[package-template](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/cli/package-template)
### 构建配置项
在tsconfig.json中可以增加配置
1. dtsGenExclude 生成.d.ts文件时所要忽略的 
   
   比如 core包中的 
   ```json
    "dtsGenExclude": [
        "__tests__/**/*"
    ]
   ```
   忽略测试目录下的文件，不生成声明文件

2. externalTag 用来判断引用的模块是否做为外部引用(不编译进来)
   因为packages内的A包，引用了B包，会把A和B的代码编译成一个js
   参考:
   ```json
   "externalTag":"@ailhc"
   或
   "externalTag":["@ailhc"]
   ```
### 构建命令行参数
1. '-w, --watch [watch]', '是否监视 默认false'
2. '-e, --entry [entry]', '入口文件 默认src/index.ts'
3. '-o, --output [output]', '输出文件 默认dist/index.js'
4. '-f, --format [format]', '输出格式 默认cjs,可选iife,umd,es <br>如果是iife和umd 需要加:<globalName> 冒号+全局变量名'
5. '-d, --types-dir [typesDir]', '声明文件输出目录 默认 dist/types'
6. '-s, --source-dirs [sourceDirs]', '源码目录数组，默认[src],写 src,src2'
7. '-u, --unRemoveComments [unRemoveComments]', '是否移除注释'
8. '-t, --target [target]', '编译目标es标准，默认es5'
9. '-m, --minify [minify]', '是否压缩，如果是将会输出.min.js'

## [CHANGELOG](packages/cli/CHANGELOG.md)

