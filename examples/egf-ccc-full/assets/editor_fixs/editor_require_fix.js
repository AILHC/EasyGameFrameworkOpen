if(CC_EDITOR){
    
    const Module = process.mainModule;
    console.log(Module.paths);
    const projectScriptsModule = process.mainModule.constructor._cache[process.resourcesPath+"\\app.asar\\editor\\\page\\project-scripts.js"];
    const path = process.mainModule.require("path");
    const up_Dir_node_modules_path = path.resolve(Editor.Project.path,"..\\node_modules");
    const up_up_Dir_node_modules_path = path.resolve(Editor.Project.path,"..\\..\\node_modules");
    projectScriptsModule.paths.push(up_Dir_node_modules_path);
    projectScriptsModule.paths.push(up_up_Dir_node_modules_path);
    
}