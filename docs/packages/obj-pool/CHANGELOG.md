# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.4](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@3.0.3...@ailhc/obj-pool@3.0.4) (2021-05-09)

**Note:** Version bump only for package @ailhc/obj-pool





## [3.0.3](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@3.0.2...@ailhc/obj-pool@3.0.3) (2021-04-25)


### Bug Fixes

* 修复通过get获取的对象中pool属性为undefined的bug，增加阈值的单元测试 ([01b3e6f](https://github.com/AILHC/EasyGameFrameworkOpen/commit/01b3e6f9485713f067c3b95617a5d724c5b24807))





## [3.0.2](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@3.0.0...@ailhc/obj-pool@3.0.2) (2021-04-25)

**Note:** Version bump only for package @ailhc/obj-pool





# [3.0.0](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@2.0.0...@ailhc/obj-pool@3.0.0) (2021-04-25)


### Features

* 废弃旧接口、完善类型提示 ([291f564](https://github.com/AILHC/EasyGameFrameworkOpen/commit/291f564e77e7df53d5e55a7ec8bddc85a908d234))


### BREAKING CHANGES

* * objPool.IObj的onFree接口废弃|* objPool.IPool的free、freeAll接口废弃|* objPool.IPoolMgr的free、freeAll接口废弃





# [2.0.0](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@1.2.1...@ailhc/obj-pool@2.0.0) (2021-04-23)


### Bug Fixes

* 完善对象池模块类型声明处理 ([4a54094](https://github.com/AILHC/EasyGameFrameworkOpen/commit/4a540941c4e9f98157eefa32017f5fe97d2fcfd9))
* 修复对象回收后isInPool=false的bug ([6f3b9d6](https://github.com/AILHC/EasyGameFrameworkOpen/commit/6f3b9d6744de7f6f213af70010bece5fa2ec5756))


### Features

* 对象池接口修改和完善 ([8e7b500](https://github.com/AILHC/EasyGameFrameworkOpen/commit/8e7b500d2e4ac9cfe7cd75583a10e62ead45d10f))
* 重构接口,并兼容旧的接口 ([5018767](https://github.com/AILHC/EasyGameFrameworkOpen/commit/5018767196b49295648a935a909ad547be1cd3d9))


### BREAKING CHANGES

* remove IObj.freeSelf() [移除IObj的freeSelf接口] , remove IObj.onCreate arg pool [移除IObj.onCreate 参数pool]





## [1.2.1](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@1.2.0...@ailhc/obj-pool@1.2.1) (2021-04-20)


### Bug Fixes

* 发布对象池模块 ([df527c1](https://github.com/AILHC/EasyGameFrameworkOpen/commit/df527c1f4a37ac22bb889367511534b626e926f8))





# [1.2.0](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@1.1.4...@ailhc/obj-pool@1.2.0) (2021-04-19)


### Features

* 增加对象池阈值控制,完善文档 ([e4d9305](https://github.com/AILHC/EasyGameFrameworkOpen/commit/e4d9305e09607a3d0877802031f2036452c543f4))





## [1.1.4](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@1.1.3...@ailhc/obj-pool@1.1.4) (2021-03-31)


### Bug Fixes

* 修复package.json的exports字段,这会导致cocoscreator2.4.5import报错 ([6c22d71](https://github.com/AILHC/EasyGameFrameworkOpen/commit/6c22d71f6f32ec566b95e7b299ec91e732e99585))





## [1.1.3](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@1.1.2...@ailhc/obj-pool@1.1.3) (2021-02-21)


### Bug Fixes

* 修复构建出iife规范的bug ([dc435c8](https://github.com/AILHC/EasyGameFrameworkOpen/commit/dc435c8ed264447b8a80263e7d157b1576c414b3))





## [1.1.2](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@1.1.1...@ailhc/obj-pool@1.1.2) (2021-02-18)

**Note:** Version bump only for package @ailhc/obj-pool





## [1.1.1](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@1.1.0...@ailhc/obj-pool@1.1.1) (2021-02-15)

**Note:** Version bump only for package @ailhc/obj-pool





# [1.1.0](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@1.0.2...@ailhc/obj-pool@1.1.0) (2021-02-07)


### Features

* 同时支持CommonJs和ES Modules ([409a819](https://github.com/AILHC/EasyGameFrameworkOpen/commit/409a819cfca6808a4070abcbc8acc80a2caf1c84))





## [1.0.2](https://github.com/AILHC/EasyGameFrameworkOpen/compare/@ailhc/obj-pool@1.0.1...@ailhc/obj-pool@1.0.2) (2021-02-07)

**Note:** Version bump only for package @ailhc/obj-pool






# 1.0.1 (2020-12-24)
@ailhc/obj-pool([eb22b22](https://github.com/AILHC/EasyGameFrameworkOpen/commit/eb22b225792289c03f955b21d47e87e3eb0a1a9b))
重新构建发布版本
# 1.0.0 (2020-12-22)
@ailhc/obj-pool([fc8a6b2](https://github.com/AILHC/EasyGameFrameworkOpen/commit/fc8a6b2a917125dabe2022961532aed4d5546ac1))
1. 修改接口
2. 完善单元测试

# 0.1.0 (2020-10-11)
1. 第一次发布
