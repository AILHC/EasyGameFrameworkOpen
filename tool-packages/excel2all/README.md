`excell2all`

excel配置表转换工具

## 简介

一个可以将各种Excel表转换成各种文件的工具库，默认支持将xlsx和csv格式的Excel表转换为json文件和ts声明文件
## 特性

1. 支持多线程加速解析(文件越多加速效果越明显)
2. 支持增量解析转换(只转换改过的文件，我改一个表，解析100个表？不存在)
3. 默认支持解析xlsx和csv格式Excel表转换为json文件和ts声明文件
4. 满足大部分需求的默认配置表解析规则
5. 支持自定义解析和转换逻辑
6. 提供丰富的生命周期钩子，可以接入自动上传，自动svn提交之类的逻辑

## 自定义Excel解析器

## 生命周期钩子
通过这些
```ts
interface IConvertHook {
    /**
     * 开始转换
     * 处理好配置
     * @param context 上下文
     * @param cb 生命周期结束回调,必须调用
     */
    onStart?(context: IConvertContext, cb: VoidFunction): void;
    /**
     * 遍历文件之后，解析之前
     * @param context 上下文
     * @param cb 生命周期结束回调,必须调用
     */
    onParseBefore?(context: IConvertContext, cb: VoidFunction): void;
    /**
     * 解析结束
     * 可以转换解析结果为多个任意文件
     * @param context 上下文
     * @param cb 生命周期结束回调,必须调用
     */
    onParseAfter?(context: IConvertContext, cb: VoidFunction): void;
    /**
     * 写入文件结束
     * @param context 上下文
     */
    onWriteFileEnd(context: IConvertContext): void;
}
```

## 默认支持的规范和逻辑
## 使用
### 默认支持的表格规范和输出文件
### 引入该库，接入自己的工作流程
### 使用cli工具

## 自定义扩展
    扩展解析逻辑
    扩展转换逻辑



