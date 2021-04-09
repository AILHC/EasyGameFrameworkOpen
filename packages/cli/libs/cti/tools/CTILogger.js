"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTILogger = void 0;
class CTILogger {
    constructor(verbose) {
        if (verbose) {
            this.log = console.log;
            this.error = console.error;
        }
        else {
            this.log = () => {
                return;
            };
            this.error = console.error;
        }
        this.flog = console.log;
        this.ferror = console.error;
    }
}
exports.CTILogger = CTILogger;
//# sourceMappingURL=CTILogger.js.map