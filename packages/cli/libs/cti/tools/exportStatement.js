"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExportStatementCreator = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const path = tslib_1.__importStar(require("path"));
const CTIUtility_1 = require("./CTIUtility");
function getExportStatementCreator(option, logger) {
    const targetExtWithDot = option.targetExts.map((ext) => CTIUtility_1.addDot(ext));
    const pathReplacer = path.sep !== '/'
        ? (exportPath) => exportPath.replace(new RegExp(path.sep.replace('\\', '\\\\'), 'g'), '/')
        : (exportPath) => exportPath;
    if (option.useSemicolon) {
        const getExportWithSemicolon = (target) => {
            const matchedExt = targetExtWithDot.find((ext) => path.extname(target) === ext);
            const targetWithoutExt = CTIUtility_1.isNotEmpty(matchedExt)
                ? target.replace(matchedExt, '')
                : target;
            logger.log(chalk_1.default.green('entrypoint added from:'), target);
            return `export * from ${option.quote}./${pathReplacer(targetWithoutExt)}${option.quote};`;
        };
        return getExportWithSemicolon;
    }
    const getExport = (target) => {
        const matchedExt = targetExtWithDot.find((ext) => path.extname(target) === ext);
        const targetWithoutExt = CTIUtility_1.isNotEmpty(matchedExt) ? target.replace(matchedExt, '') : target;
        logger.log(chalk_1.default.green('entrypoint added from:'), target);
        return `export * from ${option.quote}./${pathReplacer(targetWithoutExt)}${option.quote}`;
    };
    return getExport;
}
exports.getExportStatementCreator = getExportStatementCreator;
//# sourceMappingURL=exportStatement.js.map