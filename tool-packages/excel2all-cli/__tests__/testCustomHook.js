/**
 * @type {import("@ailhc/excel2all").DefaultConvertHook}
 * 
 */
const DefaultHook = require("@ailhc/excel2all").DefaultConvertHook;
/**
 * @type {IConvertHook}
 */
const customConvertHook = {
    onStart(context, cb) {
        console.log(`自定义Hook,onStart`);
        cb();
    },
    onConvertEnd(){
        console.log(`转换结束`);
        cb();
    }
    
}