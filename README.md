# EasyGameFramework
基于Typescript的渐进式通用游戏前端开发框架
A progressive universal game front-end development framework based on Typescript
## 快速使用

### 复制模板项目
/packages/cli/package-template
### 手动初始化模板项目（改文件夹名，项目名）
安装项目开发所需npm包
npm i


## 开发环境配置
0. git环境
   1. 对于二进制文件版本管理，我使用git 的大文件管理插件的lfs ，安装: git lfs install 
   2. 大小写敏感设置 git config core.ignorecase false
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
4. [Lerna 中文教程详解](https://segmentfault.com/a/1190000019350611?utm_source=tag-newest)
5. [lerna管理前端模块最佳实践](https://juejin.cn/post/6844903568751722509)
### 创建包
#### 快速模式
    lerna create @xxx/xxx -y
#### 配置模式
    lerna create @xxx/xxx
### 给包添加依赖
#### 给指定包添加内部包依赖(需要加上版本号)
    yarn workspace @xxx/a add @xxx/b@0.0.1

#### 给指定包添加开发时内部包依赖(需要加上版本号)
    
    yarn workspace @xxx/a add -D @xxx/b@0.0.1

#### 给指定包添加外部包依赖
    yarn workspace @xxx/xxx add @xxx/xxxx
#### 给指定包添加开发时外部包依赖
    yarn workspace @xxx/xxx add -D @xxx/xxxx

#### 给所有包添加依赖(如果是添加内部包，需要加版本号@0.0.x)
    yarn workspaces add lodash
    如果是开发时依赖: 则 add -D
### 移除依赖
1. 移除指定包对某包的依赖
    
        yarn workspace packageB remove packageA

2. 移除所有包对指定包的依赖
    
        yarn workspaces remove lodash

3. 移除根目录下对某包的依赖
    
        yarn remove -W -D typescript 

4. 添加所有依赖
    
        yarn install 或者 lerna bootstrap

5. 清除所有依赖

        lerna clean

### git发布版本
    lerna version
    会遍历所有包，检查修改，然后更新包的版本号，以及自动修改引用的包的引用版本号
    
    生成一个提交，一个tag，以及推送到远程仓库
    
    比如 packageA 修改了，版本号从1.0.0变成了1.0.1
    
    然后引用了packageA的packageB、C的版本号也要递增，以及引用的packageA的版本号也要从1.0.0变成1.0.1

## 其他开发项目使用
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


### 构建
1. 安装egf-cli到全局目录

    npm install @ailhc/egf-cli -g

    使用 build命令
    egf build -f cjs
2. 在项目package.json的scripts中增加命令

```json
    "scripts": {
        "build:cjs": "egf build -f cjs"
    }
```
然后在目录下 npm run build:cjs


### 我在哪？

**游戏开发之路有趣但不易,**

**玩起来才能一直热情洋溢。**

关注我, 一起玩转游戏开发！

你的关注是我持续更新的动力~

让我们在这游戏开发的道路上并肩前行

在以下这些渠道可以找到我和我的创作:

公众号搜索:玩转游戏开发

或扫码:<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/abd0c14c9c954e56af20adb71fa00da9~tplv-k3u1fbpfcp-zoom-1.image" alt="img" style="zoom:50%;" />



一起讨论技术的 QQ 群: 1103157878



博客主页: https://pgd.vercel.app/

掘金: https://juejin.cn/user/3069492195769469

github: https://github.com/AILHC