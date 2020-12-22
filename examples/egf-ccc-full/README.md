## EasyGameFramework的完整示例
基于CocosCreator 2.4.2 
由于2.4.3的引擎sourcemap不正确调试问题降级了
由于这个完整示例是基于monorepo开发，所以得先到根目录，看README 进行开发环境安装

## 目录结构

## 注意
1. 关于引用项目外npm包的问题

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
### 2020/12/22

### 2020/12/07
修复编辑器引用项目外的模块时报错的问题