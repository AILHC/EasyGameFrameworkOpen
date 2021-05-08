if (CC_EDITOR) {
    const path = process.mainModule.require("path");
    let scriptPath = "\\editor\\page\\project-scripts.js";
    if (process.platform === "darwin") {
        scriptPath = scriptPath.replace(/\\/g, "/");
    }
    const projectScriptsModule = process.mainModule.constructor._cache[Editor.appPath + scriptPath];
    // cc.log(projectScriptsModule.paths);
    if (!projectScriptsModule.isAddCustomPaths) {
        const projectPath = Editor.remote.AssetDB.assetdb.cwd;//项目路径
        // let pathStrs = projectPath.split("\\");
        // const upDirName = pathStrs[pathStrs.length - 1];
        // const up_Dir_node_modules_path = projectPath.replace(upDirName, "node_modules");
        // const up_upDirName = pathStrs[pathStrs.length - 2];
        // const up_up_Dir_node_modules_path = projectPath.replace(up_upDirName + "\\" + upDirName, "node_modules");
        //添加node_modules路径，按需增加
        let up_Dir_node_modules_path = path.resolve(projectPath, "..\\node_modules");
        let up_up_Dir_node_modules_path = path.resolve(projectPath, "..\\..\\node_modules");
        if (process.platform === "darwin") {
            up_up_Dir_node_modules_path = up_up_Dir_node_modules_path.replace(/\\/g, "/");
            up_Dir_node_modules_path = up_Dir_node_modules_path.replace(/\\/g, "/");
        }
        projectScriptsModule.paths.push(up_Dir_node_modules_path);
        projectScriptsModule.paths.push(up_up_Dir_node_modules_path);
        projectScriptsModule.isAddCustomPaths = true;
        // cc.warn("路径")
        // cc.warn(projectScriptsModule.paths);
    }



}
