"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScritIndexWriter = void 0;
const tslib_1 = require("tslib");
const CreateCommandModule_1 = require("./commands/CreateCommandModule");
const EntrypointCommandModule_1 = require("./commands/EntrypointCommandModule");
const configure_1 = require("./options/configure");
const CTIUtility_1 = require("./tools/CTIUtility");
class TypeScritIndexWriter {
    getDefaultOption(cwd) {
        if (CTIUtility_1.isNotEmpty(cwd)) {
            const option = configure_1.getDeafultOptions();
            option.globOptions.cwd = cwd;
            return option;
        }
        return configure_1.getDeafultOptions();
    }
    create(option, _cliCwd) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cliCwd = (() => {
                if (CTIUtility_1.isNotEmpty(_cliCwd)) {
                    return _cliCwd;
                }
                if (CTIUtility_1.isNotEmpty(option.globOptions.cwd)) {
                    return option.globOptions.cwd;
                }
                return process.cwd();
            })();
            const createCommand = new CreateCommandModule_1.CreateCommandModule();
            const result = yield createCommand.do(cliCwd, option);
            return result;
        });
    }
    createEntrypoint(option, _cliCwd) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cliCwd = (() => {
                if (CTIUtility_1.isNotEmpty(_cliCwd)) {
                    return _cliCwd;
                }
                if (CTIUtility_1.isNotEmpty(option.globOptions.cwd)) {
                    return option.globOptions.cwd;
                }
                return process.cwd();
            })();
            const entrypointCommand = new EntrypointCommandModule_1.EntrypointCommandModule();
            const result = yield entrypointCommand.do(cliCwd, option);
            return result;
        });
    }
}
exports.TypeScritIndexWriter = TypeScritIndexWriter;
//# sourceMappingURL=TypeScritIndexWriter.js.map