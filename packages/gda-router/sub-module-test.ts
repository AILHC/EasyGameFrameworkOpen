import { SubModule } from "../com/sl/framework/sub-module/SubModule";
import { SubModuleMgr } from "../com/sl/framework/sub-module/SubModuleMgr";
interface ITestSubModuleState extends ISubModuleState {
    name: string;
    icon: string;
}
export class SubModuleTest extends SubModuleMgr<ITestSubModuleState> {
    constructor() {
        super();
        this.regist(new TestSubModuleA());
        this.regist(new TestSubModuleB());
        this.regist(new TestSubModuleC());
        console.log(this.getSubModuleStates());
    }
    onSubModuleStateChange(state: ITestSubModuleState): void {
        console.log(`模块状态更新:${state.id}`, state);
    }
}
class TestSubModuleA extends SubModule<ITestSubModuleState> {
    id: string = "testSubA";
    onRegist(): void {
        console.log(`注册测试模块A`);
        Laya.timer.once(3000, this, () => {
            this.lock = true;
            this.active = true;
            this._provider.onStateUpdate();
        });
    }
    onRemove(): void {
        console.log(`移除测试模块A`);
    }
    onShow(param?: any): void {
        console.log(`显示测试模块A的页面`);
        Laya.timer.once(3000, this, () => {
            this.active = false;
            this._provider.onStateUpdate();
        });
    }
    onHide(): void {
        console.log(`关闭测试模块A的页面`);
    }
    getState(): ITestSubModuleState {
        return {
            priority: 1,
            name: "测试模块A",
            icon: "test_module_a.png"
        };
    }
}
class TestSubModuleB extends SubModule<ITestSubModuleState> {
    id: string = "testSubB";
    onRegist(): void {
        console.log(`注册测试模块B`);
        Laya.timer.once(4000, this, () => {
            this.lock = true;
            this.active = true;
            this._provider.onStateUpdate();
        });
    }
    onRemove(): void {
        console.log(`移除测试模块B`);
    }
    onShow(param?: any): void {
        console.log(`显示测试模块B的页面`);
        Laya.timer.once(2000, this, () => {
            this.active = false;
        });
    }
    onHide(): void {
        console.log(`关闭测试模块B的页面`);
    }
    getState(): ITestSubModuleState {
        return {
            priority: 3,
            name: "测试模块B",
            icon: "test_module_b.png"
        };
    }
}
class TestSubModuleC extends SubModule<ITestSubModuleState> {
    id: string = "testSubC";

    onRegist(): void {
        console.log(`注册测试模块C`);
        Laya.timer.once(1000, this, () => {
            this.lock = true;
            this.active = true;
            this._provider.onStateUpdate();
        });
    }
    onRemove(): void {
        console.log(`移除测试模块C`);
    }
    onShow(param?: any): void {
        console.log(`显示测试模块C的页面,参数:`, param);
        Laya.timer.once(1000, this, () => {
            this.active = false;
            this._provider.onStateUpdate();
        });
    }
    onHide(): void {
        console.log(`关闭测试模块C的页面`);
    }
    getState(): ITestSubModuleState {
        return {
            priority: 0,
            name: "测试模块C",
            icon: "test_module_c.png"
        };
    }
}

// type VuexOptions<M, N> = {
//     namespace?: N,
//     mutations: M,
//  }

//  type Action<M, N> = N extends string ? `${N}/${keyof M & string}` : keyof M

//  type Store<M, N> = {
//     dispatch(action: Action<M, N>): void
//  }

//  declare function Vuex<M, N>(options: VuexOptions<M, N>): Store<M, N>

//  const store = Vuex({
//     namespace: "cart" as const,
//     mutations: {
//        add() { },
//        remove() { }
//     }
//  })
//  interface Options {
//     width?: number;
//     height?: number;
// }

// let a: Options = {
//     width: 100,
//     height: 100,
//     "data-blah": true, // Error! 'data-blah' wasn't declared in 'Options'.
// };

// interface OptionsWithDataProps extends Options {
//     // Permit any property starting with 'data-'.
//     [optName: `data-${string}`]: unknown;
// }

// let b: OptionsWithDataProps = {
//     width: 100,
//     height: 100,
//     "data-blah": true,       // Works!

//     "unknown-property": true,  // Error! 'unknown-property' wasn't declared in 'OptionsWithDataProps'.
// };

// type RequireIT_TableMap = Required<IT_TableMap>;
// const table:RequireIT_TableMap = {} as any;
// table.BlockLanguageSetting[1].id
