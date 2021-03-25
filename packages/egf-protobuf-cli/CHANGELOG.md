# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.3.5](https://github.com/AILHC/EasyGameFrameworkOpen/compare/egf-protobuf@1.3.4...egf-protobuf@1.3.5) (2021-03-25)


### Bug Fixes

* 1. 修复Cannot find module 'fs-extra-promise'的bug,2. 移除protobuf-cli中对fs-extra的依赖 ([df82a19](https://github.com/AILHC/EasyGameFrameworkOpen/commit/df82a1984df6155678ec9f95416469a3ad1a27af))





## [1.3.4](https://github.com/AILHC/EasyGameFrameworkOpen/compare/egf-protobuf@1.3.3...egf-protobuf@1.3.4) (2021-02-17)


### Bug Fixes

* 修复初始化失败问题,完善失败提示输出 ([1c105c2](https://github.com/AILHC/EasyGameFrameworkOpen/commit/1c105c222987321f29cef9dcede80baca863f36f))





## [1.3.3](https://github.com/AILHC/EasyGameFrameworkOpen/compare/egf-protobuf@1.3.2...egf-protobuf@1.3.3) (2021-02-15)

**Note:** Version bump only for package egf-protobuf





## [1.3.2](https://github.com/AILHC/EasyGameFrameworkOpen/compare/egf-protobuf@1.3.1...egf-protobuf@1.3.2) (2021-02-07)

**Note:** Version bump only for package egf-protobuf





# 1.3.1 (2021-01-27)
1. 更新epbconfig.js

# 1.3.0 (2021-01-17)
0. 更新protobufjs版本为6.8.8
1. 优化项目初始化逻辑，更加稳
2. 优化配置文件配置体验(由json配置改为js配置，并提供类型提示)
3. 增加服务端文件输出配置，可选
4. 优化proto静态js文件输出逻辑，合并protobuf库为可选配置
5. 增加cli生成参数：项目路径，可指定任意目录为输出根路径

# 1.2.0

封装protobufjs的命令行，不需要另外安装protobufjs命令行
优化生成逻辑，更快了
优化文件写入逻辑，避免文件夹不存在报错

# 1.0.2
修复和确认某些windows环境 生成报错的问题

# 1.0.1
命令行命令运行使用第三方库commander;
使用方式修改

    1. pb-egf g<或者generate>   //生成当前项目目录下的protojs
    2. pb-egf a<或者add>  <egret/空> //拷贝proto .d.ts定义文件，以及protojs的解析库，还有pb-egf的配置文件  可以传参数，egret 就是egret项目，不传则是通用初始化


# 1.0.0
初始版本，基于pb-egret改造，更加自由，protobuf的库文件和proto文件合并，兼容cocosCreator的使用
