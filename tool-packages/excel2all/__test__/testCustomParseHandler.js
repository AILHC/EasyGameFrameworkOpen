const { Logger } = require('@ailhc/excel2all');

/**
 * @type {ITableParseHandler}
 */
module.exports = {
    parseTableFile(parseConfig, fileInfo, parseResult) {
        Logger.log("自定义解析")
        return parseResult;
    }
}