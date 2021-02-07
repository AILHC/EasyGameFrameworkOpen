# `@ailhc/egf-cli`
## 简介
基于rollup的EasyGameFramework的扩展库构建打包工具，也可以用于构建其他库

The Extension library build package based on Rollup's EasyGameFramework can also be used to build other libraries
## 特性
1. 支持typescript开发
2. 可以导出iife，commonjs，systemjs等格式
3. 将声明打包成单个dts声明文件

## 安装
npm install -D @ailhc/egf-cli
## 使用
    1. 对于不需要全局变量名的
    egf build -f cjs 
    2. 需要全局变量名的，冒号: 后跟变量名(如果不写，自动从package.json中解析)
    egf build -f iife:xxx 

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

## [CHANGELOG](./CHANGELOG.md)

