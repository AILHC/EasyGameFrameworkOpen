`excel2all`

excel配置表转换库

## 简介

一个可以将各种Excel表转换成各种文件的工具库，默认支持将xlsx和csv格式的Excel表转换为json文件和ts声明文件
## 特性

1. 支持增量解析转换(只转换改过的文件，我改一个表，解析100个表？不存在)
2. 默认支持解析xlsx和csv格式Excel表转换为json文件和ts声明文件
3. 满足大部分需求的默认配置表解析规则
4. 支持自定义解析和转换逻辑
5. 提供完善生命周期钩子，可以接入自动上传，自动svn提交之类的逻辑
6. 支持不同Excel文件同名表合并(方便多分支版本管理)

## [CHANGELOG](tool-packages/excel2all/CHANGELOG.md)


## 默认表格规范

### 表头

第一列第一行 `A1`

这里定义配置表的类型和名字，用冒号`:`隔开

`H` 即: `Horizontal` 指这个表的字段是纵向扩展。比如 `H:TableTypeSetting`

`V` 即: `Vertical` 指这个表的字段纵向扩展。比如: `V:ObjTypeSetting`

如果不指定类型,则默认用`H`类型 比如: `TableTypeSetting` 类型是`H`

**第一行也是注释行，可以写这个字段的注释，会生成到声明文件中**

### 默认的字段类型和值转换规则

默认的字段类型与Javascript的类型对照

1. int => number ; 需配置: 123 => 转换值: 123

2. boolean => boolean ; 需配置: true => 转换值: true 
    
3. string => string ; 需配置: 字符串 => 转换值: 字符串 

4. [int] => number[] ; 需配置: [1,2,3] => 转换值: [1,2,3] 

5. [string] => string[] ; 需配置: ["a","b","c"] => 转换值: ["1","2","3"]

6. json => Object / {} ; 需配置: {"公众号":"玩转游戏开发"} => 转换值: {"公众号":"玩转游戏开发"}

    这个类型的转换处理:先使用`JSON.parse`转换,如果出错则直接返回未转换的值，会导致出错和报错

7. 对象分列配置,比如

    | 多列对象:数字字段 	| 字符串字段           	|
    |-------------------	|----------------------	|
    | mf:obj:int        	| mf:obj:string        	|
    | obj:obj_field_int 	| obj:obj_field_string 	|

    生成`JSON`:
    
    
    ```json
        "obj": {
                    "obj_field_int": 5,
                    "obj_field_string": "玩转游戏开发",
                    "obj_field_int_array": [
                        1,
                        2,
                        3
                    ],
                    "obj_field_string_array": [
                        "玩转游戏开发"
                    ],
                    "obj_field_json": {
                        "公众号": "玩转游戏开发"
                    }
                }
    ```
    
    生成声明:

    ```ts
    readonly obj?: {
            /** 多列对象:数字字段 */
            readonly obj_field_int?: number;
            /** 字符串字段 */
            readonly obj_field_string?: string;
            /** 数字数组字段 */
            readonly obj_field_int_array?: number[];
            /** 字符串数组字段 */
            readonly obj_field_string_array?: string[];
            /** json字段 */
            readonly obj_field_json?: any;
        }
    ```
8. any => any ; 需配置: [2,\"11\"] => 转换值: [2,"11"] 

    这个类型的转换处理:先使用`JSON.parse`转换,如果出错则直接返回未转换的值，但不会导致出错



**非默认类型的值则会使用 `JSON.parse()` 去转换**

**非默认类型的类型声明也会原封不动的使用配置的不会转换**

比如: `Array<Object>` => `field: Array<Object>`


### 字段横向扩展类型

1. 标志 `TYPE`

    标志这一行是配置字段类型的

2. 标志 `CLIENT`
    标志这一行是配置字段名的

3. 标志 `NO`

    标志这一行不解析

4. 标志 `END`

    标志这一行是最后一行，解析完之后，就不再解析下一行

5. 列结束标志: 当前列的值为空

    如果注释行也就是第一行，这一列的值为空则列结束，将不会继续解析

**主键列**

`B`为主键列

这一列的值将会作为，每一行的对象在Table对象中的key

具体可见下面的示例

**配置表**

| TableTypeSetting | 主键 | 数字      | 数字数组        | 字符串       | 字符串数组                  | JSON                      | 多列对象:数字字段 | 字符串字段           | 数字数组字段            | 字符串数组字段              | json字段                  | json字段                  |
|------------------|------|-----------|-----------------|--------------|-----------------------------|---------------------------|-------------------|----------------------|-------------------------|-----------------------------|---------------------------|---------------------------|
| TYPE             | int  | int       | [int]           | string       | [string]                    | json                      | mf:obj:int        | mf:obj:string        | mf:obj:[int]            | mf:obj:[string]             | mf:obj:json               | mf:obj:json               |
| CLIENT           | id   | field_int | field_int_array | field_string | field_string_array          | field_json                | obj:obj_field_int | obj:obj_field_string | obj:obj_field_int_array | obj:obj_field_string_array  | obj:obj_field_json        | obj:obj_field_json        |
| SERVER           | id   | field_int | field_int_array |              |                             |                           |                   |                      |                         |                             |                           |                           |
|                  | 1    | 5         | [1,2,3]         | 玩转游戏开发 | ["玩转游戏开发"]            | {"公众号":"玩转游戏开发"} | 5                 | 玩转游戏开发         | [1,2,3]                 | ["玩转游戏开发"]            | {"公众号":"玩转游戏开发"} | {"公众号":"玩转游戏开发"} |
| NO               | 4    |           | [1,2,3]         | 玩转游戏开发 | ["关注公众号:玩转游戏开发"] | {"公众号":"玩转游戏开发"} |                   | 玩转游戏开发         | [1,2,3]                 | ["关注公众号:玩转游戏开发"] | {"公众号":"玩转游戏开发"} |                           |
| END              | 7    | 300       | [1,8,3]         | 玩转游戏开发 | ["关注公众号:玩转游戏开发"] | {"公众号":"玩转游戏开发"} | 300               | 玩转游戏开发         | [1,8,3]                 | ["关注公众号:玩转游戏开发"] | {"公众号":"玩转游戏开发"} |                           |

**转换值**

1. JSON

    ```json
    {
        "1": {
            "id": 1,
            "field_int": 5,
            "field_int_array": [
                1,
                2,
                3
            ],
            "field_string": "玩转游戏开发",
            "field_string_array": [
                "玩转游戏开发"
            ],
            "field_json": {
                "公众号": "玩转游戏开发"
            },
            "obj": {
                "obj_field_int": 5,
                "obj_field_string": "玩转游戏开发",
                "obj_field_int_array": [
                    1,
                    2,
                    3
                ],
                "obj_field_string_array": [
                    "玩转游戏开发"
                ],
                "obj_field_json": {
                    "公众号": "玩转游戏开发"
                }
            }
        }
    }
    ```


2. 声明

    ```ts
    
    interface IT_TableTypeSetting {
        /** 主键 */
        readonly id?: number;
        /** 数字 */
        readonly field_int?: number;
        /** 布尔值 */
        readonly field_bool?: boolean;
        /** 数字数组 */
        readonly field_int_array?: number[];
        /** 字符串 */
        readonly field_string?: string;
        /** 字符串数组 */
        readonly field_string_array?: string[];
        /** JSON */
        readonly field_json?: any;
        readonly obj?: {
            /** 多列对象:数字字段 */
            readonly obj_field_int?: number;
            /** 字符串字段 */
            readonly obj_field_string?: string;
            /** 数字数组字段 */
            readonly obj_field_int_array?: number[];
            /** 字符串数组字段 */
            readonly obj_field_string_array?: string[];
            /** json字段 */
            readonly obj_field_json?: any;
        }
    }
    ```

### 字段纵向扩展类型

**规范**

`A`列为注释列

`B`列为类型列

`C`列为字段列

`D`列为值



**配置表**

| V:ObjTypeSetting    	| TYPE               	| CLIENT        	| VALUE                                       	|
|---------------------	|--------------------	|---------------	|---------------------------------------------	|
| 数字                	| int                	| Prop1         	| 1                                           	|
| 布尔值              	| boolean            	| PropBool      	| true                                        	|
| 数字数组            	| [int]              	| Prop2         	| [1,2,3,4]                                   	|
| 字符串              	| string             	| Prop3         	| string                                      	|
| 字符串数组          	| [string]           	| Prop4         	| ["a","b","c"]                               	|
| json对象            	| json               	| Prop5         	| {"a":1,"b":2,"c":"c","d":[1],"f":["f","f"]} 	|
| 嵌套对象测试:主键id 	| mf:MyObject:int    	| MyObject:id   	| 12                                          	|
| 名字                	| mf:MyObject:string 	| MyObject:name 	| 你么                                        	|

**转换值**

1. JSON

    ```json
    {
        "Prop1": 1,
        "PropBool": true,
        "Prop2": [
            1,
            2,
            3,
            4
        ],
        "Prop3": "string",
        "Prop4": [
            "a",
            "b",
            "c"
        ],
        "Prop5": {
            "a": 1,
            "b": 2,
            "c": "c",
            "d": [
                1
            ],
            "f": [
                "f",
                "f"
            ]
        },
        "MyObject": {
            "id": 12,
            "name": "你么"
        }
    }
    ```

2. 声明

    ```ts
    interface IT_ObjTypeSetting {
        /** 数字 */
        readonly Prop1?: number;
        /** 布尔值 */
        readonly PropBool?: boolean;
        /** 数字数组 */
        readonly Prop2?: number[];
        /** 字符串 */
        readonly Prop3?: string;
        /** 字符串数组 */
        readonly Prop4?: string[];
        /** json对象 */
        readonly Prop5?: any;
        readonly MyObject?: {
            /** 嵌套对象测试:主键id */
            readonly id?: number;
            /** 名字 */
            readonly name?: string;
        }
    }
    ```

## 自定义扩展

### 扩展值解析功能

```ts
interface ITableField {
        /**配置表中注释值 */
        text: string;
        /**配置表中类型值 */
        originType: string;
        /**配置表中字段名值 */
        originFieldName: string;
        /**解析后的类型值 */
        type?: string;
        /**解析后的字段名值 */
        fieldName?: string;
        /**对象的子字段名 */
        subFieldName?: string;
        /**多列对象 */
        isMutiColObj?: boolean;
}
/**值转换结果 */
interface ITransValueResult {
    /**错误信息*/
    error?: string;
    /**转换后的值*/
    value?: any;
}
/**值转换方法 */
type ValueTransFunc = (fieldItem: ITableField, cellValue: any) => ITransValueResult;
/**
 * 值转换方法字典
 * key是类型key
 * value是方法
 */
type ValueTransFuncMap = { [key: string]: ValueTransFunc };

```

具体可见`__test__/convert_customValueTrans_test.js`

```js
const tableFileDir = path.join(process.cwd(), "__test__/test-excel-files");
/**
 * @type {IOutputConfig}
 */
const outputConfig = {
    /**自定义 配置字段类型和ts声明类型字符串映射字典 */
    customTypeStrMap: { "nums": "number[]" }
}
/**
 * @type {ITableParserConfig}
 */
const parserConfig = {
    customValueTransFuncMap: {
        'nums': function (field, cellValue) {
            /**
             * @type {ITransValueResult}
             */
            const transResult = {};
            if (cellValue && typeof cellValue === "string") {
                cellValue = (cellValue + "").replace(/，/g, ","); //为了防止策划误填，先进行转换
                /**
                 * @type {string[]}
                 */
                const numStrs = cellValue.split(",");
                const nums = numStrs.map((value) => { return Number(value) })
                transResult.value = nums;
            } else {
                transResult.error = `类型:nums,所配配置的值无法解析:${cellValue}`;
                transResult.value = cellValue;
            }
            return transResult;
        }
    }
}
/**
 * @type {ITableConvertConfig}
 */
const config = {
    projRoot: "./__test__",
    tableFileDir: tableFileDir,
    useCache: false,
    parserConfig:parserConfig
    outputConfig: outputConfig;
}
module.exports = config;

```

例子:
配置
| 自定义类型,解析为number数组 	|
|-----------------------------	|
| nums                        	|
| field_custom_type           	|
|                             	|
| 1,2,3,4                     	|
解析结果

## 自定义整个转换流程

可以只实现某个hook，其他没实现的则调用默认hook的逻辑

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
     * 配置表解析
     * @param context
     * @param cb
     */
    onParse?(context: IConvertContext, cb: VoidFunction): void;
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
    onConvertEnd?(context: IConvertContext): void;
}
```








