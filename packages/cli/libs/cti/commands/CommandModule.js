"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandModule = void 0;
const tslib_1 = require("tslib");
const chalk = tslib_1.__importStar(require("chalk"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const fs = tslib_1.__importStar(require("fs"));
const glob_1 = tslib_1.__importDefault(require("glob"));
const minimatch_1 = tslib_1.__importDefault(require("minimatch"));
const path = tslib_1.__importStar(require("path"));
const util = tslib_1.__importStar(require("util"));
const log = debug_1.default('cti:CommandModule');
class CommandModule {
    static targetFileFilter({ filenames, option, logger, }) {
        const targetExts = option.targetExts.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`));
        try {
            log('Start filter logic', option.fileExcludePatterns, filenames);
            const filteredFiles = filenames
                .filter((filename) => targetExts.indexOf(path.extname(filename)) >= 0)
                .filter((filename) => {
                return !option.excludes.reduce((result, exclude) => {
                    return result || path.dirname(filename).indexOf(exclude) >= 0;
                }, false);
            })
                .filter((filename) => !filename.endsWith('.d.ts'))
                .filter((filename) => {
                return !option.fileExcludePatterns.reduce((result, excludePattern) => {
                    log('ExcludePattern: ', glob_1.default.hasMagic(excludePattern, option.globOptions), result || minimatch_1.default(filename, excludePattern));
                    if (!glob_1.default.hasMagic(excludePattern, option.globOptions)) {
                        return result || minimatch_1.default(filename, `*${excludePattern}*`);
                    }
                    return result || minimatch_1.default(filename, excludePattern);
                }, false);
            })
                .filter((filename) => {
                return !option.targetExts
                    .map((ext) => `index.${ext}`)
                    .reduce((result, indexFile) => {
                    return result || filename.indexOf(indexFile) >= 0;
                }, false);
            })
                .filter((filename) => {
                return filename !== '.';
            });
            return filteredFiles;
        }
        catch (err) {
            logger.error(chalk.default.redBright('Error occured: ', err));
            return [];
        }
    }
}
exports.CommandModule = CommandModule;
CommandModule.promisify = {
    exists: util.promisify(fs.exists),
    glob: util.promisify(glob_1.default),
    readDir: util.promisify(fs.readdir),
    readFile: util.promisify(fs.readFile),
    stat: util.promisify(fs.stat),
    unlink: util.promisify(fs.unlink),
    writeFile: util.promisify(fs.writeFile),
};
//# sourceMappingURL=CommandModule.js.map