
if (CC_EDITOR) {
    const executor = module.require(Editor.App.path + "/node_modules/@editor/lib-programming/dist/editor-systemjs/index.js");
    
    // if (!executor.globalEditorSystem.isAddCustomPaths) {
    //     console.log(`add node_modules path`)
        
        
    //     const projectPath = Editor.Project.path;
    //     let pathStrs = projectPath.split("\\");
    //     const upDirName = pathStrs[pathStrs.length - 1];
    //     const up_Dir_node_modules_path = projectPath.replace(upDirName, "node_modules");
    //     const up_upDirName = pathStrs[pathStrs.length - 2];
    //     const up_up_Dir_node_modules_path = projectPath.replace(up_upDirName + "\\" + upDirName, "node_modules");
    //     // const path = module.require("path");
    //     //添加node_modules路径，按需增加
    //     // const up_Dir_node_modules_path = path.resolve(projectPath, "..\\node_modules");
    //     // const up_up_Dir_node_modules_path = path.resolve(projectPath, "..\\..\\node_modules");
    //     // module.paths.push(up_Dir_node_modules_path);
    //     // module.paths.push(up_up_Dir_node_modules_path);
    //     const imports = executor.globalEditorSystem.importMap.imports;
    //     imports[`file:///${up_Dir_node_modules_path}`] = `pack:///mods/file/${up_Dir_node_modules_path}`;
    //     imports[`file:///${up_up_Dir_node_modules_path}`] = `pack:///mods/file/${up_up_Dir_node_modules_path}`;
    //     executor.globalEditorSystem.isAddCustomPaths = true;
    // }
}


        // cc.warn("路径")
        // cc.warn(projectScriptsModule.paths);