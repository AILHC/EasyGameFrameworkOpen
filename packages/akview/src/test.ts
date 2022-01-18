// import { CreateTypes } from './create-types';
import { ViewMgr } from "./view-mgr";

// class testCtrlClass implements displayCtrl.ICtrl {
//     key?: any;
//     isLoading?: boolean;
//     isLoaded?: boolean;
//     isInited?: boolean;
//     isShowed?: boolean;
//     isShowEnd?: boolean;
//     needShow?: boolean;
//     needLoad?: boolean;
//     onLoadData?: any;
//     getRess?(): any[] | string[] {
//         throw new Error("Method not implemented.");
//     }
//     onInit(config?: displayCtrl.IInitConfig<any, any>): void {
//         throw new Error("Method not implemented.");
//     }
//     onShow(config?: displayCtrl.IShowConfig<any, any, any>): void {
//         throw new Error("Method not implemented.");
//     }
//     onUpdate(updateData: any): void {
//         throw new Error("Method not implemented.");
//     }
//     getFace<T>(): displayCtrl.ReturnCtrlType<T> {
//         throw new Error("Method not implemented.");
//     }
//     onHide(): void {
//         throw new Error("Method not implemented.");
//     }
//     onDestroy(destroyRes?: boolean): void {
//         throw new Error("Method not implemented.");
//     }
//     getNode() {
//         throw new Error("Method not implemented.");
//     }
// }
// type Tt = typeof testCtrlClass;
// const ctrl: displayCtrl.ICtrlTemplate<testCtrlClass> = {
//     key: "test",
//     class: testCtrlClass,
//     create(pa) {
//         return new testCtrlClass();
//     }
// };

// const mgr: displayCtrl.IMgr<CtrlKeyTypeMapType> = {} as any;
// mgr.loadDpc("typeTest", {
//     onLoadData
// });
// mgr.insDpc<any>("");
// mgr.initDpcByIns(
//     {},
//     {
//         typeKey: "typeTest"
//     }
// );

// const task: displayCtrl.ILoadTask = {
//     get isCancel() {
//         return task._isCancel;
//     },
//     _isCancel: false
//     cancel() {
//         task["isCancel"] = true;
//     },

// }

interface IModules {
    hero: {
        BagView;
        GroupView;
    };

    login: {
        LoginView;
        Tips;
    };
    player: {
        InfoView;
    };
}

interface IViewKeys {
    BagView;
    GroupView;
}
type ModuleViewKey<
    ModuleKeys,
    ModuleKey extends string & keyof ModuleKeys = any,
    ViewKey extends string & keyof ModuleKeys[ModuleKey] = string & keyof ModuleKeys[ModuleKey]
> = `${ModuleKey}.${ViewKey}`;
interface tstKeys<Modules, ViewKey> {
    h: `${ModuleKey}.${ViewKey}`;
    hero_HeroGrowUpView: "hero.HeroShowView";
    login_LoginView: "login.LoginView";
}
type tstKeyType = tstKeys[keyof tstKeys];

let key2: tstKeyType = "hero.HeroShowView";
let key3: tstKeyType = "login.LoginView";
let key4: keyof tstKeys = "hero.HeroShowView";
interface ITestMgr<ModuleKeys> {
    show<ModuleKey extends keyof ModuleKeys, ViewKey extends keyof ModuleKeys[ModuleKey]>(
        key: `${ModuleKey}.${ViewKey}`
    ): void;
}
const mgr: ITestMgr<IModules> = {} as any;
mgr.show("");
let mvkey: ModuleViewKey<IModules> = "";
type AddDotPrefix<Keys, Prefix = ""> = `${Prefix & string}${Prefix extends "" ? "" : "."}${Keys & string}`;
type GetViewKeysTypes<Module, ModuleName = ""> = {
    [ViewKey in keyof Module as AddDotPrefix<ViewKey, ModuleName>]: AddDotPrefix<ViewKey, ModuleName>;
};

type GetModulesViewKeyTypes<Modules> = {
    [K in keyof Modules]: GetViewKeysTypes<Modules[K], K>;
}[keyof Modules];
type ModulesViewsKeyTypesMap = UnionToIntersection<GetModulesViewKeyTypes<IModules>>;
type ModulesViewsKeyTypes = keyof ModulesViewsKeyTypesMap;

type ViewShowDataTypeKeyMap = { [key in ModulesViewsKeyTypes]: any };
type TestDataType1 = { "hero.BagView": { a: number; c: number; name: string } };
interface ViewShowDataType extends TestDataType1 {}
type TestDataType2 = { "login.LoginView": { loginCount: number } };

interface ViewShowDataType extends TestDataType2 {}
type AddViewShowData<Key extends string, T> = { [key in any as Key]: T };
type TestDataType3 = AddViewShowData<ModulesViewsKeyTypesMap["login.Tips"], { tipsContent: string }>;

interface ViewShowDataType extends TestDataType3 {}

interface ITestViewMgr<KeyTypes, ViewShowDataMap> {
    show<KeyType extends KeyTypes>(key: KeyType, data: ViewShowDataMap[ToAnyIndexKey<KeyType, ViewShowDataMap>]): void;
}
const viewMgr2: ITestViewMgr<ModulesViewsKeyTypes, ViewShowDataType> = {} as any;
viewMgr2.show("login.Tips");
const viewMgr3: akView.IMgr<ViewInitDataTypeMap, ViewShowDataType, {}, ModulesViewsKeyTypesMap> = {} as any;
viewMgr3.show("login.Tips");

let mvkey2: ModulesViewsKeyTypes = "hero.BagView";

type GetRestFuncType<T> = T extends (context: any, ...params: infer P) => infer R ? (...args: P) => R : never;

type AddPrefix<Keys, Prefix = ""> = `${Prefix & string}${Prefix extends "" ? "" : "/"}${Keys & string}`;

type GetMutationsTypes<Module, ModuleName = ""> = Module extends { mutations: infer M }
    ? {
          [MutationKey in keyof M as AddPrefix<MutationKey, ModuleName>]: GetRestFuncType<M[MutationKey]>;
      }
    : never;

type GetActionsTypes<Module, ModuleName = ""> = Module extends { actions: infer M }
    ? {
          [ActionKey in keyof M as AddPrefix<ActionKey, ModuleName>]: GetRestFuncType<M[ActionKey]>;
      }
    : never;

type GetModulesMutationTypes<Modules> = {
    [K in keyof Modules]: GetMutationsTypes<Modules[K], K>;
}[keyof Modules];

type GetModulesActionTypes<Modules> = {
    [K in keyof Modules]: GetActionsTypes<Modules[K], K>;
}[keyof Modules];

type GetSubModuleMutationsTypes<Module> = Module extends { modules: infer SubModules }
    ? GetModulesMutationTypes<SubModules>
    : never;

type GetSubModuleActionsTypes<Module> = Module extends { modules: infer SubModules }
    ? GetModulesActionTypes<SubModules>
    : never;

type UnionToIntersection<T> = (T extends any ? (k: T) => void : never) extends (k: infer I) => void ? I : never;

type GetMutationsType<R> = UnionToIntersection<GetSubModuleMutationsTypes<R> | GetMutationsTypes<R>>;

type GetActionsType<R> = UnionToIntersection<GetSubModuleActionsTypes<R> | GetActionsTypes<R>>;

type GetParam<T> = T extends () => any ? undefined : T extends (arg: infer R) => any ? R : any;

type ReturnType<T> = T extends (...args: any) => infer R ? R : any;

// type GetPayLoad<T, K extends keyof T> = GetParam<GetTypeOfKey<T, K>>;

// type GetReturnType<T, K extends keyof T> = ReturnType<GetTypeOfKey<T, K>>;

const vuexOptions = {
    state: {},
    getters: {},
    actions: {
        async rootAction(actionsContext: ActionContext<{}, {}>, payload: string) {}
    },
    mutations: {
        rootMutation(state: {}, context: number) {}
    },
    modules: {
        home: {
            actions: {
                async homeAction(actionsContext: ActionContext<{}, {}>, homeContext: string) {}
            },
            mutations: {
                homeMutation(state: {}, homeContext: number) {}
            }
        },
        detail: {
            actions: {
                async detailAction(actionsContext: ActionContext<{}, {}>, detailContext: string) {}
            },
            mutations: {
                detailMutation(state: {}, detailContext: number) {}
            }
        }
    },
    plugins: process.env.NODE_ENV === "development" ? [createLogger()] : []
};

type Mutations = GetMutationsType<typeof vuexOptions>;

type Actions = GetActionsType<typeof vuexOptions>;

declare module vuex {
    export interface Commit {
        <T extends keyof Mutations>(
            type: T,
            payload?: GetPayLoad<Mutations, T>,
            options?: CommitOptions
        ): GetReturnType<Mutations, T>;
    }
    export interface Dispatch {
        <T extends keyof Actions>(type: T, payload?: GetPayLoad<Actions, T>, options?: DispatchOptions): Promise<
            GetReturnType<Actions, T>
        >;
    }
}
interface ITestVueT {
    show<T extends keyof Actions>(type: T);
}
const vueT: ITestVueT = {} as any;
vueT.show("detail");
interface TestViewKeyType3 {
    testViewKey1: "testViewKey1";
    testViewKey2: string;
}

type AddViewDataType<
    ViewKeyType,
    Key extends keyof ViewKeyType,
    T extends { showData?; initData?; updateData?; hideOption? }
> = { [key in any as Key]: T };
type ToViewDataType<T extends { showData?; initData?; updateData?; hideOption? }> = T;
type TestKey1DataType = AddViewDataType<
    TestViewKeyType3,
    "testViewKey1",
    { showData: { a: number; b: boolean }; initData: { c: string } }
>;

/**
 * ssss
 */
interface TestKeyDataTypeMapType {
    testViewKey2: ToViewDataType<{ showData: { ddd: "ddd" } }>;
}
interface TestKeyDataTypeMapType
    extends AddViewDataType<
        TestViewKeyType3,
        "testViewKey1",
        { showData: { a: number; b: boolean }; initData: { c: string } }
    > {}

/**
 * dfsafda
 */
interface ITestViewMgr3<ViewKeyType, KeyDataTypeMapType, keyType extends keyof ViewKeyType = keyof ViewKeyType> {
    show<KeyOrIdType extends keyType>(
        idOrkeyOrConfig: KeyOrIdType,
        onShowData?: KeyDataTypeMapType[ToAnyIndexKey<KeyOrIdType, KeyDataTypeMapType>] extends {
            showData: infer ShowDataType;
        }
            ? ShowDataType
            : any,
        onInitData?: KeyDataTypeMapType[ToAnyIndexKey<KeyOrIdType, KeyDataTypeMapType>] extends {
            initData: infer InitDataType;
        }
            ? InitDataType
            : any
    ): string;
}
var testViewMgr3: ITestViewMgr3<TestViewKeyType3, TestKeyDataTypeMapType>;
testViewMgr3.show("testViewKey2");

type GetPluginOptionType<Plugin> = Plugin extends { onUse(...args: infer P): void } ? P[0] : any;
interface TestPluginUseType {
    use<Plugin extends akView.IPlugin>(plugin: Plugin, option: GetPluginOptionType<Plugin>);
}
const pluginUse: TestPluginUseType = {} as any;
interface ITestPlugin extends akView.IPlugin {
    onUse(option: { ab: number }): void;
}
pluginUse.use({} as ITestPlugin, { ab: 1 });

// type GetKeyType<idType> = idType extends `${infer KeyType}_$_${number}` ? KeyType : string;

// function showById<idType extends string>(id:idType,keyType:)
