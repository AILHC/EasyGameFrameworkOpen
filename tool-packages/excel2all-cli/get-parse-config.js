const path = require("path");
/**
 * @param {ITableConvertConfig & IOutputConfig &{ config:string }} option 
 */
function getParseConfig(option) {
    /**
     * @type {ITableConvertConfig}
     */
    let config = {};
    option.projRoot = getAbsolutePath(option.projRoot, process.cwd());
    if (typeof option.config === "string") {
        if (!path.isAbsolute(option.config)) {
            option.config = path.join(option.projRoot, option.config);
        }
        config = require(option.config);
    } else {
        config = option;
    }
    if (!config) {
        console.error(`配置文件不存在:${option.config}`);
        return;
    }
    if (!config.projRoot) {
        config.projRoot = option.projRoot;
    }
    if (!config.tableFileDir) {
        config.tableFileDir = config.projRoot;
    } else if (!path.isAbsolute(config.tableFileDir)) {
        config.tableFileDir = path.join(config.projRoot, config.tableFileDir);
    }
    
    if (!config.outputConfig) {
        /**
         * @type {IOutputConfig}
         */
        const outputConfig = {
            clientSingleTableJsonDir: option.clientSingleTableJsonDir,
            clientBundleJsonOutPath: option.clientBundleJsonOutPath,
            isFormatBundleJson: option.isFormatBundleJson,
            isGenDts: option.isGenDts,
            clientDtsOutDir: option.clientDtsOutDir,
            isBundleDts: option.isBundleDts,
            
            bundleDtsFileName: option.bundleDtsFileName,
            isCompress: option.isCompress
        }

        for (let key in outputConfig) {
            delete config[key];
        }
        if (outputConfig.clientSingleTableJsonDir) {
            outputConfig.clientSingleTableJsonDir = getAbsolutePath(outputConfig.clientSingleTableJsonDir, config.projRoot);
        }
        if (outputConfig.isGenDts) {
            outputConfig.clientDtsOutDir = getAbsolutePath(outputConfig.clientDtsOutDir, config.projRoot);
            if (!outputConfig.bundleDtsFileName) {
                outputConfig.bundleDtsFileName = "tableMap";
            }
        }
        if (outputConfig.clientBundleJsonOutPath) {
            outputConfig.clientBundleJsonOutPath = getAbsolutePath(outputConfig.clientBundleJsonOutPath, config.projRoot);
        }

        config.outputConfig = outputConfig;
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
module.exports = getParseConfig;