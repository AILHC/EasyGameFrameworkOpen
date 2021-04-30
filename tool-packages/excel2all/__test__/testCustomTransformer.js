const { Logger } = require('@ailhc/excel2all');
const { DefaultOutPutTransformer } = require('@ailhc/excel2all');

/**
 * @type {IOutPutTransformer}
 */
module.exports = {
    transform(context,cb) {
        Logger.log("自定义导出处理");
        (new DefaultOutPutTransformer()).transform(context,cb);
    }
}