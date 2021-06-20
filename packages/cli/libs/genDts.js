const path = require("path");
const fs = require("fs");
/**
 * 生成声明文件
 * @param {string} projRoot 
 * @param {string} out 
 * @param {string} moduleName
 * @param {string[]} exclude 
 * @param {boolean} isGlobal 
 * @param {boolean} log
 */
function genDts(projRoot, out, moduleName, exclude, isGlobal, log) {
    /**
     * @type {any}
     */
    const dtsg = require("dts-generator");
    /**
     * @type {dtsGenerator}
     */
    const dtsGen = dtsg.default;


    let dtsGenExclude = ["node_modules/**/*.d.ts"].concat(exclude ? exclude : []);
    const logPrint = (msg) => {
        log && console.log(`[EGF-CLI] ${msg}`);
    };
    /**
     * @type {Partial<import('dts-generator').DtsGeneratorOptions> }
     */
    const dtsGOpt = {
        baseDir: projRoot,

        exclude: dtsGenExclude,
        out: out,

        sendMessage: logPrint,
        verbose: logPrint,
        resolveModuleId: function (params) {

            return moduleName;
        },
        resolveModuleImport: function (params) {

            if (!params.isDeclaredExternalModule) {

                if (!params.importedModuleId.includes(".")) {
                    // npm包
                    return params.importedModuleId;
                }
                return moduleName;
            }
            return params.importedModuleId
        }
    };
    console.log(`[EGF-CLI] 开始生成声明文件:${path.relative(projRoot, out)}`);
    dtsGen(dtsGOpt).then((args) => {
        if (isGlobal) {
            console.log(`[EGF-CLI] 开始处理成全局声明`);
            //全局类型处理
            const ts = require("typescript");

            let dtsFileStr = fs.readFileSync(dtsGOpt.out, "utf-8");
            //去掉export * from ""
            //去掉export default 
            //去掉export 

            // dtsFileStr = dtsFileStr.replace(/export \* from /g, "");
            const source = ts.createSourceFile(`${moduleName}.d.ts`, dtsFileStr, ts.ScriptTarget.ESNext, true);
            const statements = source.statements;
            /**
             * @type {ts.Statement}
             */
            let statement;
            /**
             * 
             * @param {ts.Statement} statement 
             * @returns {statement is ts.ModuleDeclaration}
             */
            const isModuleDeclare = function (statement) {
                return statement.kind === ts.SyntaxKind.ModuleDeclaration;
            }
            let namespacesStr = `\ndeclare namespace ${moduleName} {`;
            for (let i = 0; i < statements.length; i++) {
                statement = statements[i];

                if (isModuleDeclare(statement)) {
                    /**
                     * @type {ts.ModuleBlock}
                     */
                    let moduleBlock = statement.body;
                    let childStatements = moduleBlock.statements;
                    for (let k = 0; k < childStatements.length; k++) {
                        /**
                         * @type {ts.ClassDeclaration}
                         */
                        let childeStatement = childStatements[k];

                        if (childStatements[k].kind === ts.SyntaxKind.ClassDeclaration) {
                            //泛型处理
                            const typeParameters = childeStatement.typeParameters;
                            let typeStr = "";
                            let refTypeStr = "";
                            if (typeParameters && typeParameters.length > 0) {
                                typeStr = "<";
                                refTypeStr = "<";

                                for (let j = 0; j < typeParameters.length; j++) {
                                    typeStr += typeParameters[j].getFullText();
                                    refTypeStr += typeParameters[j].name.escapedText;
                                    if (j < typeParameters.length - 1) {
                                        typeStr += ", ";
                                        refTypeStr += ", ";
                                    }
                                }
                                typeStr += ">";
                                refTypeStr += ">";
                            }
                            let className = childeStatement.name.escapedText;
                            namespacesStr += `\n\ttype ${className + typeStr} = import('${moduleName}').${className + refTypeStr};`;
                        }
                    }
                }
            }
            namespacesStr += "\n}";
            dtsFileStr = dtsFileStr.replace(new RegExp(`export \\* from '${moduleName}';`, "g"), "");
            dtsFileStr = dtsFileStr.replace(/export {};/g, "");
            dtsFileStr = dtsFileStr.replace(/export default /g, "");
            dtsFileStr = dtsFileStr.replace(/export /g, "");


            dtsFileStr += namespacesStr;
            // dtsFileStr = dtsFileStr.replace(new RegExp(`${moduleName}`,"g"),"");
            dtsFileStr += `\ndeclare const ${moduleName}:typeof import("${moduleName}");`;
            fs.writeFileSync(dtsGOpt.out, dtsFileStr);
        }
        console.log(`[EGF-CLI] 声明文件生成完毕`);
    })
}
module.exports = genDts;