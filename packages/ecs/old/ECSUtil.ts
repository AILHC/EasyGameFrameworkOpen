export default class ECSUtil {
    public static removeEleFromArr(arr: Array<any>, ele: any): boolean {
        let index = arr.indexOf(ele);
        if (index > -1) {
            arr.splice(index, 1);
            return true;
        }
        return false;
    }
    public static addEleToArr(arr: Array<any>, ele: any): boolean {
        let res = false;
        if (arr) {
            if (arr.indexOf(ele) < 0) {
                arr.push(ele);
                res = true;
            }
        }
        return res;
    }
    /**
     * 匹配类型 只有与匹配逻辑
     * @param entityType
     * @param kindType
     */
    public static matchTypeV2(entityType: string, kindType: string): boolean {
        let matchCount = 0;
        const types = kindType.split(",");
        if (
            entityType &&
            kindType &&
            kindType.length > 0 &&
            entityType.length > 0 &&
            entityType.length >= kindType.length
        ) {
            for (let i = 0; i < types.length; i++) {
                const type = types[i];
                if (entityType.includes(type)) {
                    matchCount++;
                }
            }
        }
        return matchCount === types.length;
    }
    /**
     * 匹配类型 只有与匹配逻辑
     * @param entityType
     * @param kindType
     */
    public static matchTypeV3(entityType: string[], kindType: string): boolean {
        let matchCount = 0;
        if (!entityType || !kindType) {
            console.warn(`entityType :${entityType} or kindType:${kindType} is Null`);
            return;
        }
        const [withStr, orAnyStr, notStr] = [...kindType.split(";")];
        const withTypes = withStr ? withStr.split(",") : [];
        const orAnyTypes = orAnyStr ? orAnyStr.split(",") : [];
        const notTypes = notStr ? notStr.split(",") : [];
        let isMatch = false;
        let type = "";
        let needMatchCount = withTypes.length;
        if (notTypes.length) {
            for (let i = 0; i < notTypes.length; i++) {
                type = notTypes[i];
                if (entityType.includes(type)) {
                    return isMatch;
                }
            }
        }
        if (orAnyTypes.length) {
            needMatchCount++;
            for (let i = 0; i < orAnyTypes.length; i++) {
                type = orAnyTypes[i];
                if (entityType.includes(type)) {
                    matchCount++;
                    break;
                }
            }
        }
        if (withTypes.length) {
            for (let i = 0; i < withTypes.length; i++) {
                const type = withTypes[i];
                if (entityType.includes(type)) {
                    matchCount++;
                }
            }
        }
        isMatch = matchCount === needMatchCount;
        return isMatch;
    }
    /**
     * 构建类型key  kindType
     * @param withTypes 必须包含的组件类型 A 与 B
     * @param orAnyTypes 选择性包含的组件类型  A 或 B
     * @param notTypes 不能包含的组件类型
     * @returns kindType string 用;做分割
     * 如 "a,b,c;d,e;f" 必须包含 abc,以及必须包含 d或e,不能有f
     */
    public static makeKindType(withTypes: any[], orAnyTypes?: any[], notTypes?: any[]) {
        const kindType = `${withTypes.toString()};${orAnyTypes ? orAnyTypes.toString() : ""};${
            notTypes ? notTypes.toString() : ""
        }`;
        return kindType;
    }
    /**
     * 将Entity转成JSON格式，也就是node=undefined TODO需要修改
     * @param entity
     */
    public static entityToJSONFormat(entity: IEntity): IEntity {
        let jsonEntity: IEntity = {} as any;
        jsonEntity = Object.assign(jsonEntity, entity);
        // delete jsonEntity.node;
        return jsonEntity;
    }
}
window["matchTypeV3"] = ECSUtil.matchTypeV3;
