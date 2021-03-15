/**
 * @type {ITableParseHandler}
 */
module.exports = {
    parseTableFile(parseConfig, fileInfo, parseResult) {
        console.log(`日志等级${parseConfig.logLevel}`);
        return parseResult;
    }
}