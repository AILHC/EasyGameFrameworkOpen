const path = require("path");
/**
 * @param {ITableConvertConfig & IOutputConfig & { config:string }} option 
 */
function getParseConfig(option) {
    /**
     * @type {ITableConvertConfig}
     */
    let config = {};
    option.projRoot = getAbsolutePath(option.projRoot, process.cwd());
    if(option.config){
        let configPath = option.config;
        if(typeof configPath !== "string"){
            configPath = "e2a.config.js"
        }
        if (!path.isAbsolute(configPath)) {
            configPath = path.join(option.projRoot, configPath);
        }
        try {
            config = require(configPath);
        } catch (error) {
            console.error(`配置文件无法读取:${configPath}`);
        }
    }
    
    if (config) {
        config = Object.assign(config, option);
    } else {
        config = option;
    }

    if (!config.tableFileDir) {
        config.tableFileDir = config.projRoot;
    } else if (!path.isAbsolute(config.tableFileDir)) {
        config.tableFileDir = path.join(config.projRoot, config.tableFileDir);
    }
    if (config.outputLogDirPath && typeof config.outputLogDirPath !== "string") {
        config.outputLogDirPath = config.projRoot;
    }
    /**
     * @type {IOutputConfig}
     */
    let outputConfig = config.outputConfig;
    if (!outputConfig) {
        /**
         * @type {IOutputConfig}
         */
        outputConfig = {
            clientSingleTableJsonDir: option.clientSingleTableJsonDir,
            clientBundleJsonOutPath: option.clientBundleJsonOutPath,
            isFormatBundleJson: option.isFormatBundleJson,
            clientDtsOutDir: option.clientDtsOutDir,
            isBundleDts: option.isBundleDts,
            bundleDtsFileName: option.bundleDtsFileName,
            isCompress: option.isCompress
        }

    }
    for (let key in outputConfig) {
        if (config[key] !== null && config[key] !== undefined) {
            outputConfig[key] = config[key];
        }
        delete config[key];
    }
    config.outputConfig = outputConfig;

    if (outputConfig.clientSingleTableJsonDir) {
        outputConfig.clientSingleTableJsonDir = getAbsolutePath(outputConfig.clientSingleTableJsonDir, config.projRoot);
    }
    if (outputConfig.clientDtsOutDir) {
        outputConfig.clientDtsOutDir = getAbsolutePath(outputConfig.clientDtsOutDir, config.projRoot);
        if (!outputConfig.bundleDtsFileName) {
            outputConfig.bundleDtsFileName = "tableMap";
        }
    }
    if (outputConfig.clientBundleJsonOutPath) {
        outputConfig.clientBundleJsonOutPath = getAbsolutePath(outputConfig.clientBundleJsonOutPath, config.projRoot);
    }

    return config;
}
/**
 * 获取绝对路径
 * @param {*} originPath 
 * @param {*} root 
 * @param {*} defaultPath 
 */
function getAbsolutePath(originPath, root, defaultPath) {
    if (!originPath) {
        if (defaultPath) {
            return path.join(root, defaultPath);
        } else {
            return root;
        }

    } else if (!path.isAbsolute(originPath)) {
        return path.join(root, originPath);
    } else {
        return originPath;
    }
}
module.exports = {
    getParseConfig,
    getAbsolutePath
}