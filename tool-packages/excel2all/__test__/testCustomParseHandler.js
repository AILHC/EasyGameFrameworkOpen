const { Logger, DefaultTableParser } = require('@ailhc/excel2all');
const parser = new DefaultTableParser();
/**
 * @type {ITableParseHandler}
 */
module.exports = {
    parseTableFile(parseConfig, fileInfo, parseResult) {
        Logger.log("自定义解析")
        const newParseResult = parser.parseTableFile(parseConfig, fileInfo, parseResult);
        return newParseResult;
    }
}