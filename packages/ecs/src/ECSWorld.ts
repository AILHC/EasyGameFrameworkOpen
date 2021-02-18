import {
    IEntityChangeEvent,
    ICompChangeEvent,
    ISystemClass,
    ISystem,
    IProcesser,
    getBaseComp,
    NODE,
    INode
} from "./ECSCore";
import ECSUtil from "./ECSUtil";
import { DefaultProcesser } from "./DefaultProcesser";

type lastType = Array<any>;
type kindType = string;
type SystemMap = { [key: string]: ISystem };
export class ECSWorld {
    private entities: { [key: number]: IEntity } = {};
    private kinds: { [key: string]: Array<IEntity> } = {};
    private compKindMap: { [key: string]: Array<string> } = {};
    private syss: { [key: string]: ISystem } = {};
    private _processer: IProcesser;
    private _root: any;
    public get worldRoot() {
        return this._root;
    }
    public set worldRoot(worldRoot: any) {
        this._root = worldRoot;
    }
    public get processer(): any {
        return this._processer;
    }
    private onlyId = 0;
    isStarted: any;
    private getEntityId(): number {
        this.onlyId++;
        return this.onlyId;
    }
    public get systemMap(): SystemMap {
        return this.syss;
    }
    public getAllEntities(): { [key: number]: IEntity } {
        return this.entities;
    }

    /**
     * 当组件被激活时派发事件。
     */
    public static readonly onCompEnabled: signals.Signal<[IEntity, IComponent, lastType]> = new signals.Signal();
    public static readonly onCompAdded: signals.Signal<[IEntity, IComponent, lastType]> = new signals.Signal();
    public static readonly onCompRemoved: signals.Signal<[IEntity, IComponent, lastType]> = new signals.Signal();
    /**
     * 当组件被禁用时派发事件。
     */
    public static readonly onCompDisabled: signals.Signal<[IEntity, IComponent, lastType]> = new signals.Signal();
    /**
     * 当组件被销毁时派发事件。
     */
    public static readonly onCompDestroy: signals.Signal<[IEntity, IComponent, lastType]> = new signals.Signal();
    public static readonly onCompChange: signals.Signal<ICompChangeEvent> = new signals.Signal();
    /**
     * 当实体添加到场景时派发事件。
     */
    public static readonly onEntityAdded: signals.Signal<IEntity> = new signals.Signal();
    /**
     * 当实体添加到类型分组中
     */
    public static readonly onEntityAddToKind: signals.Signal<[IEntity, kindType]> = new signals.Signal();
    /**
     * 当实体从类型分组中移除
     */
    public static readonly onEntityRemoveFromKind: signals.Signal<[IEntity, kindType]> = new signals.Signal();
    /**
     * 当实体发生改变时。
     */
    public static readonly onEntityChange: signals.Signal<IEntityChangeEvent> = new signals.Signal();
    /**
     * 当实体被销毁时派发事件。
     */
    public static readonly onEntityDestroy: signals.Signal<[IEntity, lastType]> = new signals.Signal();
    /**
     * 逻辑帧更新事件
     */
    public static readonly onTickUpdate: signals.Signal<number> = new signals.Signal();
    /**
     * 渲染帧更新事件
     */
    public static readonly onFrameUpdate: signals.Signal<number> = new signals.Signal();
    constructor() {}
    /**
     * 初始化ECS，
     * @param processer 帧循环处理器
     */
    public initWorld(processer?: IProcesser) {
        if (processer) {
            this._processer = processer;
        } else {
            this._processer = new DefaultProcesser();
        }
        this._processer.init(this);
    }
    //·······································实体管理···································//
    /**
     * 获取实体个数
     */
    public getEntityCount(): number {
        return Object.keys(this.entities).length;
    }
    /**
     * 创建空白实体
     */
    public createEmptyEntity(): IEntity {
        return { id: this.getEntityId(), type: [] };
    }

    /**
     * 判断 组件在指定实体中是否激活
     * @param entityId
     * @param compType
     */
    public isEnableComp(entity: IEntity, compType: number) {
        const comp: IComponent = entity[compType];
        if (comp) {
            return comp.enabled;
        } else {
            return false;
        }
    }
    /**
     * 获取实体
     * @param entityId
     */
    public getEntityById(entityId: number): IEntity {
        return this.entities[entityId];
    }
    /**
     * 添加实体到世界
     * @param comps 组件数组
     */
    public addEntityToWorld(comps: Array<IComponent>): IEntity {
        let entity: IEntity = this.createEmptyEntity();
        const world = this;
        if (comps && comps.length > 0) {
            let comp: IComponent;
            for (let i = 0; i < comps.length; i++) {
                comp = comps[i];
                if (!comp) {
                    ELog.w(`comp is null`, comps);
                    continue;
                }
                if (!comp.type) {
                    ELog.e(`comp type is null`, comp);
                }
                this.addComp(entity, comp);
            }
        } else {
            ELog.w("组件数组为空或者个数为0");
            return;
        }

        world.entities[entity.id] = entity;
        ECSWorld.onEntityAdded.dispatch(entity);
        return entity;
    }
    /**
     * 添加实体进所属分类
     * @param entity
     */
    private addEntityToKind(entity: IEntity, addComptType: any) {
        if (!entity || entity.type.length === 0) {
            ELog.i(`entity is null`);
        }
        const kinds = this.kinds;
        const kindKeys = this.getKindKeysWithCompType(addComptType);
        let kind: Array<IEntity>;
        let kindKey: string;
        const type = entity.type;
        for (let i = 0; i < kindKeys.length; i++) {
            kindKey = kindKeys[i] + "";
            if (!ECSUtil.matchTypeV3(type, kindKey)) continue;
            kind = kinds[kindKeys[i]];
            let res = ECSUtil.addEleToArr(kind, entity);
            if (res) {
                ECSWorld.onEntityAddToKind.dispatch([entity, kindKey]);
            }
        }
        // const entityType = entity.type.toString();
        // for(const key in kinds){
        //     if(ECSUtil.matchTypeV2(entityType,key)){
        //         ECSUtil.addEleToArr(kinds[key],entity);
        //     }
        // }
    }
    /**
     * 将实体从类型分类中移除
     * @param entity 实体
     * @param removeCompType 移除的组件类型
     */
    private removeEntityFromKind(entity: IEntity, removeCompType: any) {
        if (!entity || entity.type.length === 0) {
            ELog.i(`entityOrType is null`);
        }
        const kinds = this.kinds;
        const kindKeys = this.getKindKeysWithCompType(removeCompType);
        let kind: Array<IEntity>;
        for (let i = 0; i < kindKeys.length; i++) {
            const key = kindKeys[i];
            if (!ECSUtil.matchTypeV3(entity.type, key)) {
                kind = kinds[key];
                const res = ECSUtil.removeEleFromArr(kind, entity);
                if (res) {
                    ECSWorld.onEntityRemoveFromKind.dispatch([entity, key]);
                }
            }
        }
    }
    /**
     * 将实体从所有分类中移除
     * @param entity 实体
     */
    private removeEntityFromAllKind(entity: IEntity) {
        const kinds = this.kinds;
        let key;
        let kind: Array<IEntity>;
        let res;
        for (key in kinds) {
            kind = kinds[key];
            if (!kind) continue;
            res = ECSUtil.removeEleFromArr(kind, entity);
            if (res) {
                ECSWorld.onEntityRemoveFromKind.dispatch([entity, key]);
            }
        }
    }
    /**
     * 根据组件类型数组 获取实体集合
     * @param kindType 实体类型数组的字符串  比如：1,2,3,"node";4,5;6
     */
    public getKindByType(kindType: string): Array<IEntity> {
        const kinds = this.kinds;
        let kind = kinds[kindType];
        if (!kind) kind = this.newKindV2(kindType);
        let entity: IEntity;
        let match: boolean = false;
        for (let id in this.entities) {
            entity = this.entities[id];
            match = ECSUtil.matchTypeV3(entity.type, kindType);
            if (match) {
                kind.push(entity);
            }
        }
        return kind;
    }
    /**
     * 新建实体类型数组
     * @param compTypes 实体类型数组的字符串  比如：1,2,3,"node"
     */
    private newKind(compTypes: string) {
        let compType = null;
        let types = compTypes.split(",");
        const kinds = this.kinds;
        for (let i = 0; i < types.length; i++) {
            compType = types[i];
            this.getKindKeysWithCompType(compType).push(compTypes + "");
        }
        if (!kinds[compTypes]) {
            kinds[compTypes] = [];
        }
        return kinds[compTypes];
    }
    /**
     * 新建实体类型数组(与或非)
     * @param kindType 实体类型数组的字符串  比如：1,2,3,"node";4,5;6
     */
    private newKindV2(kindType: string) {
        let compType = null;
        const [withStr, orAnyStr] = [...kindType.split(";")];
        const withTypes = withStr ? withStr.split(",") : [];
        const orAnyTypes = orAnyStr ? orAnyStr.split(",") : [];
        let types = withTypes.concat(orAnyTypes);
        const kinds = this.kinds;
        for (let i = 0; i < types.length; i++) {
            compType = types[i];
            this.getKindKeysWithCompType(compType).push(kindType + "");
        }
        if (!kinds[kindType]) {
            kinds[kindType] = [];
        }
        return kinds[kindType];
    }
    /**
     * 获取所有包含指定组件类型的实体类型数组
     * @param comptType 组件类型
     */
    private getKindKeysWithCompType(comptType: any): Array<string> {
        const compKindMap = this.compKindMap;
        if (!compKindMap[comptType]) {
            compKindMap[comptType] = [];
        }

        return compKindMap[comptType];
    }
    // private removeKind(comp)
    /**
     * 根据实体的id，和组件的类型，组件的引用，为实体添加组件
     * @param entity
     * @param comp
     */
    public addComp(entity: IEntity, comp: IComponent) {
        if (!entity) {
            ELog.i(`entity ：is null `);
            return false;
        }
        // let lastType = [].concat(entity.type);
        let res = this._addComp(entity, comp);
        if (!res) {
            ELog.w(`entity:%o  comp:%o`, entity, comp);
            return;
        }
        this.addEntityToKind(entity, comp.type);
        // ECSWorld.onCompAdded.dispatch([entity, comp, lastType as any]);
    }
    /**
     * 移除对应实体上的组件
     * @param entity
     * @param compType
     * @returns 返回移除结果
     */
    public removeComp(entity: IEntity, compType: number): boolean {
        if (!entity) {
            ELog.i(`entity is null `);
            return false;
        }
        let comp: IComponent = entity[compType];
        if (comp) {
            const type = entity.type;
            // let lastType = [].concat(type);
            const cType = compType + "";
            ECSUtil.removeEleFromArr(type, cType);
            this.removeEntityFromKind(entity, cType);
            // if (type === NODE) {
            //     comp["onDes"] && comp["onDes"]();
            // }
            entity[compType] = undefined;
            // ECSWorld.onCompRemoved.dispatch([entity, comp, lastType]);
        } else {
            ELog.w(`comp:%o not in this entity :%o`, comp, entity);
        }

        return true;
    }
    public getComp(entity: IEntity, compType: number): any {
        if (!entity) {
            ELog.i(`entity is null `);
            return null;
        }
        const comp: IComponent = entity[compType];
        if (comp && comp.enabled) {
            return comp;
        } else {
            return null;
        }
    }
    /**
     * 添加组件
     * @param entity 实体
     * @param comp 组件
     */
    private _addComp(entity: IEntity, comp: IComponent) {
        if (entity && comp && entity.type && entity.type.indexOf(comp.type + "") < 0 && !entity[comp.type]) {
            entity.type.push(comp.type + "");
            entity[comp.type] = comp;
            comp.entityId = entity.id;
            return true;
        } else {
            return false;
        }
    }
    /**
     * 休眠组件
     * @param entity 实体id
     * @param compType 组件类型 compType为空则休眠所有组件
     */
    public disableComp(entity: IEntity, compType: number) {
        if (!entity) {
            ELog.i(`entity is null `);
            return false;
        }

        let comp: IComponent = entity[compType];
        if (!comp) {
            ELog.w(`comp is not in entity`, entity, compType);
            return;
        }
        // let lastType = [].concat(entity.type);
        comp.enabled = false;
        const cType = compType + "";
        ECSUtil.removeEleFromArr(entity.type, cType);
        this.removeEntityFromKind(entity, cType);
        // ECSWorld.onCompDisabled.dispatch([entity,comp,lastType]);
        return;
    }
    /**
     * 激活组件
     * @param entity 实体id
     * @param compType 组件类型 compType为空则激活所有组件
     */
    public enableComp(entity: IEntity, compType: number) {
        if (!entity) {
            ELog.i(`entity is null`);
            return false;
        }
        let comp: IComponent = entity[compType];
        if (!comp || (comp && (comp.enabled || comp.isDesed))) {
            return;
        }
        comp.enabled = true;
        const type = entity.type;
        // let lastType = [].concat(type);
        type.push(compType + "");
        this.addEntityToKind(entity, compType);
        // ECSWorld.onCompEnabled.dispatch([entity, comp, lastType]);
    }
    /**
     * 销毁实体，实体会在下一帧实际销毁
     * @param entity
     */
    public destroyEntity(entity: IEntity) {
        if (!entity) {
            ELog.e(`entity is null `);
            return;
        }
        this.entities[entity.id] = undefined;
        this.removeEntityFromAllKind(entity);
        ECSWorld.onEntityDestroy.dispatch([entity, entity.type]);
        entity[NODE] = undefined;
        // this.invalidEntities.push(entity);
    }
    /**
     * 根据id销毁实体
     * @param id
     */
    public destroyEntityById(id: number) {
        const entity = this.entities[id];
        if (!entity) {
            ELog.e(`entity is null `);
            return;
        }
        this.removeEntityFromAllKind(entity);
        ECSWorld.onEntityDestroy.dispatch([entity, entity.type]);
        entity[NODE] = undefined;
        this.entities[id] = undefined;
    }

    /**
     * 清理无效的实体，这个会在每帧结束后执行
     */
    // private clearInvalidEntities() {
    //     const invalidEntities = this.invalidEntities;
    //     let entity: IEntity;
    //     // let lastType:Array<any>;
    //     let types: Array<any>;
    //     while (entity = invalidEntities.pop()) {
    //         // lastType = [].concat(entity.type);
    //         types = entity.type;
    //         for (let i = 0; i < types.length; i++) {
    //             const type = types[i];
    //             this.removeEntityFromKind(entity, type);
    //         }
    //         // ECSWorld.onEntityDestroy.dispatch([entity, lastType]);
    //     }
    // }

    //·······································系统管理···································//
    /**
     * 每帧更新需要更新的系统
     */
    // public updateSyss(dt) {
    //     let syss = this.syss
    //     let sys = null;
    //     for (let i = 0; i < syss.length; i++) {
    //         sys = syss[i];
    //         sys.updateSys(dt);
    //         //清理无效实体
    //         this.clearInvalidEntities();
    //     }

    //     return;
    // }
    getSys<T extends ISystem>(sysName: string): T {
        return this.syss[sysName] as any;
    }
    /**
     * 添加系统 TODO 到时参考Egret的系统注册
     * @param sys
     */
    public addSys<T extends ISystem, K extends ECSWorld>(sysClass: ISystemClass<T, K>, ...registArgs): T {
        if (!sysClass) {
            ELog.w(`sysClass is null`);
            return;
        }
        let sys = new sysClass(this as any);
        sys.onRegister(...registArgs);
        this.syss[sysClass._name] = sys;
        this.enableSys(sysClass);
        return sys;
    }
    public disableSys<T extends ISystem, K extends ECSWorld>(sysClass: ISystemClass<T, K>) {
        if (!sysClass) {
            ELog.w(`sysClass is null`);
            return;
        }

        const sys = this.syss[sysClass._name];
        sys.onDisable();
        sys.enable = false;
    }
    public enableSys<T extends ISystem, K extends ECSWorld>(sysClass: ISystemClass<T, K>) {
        if (!sysClass) {
            ELog.w(`sysClass is null`);
            return;
        }
        const sys = this.syss[sysClass._name];
        sys.enable = true;
        sys.onEnable();
    }
    /**
     * 移除系统
     * @param systemName
     */
    public destroySys(systemName: string): boolean {
        if (!systemName) {
            ELog.w(`system is null`);
            return false;
        }
        let sys = this.syss[systemName];
        if (sys) {
            sys.onDes();
            this.syss[systemName] = null;
            return true;
        }
        return false;
    }
    /**
     * 销毁所有系统
     */
    public destroyAllSys() {
        // this._systems.clear();
        const syss = this.syss;
        for (const key in syss) {
            this.destroySys(key);
        }
        return;
    }
    public startWorld() {
        if (this.isStarted) return;
        this.isStarted = true;
        const syss = this.syss;
        for (const key in syss) {
            syss[key].onStart && syss[key].onStart();
        }
    }
    public startUpdate() {
        this._processer.onStart();
    }
    // /**
    //  * 开始更新，使用setInterval的方式
    //  * @param frameRate 默认FPS=60  ，在物体多的情况下 帧数低>=30性能会更好一点
    //  */
    // public startUpdate(frameRate: number = 60) {
    //     if (this._isRunning) return;
    //     this._isRunning = true;
    //     let lastTime = performance.now();
    //     let now = 0;
    //     const updateSyss = this.updateSyss.bind(this);
    //     let frameTime = 1000 / frameRate;
    //     let dt: number;
    //     this.updateHandle = setInterval(() => {
    //         now = performance.now();
    //         dt = (now - lastTime) / 1000 * this._timeScale;
    //         lastTime = now;
    //         updateSyss(dt);
    //     }, frameTime);
    //     return;
    // }

    // /**
    //  * 暂停更新
    //  */
    // public pauseUpdate() {
    //     clearInterval(this.updateHandle);
    //     this._isRunning = false;
    // }
    /**
     * 停止
     */
    public stop() {
        this.destroyAllEntities();
        this.entities = {};
        this._processer.onStop();
        this.destroyAllSys();
        this._removeAllListener();
    }
    private destroyAllEntities() {
        for (let key in this.entities) {
            let entity = this.entities[key];
            this.destroyEntity(entity);
        }
    }
    private _removeAllListener() {
        //实体事件
        ECSWorld.onEntityChange.removeAll();
        ECSWorld.onEntityDestroy.removeAll();
        ECSWorld.onEntityAdded.removeAll();
        //组件事件
        ECSWorld.onCompChange.removeAll();
        ECSWorld.onCompDestroy.removeAll();
        ECSWorld.onCompDisabled.removeAll();
        ECSWorld.onCompEnabled.removeAll();
        ECSWorld.onEntityAddToKind.removeAll();
        ECSWorld.onEntityRemoveFromKind.removeAll();
    }
}
