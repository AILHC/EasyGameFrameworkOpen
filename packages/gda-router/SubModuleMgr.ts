export abstract class SubModuleMgr<T extends ISubModuleState = ISubModuleState> implements ISubModuleMgr<T> {
    private _moduleMap: { [key: string]: ISubModule<T> } = {};
    regist<K extends ISubModuleProvider = ISubModuleProvider>(subModule: ISubModule<T>, provider?: K): void {
        if (this._moduleMap[subModule.id]) {
            console.error(`模块已存在不要重复注册:${subModule.id}`);
            return;
        }
        this._moduleMap[subModule.id] = subModule;
        const onStateUpdate = () => {
            this.onSubModuleStateChange(this._getModuleState(subModule));
        };
        if (!provider) provider = {} as any;
        provider.onStateUpdate = onStateUpdate;
        subModule._provider = provider;
        subModule.onRegist();
    }
    remove(id: string): void {
        const subModule = this._moduleMap[id];
        if (subModule) {
            delete this._moduleMap[id];
            subModule.onRemove();
            subModule._provider = undefined;
        }
    }
    showSubModule<P = any>(id?: string, param?: P): void {
        if ((typeof id === "number" && !isNaN(id)) || (typeof id === "string" && id !== "")) {
            const subModule = this._moduleMap[id];
            if (subModule) {
                subModule.onShow(param);
            } else {
                console.warn(`模块不存在`);
            }
        } else {
            const moduleStates = this.getSubModuleStates();

            for (let i = 0; i < moduleStates.length; i++) {
                if (moduleStates[i].active) {
                    this._moduleMap[moduleStates[i].id].onShow(param);
                    break;
                }
            }
        }
    }
    hideSubModule(id: string): void {
        const subModule = this._moduleMap[id];
        if (subModule) {
            subModule.onHide();
        }
    }
    getSubModuleStates(): T[] {
        const moduleMap = this._moduleMap;
        const moduleStates: T[] = [];
        let moduleState: T;
        let subModule: ISubModule;
        for (let key in moduleMap) {
            subModule = moduleMap[key];
            moduleState = this._getModuleState(subModule);
            moduleStates.push(moduleState);
        }
        moduleStates.sort((a, b) => {
            if (a.priority < b.priority) {
                return 1;
            } else if (a.priority === b.priority) {
                return 0;
            } else {
                return -1;
            }
        });
        return moduleStates;
    }
    public getSubModuleState(id: SubModuleIDType): T {
        return this._getModuleState(this._moduleMap[id]);
    }
    private _getModuleState(subModule: ISubModule) {
        return Object.assign(
            {
                id: subModule.id,
                active: subModule.active,
                lock: subModule.lock
            } as T,
            subModule.getState()
        );
    }
    abstract onSubModuleStateChange(state: T): void;
}
