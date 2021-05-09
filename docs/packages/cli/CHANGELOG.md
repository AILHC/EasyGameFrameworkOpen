# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.6.5](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.6.4...@ailhc/egf-cli@1.6.5) (2021-05-09)


### Bug Fixes

* 修复sourcemap生成bug,完善sourcemap生成 ([2f9fe4b](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/2f9fe4bc90d6e19f696d839957b6d4da05565227))
* 修复sourcemap生成问题 ([f25a622](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/f25a622e58cc36518a4d6dd40aea9c5bb20493c4))
* 修复命令行参数不起效的问题，修改为命令行参数配置优先 ([966ba33](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/966ba331fb3a5fbd399667760e42289de8bc56b9))
* 完善iife和umd规范的声明文件生成逻辑 ([c5655c4](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/c5655c406cd42114869991b24faff99b3f9d524e))





## [1.6.4](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.6.3...@ailhc/egf-cli@1.6.4) (2021-05-05)


### Bug Fixes

* 修复egf.compile.js配置不生效的bug,模版增加配置文件 ([7e715ef](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/7e715ef188c3207cc65d2cc74449bf1c44f9b251))





## [1.6.3](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.6.2...@ailhc/egf-cli@1.6.3) (2021-04-23)


### Bug Fixes

* 尝试修复类型声明生成让vscode误判的问题 ([c58c062](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/c58c062523e53ab8524583a1fa3a4de859cc5768))
* 声明生成修复 ([43b8e4b](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/43b8e4bd6625dbc5d7be80a4cd1473440476a85f))
* 修复生成的声明文件导致vscode自动导入错误问题 ([6c912c1](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/6c912c13bc64454153469adf3acbe4bfd6867aa5))





## [1.6.2](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.6.1...@ailhc/egf-cli@1.6.2) (2021-04-20)


### Bug Fixes

* 修复发布iife、umd模块报错的问题 ([2e9abd0](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/2e9abd022d1365d5b6a85e3a3dad1535aa996927))





## [1.6.1](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.6.0...@ailhc/egf-cli@1.6.1) (2021-04-18)


### Bug Fixes

* 修复TypeScritIndexWriter找不到问题 ([bedd728](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/bedd728993464efeff66914646606fd1a24d8f64))





# [1.6.0](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.5.0...@ailhc/egf-cli@1.6.0) (2021-04-16)


### Features

* 初步接入create-index ([8fd48a1](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/8fd48a1e833813eefc3d3a011b41ef3b8e610de9))
* 增加手动创建入口的命令、完善文档 ([e0226a6](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/e0226a644cc5cc70ab068aef665998184f4254ca))
* 增加create-ts-index库 ([9db6c5e](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/9db6c5efd6f7ffad73d3cdde27ef3efb24e1e326))





# [1.5.0](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.4.3...@ailhc/egf-cli@1.5.0) (2021-04-02)


### Bug Fixes

* 修复声明声明忽略配置影响编译的bug，修复多层文件夹的index.ts输出的.d.ts报错问题 ([eb1cadc](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/eb1cadce5e25fa9d46573a89f62dce5d6e605624))


### Features

* sourcemap可以配置inline或不inline ([44e3696](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/44e3696f7cb6fac7ef195243a34de80a775a4f34))





## [1.4.3](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.4.2...@ailhc/egf-cli@1.4.3) (2021-04-01)


### Bug Fixes

* 修复iife默认footer和自定义footer冲突问题，修复忽略编译逻辑bug ([9826623](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/9826623608ae6611435867342fafb551f4b7a2dd))





## [1.4.2](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.4.1...@ailhc/egf-cli@1.4.2) (2021-03-31)


### Bug Fixes

* 修复package.json的exports字段,这会导致cocoscreator2.4.5import报错 ([6c22d71](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/6c22d71f6f32ec566b95e7b299ec91e732e99585))
* 修复watch模式不生成dts的bug ([6159769](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/61597696274a231e032920adfbddf723eb109be9))





## [1.4.1](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.4.0...@ailhc/egf-cli@1.4.1) (2021-03-27)


### Bug Fixes

* 1. 修复自定义插件bug;2. 修复忽略编译bug ([3ef9053](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/3ef905334b490cfe3fc568d8af860bb4ec68489e))





# [1.4.0](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.3.2...@ailhc/egf-cli@1.4.0) (2021-03-27)


### Features

* 支持自定义插件 ([c107f0a](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/c107f0a9a93b34a95eccca34dc2da0381bc90e8b))





## [1.3.2](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.3.1...@ailhc/egf-cli@1.3.2) (2021-03-27)

**Note:** Version bump only for package @ailhc/egf-cli





## [1.3.1](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.3.0...@ailhc/egf-cli@1.3.1) (2021-03-27)


### Bug Fixes

* 修复cli编译配置的bug ([5c2e749](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/5c2e749aeefd0dc9a6ece2c752c4fb0dd08d286e))





# [1.3.0](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.2.4...@ailhc/egf-cli@1.3.0) (2021-03-27)


### Features

* 1. 增加自定义配置功能 2. 完善原本的编译处理 ([03412a7](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/03412a7689dfde1eae7f4dd18c87d8dc09b2e65c))
* 1. 完善多入口编译和chunk编译 ([d70ac04](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/d70ac041a54ff4723b48dbeb384ce3150dafa6a6))
* 多入口编译支持 ([fb7a70f](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/fb7a70f11d77ede4938b72931e9aac63b059e500))
* 完善多入口的编译，以及测试 ([12bd815](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/12bd81507b93d182fd1f78c93c5d52d3c5e8e16d))
* 完善多入口编译支持,增加参数控制是否生成声明 ([b9fb5e2](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/b9fb5e2e61db85af7ac88c667feeb1d9697c287e))





## [1.2.4](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.2.3...@ailhc/egf-cli@1.2.4) (2021-03-25)


### Bug Fixes

* 1. 修复Cannot find module 'fs-extra-promise'的bug,2. 移除protobuf-cli中对fs-extra的依赖 ([df82a19](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/df82a1984df6155678ec9f95416469a3ad1a27af))





## [1.2.3](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.2.2...@ailhc/egf-cli@1.2.3) (2021-02-18)


### Bug Fixes

* 修复iife导出的footer ([ad73bfe](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/ad73bfee3210479c2f26b52751f0ad2914207073))





## [1.2.2](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.2.1...@ailhc/egf-cli@1.2.2) (2021-02-18)

**Note:** Version bump only for package @ailhc/egf-cli





## [1.2.1](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.2.0...@ailhc/egf-cli@1.2.1) (2021-02-15)

**Note:** Version bump only for package @ailhc/egf-cli





# [1.2.0](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.1.0...@ailhc/egf-cli@1.2.0) (2021-02-07)


### Features

* 支持输出让nodejs版本>12识别的es模块 ([0eb1d57](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/0eb1d57dc1563f4c43314d0c29e9502ccfc5b3c9))





# [1.1.0](https://github.com/AILHC/EasyGameClientFrameworkOpen/compare/@ailhc/egf-cli@1.0.4...@ailhc/egf-cli@1.1.0) (2021-02-07)


### Bug Fixes

* 构建iife和umd格式时自动获取包名作为全局变量名,通过全局变量方式获取包名 ([cb11dc8](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/cb11dc877eab5c2d66019d9f95cb504eff983e9f))


### Features

* 增加新功能 ([f3141dd](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/f3141dd15f15557791459e794244a4fc333a20e1))
* 将xxx-xxx转换成驼峰命名 ([cb26e40](https://github.com/AILHC/EasyGameClientFrameworkOpen/commit/cb26e40e20b9cb35618faf88dcafa04e2881afbe))





# 1.0.4 (2021/1/27)

1. 修复externalTag为空数组时，编译报错的bug
2. 修复tsconfig中target编译字段失效的bug

# 1.0.3 (2021-01-17)

1. 增加对import json的支持(有一些库会使用到 import json的操作，比如axios)

# 1.0.2 (2020-12-20)

1. iife导出兼容nodejs环境的全局变量global

# 1.0.1 (2020-12-08)

1. 解决发布后的库，sourcemap加载不到的问题，使用inlinesourcemap的方式

# 1.0.0 (2020-12-02)

1. 修复引用外部声明文件时，把声明也合进来了，没必要
2. 增加一个tsconfig字段externalTag配置控制是否编译引用模块（避免编译进来又不能用的问题）
3. 将模块模板转移到cli工程里，方便发布出去

# 0.0.5 (2020-11-30)

更新构建工具，修复引用第三方npm包时声明文件导出出错的问题

# 0.0.4 (2020-11-30)

更新构建工具，支持sourcemap导出(方便调试)
