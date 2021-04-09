"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommandModule = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const my_easy_fp_1 = require("my-easy-fp");
const path = tslib_1.__importStar(require("path"));
const configure_1 = require("../options/configure");
const CTILogger_1 = require("../tools/CTILogger");
const CTIUtility_1 = require("../tools/CTIUtility");
const exportStatement_1 = require("../tools/exportStatement");
const CommandModule_1 = require("./CommandModule");
const log = debug_1.default('cti:CreateCommandModule');
class CreateCommandModule {
    do(executePath, passed) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const workDir = CTIUtility_1.isNotEmpty(passed.globOptions) && CTIUtility_1.isNotEmpty(passed.globOptions.cwd)
                ? passed.globOptions.cwd
                : process.cwd();
            const configFromExecutePath = yield configure_1.readConfigRC(configure_1.getRCFilename(executePath));
            const configFromWorkDir = yield configure_1.readConfigRC(configure_1.getRCFilename(workDir));
            const option = configure_1.concreteConfig(configure_1.merging(configure_1.merging(my_easy_fp_1.isPass(configFromExecutePath) ? configFromExecutePath.pass : configure_1.getDeafultOptions(), my_easy_fp_1.isPass(configFromWorkDir) ? configFromWorkDir.pass : configure_1.getDeafultOptions()), passed));
            const logger = new CTILogger_1.CTILogger(option.verbose);
            try {
                logger.log(chalk_1.default.yellowBright('Option: '), option);
                log('opt: ', option);
                const targetFileGlob = option.targetExts.map((ext) => `*.${ext}`).join('|');
                const allTsFiles = yield CommandModule_1.CommandModule.promisify.glob(`**/+(${targetFileGlob})`, option.globOptions);
                const tsFiles = CommandModule_1.CommandModule.targetFileFilter({
                    logger,
                    option,
                    filenames: allTsFiles,
                });
                const dupLibDirs = tsFiles
                    .filter((tsFile) => tsFile.split('/').length > 1)
                    .map((tsFile) => {
                    const splitted = tsFile.split('/');
                    const allPath = Array(splitted.length - 1)
                        .fill(0)
                        .map((_, index) => index + 1)
                        .map((index) => {
                        const a = splitted.slice(0, index).join('/');
                        return a;
                    });
                    return allPath;
                })
                    .reduce((aggregated, libPath) => {
                    return aggregated.concat(libPath);
                }, []);
                const dirSet = new Set();
                dupLibDirs.forEach((dir) => dirSet.add(dir));
                tsFiles.map((tsFile) => path.dirname(tsFile)).forEach((dir) => dirSet.add(dir));
                const tsDirs = Array.from(dirSet);
                if (option.includeCWD &&
                    tsDirs.findIndex((dir) => path.resolve(dir) === path.resolve('.')) < 0) {
                    tsDirs.push('.');
                }
                tsDirs.sort((left, right) => {
                    const llen = left.split('/').length;
                    const rlen = right.split('/').length;
                    if (llen > rlen) {
                        return -1;
                    }
                    if (llen < rlen) {
                        return 1;
                    }
                    return 0;
                });
                log('tsDirs:: ', tsDirs);
                yield Promise.all(tsDirs.map((tsDir) => this.write({ option, logger, directory: tsDir, directories: tsDirs })));
                logger.flog(chalk_1.default.green(`create succeeded: ${option.globOptions.cwd}`));
            }
            catch (err) {
                log(err.message);
                log(err.stack);
                logger.ferror(chalk_1.default.red(err.message));
            }
        });
    }
    write({ directory, option, logger, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                logger.log(chalk_1.default.yellowBright('Current working directory: ', directory));
                const resolvePath = path.resolve(option.globOptions.cwd || __dirname);
                const elements = yield CommandModule_1.CommandModule.promisify.readDir(path.join(resolvePath, directory));
                const stats = yield Promise.all(elements.map((target) => CommandModule_1.CommandModule.promisify.stat(path.join(resolvePath, directory, target))));
                const statMap = elements.reduce((map, element, index) => {
                    map[element] = stats[index];
                    return map;
                }, {});
                const targets = elements
                    .filter((element) => statMap[element].isDirectory() || element !== 'index.ts')
                    .filter((element) => statMap[element].isDirectory() || element !== 'entrypoint.ts')
                    .filter((element) => statMap[element].isDirectory() || element !== option.output);
                const categorized = targets.reduce((result, target) => {
                    if (statMap[target].isDirectory()) {
                        result.dir.push(target);
                    }
                    else {
                        result.allFiles.push(target);
                    }
                    return result;
                }, { dir: [], allFiles: [] });
                const excludePatternFilteredDirs = categorized.dir.filter((element) => {
                    return !option.excludes.reduce((result, excludePattern) => {
                        return result || element.indexOf(excludePattern) >= 0;
                    }, false);
                });
                excludePatternFilteredDirs.sort();
                categorized.allFiles = CommandModule_1.CommandModule.targetFileFilter({
                    logger,
                    option,
                    filenames: categorized.allFiles,
                });
                const excludePatternFilteredFiles = [...categorized.allFiles].sort();
                const sorted = (() => {
                    if (option.fileFirst) {
                        return categorized.allFiles.concat(excludePatternFilteredDirs);
                    }
                    return excludePatternFilteredDirs.concat(excludePatternFilteredFiles);
                })();
                const getExport = exportStatement_1.getExportStatementCreator(option, logger);
                const exportString = sorted.map((target) => getExport(target));
                const _buildComment = () => {
                    if (option.withoutComment) {
                        return '';
                    }
                    if (option.useTimestamp) {
                        return `// created from ${option.quote}create-ts-index${option.quote} ${dayjs_1.default().format('YYYY-MM-DD HH:mm')}\n\n`;
                    }
                    return `// created from ${option.quote}create-ts-index${option.quote}\n\n`;
                };
                const comment = _buildComment();
                const fileContent = comment + CTIUtility_1.addNewline(option, exportString.join('\n'));
                logger.log(chalk_1.default.green('created: '), `${path.join(resolvePath, directory, option.output)}`);
                if (option.withoutBackupFile) {
                    yield CommandModule_1.CommandModule.promisify.writeFile(path.join(resolvePath, directory, option.output), fileContent, 'utf8');
                    return;
                }
                const indexFile = path.join(resolvePath, directory, option.output);
                const indexBackupFile = path.join(resolvePath, directory, `${option.output}.bak`);
                if (yield CommandModule_1.CommandModule.promisify.exists(indexFile)) {
                    logger.log(chalk_1.default.green('created: '), `${indexBackupFile}`);
                    yield CommandModule_1.CommandModule.promisify.writeFile(indexBackupFile, yield CommandModule_1.CommandModule.promisify.readFile(indexFile), 'utf8');
                }
                yield CommandModule_1.CommandModule.promisify.writeFile(indexFile, fileContent, 'utf8');
            }
            catch (err) {
                log(err.message);
                log(err.stack);
                logger.error(chalk_1.default.red('indexWriter: ', err.message));
            }
        });
    }
}
exports.CreateCommandModule = CreateCommandModule;
//# sourceMappingURL=CreateCommandModule.js.map