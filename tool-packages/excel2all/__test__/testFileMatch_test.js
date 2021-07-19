const path = require("path")
/**
 * @type {typeof import("../src")}
 */
const excel2all = require("../dist/cjs/lib/index.js")
const tableFileDir = path.join(process.cwd(), "__test__/test-excel-files");
/**
 * @type {ITableConvertConfig}
 */
const convertConfig = {
    projRoot: "./__test__",
    tableFileDir: tableFileDir,
    useCache: false
};

excel2all.testFileMatch(convertConfig);
