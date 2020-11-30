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
    2. 需要全局变量名的，冒号: 后跟变量名
    egf build -f iife:xxx 

更多使用可以参考 模板项目
[package-template](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/package-template)

# 更新日志
### 0.0.4 (2020/11/30)
更新构建工具，支持sourcemap导出(方便调试)

