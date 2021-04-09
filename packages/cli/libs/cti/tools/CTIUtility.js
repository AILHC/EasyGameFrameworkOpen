"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuote = exports.parseBool = exports.isEmpty = exports.isNotEmpty = exports.isFalsy = exports.addNewline = exports.addDot = void 0;
function addDot(ext) {
    if (ext.startsWith('.'))
        return ext;
    return `.${ext}`;
}
exports.addDot = addDot;
function addNewline(option, data) {
    if (option.addNewline)
        return `${data}\n`;
    return data;
}
exports.addNewline = addNewline;
function isFalsy(value) {
    return !value;
}
exports.isFalsy = isFalsy;
function isNotEmpty(value) {
    return value !== undefined && value !== null;
}
exports.isNotEmpty = isNotEmpty;
function isEmpty(value) {
    return !isNotEmpty(value);
}
exports.isEmpty = isEmpty;
function parseBool(value) {
    if (value === undefined) {
        return false;
    }
    if (value === null) {
        return false;
    }
    if (typeof value === 'number') {
        return true;
    }
    if (typeof value === 'string' && value === 'false') {
        return false;
    }
    if (typeof value === 'string' && value === 'true') {
        return true;
    }
    return Boolean(value);
}
exports.parseBool = parseBool;
function getQuote(value) {
    if (value === 'd' || value === '"') {
        return '"';
    }
    return "'";
}
exports.getQuote = getQuote;
exports.default = {
    addDot,
    addNewline,
    getQuote,
    isEmpty,
    isNotEmpty,
    parseBool,
};
//# sourceMappingURL=CTIUtility.js.map