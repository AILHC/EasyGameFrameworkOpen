# `@ailhc/xxx`
> xxxx

## 简介




## 特性
****
## 使用

0. 
    
    通过npm安装 
    npm install @ailhc/xxx

    如果支持使用npm模块，则 通过导入npm模块的方式
    ```ts
    import { } from "@ailhc/xxx"

    ```
    如果不支持，则使用dist下的iife格式
    或者直接复制src下的源码

1. 基础使用
```ts

```

## 配置
编译相关的配置都配置在tsconfig中

1. dtsGenExclude 是 声明文件生成忽略
2. externalTag 是 而外模块判断，可以是 字符串，也可以是字符串数组
如果 import url includes(externalTag) 就会当这个模块为不处理和编译模块
比如我不想把@ailhc/display-ctrl 甚至 带@ailhc的url的模块都是而外模块
## 发布日志
 
*********
    0.1.0 (2020-10-11)
    1. 第一次发布


