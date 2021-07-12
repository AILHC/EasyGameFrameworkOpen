# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.2.7](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/excel2all@0.2.6...@ailhc/excel2all@0.2.7) (2021-07-12)


### Bug Fixes

* 修复excel文件数据判断bug ([ae4ce92](https://github.com/AILHC/EasyGameFrameworkOpen/commit/ae4ce92519718cf374294795c7a5b914eac02b13))





## [0.2.6](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/excel2all@0.2.5...@ailhc/excel2all@0.2.6) (2021-07-12)


### Bug Fixes

* 修复table-utils-> isEmptyCell 判断bug,增加测试 ([c7b6049](https://github.com/AILHC/EasyGameFrameworkOpen/commit/c7b6049f80168ee95d1d4a618030e3ef183a4fd5))





## [0.2.5](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/excel2all@0.2.4...@ailhc/excel2all@0.2.5) (2021-07-12)


### Bug Fixes

* 修复isEmptyCell判断bug ([2a22fe9](https://github.com/AILHC/EasyGameFrameworkOpen/commit/2a22fe9d961a39385de5d742711af6524b900c2e))
* 修复table-utils->getCharCodeSum AF > BD的bug ([94aa7aa](https://github.com/AILHC/EasyGameFrameworkOpen/commit/94aa7aab689a99c03d0521a3ff41e9feff4704e5))





## [0.2.4](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/excel2all@0.2.3...@ailhc/excel2all@0.2.4) (2021-07-07)


### Bug Fixes

* 修复文件遍历bug，极大提升整个流程的速度 ([1eb646f](https://github.com/AILHC/EasyGameFrameworkOpen/commit/1eb646f94252c5af974f54732a9585784e3bb788))





## [0.2.3](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/excel2all@0.2.2...@ailhc/excel2all@0.2.3) (2021-07-05)


### Bug Fixes

* 缓存处理错误bug和log打印bug修复、增加log输出、新增any类型转换逻辑 ([466567a](https://github.com/AILHC/EasyGameFrameworkOpen/commit/466567a7fec3a88313b943be2b80aed70ed784ab))





## [0.2.2](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/excel2all@0.2.0...@ailhc/excel2all@0.2.2) (2021-06-10)

**Note:** Version bump only for package @ailhc/excel2all





## [0.2.1](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/excel2all@0.2.0...@ailhc/excel2all@0.2.1) (2021-06-02)

**Note:** Version bump only for package @ailhc/excel2all





# [0.2.0](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/excel2all@0.1.0...@ailhc/excel2all@0.2.0) (2021-05-09)


### Bug Fixes

* 修复些bug和完善日志输出 ([ffb24f4](https://github.com/AILHC/EasyGameFrameworkOpen/commit/ffb24f45ba27696d49631423fd11eac84b6b8105))


### Features

* 增加自定义输出转换，完善log输出，增加测试配置表，用于功能测试 ([528fe7a](https://github.com/AILHC/EasyGameFrameworkOpen/commit/528fe7a3536fd11bf1aed64c41ebedde97871cbe))





# 0.1.0 (2021-03-31)


### Bug Fixes

* 修复bug ([56ff9f6](https://github.com/AILHC/EasyGameFrameworkOpen/commit/56ff9f698d1927c05f57915b28f4a8a7a956489e))
* 架构调整，修复多线程bug ([4d6a519](https://github.com/AILHC/EasyGameFrameworkOpen/commit/4d6a519f0bf55623be067b79d2eda56ece5dc9ec))


### Features

* 初始化工作空间 ([7ad05aa](https://github.com/AILHC/EasyGameFrameworkOpen/commit/7ad05aad5b39e011ec140decfb59f0fae486c29c))
* 删除部分无用功能 ([9ff7899](https://github.com/AILHC/EasyGameFrameworkOpen/commit/9ff78997f314ca3b2e362445ad18a27443576a10))
* 功能完善 ([63529ff](https://github.com/AILHC/EasyGameFrameworkOpen/commit/63529ffd0cbb9da672b42e168ec98faedb2502b1))
* 增加功能，修复测试，完善日志log逻辑 ([99600f5](https://github.com/AILHC/EasyGameFrameworkOpen/commit/99600f51ab778d9995ad3e82dad78e4c0e8417fa))
* 实现命令行参数解析和配置注释修改 ([e875072](https://github.com/AILHC/EasyGameFrameworkOpen/commit/e875072dfd93ce57ca544f9632e8cf1517c6a4ae))


### BREAKING CHANGES

* ITransFile2AnyHandler change to IConvertHook
