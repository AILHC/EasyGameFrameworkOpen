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
interface ViewKeyMap {
    /**dasfas */
    typeTest: "typeTest";
    typeTest2: "typeTest2";
}
interface ViewShowDataTypeMap {
    /**dasfas */
    typeTest: number;
    typeTest2: { a: number; b: number };
}
interface ViewInitDataTypeMap {
    /**dasfas */
    typeTest: Date;
    typeTest2: { m: number; n: number };
}
interface ViewUpdateDataTypeMap {
    /**dasfas */
    typeTest: string;
    typeTest2: { c: number; d: number };
}
const viewMgr: akView.IMgr<ViewKeyMap, ViewInitDataTypeMap, ViewShowDataTypeMap, ViewUpdateDataTypeMap> = new ViewMgr<
    ViewKeyMap,
    ViewInitDataTypeMap,
    ViewShowDataTypeMap,
    ViewUpdateDataTypeMap
>();
viewMgr.show("typeTest2", ""); //提示类型错误

viewMgr.show({ key: "typeTest", onInitData: new Date() });
//获取viewMgr中指定View的ShowConfig类型信息，类型错误会报错
const config: GetShowConfigType<typeof viewMgr, "typeTest"> = { key: "typeTest", onInitData: "" };

viewMgr.show(config);
let id = "typeTest_$_1";
//会做合并类型检查
viewMgr.show(id, "");
//如果不想检查
viewMgr.show<any>(id, "");
//精确检查,第二个参数应该是number
viewMgr.show<GetViewKeyType<ViewKeyMap, "typeTest">>(id, "", new Date());

//参数应该是string
viewMgr.update("typeTest", 1);

//会做合并类型检查
viewMgr.update(id, 1);
//如果不想检查
viewMgr.update<any>(id, 1);
//精确检查,第二个参数应该是string
viewMgr.update<GetViewKeyType<ViewKeyMap, "typeTest">>(id, 1);

//可以获得类型提示,对于字符串变量也不会报错
viewMgr.isPreloadResLoading();
viewMgr.isPreloadResLoaded("");
viewMgr.hide("typeTest", {});
viewMgr.destroy("typeTest");
viewMgr.isInited("typeTes");
viewMgr.isShowed("typeTest2");
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
