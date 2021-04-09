"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitCommandModule = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const fs = tslib_1.__importStar(require("fs"));
const json5_1 = tslib_1.__importDefault(require("json5"));
const my_easy_fp_1 = require("my-easy-fp");
const path = tslib_1.__importStar(require("path"));
const configure_1 = require("../options/configure");
const CTILogger_1 = require("../tools/CTILogger");
const CTIUtility_1 = require("../tools/CTIUtility");
const log = debug_1.default('cti:InitCommandModule');
class InitCommandModule {
    do(executePath, passed) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const workDir = CTIUtility_1.isNotEmpty(passed.globOptions) && CTIUtility_1.isNotEmpty(passed.globOptions.cwd)
                ? passed.globOptions.cwd
                : process.cwd();
            const configFromExecutePath = yield configure_1.readConfigRC(configure_1.getRCFilename(executePath));
            const configFromWorkDir = yield configure_1.readConfigRC(configure_1.getRCFilename(workDir));
            const option = configure_1.concreteConfig(configure_1.merging(configure_1.merging(my_easy_fp_1.isPass(configFromExecutePath) ? configFromExecutePath.pass : configure_1.getDeafultOptions(), my_easy_fp_1.isPass(configFromWorkDir) ? configFromWorkDir.pass : configure_1.getDeafultOptions()), passed));
            log('readed option: ', option);
            const logger = new CTILogger_1.CTILogger(option.verbose);
            try {
                const defaultOption = configure_1.getDeafultOptions();
                const stringified = json5_1.default.stringify(defaultOption, null, 2);
                const headContent = (() => {
                    if (option.useTimestamp) {
                        return `// created from ${option.quote}create-ts-index${option.quote} ${dayjs_1.default().format('YYYY-MM-DD HH:mm')}`;
                    }
                    return `// created from ${option.quote}create-ts-index${option.quote}`;
                })();
                const addNewline = (() => {
                    if (option.addNewline) {
                        return '\n';
                    }
                    return '';
                })();
                yield new Promise((resolve, reject) => {
                    fs.writeFile(path.join(workDir, '.ctirc'), `${headContent}\n\n${stringified}${addNewline}`, (err) => {
                        if (CTIUtility_1.isNotEmpty(err)) {
                            return reject(err);
                        }
                        logger.flog(chalk_1.default.green(`.ctirc create succeeded: ${option.globOptions.cwd}`));
                        return resolve();
                    });
                });
            }
            catch (err) {
                logger.error(chalk_1.default.red('indexWriter: ', err.message));
                logger.error(chalk_1.default.red('indexWriter: ', err.stack));
            }
        });
    }
    write(_args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implements');
        });
    }
}
exports.InitCommandModule = InitCommandModule;
//# sourceMappingURL=InitCommandModule.js.map