"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanCommandModule = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const my_easy_fp_1 = require("my-easy-fp");
const path = tslib_1.__importStar(require("path"));
const configure_1 = require("../options/configure");
const CTILogger_1 = require("../tools/CTILogger");
const CTIUtility_1 = require("../tools/CTIUtility");
const CommandModule_1 = require("./CommandModule");
class CleanCommandModule {
    do(executePath, passed) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const workDir = CTIUtility_1.isNotEmpty(passed.globOptions) && CTIUtility_1.isNotEmpty(passed.globOptions.cwd)
                ? passed.globOptions.cwd
                : process.cwd();
            const configFromExecutePath = yield configure_1.readConfigRC(configure_1.getRCFilename(executePath));
            const configFromWorkDir = yield configure_1.readConfigRC(configure_1.getRCFilename(workDir));
            const option = configure_1.concreteConfig(configure_1.merging(configure_1.merging(my_easy_fp_1.isPass(configFromExecutePath) ? configFromExecutePath.pass : configure_1.getDeafultOptions(), my_easy_fp_1.isPass(configFromWorkDir) ? configFromWorkDir.pass : configure_1.getDeafultOptions()), passed));
            const logger = new CTILogger_1.CTILogger(option.verbose);
            logger.log(chalk_1.default.yellowBright('Option: '), option);
            const indexFiles = yield CommandModule_1.CommandModule.promisify.glob('**/index.ts', {
                cwd: workDir,
                nonull: false,
            });
            const indexBackupFiles = yield CommandModule_1.CommandModule.promisify.glob('**/index.ts.bak', {
                cwd: workDir,
                nonull: false,
            });
            const entrypointFiles = yield CommandModule_1.CommandModule.promisify.glob('**/entrypoint.ts', {
                cwd: workDir,
                nonull: false,
            });
            const entrypointBackupFiles = yield CommandModule_1.CommandModule.promisify.glob('**/entrypoint.ts.bak', {
                cwd: workDir,
                nonull: false,
            });
            const outputFiles = yield CommandModule_1.CommandModule.promisify.glob(`**/${option.output}`, {
                cwd: workDir,
                nonull: false,
            });
            const outputBackupFiles = yield CommandModule_1.CommandModule.promisify.glob(`**/${option.output}.bak`, {
                cwd: workDir,
                nonull: false,
            });
            const concatted = indexFiles
                .concat(indexBackupFiles)
                .concat(entrypointFiles)
                .concat(entrypointBackupFiles)
                .concat(outputFiles)
                .concat(outputBackupFiles);
            const concattedSet = new Set(concatted);
            if (concatted.length === 0) {
                logger.flog(chalk_1.default.yellow(`Cannot find target file on working directory: ${workDir}`));
            }
            yield Promise.all(Array.from(concattedSet).map((file) => {
                logger.log(chalk_1.default.redBright('delete file: '), path.join(workDir, file));
                return CommandModule_1.CommandModule.promisify.unlink(path.join(workDir, file));
            }));
            logger.flog(chalk_1.default.green(`clean succeeded: ${workDir}`));
        });
    }
    write(_param) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            throw new Error('Not Implemented');
        });
    }
}
exports.CleanCommandModule = CleanCommandModule;
//# sourceMappingURL=CleanCommandModule.js.map