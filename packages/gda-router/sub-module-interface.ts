declare global {
    type SubModuleIDType = string | number;
    /**
     * 子模块注册参数,可继承扩展
     */
    interface ISubModuleProvider {
        /**
         * 子模块更新回调,
         * 自动生成赋值
         */
        onStateUpdate?: VoidFunction;
    }
    type OnSubModuleStateUpdateFunc<T> = (state: T) => void;
    /**
     * 子模块状态,可继承扩展
     */
    interface ISubModuleState {
        /**
         * 子系统id，自动赋值
         *  */
        id?: SubModuleIDType;
        /**
         * 优先级，用于排序
         *  */
        priority: number;
        /**
         * 是否锁住(自动赋值)
         *  */
        lock?: boolean;
        /**
         * 是否激活（自动赋值）
         *  */
        active?: boolean;
    }
    /**
     * 子模块接口
     */
    interface ISubModule<T extends ISubModuleState = ISubModuleState> {
        /**只读 */
        id: SubModuleIDType;
        /**
         * 是否锁住
         */
        lock: boolean;
        /**
         * 活跃
         * 用于红点
         *  */
        active: boolean;
        /**
         * 提供给SubModule的接口,onRegist时Mgr自动赋值,onRemove移除时Mgr自动置空
         */
        _provider: ISubModuleProvider;
        /**
         * 注册
         */
        onRegist(): void;
        /**
         * 移除
         */
        onRemove(): void;
        /**
         * 打开
         */
        onShow(param?: any): void;
        /**
         * 关闭
         */
        onHide(): void;
        /**
         * 获取入口状态数据(按钮，标签按钮状态)
         */
        getState(): T;
    }
    /**
     * 子模块管理器
     */
    interface ISubModuleMgr<T extends ISubModuleState = ISubModuleState> {
        /**
         * 注册子模块
         * @param subModule
         */
        regist<K extends ISubModuleProvider = ISubModuleProvider>(subModule: ISubModule, provider?: K): void;
        /**
         * 移除指定子模块
         * @param subModule
         */
        remove(id: SubModuleIDType): void;
        /**
         * 显示指定子模块
         * @param id 默认显示活跃的子模块
         * @param param 显示参数 可选
         */
        showSubModule<P = any>(id?: SubModuleIDType, param?: P): void;
        /**
         * 隐藏指定子模块
         * @param id
         */
        hideSubModule(id: SubModuleIDType): void;
        /**
         * 获取所有子系统状态，用于对应子模块的入口UI状态展示
         */
        getSubModuleStates(): T[];
        /**
         * 获取指定子系统状态
         * @param id
         */
        getSubModuleState(id: SubModuleIDType): T;
        /**
         * 当子模块状态变化回调
         * @param subModuleId
         * @param active
         */
        onSubModuleStateChange(state: T): void;
    }
}
export {};
