# EasyGameFramework
基于Typescript的渐进式可扩展的通用游戏前端开发框架

# 开发配置
1. 需要先安装开发环境
    1. 设置淘宝源
    ```
        npm config set registry http://registry.npm.taobao.org/
    ```
    1. 安装yarn 
    ```
        npm i yarn -g
    ```
    1. 安装lerna
    ```
        npm i lerna -g
    ```

2. 需要yarn config set ignore-engines true 设置一下
3. 然后执行进行环境安装
   ``` 
    yarn install
   ```
# 开发(monorepo模式)
### 参考资料
1. [lerna+yarn workspace+monorepo项目的最佳实践](https://blog.csdn.net/i10630226/article/details/99702447)
2. [基于lerna和yarn workspace的monorepo工作流](https://zhuanlan.zhihu.com/p/71385053)
3. [Monorepo 项目管理Lerna](https://www.cnblogs.com/sanbao/p/11834137.html)
### 创建包
#### 快速模式
    lerna create @xxx/xxx -y
#### 配置模式
    lerna create @xxx/xxx
### 给包添加依赖
#### 给指定包添加内部包依赖(需要加上版本号)
    yarn workspace @egf/event add @egf/obj-pool@0.0.1
#### 指定包添加外部包依赖
    yarn workspace @xxx/xxx add @xxx/xxxx
#### 给所有包添加依赖(如果是添加内部包，需要加版本号)
    yarn workspaces add lodash
### 移除依赖
#### 移除指定包对某包的依赖
    yarn workspace packageB remove packageA
#### 移除所有包对指定包的依赖
    yarn workspaces remove lodash
#### 移除根目录下对某包的依赖
    yarn remove -W -D typescript
#### 

### 添加所有依赖
yarn install


### 其他开发项目使用
1. 使用npm link 将指定包链接到全局
比如
    ```
    cd packages/core
    yarn link
    ```
2. 到项目里创建链接(这个@egf/core是包名)
    ```
    cd cocos-example
    yarn link @egf/core
    ```


### 发布
如果接口文件里引用的全局定义，不在这次编译导出的所有文件里，那这个接口文件的.d.ts就不能导出
