//主要是解决在monorepo环境下使用npm包，以及多项目共用npm包时，编辑器编译报错，构建编译报错的问题
//原因是编辑器环境编译和构建编译走cc.require，都会经过app.asar\\editor\\\page\\project-scripts.js来进行引用
//而这个app.asar\\editor\\\page\\project-scripts.js模块的node_modules路径只包含项目内的，以及编辑器内的，不包括项目外的node_modules
//放入assets目录中，设置为插件就可以了
if (CC_EDITOR) {
    const projectScriptsModule = process.mainModule.constructor._cache[process.resourcesPath + "\\app.asar\\editor\\\page\\project-scripts.js"];
    // cc.log(projectScriptsModule.id);
    // cc.log(projectScriptsModule.paths);
    if (!projectScriptsModule.isAddCustomPaths) {
        const projectPath = Editor.remote.AssetDB.assetdb.cwd;//项目路径
        // let pathStrs = projectPath.split("\\");
        // const upDirName = pathStrs[pathStrs.length - 1];
        // const up_Dir_node_modules_path = projectPath.replace(upDirName, "node_modules");
        // const up_upDirName = pathStrs[pathStrs.length - 2];
        // const up_up_Dir_node_modules_path = projectPath.replace(up_upDirName + "\\" + upDirName, "node_modules");
        const path = process.mainModule.require("path");
        //添加node_modules路径，按需增加
        const up_Dir_node_modules_path = path.resolve(projectPath, "..\\node_modules");
        const up_up_Dir_node_modules_path = path.resolve(projectPath, "..\\..\\node_modules");
        projectScriptsModule.paths.push(up_Dir_node_modules_path);
        projectScriptsModule.paths.push(up_up_Dir_node_modules_path);
        projectScriptsModule.isAddCustomPaths = true;
        // cc.warn("路径")
        // cc.warn(projectScriptsModule.paths);
    }



}