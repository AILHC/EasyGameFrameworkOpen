## EasyGameFramework的完整示例
基于CocosCreator 2.4.x

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

    因为cocos编辑器和构建时的模块加载逻辑和预览时不一致，导致编辑器会报错，构建也会报错。

    如果你也使用这个monorepo的方式开发，或者多个项目共用npm包。
    
    那么就可以使用egf-ccc-full下的editor_require_fix.js到你项目，设置为插件就可以了

2. 关于ABundle引用npm包的问题
    由于cocos在构建后的模块加载逻辑上的疏忽（没有考虑npm包的情况），所以在构建后的abundle中的脚本引用npm包是会报错的

    你可以用build_fixs/_prelude.js去覆盖
    编辑器目录的Creator\2.4.2\resources\static\_prelude.js 
    
    然后重新构建就可以了
## 更新日志

### 2021/5/31
使用2.4.4构建，修复构建后abundle示例报错的问题
### 2021/4/24
完善示例项目，
### 2020/12/22

### 2020/12/07
修复编辑器引用项目外的模块时报错的问题