## EasyGameFramework的完整示例
基于CocosCreator 3.1.0

## 安装
如果是单独下载这个项目
执行
```bash
npm install
```

如果是克隆了框架仓库
需要在仓库根目录(需要安装yarn)
执行
```bash
yarn install
```
## 例子说明
1. broadcastTest 
演示broadcast模块的神奇功能

2. display-ctrl
演示UI框架+层级管理模块的使用演示

3. fairygui
演示了如何结合fairygui使用

## 注意
1. 关于引用项目外npm包的问题(在框架仓库中打开这个项目需要注意)

    由于这个基于monorepo开发的，所以所有的npm包都是共用的，在项目文件夹外的。

    目前在Windows上使用正常，Mac上使用异常

## 更新日志

### 2021/5/31
移植适配3.1.0成功