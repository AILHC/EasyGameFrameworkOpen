import { ViewMgr } from "../../src";
interface CtrlKeyTypeMapType {
    typeTest: "typeTest";
    typeTest2: "typeTest2";
}
interface InitDataTypeMapType {
    typeTest: {
        a: number;
        b: number;
    };
    typeTest2: {
        fjfj: string;
    };
}
interface ShowDataTypeMapType {
    typeTest: {
        a: number;
        b: number;
    };
    typeTest2: {
        fjfj: string;
    };
}
type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never }[keyof T] & string;
// let params:
type MethodParameters<T extends Partial<any>, M extends FunctionPropertyNames<T>> = Parameters<T[M]>;

interface IShowConfig2<InitDataTypeMapType = any, ShowDataTypeMapType = any, TypeKey extends keyof any = any> {
    typeKey: TypeKey;
    /**
     * 透传初始化数据
     */
    onInitData?: InitDataTypeMapType[ToAnyIndexKey<TypeKey, InitDataTypeMapType>];
    /**
     * 强制重新加载
     */
    forceLoad?: boolean;
    /**
     * 显示数据
     */
    onShowData?: ShowDataTypeMapType[ToAnyIndexKey<TypeKey, ShowDataTypeMapType>];
    /**调用就执行 */
    showedCb?: void;
    /**显示被取消了 */
    onCancel?: VoidFunction;
}
/**
 * 将索引类型转换为任意类型的索引类型
 */
type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;

interface ITestMgr<
    CtrlKeyMapType = any,
    InitDataTypeMapType = any,
    ShowDataTypeMapType = any,
    UpdateDataTypeMapType = any
> {
    /**
     * 显示单例显示控制器
     * @param typeKey
     * @param key
     * @param lifeCircleData
     */
    showDpc<T = any, keyType extends keyof CtrlKeyMapType = any>(
        showConfig: IShowConfig2<InitDataTypeMapType, ShowDataTypeMapType, keyType>
    ): T;
    // showDpc<T extends ICtrl, keyType extends keyof CtrlKeyMapType = any>(key: keyType, showConfig: IShowConfig2<InitDataTypeMapType, ShowDataTypeMapType, keyType>,): T;
    /**
     * 更新控制器
     * @param key
     * @param updateData
     */
    updateDpc(key: string, updateData?: any): void;
    /**
     * 隐藏单例控制器
     * @param key
     */
    hideDpc(key: string): void;
    /**
     * 销毁单例控制器
     * @param key
     * @param destroyRes 销毁资源
     * @param destroyIns 销毁实例
     */
    destroyDpc(key: string, destroyRes?: boolean, destroyIns?: boolean): void;
}
const mgr: ITestMgr<CtrlKeyTypeMapType, InitDataTypeMapType, ShowDataTypeMapType> = new ViewMgr() as any;
mgr.showDpc({
    typeKey: "typeTest",
    onInitData: { a: 1, b: 1 },
    onShowData: { a: 1, b: 1 }
});
const myMgr: akView.IMgr<CtrlKeyTypeMapType, InitDataTypeMapType, ShowDataTypeMapType> = {} as any;

myMgr.showDpc("typeTest2");

type Whitespace = " " | "\n" | "\r" | "\t";

type TrimStart<S extends string, P extends string = Whitespace> = S extends `${P}${infer R}` ? TrimStart<R, P> : S;

type String1 = "\t  \r  \n   value";
type Trimmed1 = TrimStart<String1>;

type String2 = "---value";
type Trimmed2 = TrimStart<String2, "-">;
function a(a: Trimmed1) {}
a("value");
