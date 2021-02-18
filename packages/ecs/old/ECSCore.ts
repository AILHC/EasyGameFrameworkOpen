import { ECSWorld } from "./ECSWorld";

declare global {
    interface IComponent {
        type: number;
        entityId: number;
        cname?: string;
        /**组件激活状态 */
        enabled: boolean;
        isDesed: boolean;
    }
    interface IEntity {
        id: number;
        /**实体的组件集合类型 */
        type: Array<string>;
        [key: string]: any;
    }

    interface ICompKindHandler<Type = any, KindType = any, Types = any> {
        /**
         * 匹配
         * @param compTypes
         * @param kind
         */
        isMatchKind(compTypes: Types, kind: KindType): boolean;
        /**
         * 构建类型
         * @param withTypes
         * @param orAnyTypes
         * @param notTypes
         */
        makeKind(withTypes: Type[], orAnyTypes?: Type[], notTypes?: Type[]): KindType;
    }
}
// export interface IEntity {
//     id: number;
//     /**实体的组件集合类型 */
//     type: Array<string>;
//     [key: string]: any
// }
export interface ISystem {
    enable?: boolean;
    onStart?();
    /**
     * 注册
     */
    onRegister(...registArgs);
    /**
     * 销毁时
     */
    onDes();
    /**
     * 被禁用的时候
     */
    onDisable();
    /**
     * 被启用的时候
     */
    onEnable();
}

export interface ISystemClass<TSystem extends ISystem, T extends ECSWorld> {
    _name: string;
    new (world: T): TSystem;
}
/**
 * 实体变动事件
 */
export interface IEntityChangeEvent {
    entity: IEntity;
    lastTypes: Array<number>;
}
/**
 * 组件变动事件
 */
export interface ICompChangeEvent {
    e: IEntity;
    oldComps: Array<IComponent>;
}
export interface INode {
    onAdd(entity: IEntity);
    onDes();
}
/**
 * 处理器
 */
export interface IProcesser {
    init(world: any);
    onStart();
    onStop();
}
export function getBaseComp(type: any, name?: string, enabled: boolean = true): IComponent {
    return {
        type: type,
        cname: name,
        enabled: enabled,
        isDesed: false,
        entityId: -1
    };
}
export function initBaseComp(comp: IComponent, type: any, name?: string, enabled: boolean = true) {
    comp.type = type;
    comp.cname = name;
    comp.enabled = enabled;
    comp.isDesed = false;
    comp.entityId = -1;
}
export const NODE: any = "node";
