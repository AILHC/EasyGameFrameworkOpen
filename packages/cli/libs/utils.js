// 获取本机电脑IP
function getIPAdress() {
    let interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                // console.log(alias.address);

                return alias.address
            }
        }
    }
}
/**
 * 驼峰化模块名  
 * example:  @ailhc/egf-cli => egfCli
 * @param {string} moduleName 
 */
function camelizePkgName(moduleName) {
    if (moduleName.includes("/")) {
        moduleName = moduleName.split("/")[1];
    }
    if (moduleName.includes("-")) {
        let camelizeRE = /-(\w)/g;
        moduleName = moduleName.replace(camelizeRE, function (_, c) {
            return c ? c.toUpperCase() : '';
        })
    }
    return moduleName;
}
module.exports = {
    getIPAdress: getIPAdress,
    camelizePkgName: camelizePkgName
}