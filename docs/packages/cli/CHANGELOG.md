# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
