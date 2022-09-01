interface test<ViewKeyTypes, ViewDataTypes, keyType extends keyof ViewKeyTypes = keyof ViewKeyTypes> {
    show<TKeyType extends keyType>(key: TKeyType): outIdType<TKeyType>;
    hide<KeyOrIdType extends keyType | String>(
        keyOrViewAgent: KeyOrIdType,
        hideCfg?: akView.IHideConfig<KeyOrIdType, ViewDataTypes>
    ): void;
}
type GetKeyType<InputType> = InputType extends `${infer L}${"_$_"}` ? L : InputType;
type outIdType<InType> = `${InType extends string | number ? InType : string}_$_${number}`;
interface keys {
    a: "a";
    b: "b";
}
interface dataTypes {
    a: { hideOption: { dsd: number } };
    b: { hideOption: { dsds: number } };
}
var t: test<keys, dataTypes>;
class bb {
    private _aid: outIdType<"a">;
    constructor() {
        this._aid = t.show("a");
        t.hide(this._aid, { hideOption: { dsd } });
    }
}
let aid = t.show("a");
t.hide("a_$_", { hideOption: { dsd } });

//对于子UI的需求
// 仔细想了一下，这个需求并不是很重要
// 为什么需要子UI控制逻辑？
// 拆分UI逻辑
